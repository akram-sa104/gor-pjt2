const express = require('express');
const pool = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Kirim pesan kontak
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Nama, email, dan pesan wajib diisi' });
    }

    await pool.query(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name, email, subject || null, message]
    );

    res.status(201).json({ message: 'Pesan terkirim' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: lihat semua pesan
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [messages] = await pool.query('SELECT * FROM contact_messages ORDER BY created_at DESC');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
