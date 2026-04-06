const express = require('express');
const pool = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// GET notifikasi admin
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [notifications] = await pool.query(
      'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50'
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET jumlah notifikasi belum dibaca
router.get('/unread-count', verifyToken, isAdmin, async (req, res) => {
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = FALSE'
    );
    res.json({ count: result[0].count });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH tandai semua sudah dibaca
router.patch('/read-all', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE');
    res.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH tandai satu sudah dibaca
router.patch('/:id/read', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ message: 'Notifikasi ditandai sudah dibaca' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
