import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const statsRouter = Router();

statsRouter.use(authMiddleware);

statsRouter.get('/:invitationId', async (req: AuthRequest, res: Response) => {
  try {
    const id = String(req.params.invitationId);

    const invitation = await prisma.invitation.findFirst({
      where: { id, userId: req.userId },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    const guests = await prisma.guest.findMany({ where: { invitationId: id } });
    const wishesCount = await prisma.wish.count({ where: { invitationId: id } });
    const gifts = await prisma.gift.findMany({ where: { invitationId: id } });

    const totalGuests = guests.length;
    const attending = guests.filter(g => g.rsvpStatus === 'attending').length;
    const notAttending = guests.filter(g => g.rsvpStatus === 'not_attending').length;
    const pending = guests.filter(g => g.rsvpStatus === 'pending').length;
    const scanned = guests.filter(g => g.scannedAt !== null).length;
    const vipAttending = guests.filter(g => g.isVip && g.rsvpStatus === 'attending').length;
    const totalGiftAmount = gifts.reduce((sum, g) => sum + (g.amount || 0), 0);

    return res.json({
      totalVisits: invitation.visitCount,
      totalGuests,
      attending,
      notAttending,
      pending,
      wishesCount,
      totalGifts: gifts.length,
      totalGiftAmount,
      scanned,
      vipAttending,
    });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

statsRouter.post('/:invitationId/visit', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.invitation.update({
      where: { id: String(req.params.invitationId) },
      data: { visitCount: { increment: 1 } },
    });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});
