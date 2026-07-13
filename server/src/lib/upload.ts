import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export function uploadUrl(filename: string, req?: any): string {
  const base = process.env.UPLOAD_BASE_URL
    || (req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:3001');
  return `${base}/uploads/${filename}`;
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp|mp3|wav|ogg|mp4|mov)$/i;
  if (allowed.test(path.extname(file.originalname))) return cb(null, true);
  cb(new Error('File type not allowed'));
};

export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter });
