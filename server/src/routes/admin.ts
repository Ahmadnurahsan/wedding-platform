import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

export const adminRouter = Router();

adminRouter.use(authMiddleware);
adminRouter.use(adminMiddleware);

// ── Dashboard Stats ──
adminRouter.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalInvitations = await prisma.invitation.count();
    const draftInvitations = await prisma.invitation.count({ where: { status: 'draft' } });
    const publishedInvitations = await prisma.invitation.count({ where: { status: 'published' } });
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const usersLast30Days = await prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
    const invitationsLast30Days = await prisma.invitation.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
    const totalWishes = await prisma.wish.count();
    const totalGifts = await prisma.gift.aggregate({ _sum: { amount: true }, _count: true });

    const popularTemplates = await prisma.theme.findMany({
      include: { _count: { select: { invitations: true } } },
      orderBy: { invitations: { _count: 'desc' } },
      take: 5,
    });

    return res.json({
      totalUsers,
      totalInvitations,
      draftInvitations,
      publishedInvitations,
      publishedToday: await prisma.invitation.count({
        where: { publishedAt: { gte: new Date(today.setHours(0, 0, 0, 0)) } },
      }),
      usersLast30DaysCount: usersLast30Days,
      invitationsLast30DaysCount: invitationsLast30Days,
      totalWishes,
      revenue: { totalGifts: totalGifts._count, totalAmount: totalGifts._sum.amount || 0 },
      popularTemplates: popularTemplates.map(t => ({ name: t.name, count: t._count.invitations })),
    });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Daily Stats for Chart ──
adminRouter.get('/stats/daily', async (req, res: Response) => {
  try {
    const days = Math.min(Math.max(parseInt(String(req.query.days)) || 14, 7), 90);
    const result: { date: string; users: number; invitations: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));

      const [users, invitations] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.invitation.count({ where: { createdAt: { gte: start, lte: end } } }),
      ]);

      result.push({ date: start.toISOString().slice(0, 10), users, invitations });
    }

    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Users ──
adminRouter.get('/users', async (req, res: Response) => {
  try {
    const search = String(req.query.search || '');
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit)) || 20));
    const skip = (page - 1) * limit;

    const where = search ? {
      OR: [
        { name: { contains: search } },
        { email: { contains: search } },
      ],
    } : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true, _count: { select: { invitations: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({ users, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/users/:userId/role', async (req, res: Response) => {
  try {
    const { role } = z.object({ role: z.enum(['user', 'admin']) }).parse(req.body);
    const updated = await prisma.user.update({
      where: { id: String(req.params.userId) },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/users/:userId', async (req, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: String(req.params.userId) } });
    return res.json({ message: 'User deleted' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Invitations ──
adminRouter.get('/invitations', async (req, res: Response) => {
  try {
    const search = String(req.query.search || '');
    const status = String(req.query.status || '');
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit)) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) where.OR = [{ slug: { contains: search } }, { title: { contains: search } }];
    if (status) where.status = status;

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
        where,
        include: { user: { select: { name: true, email: true } }, theme: { select: { name: true } }, _count: { select: { guests: true, wishes: true, gifts: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invitation.count({ where }),
    ]);

    return res.json({ invitations, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/invitations/:id', async (req, res: Response) => {
  try {
    await prisma.invitation.delete({ where: { id: String(req.params.id) } });
    return res.json({ message: 'Invitation deleted' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/invitations/:id/publish', async (req, res: Response) => {
  try {
    const inv = await prisma.invitation.findUnique({ where: { id: String(req.params.id) } });
    if (!inv) return res.status(404).json({ error: 'Invitation not found' });
    const updated = await prisma.invitation.update({
      where: { id: String(req.params.id) },
      data: { status: inv.status === 'published' ? 'draft' : 'published', publishedAt: inv.status === 'published' ? null : new Date() },
    });
    return res.json(updated);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Theme CRUD ──
adminRouter.get('/themes', async (_req, res: Response) => {
  try {
    const themes = await prisma.theme.findMany({ orderBy: { name: 'asc' } });
    return res.json(themes);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/themes', async (req, res: Response) => {
  try {
    const data = z.object({
      name: z.string().min(1),
      category: z.string().default('Modern'),
      thumbnailUrl: z.string().nullable().optional(),
      isPremium: z.boolean().default(false),
      price: z.number().min(0).default(50000),
      sectionsConfig: z.string().nullable().optional(),
      defaultColors: z.string().nullable().optional(),
    }).parse(req.body);

    const theme = await prisma.theme.create({ data });
    return res.status(201).json(theme);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/themes/:id', async (req, res: Response) => {
  try {
    const data = z.object({
      name: z.string().min(1).optional(),
      category: z.string().optional(),
      thumbnailUrl: z.string().nullable().optional(),
      isPremium: z.boolean().optional(),
      price: z.number().min(0).optional(),
      isActive: z.boolean().optional(),
      sectionsConfig: z.string().nullable().optional(),
      defaultColors: z.string().nullable().optional(),
    }).parse(req.body);

    const theme = await prisma.theme.update({ where: { id: String(req.params.id) }, data });
    return res.json(theme);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/themes/:id', async (req, res: Response) => {
  try {
    await prisma.theme.delete({ where: { id: String(req.params.id) } });
    return res.json({ message: 'Theme deleted' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Coupons ──
adminRouter.get('/coupons', async (req, res: Response) => {
  try {
    const search = String(req.query.search || '');
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit)) || 20));
    const skip = (page - 1) * limit;

    const where = search ? { code: { contains: search } } : {};
    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } }, theme: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return res.json({ coupons, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/coupons', async (req: AuthRequest, res: Response) => {
  try {
    const data = z.object({
      code: z.string().min(1).toUpperCase(),
      discountType: z.enum(['percentage', 'fixed']),
      discountValue: z.number().positive(),
      maxUses: z.number().int().min(0).default(0),
      minAmount: z.number().min(0).default(0),
      userId: z.string().nullable().optional(),
      themeId: z.string().nullable().optional(),
      startsAt: z.string().nullable().optional(),
      expiresAt: z.string().nullable().optional(),
    }).parse(req.body);

    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });
    return res.status(201).json(coupon);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/coupons/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = z.object({
      code: z.string().min(1).toUpperCase().optional(),
      discountType: z.enum(['percentage', 'fixed']).optional(),
      discountValue: z.number().positive().optional(),
      maxUses: z.number().int().min(0).optional(),
      minAmount: z.number().min(0).optional(),
      userId: z.string().nullable().optional(),
      themeId: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
      startsAt: z.string().nullable().optional(),
      expiresAt: z.string().nullable().optional(),
    }).parse(req.body);

    const updateData: any = { ...data };
    if (data.startsAt !== undefined) updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    const coupon = await prisma.coupon.update({ where: { id: String(req.params.id) }, data: updateData });
    return res.json(coupon);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.delete('/coupons/:id', async (req: AuthRequest, res: Response) => {
  try {
    await prisma.coupon.delete({ where: { id: String(req.params.id) } });
    return res.json({ message: 'Coupon deleted' });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Settings ──
adminRouter.get('/settings', async (_req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.setting.findMany();
    const result: Record<string, string> = {};
    settings.forEach(s => { result[s.key] = s.value; });
    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/settings', async (req: AuthRequest, res: Response) => {
  try {
    const data = z.record(z.string(), z.string()).parse(req.body);
    const ops = Object.entries(data).map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
    );
    await Promise.all(ops);
    return res.json({ message: 'Settings updated' });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Apply Coupon (user-facing but admin can test) ──
adminRouter.post('/coupons/validate', async (req: AuthRequest, res: Response) => {
  try {
    const { code, amount, themeId, userId } = z.object({
      code: z.string(),
      amount: z.number().default(0),
      themeId: z.string().optional(),
      userId: z.string().optional(),
    }).parse(req.body);

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon) return res.status(404).json({ error: 'Kode kupon tidak ditemukan' });
    if (!coupon.isActive) return res.status(400).json({ error: 'Kupon sudah tidak aktif' });
    if (coupon.expiresAt && coupon.expiresAt < new Date()) return res.status(400).json({ error: 'Kupon sudah kadaluarsa' });
    if (coupon.startsAt && coupon.startsAt > new Date()) return res.status(400).json({ error: 'Kupon belum berlaku' });
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Kuota kupon habis' });
    if (coupon.userId && coupon.userId !== userId) return res.status(400).json({ error: 'Kupon tidak berlaku untuk akun ini' });
    if (coupon.themeId && coupon.themeId !== themeId) return res.status(400).json({ error: 'Kupon tidak berlaku untuk tema ini' });
    const minAmount = coupon.minAmount ?? 0;
    if (amount < minAmount) return res.status(400).json({ error: `Minimal pembelian Rp${minAmount.toLocaleString('id-ID')}` });

    let discountAmount = coupon.discountType === 'percentage' ? (amount * coupon.discountValue) / 100 : coupon.discountValue;
    if (discountAmount > amount) discountAmount = amount;

    return res.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount),
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Admin Credit Management ──
adminRouter.get('/credits', async (_req: AuthRequest, res: Response) => {
  try {
    const credits = await prisma.credit.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { balance: 'desc' },
    });
    return res.json(credits);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/credits/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit)) || 20));
    const skip = (page - 1) * limit;
    const userId = String(req.query.userId || '');

    const where = userId ? { userId } : {};

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return res.json({ transactions, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Admin Affiliates ──
adminRouter.get('/affiliates', async (_req: AuthRequest, res: Response) => {
  try {
    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { commissions: true } },
      },
      orderBy: { totalEarned: 'desc' },
    });
    const result = await Promise.all(affiliates.map(async (aff) => {
      const referredUsers = await prisma.user.count({ where: { referredBy: aff.referralCode } });
      return { ...aff, referredUsers };
    }));
    return res.json(result);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.get('/affiliates/commissions', async (req: AuthRequest, res: Response) => {
  try {
    const status = String(req.query.status || '');
    const where = status ? { status } : {};
    const commissions = await prisma.affiliateCommission.findMany({
      where,
      include: {
        affiliate: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.json(commissions);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/affiliates/:id/rate', async (req: AuthRequest, res: Response) => {
  try {
    const { commissionRate } = z.object({ commissionRate: z.number().min(0).max(100) }).parse(req.body);
    const aff = await prisma.affiliate.update({
      where: { id: String(req.params.id) },
      data: { commissionRate },
    });
    return res.json(aff);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.put('/affiliates/commissions/:id/pay', async (req: AuthRequest, res: Response) => {
  try {
    const comm = await prisma.affiliateCommission.findUnique({ where: { id: String(req.params.id) } });
    if (!comm) return res.status(404).json({ error: 'Commission not found' });
    if (comm.status === 'paid') return res.status(400).json({ error: 'Already paid' });

    await prisma.$transaction([
      prisma.affiliateCommission.update({ where: { id: comm.id }, data: { status: 'paid' } }),
      prisma.affiliate.update({ where: { id: comm.affiliateId }, data: { totalPaid: { increment: comm.amount } } }),
    ]);

    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminRouter.post('/credits/give', async (req: AuthRequest, res: Response) => {
  try {
    const { userId, amount, description } = z.object({
      userId: z.string(),
      amount: z.number().int().positive(),
      description: z.string().default('Top up dari admin'),
    }).parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await prisma.$transaction([
      prisma.credit.upsert({
        where: { userId },
        update: { balance: { increment: amount } },
        create: { userId, balance: amount },
      }),
      prisma.transaction.create({
        data: { userId, type: 'admin', amount, description: `Admin: ${description}`, referenceId: req.userId },
      }),
    ]);

    const credit = await prisma.credit.findUnique({ where: { userId } });
    return res.json({ success: true, balance: credit?.balance || amount, amount });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
