const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Setup multer storage
const uploadDir = path.join(__dirname, '..', 'uploads', 'gallery');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Hanya file gambar yang diperbolehkan'));
  },
});

// ==================== GET ALL GALLERY ====================
router.get('/', async (req, res) => {
  try {
    const [items] = await pool.query('SELECT * FROM gallery ORDER BY created_at DESC');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== UPLOAD IMAGE ====================
router.post('/upload', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'File gambar wajib diupload' });
    }
    const image_url = `/uploads/gallery/${req.file.filename}`;
    res.json({ image_url });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== ADD GALLERY ITEM (Admin) ====================
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    const { title, image_url, category } = req.body;
    if (!image_url) {
      return res.status(400).json({ message: 'URL gambar wajib diisi' });
    }
    const [result] = await pool.query(
      'INSERT INTO gallery (title, image_url, category) VALUES (?, ?, ?)',
      [title || null, image_url, category || 'lapangan']
    );
    res.status(201).json({ message: 'Foto berhasil ditambahkan', id: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== UPDATE GALLERY ITEM (Admin) ====================
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
    const { title, image_url, category } = req.body;
    await pool.query(
      'UPDATE gallery SET title = ?, image_url = ?, category = ? WHERE id = ?',
      [title, image_url, category, req.params.id]
    );
    res.json({ message: 'Foto berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== DELETE GALLERY ITEM (Admin) ====================
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Akses ditolak' });
    }
     // Get image path before deleting
    const [rows] = await pool.query('SELECT image_url FROM gallery WHERE id = ?', [req.params.id]);
    if (rows.length > 0 && rows[0].image_url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', rows[0].image_url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await pool.query('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    res.json({ message: 'Foto berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
