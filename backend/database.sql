-- =============================================
-- DATABASE GOR PERUM JASA TIRTA II
-- SQL Server / T-SQL compatible
-- =============================================

IF DB_ID(N'gor_jasa_tirta') IS NULL
BEGIN
  EXEC(N'CREATE DATABASE gor_jasa_tirta');
END
GO

USE gor_jasa_tirta;
GO

-- Tabel Users
CREATE TABLE dbo.users (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  email NVARCHAR(255) NOT NULL UNIQUE,
  phone NVARCHAR(20) NULL,
  password NVARCHAR(255) NOT NULL,
  role NVARCHAR(20) NOT NULL CONSTRAINT df_users_role DEFAULT (N'user'),
  created_at DATETIME2 NOT NULL CONSTRAINT df_users_created_at DEFAULT (CURRENT_TIMESTAMP),
  CONSTRAINT ck_users_role CHECK (role IN (N'user', N'admin'))
);
GO

-- Tabel Lantai (Floor)
CREATE TABLE dbo.floors (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  description NVARCHAR(MAX) NULL,
  price_per_hour DECIMAL(10,2) NOT NULL CONSTRAINT df_floors_price DEFAULT (0),
  is_active BIT NOT NULL CONSTRAINT df_floors_is_active DEFAULT (1),
  created_at DATETIME2 NOT NULL CONSTRAINT df_floors_created_at DEFAULT (CURRENT_TIMESTAMP)
);
GO

-- Tabel Olahraga per Lantai
CREATE TABLE dbo.floor_sports (
  id INT IDENTITY(1,1) PRIMARY KEY,
  floor_id INT NOT NULL,
  sport_name NVARCHAR(100) NOT NULL,
  icon NVARCHAR(50) NOT NULL CONSTRAINT df_floor_sports_icon DEFAULT (N'goal'),
  CONSTRAINT fk_floor_sports_floor
    FOREIGN KEY (floor_id) REFERENCES dbo.floors(id) ON DELETE CASCADE
);
GO

-- Tabel Bookings (per lantai, bukan per lapangan)
CREATE TABLE dbo.bookings (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  floor_id INT NOT NULL,
  sport NVARCHAR(100) NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours INT NOT NULL CONSTRAINT df_bookings_duration DEFAULT (1),
  status NVARCHAR(20) NOT NULL CONSTRAINT df_bookings_status DEFAULT (N'pending'),
  notes NVARCHAR(MAX) NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT df_bookings_created_at DEFAULT (CURRENT_TIMESTAMP),
  CONSTRAINT ck_bookings_status CHECK (status IN (N'pending', N'approved', N'rejected', N'cancelled')),
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_floor
    FOREIGN KEY (floor_id) REFERENCES dbo.floors(id) ON DELETE CASCADE
);
GO

-- Tabel Gallery
CREATE TABLE dbo.gallery (
  id INT IDENTITY(1,1) PRIMARY KEY,
  title NVARCHAR(200) NULL,
  image_url NVARCHAR(500) NOT NULL,
  category NVARCHAR(20) NOT NULL CONSTRAINT df_gallery_category DEFAULT (N'lapangan'),
  created_at DATETIME2 NOT NULL CONSTRAINT df_gallery_created_at DEFAULT (CURRENT_TIMESTAMP),
  CONSTRAINT ck_gallery_category CHECK (category IN (N'hero', N'about', N'lapangan', N'tribun', N'exterior', N'fasilitas'))
);
GO

-- Tabel Contact Messages
CREATE TABLE dbo.contact_messages (
  id INT IDENTITY(1,1) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL,
  email NVARCHAR(255) NOT NULL,
  subject NVARCHAR(200) NULL,
  message NVARCHAR(MAX) NOT NULL,
  is_read BIT NOT NULL CONSTRAINT df_contact_messages_is_read DEFAULT (0),
  created_at DATETIME2 NOT NULL CONSTRAINT df_contact_messages_created_at DEFAULT (CURRENT_TIMESTAMP)
);
GO

-- Tabel Notifications
CREATE TABLE dbo.notifications (
  id INT IDENTITY(1,1) PRIMARY KEY,
  message NVARCHAR(500) NOT NULL,
  type NVARCHAR(50) NOT NULL CONSTRAINT df_notifications_type DEFAULT (N'general'),
  is_read BIT NOT NULL CONSTRAINT df_notifications_is_read DEFAULT (0),
  related_id INT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT df_notifications_created_at DEFAULT (CURRENT_TIMESTAMP),
  CONSTRAINT ck_notifications_type CHECK (type IN (N'booking_new', N'booking_cancelled', N'general'))
);
GO

-- Tabel User Notifications (notifikasi untuk user biasa)
CREATE TABLE dbo.user_notifications (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL,
  message NVARCHAR(MAX) NOT NULL,
  type NVARCHAR(50) NOT NULL CONSTRAINT df_user_notifications_type DEFAULT (N'general'),
  is_read BIT NOT NULL CONSTRAINT df_user_notifications_is_read DEFAULT (0),
  related_id INT NULL,
  created_at DATETIME2 NOT NULL CONSTRAINT df_user_notifications_created_at DEFAULT (CURRENT_TIMESTAMP),
  CONSTRAINT ck_user_notifications_type CHECK (type IN (N'general', N'booking_new', N'booking_cancelled')),
  CONSTRAINT fk_user_notifications_user
    FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

-- =============================================
-- DATA AWAL (SEED)
-- =============================================

-- Admin default (password: admin123)
IF NOT EXISTS (
  SELECT 1
  FROM dbo.users
  WHERE email = N'admin@jasatirta2.co.id'
)
BEGIN
  INSERT INTO dbo.users (name, email, phone, password, role)
  VALUES (N'Admin GOR', N'admin@jasatirta2.co.id', N'08123456789', N'$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', N'admin');
END
GO

-- Lantai
IF NOT EXISTS (SELECT 1 FROM dbo.floors WHERE name = N'Lantai 1')
BEGIN
  INSERT INTO dbo.floors (name, description, price_per_hour)
  VALUES
    (N'Lantai 1', N'Area serbaguna untuk yoga, senam, dan tenis meja', 100000),
    (N'Lantai 2', N'Lapangan utama untuk futsal, voli, badminton, dan basket', 150000);
END
GO

-- Olahraga per Lantai
IF NOT EXISTS (SELECT 1 FROM dbo.floor_sports)
BEGIN
  INSERT INTO dbo.floor_sports (floor_id, sport_name, icon)
  VALUES
    (1, N'Yoga', N'heart'),
    (1, N'Senam', N'activity'),
    (1, N'Tenis Meja', N'target'),
    (2, N'Futsal', N'goal'),
    (2, N'Voli', N'volleyball'),
    (2, N'Badminton', N'badminton'),
    (2, N'Basket', N'basketball');
END
GO
