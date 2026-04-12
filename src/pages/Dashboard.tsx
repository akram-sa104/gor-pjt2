import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, LogOut, User, History, XCircle, Loader2, Settings, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { api, BookingItem } from "@/lib/api";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import EditProfileForm from "@/components/EditProfileForm";
import ReviewForm from "@/components/ReviewForm";

const statusConfig = {
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  approved: { label: "Approved", className: "bg-success/10 text-success" },
  rejected: { label: "Rejected", className: "bg-destructive/10 text-destructive" },
  cancelled: { label: "Dibatalkan", className: "bg-muted text-muted-foreground" },
};

type TabKey = "riwayat" | "pengaturan";
const Dashboard = () => {
    const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("riwayat");
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());

 useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    api.getMyBookings()
        .then((b) => {
        setBookings(b);
        // Check which approved bookings are already reviewed
        const approved = b.filter((x) => x.status === "approved");
        Promise.all(approved.map((x) => api.checkReview(x.id).then((r) => r.reviewed ? x.id : null)))
          .then((ids) => setReviewedIds(new Set(ids.filter(Boolean) as number[])));
      })
      .catch(() => toast.error("Gagal memuat data booking"))
      .finally(() => setLoading(false));
  }, [user, navigate]);
  const cancelBooking = async (id: number) => {
    try {
      await api.cancelBooking(id);
      setBookings(bookings.filter((b) => b.id !== id));
      toast.success("Booking berhasil dibatalkan.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal membatalkan booking";
      toast.error(message || "Gagal membatalkan booking");
    }
  };
  const handleLogout = () => {
    logout();
    navigate("/");

      };
  const renderContent = () => {
    if (activeTab === "pengaturan") {
      return (
        <>
          <h1 className="text-2xl font-bold text-foreground mb-6">Pengaturan</h1>
          <div className="space-y-6">
            <EditProfileForm />
             <ChangePasswordForm />
          </div>
        </>
      );
    }
    return (
      <>
        <h1 className="text-2xl font-bold text-foreground mb-6">Dashboard</h1>
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl p-4 shadow-corporate">
            <p className="text-sm text-muted-foreground">Total Booking</p>
            <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-corporate">
            <p className="text-sm text-muted-foreground">Disetujui</p>
            <p className="text-2xl font-bold text-success">{bookings.filter(b => b.status === "approved").length}</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-corporate">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-warning">{bookings.filter(b => b.status === "pending").length}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-corporate overflow-hidden">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Riwayat Booking</h2>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Belum ada booking. <Link to="/booking" className="text-primary hover:underline">Buat booking sekarang</Link></p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Lantai</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Olahraga</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tanggal</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Jam</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <React.Fragment key={b.id}>
                      <tr className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 text-foreground font-medium">{b.floor_name}</td>
                        <td className="py-3 px-4 text-foreground">{b.sport}</td>
                        <td className="py-3 px-4 text-foreground flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />{b.booking_date.slice(0, 10)}</td>
                           <td className="py-3 px-4 text-foreground"><Clock className="h-3.5 w-3.5 inline mr-1.5 text-muted-foreground" />{b.start_time.slice(0, 5)} - {b.end_time.slice(0, 5)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[b.status]?.className || ""}`}>
                            {statusConfig[b.status]?.label || b.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {b.status === "pending" && (
                            <Button variant="ghost" size="sm" onClick={() => cancelBooking(b.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8">
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Batal
                            </Button>
                          )}
                          {b.status === "approved" && !reviewedIds.has(b.id) && (
                            <Button variant="ghost" size="sm" onClick={() => setReviewingId(reviewingId === b.id ? null : b.id)} className="text-warning hover:text-warning hover:bg-warning/10 h-8">
                              <Star className="h-3.5 w-3.5 mr-1" /> Review
                            </Button>
                          )}
                          {b.status === "approved" && reviewedIds.has(b.id) && (
                            <span className="text-xs text-muted-foreground">✓ Reviewed</span>
                          )}
                        </td>
                      </tr>
                      {reviewingId === b.id && (
                        <tr>
                          <td colSpan={5} className="px-4 pb-4">
                            <ReviewForm
                              bookingId={b.id}
                               courtName={`${b.floor_name} - ${b.sport}`}
                              onReviewSent={() => {
                                setReviewingId(null);
                                setReviewedIds((prev) => new Set([...prev, b.id]));
                              }}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-secondary pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
             <motion.aside initial={{ opacity: 0, x: -20 }} 
             animate={{ opacity: 1, x: 0 }} className="w-full md:w-64 shrink-0">
              <div className="bg-card rounded-xl shadow-corporate p-5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                       <p className="font-semibold text-foreground text-sm">{user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <nav className="space-y-1">
                      <button
                    onClick={() => setActiveTab("riwayat")}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "riwayat" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <History className="h-4 w-4" /> Riwayat Booking
                  </button>
                  <Link to="/booking" className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors">
                    <CalendarDays className="h-4 w-4" /> Booking Baru
                  </Link>
                   <button
                    onClick={() => setActiveTab("pengaturan")}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === "pengaturan" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Settings className="h-4 w-4" /> Pengaturan
                  </button>
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

export default Dashboard;
