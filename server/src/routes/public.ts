import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

export const publicRouter = Router();

publicRouter.get('/:slug', async (req, res: Response) => {
  try {
    const invitation = await prisma.invitation.findUnique({
      where: { slug: req.params.slug },
      include: {
        theme: true,
        events: { orderBy: { orderIndex: 'asc' } },
        sections: { where: { isVisible: true }, orderBy: { orderIndex: 'asc' } },
        media: { orderBy: { orderIndex: 'asc' } },
        wishes: { where: { isVisible: true, isApproved: true }, orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });

    if (!invitation || invitation.status !== 'published') {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    // Increment visit count
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { visitCount: { increment: 1 } },
    });

    return res.json(invitation);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

publicRouter.get('/:slug/guest/:code', async (req, res: Response) => {
  try {
    const guest = await prisma.guest.findFirst({
      where: {
        uniqueCode: req.params.code,
        invitation: { slug: req.params.slug },
      },
      select: { id: true, name: true, isVip: true, rsvpStatus: true, scannedAt: true, uniqueCode: true },
    });

    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    // Track view
    await prisma.guest.update({
      where: { id: guest.id },
      data: { viewedAt: new Date() },
    });

    return res.json(guest);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

publicRouter.post('/:slug/rsvp', async (req, res: Response) => {
  try {
    const { name, phone, whatsapp, rsvpStatus, rsvpCount, rsvpNote } = z.object({
      name: z.string().min(1),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      rsvpStatus: z.enum(['attending', 'not_attending']),
      rsvpCount: z.number().int().min(1).default(1),
      rsvpNote: z.string().optional(),
    }).parse(req.body);

    const invitation = await prisma.invitation.findUnique({
      where: { slug: req.params.slug },
    });

    if (!invitation || invitation.status !== 'published') {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const guest = await prisma.guest.create({
      data: {
        invitationId: invitation.id,
        name,
        phone,
        whatsapp,
        rsvpStatus,
        rsvpCount,
        rsvpNote,
      },
    });

    return res.status(201).json(guest);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

publicRouter.post('/:slug/wishes', async (req, res: Response) => {
  try {
    const { name, message } = z.object({
      name: z.string().min(1),
      message: z.string().min(1),
    }).parse(req.body);

    const invitation = await prisma.invitation.findUnique({
      where: { slug: req.params.slug },
    });

    if (!invitation || invitation.status !== 'published') {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const wish = await prisma.wish.create({
      data: {
        invitationId: invitation.id,
        name,
        message,
        isApproved: true,
      },
    });

    return res.status(201).json(wish);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.errors });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

publicRouter.post('/:slug/wishes/:wishId/like', async (req, res: Response) => {
  try {
    const wish = await prisma.wish.update({
      where: { id: req.params.wishId },
      data: { likes: { increment: 1 } },
    });
    return res.json({ likes: wish.likes });
  } catch {
    return res.status(404).json({ error: 'Wish not found' });
  }
});
