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
