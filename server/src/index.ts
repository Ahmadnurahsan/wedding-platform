import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { invitationsRouter } from './routes/invitations';
import { statsRouter } from './routes/stats';
import { adminRouter } from './routes/admin';
import { publicRouter } from './routes/public';
import { guestsRouter } from './routes/guests';
import { uploadRouter } from './routes/upload';
import { themesRouter } from './routes/themes';

const app = express();
const PORT = process.env.PORT || 3001;

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
app.use('/api/public', publicRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
