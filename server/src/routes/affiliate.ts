import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const affiliateRouter = Router();

affiliateRouter.use(authMiddleware);

// Generate referral code (auto if not exists)
async function getOrCreateAffiliate(userId: string) {
  let aff = await prisma.affiliate.findUnique({ where: { userId } });
  if (!aff) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const code = (user?.name || 'user').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() +
      Math.random().toString(36).slice(2, 5).toUpperCase();
    aff = await prisma.affiliate.create({ data: { userId, referralCode: code } });
  }
  return aff;
}

// My affiliate info
affiliateRouter.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const aff = await getOrCreateAffiliate(req.userId!);
    const commissions = await prisma.affiliateCommission.findMany({
      where: { affiliateId: aff.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const referredUsers = await prisma.user.count({
      where: { referredBy: aff.referralCode },
    });
    return res.json({
      ...aff,
      referredUsers,
      recentCommissions: commissions,
    });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Register referral (when user signs up with code)
affiliateRouter.post('/register-referral', async (req: AuthRequest, res: Response) => {
  try {
    const { code } = z.object({ code: z.string() }).parse(req.body);
    const aff = await prisma.affiliate.findUnique({ where: { referralCode: code.toUpperCase() } });
    if (!aff) return res.status(404).json({ error: 'Kode referral tidak valid' });
    if (aff.userId === req.userId) return res.status(400).json({ error: 'Tidak bisa refer diri sendiri' });

    await prisma.user.update({ where: { id: req.userId! }, data: { referredBy: code.toUpperCase() } });

    // Create pending commission (will be confirmed on first purchase)
    await prisma.affiliateCommission.create({
      data: {
        affiliateId: aff.id,
        referredUserId: req.userId!,
        amount: 0,
        description: 'Pendaftaran via referral',
        status: 'pending',
      },
    });

    return res.json({ success: true, message: 'Referral registered' });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all affiliate info (public - for validation)
affiliateRouter.get('/check/:code', async (req: AuthRequest, res: Response) => {
  try {
    const code = String(req.params.code || '').toUpperCase();
    const aff = await prisma.affiliate.findUnique({ where: { referralCode: code } });
    if (!aff || !aff.isActive) return res.status(404).json({ error: 'Kode referral tidak valid' });
    return res.json({ valid: true, code: aff.referralCode });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});
