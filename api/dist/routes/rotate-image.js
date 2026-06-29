"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabase_1 = require("../lib/supabase");
const auth_1 = require("../middleware/auth");
const sharp_1 = __importDefault(require("sharp"));
const router = (0, express_1.Router)();
// POST /rotate-image
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.user.id;
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
        const { data: fileData, error: downloadError } = await supabase_1.supabase.storage
            .from('images')
            .download(fileId);
        if (downloadError || !fileData) {
            throw downloadError || new Error('Failed to download image from storage');
        }
        // 2. Rotate image using sharp
        const buffer = Buffer.from(await fileData.arrayBuffer());
        const rotatedBuffer = await (0, sharp_1.default)(buffer)
            .rotate(90) // Always rotate 90 degrees clockwise
            .toBuffer();
        // 3. Upload back to the exact same path (overwrite)
        const { error: uploadError } = await supabase_1.supabase.storage
            .from('images')
            .upload(fileId, rotatedBuffer, {
            contentType: 'image/jpeg',
            upsert: true,
        });
        if (uploadError) {
            throw uploadError;
        }
        // 4. Get public URL (it's the same, but we return it)
        const { data: { publicUrl } } = supabase_1.supabase.storage.from('images').getPublicUrl(fileId);
        return res.json({ success: true, url: publicUrl, fileId });
    }
    catch (err) {
        console.error('Rotate image route error:', err);
        return res.status(500).json({ error: 'Rotation failed', message: err.message });
    }
});
exports.default = router;
