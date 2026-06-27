"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-nocheck
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const supabase_1 = require("../lib/supabase");
const db_1 = require("../lib/db");
const schema_1 = require("../lib/db/schema");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
// POST /upload — upload slike u Supabase Storage
router.post('/', auth_1.requireAuth, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const uploadType = req.body.type;
        if (!file)
            return res.status(400).json({ error: 'No file provided' });
        let targetFolder = 'uploads';
        if (uploadType === 'user' || uploadType?.startsWith('profile'))
            targetFolder = 'users';
        else if (uploadType === 'ad')
            targetFolder = 'ads';
        const fileExtension = file.originalname.split('.').pop() || 'png';
        const fileName = `${req.user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
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
        return res.json({ url: publicUrl, fileId: filePath });
    }
    catch (err) {
        console.error('Image upload error:', err);
        return res.status(500).json({ error: 'Upload failed', message: err.message });
    }
});
// POST /upload/temp — upload temp slike i čuva u DB
router.post('/temp', auth_1.requireAuth, upload.single('file'), async (req, res) => {
    try {
        const userId = req.user.id;
        const file = req.file;
        const uploadType = req.body.type;
        if (!file)
            return res.status(400).json({ error: 'No file provided' });
        let targetFolder = 'uploads';
        if (uploadType === 'user' || uploadType?.startsWith('profile'))
            targetFolder = 'users';
        else if (uploadType === 'ad')
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
            imageType: uploadType || null,
        }).returning();
        return res.json({ url: publicUrl, fileId: filePath, tempImageId: tempImage.id });
    }
    catch (err) {
        console.error('Temp image upload error:', err);
        return res.status(500).json({ error: 'Upload failed', message: err.message });
    }
});
// POST /upload/audio - upload audio snimka u Supabase Storage u bucket 'audios'
router.post('/audio', auth_1.requireAuth, upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: 'No file provided' });
        // Provera i kreiranje bucket-a 'audios' ako ne postoji
        try {
            const { data: buckets, error: listError } = await supabase_1.supabase.storage.listBuckets();
            if (listError)
                throw listError;
            const hasAudiosBucket = buckets?.some(b => b.name === 'audios');
            if (!hasAudiosBucket) {
                const { error: createError } = await supabase_1.supabase.storage.createBucket('audios', {
                    public: true,
                });
                if (createError)
                    throw createError;
            }
        }
        catch (bucketErr) {
            console.warn('⚠️ Bucket check/creation warning:', bucketErr);
        }
        const fileExtension = file.originalname.split('.').pop() || 'mp3';
        const fileName = `${req.user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
        const filePath = `${fileName}`;
        const { data, error } = await supabase_1.supabase.storage
            .from('audios')
            .upload(filePath, file.buffer, {
            contentType: file.mimetype || 'audio/mpeg',
            upsert: true,
        });
        if (error)
            throw error;
        const { data: { publicUrl } } = supabase_1.supabase.storage.from('audios').getPublicUrl(filePath);
        return res.json({ success: true, url: publicUrl, fileId: filePath });
    }
    catch (err) {
        console.error('Audio upload error:', err);
        return res.status(500).json({ error: 'Audio upload failed', message: err.message });
    }
});
exports.default = router;
