const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    // Cek email sudah terdaftar
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password & simpan
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, hashedPassword]
    );

    res.status(201).json({ message: 'Registrasi berhasil', userId: result.insertId });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== LOGIN ====================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email dan password wajib diisi' });
    }

    // Cari user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = users[0];

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==================== GET PROFILE ====================
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
