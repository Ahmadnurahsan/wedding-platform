import { Router, Response } from 'express';
import multer from 'multer';
import { upload, uploadUrl } from '../lib/upload';
import { authMiddleware, AuthRequest } from '../middleware/auth';

export const uploadRouter = Router();

uploadRouter.post('/', authMiddleware, (req: AuthRequest, res: Response) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err instanceof multer.MulterError ? err.message : err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    return res.json({ url: uploadUrl(req.file.filename, req), filename: req.file.filename, size: req.file.size });
  });
});

uploadRouter.post('/multiple', authMiddleware, (req: AuthRequest, res: Response) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.files || !Array.isArray(req.files)) return res.status(400).json({ error: 'No files uploaded' });
    return res.json({ files: req.files.map((f) => ({ url: uploadUrl(f.filename, req), filename: f.filename, size: f.size })) });
  });
});
