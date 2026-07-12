import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const creditRouter = Router();

creditRouter.use(authMiddleware);

// Get my credit balance
creditRouter.get('/balance', async (req: AuthRequest, res: Response) => {
  try {
    const credit = await prisma.credit.findUnique({ where: { userId: req.userId! } });
    return res.json({ balance: credit?.balance || 0 });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get my transactions
creditRouter.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit)) || 20));
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: req.userId! },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId: req.userId! } }),
    ]);

    return res.json({ transactions, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Purchase a premium theme with credits
creditRouter.post('/purchase-theme', async (req: AuthRequest, res: Response) => {
  try {
    const { themeId, couponCode } = z.object({
      themeId: z.string(),
      couponCode: z.string().optional(),
    }).parse(req.body);

    const theme = await prisma.theme.findUnique({ where: { id: themeId } });
    if (!theme) return res.status(404).json({ error: 'Theme not found' });
    if (!theme.isPremium) return res.status(400).json({ error: 'Theme is not premium' });

    let finalPrice = theme.price;

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
      if (!coupon) return res.status(404).json({ error: 'Kupon tidak ditemukan' });
      if (!coupon.isActive) return res.status(400).json({ error: 'Kupon tidak aktif' });
      if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: 'Kupon kadaluarsa' });
      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Kuota kupon habis' });
      if (coupon.userId && coupon.userId !== req.userId) return res.status(400).json({ error: 'Kupon bukan untuk akun ini' });
      if (coupon.themeId && coupon.themeId !== themeId) return res.status(400).json({ error: 'Kupon tidak berlaku untuk tema ini' });

      let discount = coupon.discountType === 'percentage'
        ? Math.floor((finalPrice * coupon.discountValue) / 100)
        : coupon.discountValue;
      finalPrice = Math.max(0, finalPrice - discount);

      await prisma.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
    }

    const priceInCredits = Math.round(finalPrice);
    const credit = await prisma.credit.findUnique({ where: { userId: req.userId! } });
    if (!credit || credit.balance < priceInCredits) {
      return res.status(400).json({
        error: 'Saldo tidak mencukupi',
        needed: priceInCredits,
        balance: credit?.balance || 0,
      });
    }

    await prisma.$transaction([
      prisma.credit.update({ where: { userId: req.userId! }, data: { balance: { decrement: priceInCredits } } }),
      prisma.transaction.create({
        data: {
          userId: req.userId!,
          type: 'purchase',
          amount: -priceInCredits,
          description: `Pembelian tema: ${theme.name}`,
          referenceId: themeId,
        },
      }),
    ]);

    // Award affiliate commission if user was referred
    const user = await prisma.user.findUnique({ where: { id: req.userId! } });
    if (user?.referredBy) {
      const aff = await prisma.affiliate.findUnique({ where: { referralCode: user.referredBy } });
      if (aff && aff.isActive) {
        const commissionAmount = Math.floor(priceInCredits * (aff.commissionRate / 100));
        if (commissionAmount > 0) {
          await prisma.$transaction([
            prisma.affiliate.update({ where: { id: aff.id }, data: { totalEarned: { increment: commissionAmount } } }),
            prisma.affiliateCommission.create({
              data: {
                affiliateId: aff.id,
                referredUserId: req.userId!,
                amount: commissionAmount,
                description: `Komisi dari pembelian tema: ${theme.name}`,
                status: 'pending',
              },
            }),
            prisma.credit.upsert({
              where: { userId: aff.userId },
              update: { balance: { increment: commissionAmount } },
              create: { userId: aff.userId, balance: commissionAmount },
            }),
            prisma.transaction.create({
              data: {
                userId: aff.userId,
                type: 'credit',
                amount: commissionAmount,
                description: `Komisi afiliasi dari ${user.name || 'pengguna'}`,
              },
            }),
          ]);
        }
      }
    }

    return res.json({ success: true, theme, deducted: priceInCredits, remainingBalance: (credit.balance - priceInCredits) });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
