// @ts-nocheck
import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { tempImages } from '@/lib/db/schema';
import { requireAuth } from '@/middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// POST /upload — upload slike u Supabase Storage
router.post('/', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const uploadType = req.body.type as string | undefined;

    if (!file) return res.status(400).json({ error: 'No file provided' });

    let targetFolder = 'uploads';
    if (uploadType === 'user' || uploadType?.startsWith('profile')) targetFolder = 'users';
    else if (uploadType === 'ad') targetFolder = 'ads';

    const fileExtension = file.originalname.split('.').pop() || 'png';
    const fileName = `${req.user!.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const filePath = `${targetFolder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath);

    return res.json({ url: publicUrl, fileId: filePath });
  } catch (err: any) {
    console.error('Image upload error:', err);
    return res.status(500).json({ error: 'Upload failed', message: err.message });
  }
});

// POST /upload/temp — upload temp slike i čuva u DB
router.post('/temp', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const file = req.file;
    const uploadType = req.body.type as string | undefined;

    if (!file) return res.status(400).json({ error: 'No file provided' });

    let targetFolder = 'uploads';
    if (uploadType === 'user' || uploadType?.startsWith('profile')) targetFolder = 'users';
    else if (uploadType === 'ad') targetFolder = 'ads';

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

    const type = uploadType || 'ad';
    const [tempImage] = await db.insert(tempImages).values({
      fileId: filePath,
      url: publicUrl,
      userId,
      state: type === 'ad' ? 'draft' : 'unpublished',
      imageType: type,
    }).returning();

    return res.json({ url: publicUrl, fileId: filePath, tempImageId: tempImage.id });
  } catch (err: any) {
    console.error('Temp image upload error:', err);
    return res.status(500).json({ error: 'Upload failed', message: err.message });
  }
});

// POST /upload/audio - upload audio snimka u Supabase Storage u bucket 'audios'
router.post('/audio', requireAuth, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file provided' });

    // Provera i kreiranje bucket-a 'audios' ako ne postoji
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      if (listError) throw listError;
      
      const hasAudiosBucket = buckets?.some(b => b.name === 'audios');
      if (!hasAudiosBucket) {
        const { error: createError } = await supabase.storage.createBucket('audios', {
          public: true,
        });
        if (createError) throw createError;
      }
    } catch (bucketErr) {
      console.warn('⚠️ Bucket check/creation warning:', bucketErr);
    }

    const fileExtension = file.originalname.split('.').pop() || 'mp3';
    const fileName = `${req.user!.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
    const filePath = `${fileName}`;

    const { data, error } = await supabase.storage
      .from('audios')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype || 'audio/mpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage.from('audios').getPublicUrl(filePath);

    return res.json({ success: true, url: publicUrl, fileId: filePath });
  } catch (err: any) {
    console.error('Audio upload error:', err);
    return res.status(500).json({ error: 'Audio upload failed', message: err.message });
  }
});

export default router;
