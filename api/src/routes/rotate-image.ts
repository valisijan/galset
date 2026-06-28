import { Router, Request, Response } from 'express';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/middleware/auth';
import sharp from 'sharp';

const router = Router();

// POST /rotate-image
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({ error: 'Missing fileId' });
    }

    const pathParts = fileId.split('/');
    const fileName = pathParts[pathParts.length - 1];
    const isOwner = fileName.startsWith(`${userId}-`);

    if (!isOwner) {
      return res.status(403).json({ error: 'Unauthorized to rotate this image' });
    }

    // 1. Download image from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('images')
      .download(fileId);

    if (downloadError || !fileData) {
      throw downloadError || new Error('Failed to download image from storage');
    }

    // 2. Rotate image using sharp
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const rotatedBuffer = await sharp(buffer)
      .rotate(90) // Always rotate 90 degrees clockwise
      .toBuffer();

    // 3. Upload back to the exact same path (overwrite)
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileId, rotatedBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // 4. Get public URL (it's the same, but we return it)
    const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileId);

    return res.json({ success: true, url: publicUrl, fileId });
  } catch (err: any) {
    console.error('Rotate image route error:', err);
    return res.status(500).json({ error: 'Rotation failed', message: err.message });
  }
});

export default router;
