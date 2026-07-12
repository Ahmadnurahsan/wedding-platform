import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';

export const themesRouter = Router();

themesRouter.get('/', async (_req, res: Response) => {
  try {
    const themes = await prisma.theme.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return res.json(themes);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

themesRouter.get('/:id', async (req, res: Response) => {
  try {
    const theme = await prisma.theme.findUnique({ where: { id: String(req.params.id) } });
    if (!theme) return res.status(404).json({ error: 'Theme not found' });
    return res.json(theme);
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
});
