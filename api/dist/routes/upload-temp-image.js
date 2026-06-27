"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const supabase_1 = require("../lib/supabase");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
// POST /upload-temp-image
router.post('/', auth_1.requireAuth, upload.single('file'), async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;
        const { fileId, url, imageType } = req.body;
        // Case 1: Already uploaded directly on frontend
        if (fileId && url) {
            const [tempImage] = await db_1.db.insert(schema_1.tempImages).values({
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
        if (type.startsWith('profile') || type === 'user')
            targetFolder = 'users';
        else if (type === 'ad')
            targetFolder = 'ads';
        const fileExtension = file.originalname.split('.').pop() || 'png';
        const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
        const filePath = `${targetFolder}/${fileName}`;
        const { data, error } = await supabase_1.supabase.storage
            .from('images')
            .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
        });
        if (error)
            throw error;
        const { data: { publicUrl } } = supabase_1.supabase.storage.from('images').getPublicUrl(filePath);
        const [tempImage] = await db_1.db.insert(schema_1.tempImages).values({
            fileId: filePath,
            url: publicUrl,
            userId,
            isPublished: false,
            imageType: type,
        }).returning();
        return res.json({ url: publicUrl, fileId: filePath, tempImageId: tempImage.id });
    }
    catch (err) {
        console.error('Upload temp image route error:', err);
        return res.status(500).json({ error: 'Upload failed', message: err.message });
    }
});
exports.default = router;
