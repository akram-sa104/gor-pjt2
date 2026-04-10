const express = require('express');
const pool = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Admin: semua pesan (contact + review) dalam satu inbox
router.get('/inbox', verifyToken, isAdmin, async (req, res) => {
  try {
    // Contact messages
    const [contacts] = await pool.query(`
      SELECT id, name, email, subject, message, is_read, created_at, 'contact' as source, NULL as rating, NULL as user_id
      FROM contact_messages ORDER BY created_at DESC
    `);

    // Reviews
    const [reviews] = await pool.query(`
      SELECT r.id, u.name, u.email, CONCAT('Review Booking #', r.booking_id) as subject,
             r.comment as message, r.is_read, r.created_at, 'review' as source, r.rating, r.user_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    const all = [...contacts, ...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(all);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: balas pesan
router.post('/reply', verifyToken, isAdmin, async (req, res) => {
  try {
    const { source, source_id, reply_message, user_id } = req.body;
    if (!reply_message) {
      return res.status(400).json({ message: 'Pesan balasan wajib diisi' });
    }

    // Simpan reply
    await pool.query(
      'INSERT INTO message_replies (source, source_id, admin_id, message) VALUES (?, ?, ?, ?)',
      [source, source_id, req.user.id, reply_message]
    );

    // Tandai pesan asli sebagai sudah dibaca
    if (source === 'contact') {
      await pool.query('UPDATE contact_messages SET is_read = TRUE WHERE id = ?', [source_id]);
    } else if (source === 'review') {
      await pool.query('UPDATE reviews SET is_read = TRUE WHERE id = ?', [source_id]);
    }

    // Kirim notifikasi ke user jika ada user_id
    if (user_id) {
      await pool.query(
        'INSERT INTO user_notifications (user_id, message, type, related_id) VALUES (?, ?, "general", ?)',
        [user_id, `Admin membalas pesan Anda: "${reply_message.substring(0, 50)}${reply_message.length > 50 ? '...' : ''}"`, source_id]
      );
    }

    res.status(201).json({ message: 'Balasan terkirim' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET replies for a message
router.get('/replies/:source/:sourceId', verifyToken, async (req, res) => {
  try {
    const [replies] = await pool.query(
      `SELECT mr.*, u.name as admin_name FROM message_replies mr
       JOIN users u ON mr.admin_id = u.id
       WHERE mr.source = ? AND mr.source_id = ?
       ORDER BY mr.created_at ASC`,
      [req.params.source, req.params.sourceId]
    );
    res.json(replies);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User: kirim pesan balasan ke thread
router.post('/user-reply', verifyToken, async (req, res) => {
  try {
    const { source, source_id, reply_message } = req.body;
    if (!reply_message) {
      return res.status(400).json({ message: 'Pesan wajib diisi' });
    }

    await pool.query(
      'INSERT INTO message_replies (source, source_id, admin_id, message) VALUES (?, ?, ?, ?)',
      [source, source_id, req.user.id, reply_message]
    );

    // Notifikasi ke admin
    await pool.query(
      'INSERT INTO notifications (message, type, related_id) VALUES (?, "general", ?)',
      [`Balasan baru dari ${req.user.name}`, source_id]
    );

    res.status(201).json({ message: 'Balasan terkirim' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
