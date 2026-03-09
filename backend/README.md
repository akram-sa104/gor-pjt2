# Backend GOR Perum Jasa Tirta II

## Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Buat database MySQL
Buka phpMyAdmin → jalankan file `database.sql`

### 3. Konfigurasi environment
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi MySQL kamu
```

### 4. Jalankan server
```bash
npm run dev
```
Server berjalan di `http://localhost:5000`

---

## API Endpoints

### Auth
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Daftar user baru | ❌ |
| POST | `/api/auth/login` | Login, dapat token JWT | ❌ |
| GET | `/api/auth/me` | Get profil user | ✅ |

### Booking
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/bookings/courts` | Daftar lapangan | ❌ |
| GET | `/api/bookings/availability?court_id=1&date=2025-01-15` | Cek ketersediaan | ❌ |
| POST | `/api/bookings` | Buat booking | ✅ User |
| GET | `/api/bookings/my` | Riwayat booking saya | ✅ User |
| PATCH | `/api/bookings/:id/cancel` | Batalkan booking | ✅ User |
| GET | `/api/bookings/all` | Semua booking | ✅ Admin |
| PATCH | `/api/bookings/:id/status` | Approve/Reject | ✅ Admin |
| GET | `/api/bookings/stats` | Statistik | ✅ Admin |

### Contact
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/contact` | Kirim pesan | ❌ |
| GET | `/api/contact` | Lihat semua pesan | ✅ Admin |

### Auth Header
```
Authorization: Bearer <token_jwt>
```

---

## Contoh Request

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@mail.com","phone":"08123456789","password":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@mail.com","password":"123456"}'
```

### Buat Booking
```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_KAMU" \
  -d '{"court_id":1,"booking_date":"2025-01-20","start_time":"08:00","end_time":"10:00"}'
```

## Login Admin Default
- Email: `admin@jasatirta2.co.id`
- Password: `admin123`
