const express = require('express');
const pool = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// User: kirim review untuk booking yang sudah approved
router.post('/', verifyToken, async (req, res) => {
  try {
    const { booking_id, rating, comment } = req.body;
    if (!booking_id || !rating) {
      return res.status(400).json({ message: 'Booking ID dan rating wajib diisi' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating harus antara 1-5' });
    }

    // Cek booking milik user dan sudah approved
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ? AND status = "approved"',
      [booking_id, req.user.id]
    );
    if (bookings.length === 0) {
      return res.status(400).json({ message: 'Booking tidak ditemukan atau belum disetujui' });
    }

    // Cek sudah pernah review
    const [existing] = await pool.query(
      'SELECT id FROM reviews WHERE booking_id = ? AND user_id = ?',
      [booking_id, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Anda sudah memberikan review untuk booking ini' });
    }

    const [result] = await pool.query(
      'INSERT INTO reviews (booking_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [booking_id, req.user.id, rating, comment || null]
    );

    // Notifikasi ke admin
    await pool.query(
      'INSERT INTO notifications (message, type, related_id) VALUES (?, "general", ?)',
      [`Review baru (${rating}⭐) dari ${req.user.name}`, result.insertId]
    );

    res.status(201).json({ message: 'Review berhasil dikirim', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// User: cek apakah sudah review booking tertentu
router.get('/check/:bookingId', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id FROM reviews WHERE booking_id = ? AND user_id = ?',
      [req.params.bookingId, req.user.id]
    );
    res.json({ reviewed: rows.length > 0 });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: lihat semua review
router.get('/', verifyToken, isAdmin, async (req, res) => {
  try {
    const [reviews] = await pool.query(`
      SELECT r.*, u.name as user_name, u.email as user_email,
             c.name as court_name, b.booking_date
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN bookings b ON r.booking_id = b.id
      JOIN courts c ON b.court_id = c.id
      ORDER BY r.created_at DESC
    `);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
