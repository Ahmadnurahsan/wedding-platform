import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { authRouter } from './routes/auth';
import { invitationsRouter } from './routes/invitations';
import { statsRouter } from './routes/stats';
import { adminRouter } from './routes/admin';
import { publicRouter } from './routes/public';
import { guestsRouter } from './routes/guests';
import { uploadRouter } from './routes/upload';
import { themesRouter } from './routes/themes';
import { creditRouter } from './routes/credits';
import { affiliateRouter } from './routes/affiliate';

const app = express();
const PORT = process.env.PORT || 3001;

const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/invitations', invitationsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/admin', adminRouter);
app.use('/uploads', express.static('uploads'));
app.use('/api/upload', uploadRouter);
app.use('/api/guests', guestsRouter);
app.use('/api/themes', themesRouter);
app.use('/api/credits', creditRouter);
app.use('/api/affiliate', affiliateRouter);
app.use('/api/public', publicRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
