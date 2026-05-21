const express = require('express');
const pool = require('../config/db');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// ==================== GET SEMUA LANTAI & OLAHRAGA ====================
router.get('/floors', async (req, res) => {
  try {
     const [floors] = await pool.query('SELECT * FROM floors WHERE is_active = TRUE');
    const [sports] = await pool.query('SELECT * FROM floor_sports');
    
    const result = floors.map(f => ({
      ...f,
      sports: sports.filter(s => s.floor_id === f.id)
    }));
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== CEK KETERSEDIAAN PER LANTAI ====================
router.get('/availability', async (req, res) => {
  try {
    const { floor_id, date } = req.query;
    if (!floor_id || !date) {
      return res.status(400).json({ message: 'floor_id dan date wajib diisi' });
    }

    const [bookings] = await pool.query(
      `SELECT start_time, end_time, sport, status FROM bookings 
       WHERE floor_id = ? AND booking_date = ? AND status IN ('pending', 'approved')`,
      [floor_id, date]
    );

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== BUAT BOOKING (USER) ====================
router.post('/', verifyToken, async (req, res) => {
  try {
    const { floor_id, sport, booking_date, start_time, end_time, notes } = req.body;

    if (!floor_id || !sport || !booking_date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Data booking tidak lengkap' });
    }

        // Calculate duration
    const startHour = parseInt(start_time.split(':')[0]);
    const endHour = parseInt(end_time.split(':')[0]);
    const duration_hours = endHour - startHour;
    if (duration_hours < 1) {
      return res.status(400).json({ message: 'Durasi minimal 1 jam' });
    }
    // Cek bentrok jadwal di lantai yang sama
    const [conflicts] = await pool.query(
      `SELECT id FROM bookings 
       WHERE floor_id = ? AND booking_date = ? AND status IN ('pending', 'approved')
       AND (start_time < ? AND end_time > ?)`,
      [floor_id, booking_date, end_time, start_time]
    );

    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Jadwal bentrok! Lantai ini sudah terisi pada waktu tersebut.' });
    }

       // Get user name for notification
    const [userInfo] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
     const [floorInfo] = await pool.query('SELECT name FROM floors WHERE id = ?', [floor_id]);

    const [result] = await pool.query(
      'INSERT INTO bookings (user_id, floor_id, sport, booking_date, start_time, end_time, duration_hours, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, floor_id, sport, booking_date, start_time, end_time, duration_hours, notes || null]
    );

        // Create notification for admin
    const userName = userInfo[0]?.name || 'User';
    const floorName = floorInfo[0]?.name || 'Lantai';
    await pool.query(
      'INSERT INTO notifications (message, type, related_id) VALUES (?, ?, ?)',
       [`Booking baru dari ${userName} untuk ${sport} di ${floorName} pada ${booking_date} jam ${start_time}-${end_time}`, 'booking_new', result.insertId]
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
      `SELECT b.*, f.name as floor_name 
       FROM bookings b JOIN floors f ON b.floor_id = f.id 
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

// ==================== RESCHEDULE BOOKING (USER, pending only) ====================
router.patch('/:id/reschedule', verifyToken, async (req, res) => {
  try {
    const { booking_date, start_time, end_time } = req.body;
    if (!booking_date || !start_time || !end_time) {
      return res.status(400).json({ message: 'Tanggal dan jam wajib diisi' });
    }
    const [rows] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    if (rows[0].status !== 'pending') {
      return res.status(400).json({ message: 'Hanya booking pending yang bisa diubah' });
    }
    const startHour = parseInt(start_time.split(':')[0]);
    const endHour = parseInt(end_time.split(':')[0]);
    const duration_hours = endHour - startHour;
    if (duration_hours < 1) {
      return res.status(400).json({ message: 'Durasi minimal 1 jam' });
    }
    const [conflicts] = await pool.query(
      `SELECT id FROM bookings 
       WHERE floor_id = ? AND booking_date = ? AND status IN ('pending','approved')
       AND id != ? AND (start_time < ? AND end_time > ?)`,
      [rows[0].floor_id, booking_date, req.params.id, end_time, start_time]
    );
    if (conflicts.length > 0) {
      return res.status(409).json({ message: 'Jadwal bentrok dengan booking lain' });
    }
    await pool.query(
      'UPDATE bookings SET booking_date = ?, start_time = ?, end_time = ?, duration_hours = ? WHERE id = ?',
      [booking_date, start_time, end_time, duration_hours, req.params.id]
    );
    const [userInfo] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id]);
    await pool.query(
      'INSERT INTO notifications (message, type, related_id) VALUES (?, ?, ?)',
      [`${userInfo[0]?.name || 'User'} mengubah jadwal booking #${req.params.id} menjadi ${booking_date} ${start_time}-${end_time}`, 'booking_new', parseInt(req.params.id)]
    );
    res.json({ message: 'Booking berhasil diubah' });
  } catch (error) {
    console.error('Reschedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/all', verifyToken, isAdmin, async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.*, f.name as floor_name, u.name as user_name, u.email as user_email
       FROM bookings b 
       JOIN floors f ON b.floor_id = f.id 
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
    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Status harus approved, rejected, atau cancelled' });
    }

     const [booking] = await pool.query(
      'SELECT b.*, f.name as floor_name FROM bookings b JOIN floors f ON b.floor_id = f.id WHERE b.id = ?',
      [req.params.id]
    );
    if (booking.length === 0) return res.status(404).json({ message: 'Booking tidak ditemukan' });
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    // Create user notification
    const statusText = status === 'approved' ? 'disetujui' : status === 'rejected' ? 'ditolak' : 'dibatalkan oleh admin';
    const floorName = booking[0].floor_name;
    const bookingDate = booking[0].booking_date;
    const dateStr = typeof bookingDate === 'string' ? bookingDate.slice(0, 10) : new Date(bookingDate).toISOString().slice(0, 10);
    await pool.query(
      'INSERT INTO user_notifications (user_id, message, type, related_id) VALUES (?, ?, ?, ?)',
        [booking[0].user_id, `Booking ${booking[0].sport} di ${floorName} pada ${dateStr} telah ${statusText}`, `booking_${status}`, parseInt(req.params.id)]
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
    const months = Math.min(parseInt(req.query.months) || 6, 60);
    const [total] = await pool.query('SELECT COUNT(*) as count FROM bookings');
    const [pending] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'");
    const [approved] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'approved'");
    const [rejected] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status IN ('rejected','cancelled')");
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');

    // Booking per bulan (6 bulan terakhir)
       const [monthlyRaw] = await pool.query(
      `SELECT DATE_FORMAT(booking_date, '%Y-%m') as month,
              COUNT(*) as count,
              SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved,
              SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending,
              SUM(CASE WHEN status IN ('rejected','cancelled') THEN 1 ELSE 0 END) as rejected
       FROM bookings
       WHERE booking_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY month ORDER BY month`,
      [months]
    );

     // Fill missing months with 0
    const map = new Map(monthlyRaw.map(r => [r.month, r]));
    const monthly = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const r = map.get(key);
      monthly.push({
        month: key,
        count: r ? Number(r.count) : 0,
        approved: r ? Number(r.approved) : 0,
        pending: r ? Number(r.pending) : 0,
        rejected: r ? Number(r.rejected) : 0,
      });
    }
    const rangeTotal = monthly.reduce((s, m) => s + m.count, 0);
    const rangeApproved = monthly.reduce((s, m) => s + m.approved, 0);

    res.json({
      totalBookings: total[0].count,
      pendingBookings: pending[0].count,
      approvedBookings: approved[0].count,
      rejectedBookings: rejected[0].count,
      totalUsers: users[0].count,
      monthlyBookings: monthly,
      rangeMonths: months,
      rangeTotal,
      rangeApproved,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
