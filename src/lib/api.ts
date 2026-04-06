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

    changePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

     updateProfile: (data: { name: string; phone: string }) =>
    request<User>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  resetPassword: (email: string, code: string, newPassword: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, code, newPassword }),
    }),

  // Contact
  sendContact: (data: { name: string; email: string; subject?: string; message: string }) =>
    request<{ message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

      // Users (Admin)
  getAllUsers: () => request<UserItem[]>('/auth/users'),
  deleteUser: (id: number) =>
    request<{ message: string }>(`/auth/users/${id}`, { method: 'DELETE' }),
  // Gallery (Admin)
  getGallery: () => request<GalleryItem[]>('/gallery'),
  addGallery: (data: { title: string; image_url: string; category: string }) =>
    request<{ message: string; id: number }>('/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateGallery: (id: number, data: { title: string; image_url: string; category: string }) =>
    request<{ message: string }>(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteGallery: (id: number) =>
    request<{ message: string }>(`/gallery/${id}`, { method: 'DELETE' }),
    // Notifications (Admin)
  getNotifications: () => request<NotificationItem[]>('/notifications'),
  getUnreadNotificationCount: () =>
    request<{ count: number }>('/notifications/unread-count'),
  markAllNotificationsRead: () =>
    request<{ message: string }>('/notifications/read-all', { method: 'PATCH' }),
  markNotificationRead: (id: number) =>
    request<{ message: string }>(`/notifications/${id}/read`, { method: 'PATCH' }),
   // User Notifications
  getUserNotifications: () => request<NotificationItem[]>('/user-notifications'),
  getUserUnreadNotificationCount: () =>
    request<{ count: number }>('/user-notifications/unread-count'),
  markAllUserNotificationsRead: () =>
    request<{ message: string }>('/user-notifications/read-all', { method: 'PATCH' }),
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
export interface UserItem {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
}
export interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  category: 'lapangan' | 'tribun' | 'exterior' | 'fasilitas';
  created_at: string;
}

export interface NotificationItem {
  id: number;
  message: string;
  type: 'booking_new' | 'booking_cancelled' | 'general';
  is_read: boolean;
  related_id?: number;
  created_at: string;
}