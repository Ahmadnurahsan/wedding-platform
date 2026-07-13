import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const invitationsRouter = Router();

invitationsRouter.use(authMiddleware);

invitationsRouter.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const invitations = await prisma.invitation.findMany({
      where: { userId: req.userId },
      include: { theme: true, _count: { select: { guests: true, wishes: true, gifts: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return res.json(invitations);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

invitationsRouter.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { slug, title, themeId } = z.object({
      slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
      title: z.string().optional(),
      themeId: z.string().optional(),
    }).parse(req.body);

    const existing = await prisma.invitation.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: 'Slug already taken' });
    }

    const defaultSections = ['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer'];

    const invitation = await prisma.invitation.create({
      data: {
        userId: req.userId!,
        slug,
        title,
        themeId,
        sections: themeId
          ? undefined
          : {
              create: defaultSections.map((key, i) => ({
                sectionKey: key,
                isVisible: true,
                orderIndex: i,
              })),
            },
      },
      include: { sections: true },
    });

    // If themeId is set, create sections from theme config
    if (themeId) {
      const theme = await prisma.theme.findUnique({ where: { id: themeId } });
      if (theme?.sectionsConfig) {
        const keys: string[] = JSON.parse(theme.sectionsConfig);
        await prisma.invitationSection.createMany({
          data: keys.map((key, i) => ({
            invitationId: invitation.id,
            sectionKey: key,
            isVisible: true,
            orderIndex: i,
          })),
        });
      } else {
        await prisma.invitationSection.createMany({
          data: defaultSections.map((key, i) => ({
            invitationId: invitation.id,
            sectionKey: key,
            isVisible: true,
            orderIndex: i,
          })),
        });
      }
    }

    // Refetch with sections
    const created = await prisma.invitation.findUnique({
      where: { id: invitation.id },
      include: { sections: { orderBy: { orderIndex: 'asc' } } },
    });

    return res.status(201).json(created);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

invitationsRouter.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invitation = await prisma.invitation.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
      include: {
        events: { orderBy: { orderIndex: 'asc' } },
        sections: { orderBy: { orderIndex: 'asc' } },
        guests: true,
        wishes: { orderBy: { createdAt: 'desc' } },
        gifts: true,
        media: { orderBy: { orderIndex: 'asc' } },
      },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Auto-create default sections if empty (backward compat)
    if (invitation.sections.length === 0) {
      const defaultSections = ['hero', 'couple', 'events', 'gallery', 'rsvp', 'maps', 'wishes', 'gift', 'footer'];
      await prisma.invitationSection.createMany({
        data: defaultSections.map((key, i) => ({
          invitationId: invitation.id,
          sectionKey: key,
          isVisible: true,
          orderIndex: i,
        })),
      });
      // Refetch
      const updated = await prisma.invitation.findFirst({
        where: { id: String(req.params.id), userId: req.userId },
        include: {
          events: { orderBy: { orderIndex: 'asc' } },
          sections: { orderBy: { orderIndex: 'asc' } },
          guests: true,
          wishes: { orderBy: { createdAt: 'desc' } },
          gifts: true,
          media: { orderBy: { orderIndex: 'asc' } },
        },
      });
      return res.json(updated);
    }

    return res.json(invitation);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

invitationsRouter.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invitation = await prisma.invitation.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // If themeId changed, recreate sections from new theme
    if (req.body.themeId && req.body.themeId !== invitation.themeId) {
      const theme = await prisma.theme.findUnique({ where: { id: req.body.themeId } });
      if (theme?.sectionsConfig) {
        const keys: string[] = JSON.parse(theme.sectionsConfig);
        // Delete old sections
        await prisma.invitationSection.deleteMany({ where: { invitationId: invitation.id } });
        // Create new sections
        await prisma.invitationSection.createMany({
          data: keys.map((key, i) => ({
            invitationId: invitation.id,
            sectionKey: key,
            isVisible: true,
            orderIndex: i,
          })),
        });
      }
    }

    const updated = await prisma.invitation.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });

    return res.json(updated);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

invitationsRouter.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const invitation = await prisma.invitation.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    await prisma.invitation.delete({ where: { id: String(req.params.id) } });
    return res.json({ message: 'Deleted' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update events
invitationsRouter.put('/:id/events', async (req: AuthRequest, res: Response) => {
  try {
    const inv = await prisma.invitation.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    const { events } = z.object({
      events: z.array(z.object({
        id: z.string().optional(),
        title: z.string().min(1),
        date: z.string().nullable().optional(),
        timeStart: z.string().nullable().optional(),
        timeEnd: z.string().nullable().optional(),
        locationName: z.string().nullable().optional(),
        address: z.string().nullable().optional(),
        mapsUrl: z.string().nullable().optional(),
        orderIndex: z.number().int().optional(),
      })),
    }).parse(req.body);

    // Delete events not in the list
    const eventIds = events.filter(e => e.id).map(e => e.id!);
    await prisma.event.deleteMany({
      where: { invitationId: String(req.params.id), id: { notIn: eventIds } },
    });

    // Upsert events
    const updated = await Promise.all(
      events.map((event, i) =>
        prisma.event.upsert({
          where: { id: event.id || '__new__' },
          create: {
            invitationId: String(req.params.id),
            title: event.title,
            date: event.date,
            timeStart: event.timeStart,
            timeEnd: event.timeEnd,
            locationName: event.locationName,
            address: event.address,
            mapsUrl: event.mapsUrl,
            orderIndex: event.orderIndex ?? i,
          },
          update: {
            title: event.title,
            date: event.date,
            timeStart: event.timeStart,
            timeEnd: event.timeEnd,
            locationName: event.locationName,
            address: event.address,
            mapsUrl: event.mapsUrl,
            orderIndex: event.orderIndex ?? i,
          },
        })
      )
    );

    return res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create media
invitationsRouter.post('/:id/media', async (req: AuthRequest, res: Response) => {
  try {
    const inv = await prisma.invitation.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    const { url, type, caption } = z.object({
      url: z.string(),
      type: z.string().optional(),
      caption: z.string().optional(),
    }).parse(req.body);

    const count = await prisma.media.count({ where: { invitationId: inv.id } });
    const media = await prisma.media.create({
      data: { invitationId: inv.id, url, type: type || 'image', caption, orderIndex: count },
    });
    return res.json(media);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete media
invitationsRouter.delete('/:id/media/:mediaId', async (req: AuthRequest, res: Response) => {
  try {
    const inv = await prisma.invitation.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    await prisma.media.delete({ where: { id: String(req.params.mediaId) } });
    return res.json({ message: 'Deleted' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reorder & toggle sections
invitationsRouter.put('/:id/sections', async (req: AuthRequest, res: Response) => {
  try {
    const inv = await prisma.invitation.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    const { sections } = z.object({
      sections: z.array(z.object({
        id: z.string(),
        isVisible: z.boolean(),
        orderIndex: z.number().int(),
      })),
    }).parse(req.body);

    const updated = await Promise.all(
      sections.map((s) =>
        prisma.invitationSection.update({
          where: { id: s.id },
          data: { isVisible: s.isVisible, orderIndex: s.orderIndex },
        })
      )
    );

    return res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle wish approval
invitationsRouter.put('/:id/wishes/:wishId/approve', async (req: AuthRequest, res: Response) => {
  try {
    const inv = await prisma.invitation.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    const wish = await prisma.wish.findFirst({
      where: { id: String(req.params.wishId), invitationId: String(req.params.id) },
    });
    if (!wish) return res.status(404).json({ error: 'Wish not found' });

    const updated = await prisma.wish.update({
      where: { id: String(req.params.wishId) },
      data: { isApproved: !wish.isApproved },
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Reply to wish
invitationsRouter.put('/:id/wishes/:wishId/reply', async (req: AuthRequest, res: Response) => {
  try {
    const inv = await prisma.invitation.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    const { reply } = z.object({ reply: z.string().min(1) }).parse(req.body);

    const updated = await prisma.wish.update({
      where: { id: String(req.params.wishId) },
      data: { reply },
    });
    return res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete wish
invitationsRouter.delete('/:id/wishes/:wishId', async (req: AuthRequest, res: Response) => {
  try {
    const inv = await prisma.invitation.findFirst({
      where: { id: String(req.params.id), userId: req.userId },
    });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    await prisma.wish.delete({ where: { id: String(req.params.wishId) } });
    return res.json({ message: 'Deleted' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});
