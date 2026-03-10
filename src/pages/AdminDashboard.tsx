import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, CalendarDays, CheckCircle, XCircle, Clock, LogOut, Image, Settings, LayoutDashboard, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { api, AdminBookingItem, AdminStats } from "@/lib/api";

const statusConfig = {
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  approved: { label: "Approved", className: "bg-success/10 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Dibatalkan", className: "bg-muted text-muted-foreground" },
};

type TabKey = "dashboard" | "booking" | "galeri" | "users" | "statistik" | "pengaturan";
const sidebarItems: { icon: any; label: string; key: TabKey }[] = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: CalendarDays, label: "Kelola Booking", key: "booking" },
  { icon: Image, label: "Kelola Galeri", key: "galeri" },
  { icon: Users, label: "Data User", key: "users" },
  { icon: BarChart3, label: "Statistik", key: "statistik" },
  { icon: Settings, label: "Pengaturan", key: "pengaturan" },
];

const AdminDashboard = () => {
   const { user, logout } = useAuth();
  const navigate = useNavigate();
   const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [bookings, setBookings] = useState<AdminBookingItem[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }
    Promise.all([api.getAllBookings(), api.getStats()])
      .then(([b, s]) => { setBookings(b); setStats(s); })
      .catch(() => toast.error("Gagal memuat data"))
      .finally(() => setLoading(false));
  }, [user, navigate]);
  const updateStatus = async (id: number, status: "approved" | "rejected") => {
    try {
      await api.updateBookingStatus(id, status);
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
      toast.success(`Booking ${status === "approved" ? "disetujui" : "ditolak"}.`);
    } catch (err: any) {
      toast.error(err.message || "Gagal update status");
    }
  };

   const handleLogout = () => { logout(); navigate("/"); };
  const statCards = stats ? [
    { label: "Total Booking", value: stats.totalBookings, color: "text-foreground" },
    { label: "Pending", value: stats.pendingBookings, color: "text-warning" },
    { label: "Disetujui", value: stats.approvedBookings, color: "text-success" },
    { label: "Total User", value: stats.totalUsers, color: "text-primary" },
  ] : [];

   const renderContent = () => {
    if (loading) {
      return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }
    switch (activeTab) {
      case "dashboard":
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-6">Admin Dashboard</h1>
            <div className="grid sm:grid-cols-4 gap-4 mb-8">
              {statCards.map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-4 shadow-corporate">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-xl shadow-corporate p-6 mb-6">
              <h2 className="font-semibold text-foreground mb-4">Statistik Penggunaan GOR</h2>
              <div className="flex items-end gap-2 h-40">
                {(stats?.monthlyBookings || []).slice(-7).map((m, i) => {
                  const max = Math.max(...(stats?.monthlyBookings || []).map((x) => x.count), 1);
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(m.count / max) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="w-full gradient-primary rounded-t-md min-h-[4px]"
                      />
                      <span className="text-xs text-muted-foreground">{m.month.slice(5)}</span>
                    </div>
                  );
                })}
                {(!stats?.monthlyBookings || stats.monthlyBookings.length === 0) && (
                  <p className="text-muted-foreground text-sm w-full text-center">Belum ada data</p>
                )}
              </div>
            </div>
            {/* Recent bookings preview */}
            <div className="bg-card rounded-xl shadow-corporate overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Booking Terbaru</h2>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("booking")} className="text-primary">Lihat Semua</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Lapangan</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b.id} className="border-b border-border">
                        <td className="py-3 px-4 text-foreground">{b.user_name}</td>
                        <td className="py-3 px-4 text-foreground">{b.court_name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[b.status]?.className || ""}`}>
                            {statusConfig[b.status]?.label || b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      case "booking":
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-6">Kelola Booking</h1>
            <div className="bg-card rounded-xl shadow-corporate overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Lapangan</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tanggal</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Jam</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 text-foreground font-medium">{b.user_name}</td>
                        <td className="py-3 px-4 text-foreground">{b.court_name}</td>
                        <td className="py-3 px-4 text-foreground">{b.booking_date.slice(0, 10)}</td>
                        <td className="py-3 px-4 text-foreground">{b.start_time.slice(0, 5)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[b.status]?.className || ""}`}>
                            {statusConfig[b.status]?.label || b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {b.status === "pending" && (
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => updateStatus(b.id, "approved")} className="text-success hover:text-success hover:bg-success/10 h-8">
                                <CheckCircle className="h-3.5 w-3.5 mr-1" /> Setujui
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => updateStatus(b.id, "rejected")} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8">
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Tolak
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Belum ada booking</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        );
      case "galeri":
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-6">Kelola Galeri</h1>
            <div className="bg-card rounded-xl shadow-corporate p-8 text-center">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Fitur kelola galeri akan segera hadir.</p>
              <p className="text-sm text-muted-foreground mt-1">Anda akan bisa menambah, mengedit, dan menghapus foto galeri GOR.</p>
            </div>
          </>
        );
      case "users":
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-6">Data User</h1>
            <div className="bg-card rounded-xl shadow-corporate p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Fitur manajemen user akan segera hadir.</p>
              <p className="text-sm text-muted-foreground mt-1">Anda akan bisa melihat dan mengelola data pengguna terdaftar.</p>
            </div>
          </>
        );
      case "statistik":
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-6">Statistik</h1>
            <div className="grid sm:grid-cols-4 gap-4 mb-8">
              {statCards.map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-4 shadow-corporate">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-xl shadow-corporate p-6">
              <h2 className="font-semibold text-foreground mb-4">Statistik Bulanan</h2>
              <div className="flex items-end gap-2 h-48">
                {(stats?.monthlyBookings || []).map((m, i) => {
                  const max = Math.max(...(stats?.monthlyBookings || []).map((x) => x.count), 1);
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${(m.count / max) * 100}%` }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="w-full gradient-primary rounded-t-md min-h-[4px]"
                      />
                      <span className="text-xs text-muted-foreground">{m.month.slice(5)}</span>
                    </div>
                  );
                })}
                {(!stats?.monthlyBookings || stats.monthlyBookings.length === 0) && (
                  <p className="text-muted-foreground text-sm w-full text-center">Belum ada data</p>
                )}
              </div>
            </div>
          </>
        );
      case "pengaturan":
        return (
          <>
            <h1 className="text-2xl font-bold text-foreground mb-6">Pengaturan</h1>
            <div className="space-y-6">
              <div className="bg-card rounded-xl shadow-corporate p-6">
                <h2 className="font-semibold text-foreground mb-4">Profil Admin</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Nama</label>
                    <Input defaultValue={user?.name || ""} disabled />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                    <Input defaultValue={user?.email || ""} disabled />
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-xl shadow-corporate p-6">
                <h2 className="font-semibold text-foreground mb-4">Pengaturan Umum</h2>
                <p className="text-sm text-muted-foreground">Fitur pengaturan lanjutan akan segera hadir.</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-secondary pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <motion.aside initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full md:w-64 shrink-0">
              <div className="bg-card rounded-xl shadow-corporate p-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center">
                    <Settings className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                     <p className="font-semibold text-foreground text-sm">{user?.name || "Admin"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <nav className="space-y-1">
                  {sidebarItems.map((item) => (
                    <button
                        key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <item.icon className="h-4 w-4" /> {item.label}
                    </button>
                  ))}
                   <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </nav>
              </div>
            </motion.aside>

            {/* Main */}
            <motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1">
              {renderContent()}
            </motion.main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
