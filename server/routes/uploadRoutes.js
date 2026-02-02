import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images only!'));
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({
            message: 'Image uploaded',
            filePath: `/uploads/${req.file.filename}`,
        });
    } else {
        res.status(400).json({ message: 'No image file uploaded' });
    }
});

router.post('/multiple', upload.array('images', 10), (req, res) => {
    if (req.files && req.files.length > 0) {
        const filePaths = req.files.map(file => `/uploads/${file.filename}`);
        res.json({
            message: 'Images uploaded',
            filePaths: filePaths,
        });
    } else {
        res.status(400).json({ message: 'No image files uploaded' });
    }
});

export default router;
