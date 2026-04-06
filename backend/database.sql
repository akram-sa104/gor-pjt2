-- =============================================
-- DATABASE GOR PERUM JASA TIRTA II
-- =============================================

CREATE DATABASE IF NOT EXISTS gor_jasa_tirta;
USE gor_jasa_tirta;

-- Tabel Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Courts (Lapangan)
CREATE TABLE courts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('futsal', 'badminton') NOT NULL,
  price_per_hour DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Bookings
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  court_id INT NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE
);

-- Tabel Gallery
CREATE TABLE gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200),
  image_url VARCHAR(500) NOT NULL,
  category ENUM('lapangan', 'tribun', 'exterior', 'fasilitas') DEFAULT 'lapangan',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Contact Messages
CREATE TABLE contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Notifications
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message VARCHAR(500) NOT NULL,
  type ENUM('booking_new', 'booking_cancelled', 'general') DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  related_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel User Notifications (notifikasi untuk user biasa)
CREATE TABLE user_notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  is_read BOOLEAN DEFAULT FALSE,
  related_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- =============================================
-- DATA AWAL (SEED)
-- =============================================

-- Admin default (password: admin123)
INSERT INTO users (name, email, phone, password, role) VALUES
('Admin GOR', 'admin@jasatirta2.co.id', '08123456789', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Lapangan
INSERT INTO courts (name, type, price_per_hour) VALUES
('Lapangan Futsal A', 'futsal', 150000),
('Lapangan Futsal B', 'futsal', 150000),
('Lapangan Badminton 1', 'badminton', 75000),
('Lapangan Badminton 2', 'badminton', 75000),
('Lapangan Badminton 3', 'badminton', 75000);
