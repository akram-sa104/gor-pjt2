const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Terjadi kesalahan');
  }
  return data;
}
// Auth
export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (data: { name: string; email: string; phone: string; password: string }) =>
    request<{ message: string; userId: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProfile: () => request<User>('/auth/me'),
  // Courts
  getCourts: () => request<Court[]>('/bookings/courts'),
  // Availability
  getAvailability: (courtId: number, date: string) =>
    request<{ start_time: string; end_time: string; status: string }[]>(
      `/bookings/availability?court_id=${courtId}&date=${date}`
    ),
  // Bookings
  createBooking: (data: { court_id: number; booking_date: string; start_time: string; end_time: string; notes?: string }) =>
    request<{ message: string; bookingId: number }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMyBookings: () => request<BookingItem[]>('/bookings/my'),
  cancelBooking: (id: number) =>
    request<{ message: string }>(`/bookings/${id}/cancel`, { method: 'PATCH' }),
  // Admin
  getAllBookings: () => request<AdminBookingItem[]>('/bookings/all'),
  updateBookingStatus: (id: number, status: 'approved' | 'rejected') =>
    request<{ message: string }>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  getStats: () => request<AdminStats>('/bookings/stats'),
  // Contact
  sendContact: (data: { name: string; email: string; subject?: string; message: string }) =>
    request<{ message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
// Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
}
export interface Court {
  id: number;
  name: string;
  type: 'futsal' | 'badminton';
  price_per_hour: number;
  is_active: boolean;
}
export interface BookingItem {
  id: number;
  court_name: string;
  court_type: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  notes?: string;
  created_at: string;
}
export interface AdminBookingItem extends BookingItem {
  user_name: string;
  user_email: string;
}
export interface AdminStats {
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  totalUsers: number;
  monthlyBookings: { month: string; count: number }[];
}