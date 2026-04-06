import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, CheckCircle, Loader2, Goal, Volleyball } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { api, Court } from "@/lib/api";
import PaymentMethodSelector, { PaymentMethod } from "@/components/PaymentMethodSelector";

const iconMap: Record<string, any> = { futsal: Goal, badminton: Volleyball };

const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

const bookedSlots: Record<string, string[]> = {
  "futsal": ["09:00", "10:00", "14:00"],
  "badminton": ["08:00", "15:00", "16:00"],
};

const Booking = () => {
   const { user } = useAuth();
  const navigate = useNavigate();
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourts, setLoadingCourts] = useState(true);
  // Load courts
  useEffect(() => {
    api.getCourts()
      .then((data) => {
        setCourts(data);
        if (data.length > 0) setSelectedCourt(data[0].id);
      })
      .catch(() => toast.error("Gagal memuat data lapangan"))
      .finally(() => setLoadingCourts(false));
  }, []);
  // Load availability when court/date changes
  useEffect(() => {
    if (!selectedCourt || !selectedDate) {
      setBookedTimes([]);
      return;
    }
    api.getAvailability(selectedCourt, selectedDate)
      .then((data) => {
        const booked = data.map((b) => b.start_time.slice(0, 5));
        setBookedTimes(booked);
      })
      .catch(() => setBookedTimes([]));
  }, [selectedCourt, selectedDate]);
  const court = courts.find((c) => c.id === selectedCourt);
  const handleBooking = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu!");
      navigate("/login");
      return;
    }
    if (!selectedCourt || !selectedDate || !selectedTime) {
      toast.error("Pilih tanggal dan jam terlebih dahulu!");
      return;
    }
        setLoading(true);
    try {
      const endHour = String(parseInt(selectedTime.split(":")[0]) + 1).padStart(2, "0");
      await api.createBooking({
        court_id: selectedCourt,
        booking_date: selectedDate,
        start_time: `${selectedTime}:00`,
        end_time: `${endHour}:00:00`,
      });
      toast.success("Booking berhasil diajukan!");
      setSelectedTime("");
      // Refresh availability
      const data = await api.getAvailability(selectedCourt, selectedDate);
      setBookedTimes(data.map((b) => b.start_time.slice(0, 5)));
    } catch (err: any) {
      toast.error(err.message || "Booking gagal");
    } finally {
      setLoading(false);
    }
  };

    const isBooked = (time: string) => bookedTimes.includes(time);
  if (loadingCourts) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-secondary pt-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-secondary pt-24 pb-12">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <span className="text-accent font-semibold text-sm uppercase tracking-wider">Booking Online</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-3">Booking Lapangan</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">Pilih lapangan, tanggal, dan jam untuk melakukan booking</p>
          </motion.div>

          <div className="max-w-4xl mx-auto grid lg:grid-cols-3 gap-6">
            {/* Court selection */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-semibold text-foreground mb-2">Pilih Lapangan</h3>
                     {courts.map((c) => {
                const Icon = iconMap[c.type] || Goal;
                return (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedCourt(c.id); setSelectedTime(""); }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedCourt === c.id
                        ? "border-primary bg-primary/5 shadow-corporate"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedCourt === c.id ? "gradient-primary" : "bg-secondary"}`}>
                        <Icon className={`h-5 w-5 ${selectedCourt === c.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{c.name}</p>
                        <p className="text-sm text-accent font-medium">Rp {c.price_per_hour.toLocaleString("id-ID")}/jam</p>
                      </div>
                    </div>
                       </button>
                );
              })}

              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Pilih Tanggal
                </h3>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Time slots */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Pilih Jam
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((time) => {
                  const booked = isBooked(time);
                  const selected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      disabled={booked}
                      onClick={() => setSelectedTime(time)}
                      className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        booked
                          ? "bg-destructive/10 text-destructive/50 cursor-not-allowed line-through"
                          : selected
                          ? "gradient-primary text-primary-foreground shadow-corporate"
                          : "bg-card border border-border text-foreground hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-card border border-border inline-block" /> Tersedia</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded gradient-primary inline-block" /> Dipilih</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-destructive/10 inline-block" /> Terisi</span>
              </div>

              {/* Summary */}
                      {selectedDate && selectedTime && court && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-card rounded-xl border border-border p-5 shadow-corporate"
                >
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" /> Ringkasan Booking
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                         <div><span className="text-muted-foreground">Lapangan:</span><p className="font-medium text-foreground">{court.name}</p></div>
                    <div><span className="text-muted-foreground">Harga:</span><p className="font-medium text-accent">Rp {court.price_per_hour.toLocaleString("id-ID")}/jam</p></div>
                    <div><span className="text-muted-foreground">Tanggal:</span><p className="font-medium text-foreground">{selectedDate}</p></div>
                    <div><span className="text-muted-foreground">Jam:</span><p className="font-medium text-foreground">{selectedTime}</p></div>
                  </div>
                    <div className="mb-4">
                    <PaymentMethodSelector selected={paymentMethod} onSelect={setPaymentMethod} />
                  </div>
                   <Button onClick={handleBooking} disabled={loading} className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-11">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {loading ? "Memproses..." : "Ajukan Booking"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Booking;
