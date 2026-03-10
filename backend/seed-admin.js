const bcrypt = require('bcryptjs');
const pool = require('./config/db');
async function seedAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Update atau insert admin
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@jasatirta2.co.id']);
    
    if (existing.length > 0) {
      await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, 'admin@jasatirta2.co.id']);
      console.log('✅ Password admin berhasil diupdate ke "admin123"');
    } else {
      await pool.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Admin GOR', 'admin@jasatirta2.co.id', '08123456789', hashedPassword, 'admin']
      );
      console.log('✅ Admin berhasil dibuat dengan password "admin123"');
    }
    
    console.log('Hash:', hashedPassword);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
seedAdmin();