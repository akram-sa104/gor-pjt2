const express = require('express');
const pool = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// ==================== GET SEMUA LAPANGAN ====================
router.get('/courts', async (req, res) => {
  try {
    const [courts] = await pool.query('SELECT * FROM courts WHERE is_active = TRUE');
    res.json(courts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CEK KETERSEDIAAN ====================
router.get('/availability', async (req, res) => {
  try {
    const { court_id, date } = req.query;
    if (!court_id || !date) {
      return res.status(400).json({ message: 'court_id dan date wajib diisi' });
    }

    const [bookings] = await pool.query(
      `SELECT start_time, end_time, status FROM bookings 
       WHERE court_id = ? AND booking_date = ? AND status IN ('pending', 'approved')`,
      [court_id, date]
    );

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== BUAT BOOKING (USER) ====================
router.post('/', verifyToken, async (req, res) => {
  try {
    const { court_id, booking_date, start_time, end_time, notes } = req.body;

    if (!court_id || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Data booking tidak lengkap' });
    }

    // Cek bentrok jadwal
    const [conflicts] = await pool.query(
      `SELECT id FROM bookings 
       WHERE court_id = ? AND booking_date = ? AND status IN ('pending', 'approved')
       AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))`,
      [court_id, booking_date, end_time, start_time, end_time, start_time, start_time, end_time]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Jadwal bentrok dengan booking lain' });
    }

       // Get user name for notification
    const [userInfo] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
    const [courtInfo] = await pool.query('SELECT name FROM courts WHERE id = ?', [court_id]);

    const [result] = await pool.query(
      'INSERT INTO bookings (user_id, court_id, booking_date, start_time, end_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, court_id, booking_date, start_time, end_time, notes || null]
    );

        // Create notification for admin
    const userName = userInfo[0]?.name || 'User';
    const courtName = courtInfo[0]?.name || 'Lapangan';
    await pool.query(
      'INSERT INTO notifications (message, type, related_id) VALUES (?, ?, ?)',
      [`Booking baru dari ${userName} untuk ${courtName} pada ${booking_date} jam ${start_time}`, 'booking_new', result.insertId]
    );

    res.status(201).json({ message: 'Booking berhasil diajukan', bookingId: result.insertId });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== RIWAYAT BOOKING USER ====================
router.get('/my', verifyToken, async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.*, c.name as court_name, c.type as court_type 
       FROM bookings b JOIN courts c ON b.court_id = c.id 
       WHERE b.user_id = ? ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== BATALKAN BOOKING (USER) ====================
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const [booking] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (booking.length === 0) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    if (booking[0].status !== 'pending') {
      return res.status(400).json({ message: 'Hanya booking pending yang bisa dibatalkan' });
    }

    await pool.query('UPDATE bookings SET status = "cancelled" WHERE id = ?', [req.params.id]);
      // Notification for cancellation
    const [userInfo] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
    await pool.query(
      'INSERT INTO notifications (message, type, related_id) VALUES (?, ?, ?)',
      [`${userInfo[0]?.name || 'User'} membatalkan booking #${req.params.id}`, 'booking_cancelled', parseInt(req.params.id)]
    );
    res.json({ message: 'Booking dibatalkan' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== SEMUA BOOKING (ADMIN) ====================
router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.*, c.name as court_name, c.type as court_type, u.name as user_name, u.email as user_email
       FROM bookings b 
       JOIN courts c ON b.court_id = c.id 
       JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== APPROVE / REJECT (ADMIN) ====================
router.patch('/:id/status', verifyToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status harus approved atau rejected' });
    }

     const [booking] = await pool.query(
      'SELECT b.*, c.name as court_name FROM bookings b JOIN courts c ON b.court_id = c.id WHERE b.id = ?',
      [req.params.id]
    );
    if (booking.length === 0) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    // Create user notification
    const statusText = status === 'approved' ? 'disetujui' : 'ditolak';
    const courtName = booking[0].court_name;
    const bookingDate = booking[0].booking_date;
    const dateStr = typeof bookingDate === 'string' ? bookingDate.slice(0, 10) : new Date(bookingDate).toISOString().slice(0, 10);
    await pool.query(
      'INSERT INTO user_notifications (user_id, message, type, related_id) VALUES (?, ?, ?, ?)',
      [booking[0].user_id, `Booking Anda untuk ${courtName} pada ${dateStr} telah ${statusText}`, `booking_${status}`, parseInt(req.params.id)]
    );

    res.json({ message: `Booking ${status}` });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== STATISTIK (ADMIN) ====================
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM bookings');
    const [pending] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
    const [approved] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'approved'");
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');

    // Booking per bulan (6 bulan terakhir)
    const [monthly] = await pool.query(
      `SELECT DATE_FORMAT(booking_date, '%Y-%m') as month, COUNT(*) as count 
       FROM bookings WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY month ORDER BY month`
    );

    res.json({
      totalBookings: total[0].count,
      pendingBookings: pending[0].count,
      approvedBookings: approved[0].count,
      totalUsers: users[0].count,
      monthlyBookings: monthly
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
