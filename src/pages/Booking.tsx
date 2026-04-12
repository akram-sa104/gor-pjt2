import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, CheckCircle, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { api, Floor, AvailabilitySlot } from "@/lib/api";
import PaymentMethodSelector, { PaymentMethod } from "@/components/PaymentMethodSelector";


const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
];

const bookedSlots: Record<string, string[]> = {
  "futsal": ["09:00", "10:00", "14:00"],
  "badminton": ["08:00", "15:00", "16:00"],
};

const Booking = () => {
   const { user } = useAuth();
  const navigate = useNavigate();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedSport, setSelectedSport] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookedSlots, setBookedSlots] = useState<AvailabilitySlot[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFloors, setLoadingFloors] = useState(true);

  useEffect(() => {
    api.getFloors()
      .then((data) => {
          setFloors(data);
        if (data.length > 0) {
          setSelectedFloor(data[0].id);
          if (data[0].sports.length > 0) setSelectedSport(data[0].sports[0].sport_name);
        }
      })
      .catch(() => toast.error("Gagal memuat data lantai"))
      .finally(() => setLoadingFloors(false));
  }, []);
  
  useEffect(() => {
      if (!selectedFloor || !selectedDate) {
      setBookedSlots([]);
      return;
    }
     api.getAvailability(selectedFloor, selectedDate)
      .then(setBookedSlots)
      .catch(() => setBookedSlots([]));
  }, [selectedFloor, selectedDate]);
   const floor = floors.find((f) => f.id === selectedFloor);
  const isTimeBooked = (time: string) => {
    const timeVal = time + ":00";
    return bookedSlots.some(slot => {
      const slotStart = slot.start_time.slice(0, 8);
      const slotEnd = slot.end_time.slice(0, 8);
      return timeVal >= slotStart && timeVal < slotEnd;
    });
  };
  const isTimeInRange = (time: string) => {
    if (!startTime || !endTime) return false;
    return time >= startTime && time < endTime;
  };
  const canSelectAsEnd = (time: string) => {
    if (!startTime) return false;
    if (time <= startTime) return false;
    // Check no booked slot between start and this time
    for (const slot of bookedSlots) {
      const slotStart = slot.start_time.slice(0, 5);
      const slotEnd = slot.end_time.slice(0, 5);
      if (slotStart < time && slotEnd > startTime) return false;
    }
    return true;
  };
  const handleTimeClick = (time: string) => {
    if (isTimeBooked(time)) return;
    if (!startTime || endTime) {
      // Start fresh selection
      setStartTime(time);
      setEndTime("");
    } else {
      // Selecting end time
      if (time <= startTime) {
        setStartTime(time);
        setEndTime("");
      } else if (canSelectAsEnd(time)) {
        // End time = next hour of clicked slot
        const endHour = String(parseInt(time.split(":")[0]) + 1).padStart(2, "0");
        setEndTime(`${endHour}:00`);
      }
    }
  };
  const getDurationHours = () => {
    if (!startTime || !endTime) return 0;
    return parseInt(endTime.split(":")[0]) - parseInt(startTime.split(":")[0]);
  };
  const handleBooking = async () => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu!");
      navigate("/login");
      return;
    }
    if (!selectedFloor || !selectedSport || !selectedDate || !startTime || !endTime) {
      toast.error("Lengkapi semua pilihan terlebih dahulu!");
      return;
    }
        setLoading(true);
    try {
      
      await api.createBooking({
         floor_id: selectedFloor,
        sport: selectedSport,
        booking_date: selectedDate,
         start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
      });
      toast.success("Booking berhasil diajukan!");
       setStartTime("");
      setEndTime("");
      const data = await api.getAvailability(selectedFloor, selectedDate);
      setBookedSlots(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Booking gagal";
      toast.error(message || "Booking gagal");
    } finally {
      setLoading(false);
    }
  };

  if (loadingFloors) {
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
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-3">Booking GOR</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">Pilih lantai, olahraga, tanggal, dan rentang jam untuk booking</p>
          </motion.div>

         <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
            {/* Left: Floor, Sport, Date selection */}
            <div className="lg:col-span-1 space-y-5">
              {/* Floor Selection */}
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" /> Pilih Lantai
                </h3>
                {floors.map((f) => (
                  <button
                   key={f.id}
                    onClick={() => {
                      setSelectedFloor(f.id);
                      setSelectedSport(f.sports[0]?.sport_name || "");
                      setStartTime("");
                      setEndTime("");
                    }}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all mb-3 ${
                      selectedFloor === f.id
                        ? "border-primary bg-primary/5 shadow-corporate"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                          <p className="font-semibold text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{f.description}</p>
                    <p className="text-sm text-accent font-medium mt-1">Rp {Number(f.price_per_hour).toLocaleString("id-ID")}/jam</p>
                       </button>
                 ))}
              </div>

               {/* Sport Selection */}
              {floor && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Pilih Olahraga</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {floor.sports.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSport(s.sport_name)}
                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          selectedSport === s.sport_name
                            ? "gradient-primary text-primary-foreground shadow-corporate"
                            : "bg-card border border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {s.sport_name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Date Selection */}
              <div>
                <label htmlFor="booking-date" className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Pilih Tanggal
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setStartTime(""); setEndTime(""); }}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

             {/* Right: Time slots */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Pilih Rentang Jam
              </h3>
               <p className="text-xs text-muted-foreground mb-4">
                {!startTime ? "Klik jam mulai" : !endTime ? "Klik jam selesai" : "Rentang jam sudah dipilih"}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {timeSlots.map((time) => {
                          const booked = isTimeBooked(time);
                  const isStart = startTime === time;
                  const inRange = isTimeInRange(time);
                  const isSelectable = !startTime || !endTime ? !booked : true;

                  return (
                    <button
                      key={time}
                      disabled={booked}
                       onClick={() => handleTimeClick(time)}
                      className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${
                        booked
                          ? "bg-destructive/10 text-destructive/50 cursor-not-allowed line-through"
                           : isStart
                          ? "gradient-primary text-primary-foreground shadow-corporate ring-2 ring-primary"
                          : inRange
                          ? "bg-primary/20 text-primary border-2 border-primary/40"
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
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded gradient-primary inline-block" /> Jam Mulai</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary/20 border-2 border-primary/40 inline-block" /> Rentang</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-destructive/10 inline-block" /> Terisi</span>
              </div>

              {/* Summary */}
                         {selectedDate && startTime && endTime && floor && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-card rounded-xl border border-border p-5 shadow-corporate"
                >
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-accent" /> Ringkasan Booking
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
               <div><span className="text-muted-foreground">Lantai:</span><p className="font-medium text-foreground">{floor.name}</p></div>
                    <div><span className="text-muted-foreground">Olahraga:</span><p className="font-medium text-foreground">{selectedSport}</p></div>
                    <div><span className="text-muted-foreground">Tanggal:</span><p className="font-medium text-foreground">{selectedDate}</p></div>
                    <div><span className="text-muted-foreground">Jam:</span><p className="font-medium text-foreground">{startTime} - {endTime}</p></div>
                    <div><span className="text-muted-foreground">Durasi:</span><p className="font-medium text-foreground">{getDurationHours()} jam</p></div>
                    <div><span className="text-muted-foreground">Total:</span><p className="font-medium text-accent">Rp {(Number(floor.price_per_hour) * getDurationHours()).toLocaleString("id-ID")}</p></div>
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
