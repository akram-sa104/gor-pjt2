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

-- Tabel Lantai (Floor)
CREATE TABLE floors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_per_hour DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Olahraga per Lantai
CREATE TABLE floor_sports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  floor_id INT NOT NULL,
  sport_name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT 'goal',
  FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- Tabel Bookings (per lantai, bukan per lapangan)
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  floor_id INT NOT NULL,
  sport VARCHAR(100) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours INT NOT NULL DEFAULT 1,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE CASCADE
);

-- Tabel Gallery
CREATE TABLE gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200),
  image_url VARCHAR(500) NOT NULL,
  category ENUM('hero', 'about', 'lapangan', 'tribun', 'exterior', 'fasilitas') DEFAULT 'lapangan',
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

-- Lantai
INSERT INTO floors (name, description, price_per_hour) VALUES
('Lantai 1', 'Area serbaguna untuk yoga, senam, dan tenis meja', 100000),
('Lantai 2', 'Lapangan utama untuk futsal, voli, badminton, dan basket', 150000);
-- Olahraga per Lantai
INSERT INTO floor_sports (floor_id, sport_name, icon) VALUES
(1, 'Yoga', 'heart'),
(1, 'Senam', 'activity'),
(1, 'Tenis Meja', 'target'),
(2, 'Futsal', 'goal'),
(2, 'Voli', 'volleyball'),
(2, 'Badminton', 'badminton'),
(2, 'Basket', 'basketball');