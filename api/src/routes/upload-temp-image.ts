import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { tempImages } from '@/lib/db/schema';
import { requireAuth } from '@/middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// POST /upload-temp-image
router.post('/', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const file = req.file;
    const { fileId, url, imageType } = req.body;

    // Case 1: Already uploaded directly on frontend
    if (fileId && url) {
      const [tempImage] = await db.insert(tempImages).values({
        fileId,
        url,
        userId,
        isPublished: false,
        imageType: imageType || null,
      }).returning();
      return res.json({ url, fileId, tempImageId: tempImage.id });
    }

    // Case 2: File sent to backend, upload to Supabase Storage
    if (!file) {
      return res.status(400).json({ error: 'No file or file details provided' });
    }

    const type = imageType || req.body.type || 'ad';
    let targetFolder = 'uploads';
    if (type.startsWith('profile') || type === 'user') targetFolder = 'users';
    else if (type === 'ad') targetFolder = 'ads';

    const fileExtension = file.originalname.split('.').pop() || 'png';
    const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const filePath = `${targetFolder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

    const [tempImage] = await db.insert(tempImages).values({
      fileId: filePath,
      url: publicUrl,
      userId,
      isPublished: false,
      imageType: type,
    }).returning();

    return res.json({ url: publicUrl, fileId: filePath, tempImageId: tempImage.id });
  } catch (err: any) {
    console.error('Upload temp image route error:', err);
    return res.status(500).json({ error: 'Upload failed', message: err.message });
  }
});

export default router;
