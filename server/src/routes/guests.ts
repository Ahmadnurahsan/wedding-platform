import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const guestsRouter = Router();

guestsRouter.use(authMiddleware);

const guestSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  isVip: z.boolean().optional().default(false),
});

// List guests for an invitation
guestsRouter.get('/:invitationId', async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.invitationId);
    const inv = await prisma.invitation.findFirst({ where: { id, userId: req.userId } });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    const guests = await prisma.guest.findMany({
      where: { invitationId: id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(guests);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Add single guest
guestsRouter.post('/:invitationId', async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.invitationId);
    const inv = await prisma.invitation.findFirst({ where: { id, userId: req.userId } });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    const data = guestSchema.parse(req.body);
    const guest = await prisma.guest.create({
      data: {
        invitationId: id,
        name: data.name,
        phone: data.phone,
        whatsapp: data.whatsapp,
        isVip: data.isVip,
        uniqueCode: `${id.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      },
    });
    return res.status(201).json(guest);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk import guests
guestsRouter.post('/:invitationId/bulk', async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.invitationId);
    const inv = await prisma.invitation.findFirst({ where: { id, userId: req.userId } });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    const { guests } = z.object({
      guests: z.array(z.object({
        name: z.string().min(1),
        phone: z.string().optional(),
        whatsapp: z.string().optional(),
        isVip: z.boolean().optional(),
      })),
    }).parse(req.body);

    const created = await prisma.$transaction(
      guests.map((g) =>
        prisma.guest.create({
          data: {
            invitationId: id,
            name: g.name,
            phone: g.phone,
            whatsapp: g.whatsapp,
            isVip: g.isVip || false,
            uniqueCode: `${id.slice(0, 8)}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          },
        })
      )
    );

    return res.status(201).json({ count: created.length, guests: created });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete guest
guestsRouter.delete('/:invitationId/:guestId', async (req: AuthRequest, res: Response) => {
  try {
    const invitationId = String(req.params.invitationId);
    const inv = await prisma.invitation.findFirst({ where: { id: invitationId, userId: req.userId } });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });

    await prisma.guest.delete({ where: { id: String(req.params.guestId) } });
    return res.json({ message: 'Deleted' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark guest as scanned (QR check-in)
guestsRouter.post('/:invitationId/:guestId/scan', async (req: AuthRequest, res: Response) => {
  try {
    const guest = await prisma.guest.update({
      where: { id: String(req.params.guestId) },
      data: { scannedAt: new Date() },
    });
    return res.json(guest);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Update RSVP
guestsRouter.patch('/:invitationId/:guestId/rsvp', async (req: AuthRequest, res: Response) => {
  try {
    const { rsvpStatus, rsvpCount } = z.object({
      rsvpStatus: z.enum(['attending', 'not_attending', 'pending']),
      rsvpCount: z.number().int().optional(),
    }).parse(req.body);

    const guest = await prisma.guest.update({
      where: { id: String(req.params.guestId) },
      data: { rsvpStatus, ...(rsvpCount ? { rsvpCount } : {}) },
    });
    return res.json(guest);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
