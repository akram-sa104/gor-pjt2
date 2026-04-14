import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin, Download, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, Floor, AvailabilitySlot } from "@/lib/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
  "19:00", "20:00", "21:00",
];

const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatShortDate(d: Date) {
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

const fallbackFloors: Floor[] = [
  {
    id: 1, name: "Lantai 1", description: "Yoga, Senam, Tenis Meja",
    price_per_hour: 100000, is_active: true,
    sports: [
      { id: 1, floor_id: 1, sport_name: "Yoga", icon: "heart" },
      { id: 2, floor_id: 1, sport_name: "Senam", icon: "activity" },
      { id: 3, floor_id: 1, sport_name: "Tenis Meja", icon: "target" },
    ],
  },
  {
    id: 2, name: "Lantai 2", description: "Futsal, Voli, Badminton, Basket",
    price_per_hour: 150000, is_active: true,
    sports: [
      { id: 4, floor_id: 2, sport_name: "Futsal", icon: "goal" },
      { id: 5, floor_id: 2, sport_name: "Voli", icon: "volleyball" },
      { id: 6, floor_id: 2, sport_name: "Badminton", icon: "badminton" },
      { id: 7, floor_id: 2, sport_name: "Basket", icon: "basketball" },
    ],
  },
];

const WeeklySchedule = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [weekAvailability, setWeekAvailability] = useState<Record<string, AvailabilitySlot[]>>({});
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const scheduleRef = useRef<HTMLDivElement>(null);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  useEffect(() => {
    api.getFloors()
      .then((data) => {
        const f = data.length > 0 ? data : fallbackFloors;
        setFloors(f);
        if (!selectedFloor && f.length > 0) setSelectedFloor(f[0].id);
      })
      .catch(() => {
        setFloors(fallbackFloors);
        if (!selectedFloor) setSelectedFloor(1);
      });
  }, [selectedFloor]);

  useEffect(() => {
    if (!selectedFloor) return;
    setLoading(true);
    const promises = weekDates.map((d) => {
      const dateStr = formatDate(d);
      return api.getAvailability(selectedFloor, dateStr)
        .then((slots) => ({ date: dateStr, slots }))
        .catch(() => ({ date: dateStr, slots: [] as AvailabilitySlot[] }));
    });
    Promise.all(promises).then((results) => {
      const map: Record<string, AvailabilitySlot[]> = {};
      results.forEach((r) => { map[r.date] = r.slots; });
      setWeekAvailability(map);
      setLoading(false);
    });
  }, [selectedFloor, weekOffset, weekDates]);

  const isBooked = (date: string, time: string) => {
    const slots = weekAvailability[date] || [];
    const timeVal = time + ":00";
    return slots.some((slot) => {
      const start = slot.start_time.slice(0, 8);
      const end = slot.end_time.slice(0, 8);
      return timeVal >= start && timeVal < end;
    });
  };

  const getBookingInfo = (date: string, time: string) => {
    const slots = weekAvailability[date] || [];
    const timeVal = time + ":00";
    return slots.find((slot) => {
      const start = slot.start_time.slice(0, 8);
      const end = slot.end_time.slice(0, 8);
      return timeVal >= start && timeVal < end;
    });
  };

  const floor = floors.find((f) => f.id === selectedFloor);
  const isToday = (d: Date) => formatDate(d) === formatDate(new Date());

  const handleExportImage = async () => {
    if (!scheduleRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(scheduleRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `jadwal-${floor?.name || 'gor'}-${formatShortDate(weekDates[0])}-${formatShortDate(weekDates[6])}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export image failed:', err);
    }
    setExporting(false);
  };
  const handleExportPDF = async () => {
    if (!scheduleRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(scheduleRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`jadwal-${floor?.name || 'gor'}-${formatShortDate(weekDates[0])}-${formatShortDate(weekDates[6])}.pdf`);
    } catch (err) {
      console.error('Export PDF failed:', err);
    }
    setExporting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-8 md:pt-32 md:pb-12 bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
              <CalendarDays size={18} />
              <span className="text-sm font-medium">Jadwal Mingguan</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Jadwal <span className="text-primary">Ketersediaan</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Lihat ketersediaan semua lantai dalam satu tampilan mingguan
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Floor selector */}
          <div className="flex flex-wrap gap-3 justify-center mb-6">
            {floors.map((f) => (
              <Button
                key={f.id}
                variant={selectedFloor === f.id ? "default" : "outline"}
                onClick={() => setSelectedFloor(f.id)}
                className="gap-2"
              >
                <MapPin size={16} />
                {f.name}
              </Button>
            ))}
          </div>

          {floor && (
            <p className="text-center text-sm text-muted-foreground mb-6">
              Olahraga: {floor.sports.map((s) => s.sport_name).join(", ")} — Rp {floor.price_per_hour?.toLocaleString("id-ID")}/jam
            </p>
          )}

          {/* Week navigation */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p - 1)}>
              <ChevronLeft size={18} />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[200px] text-center">
              {formatShortDate(weekDates[0])} — {formatShortDate(weekDates[6])}{" "}
              {weekDates[0].getFullYear()}
            </span>
            <Button variant="outline" size="icon" onClick={() => setWeekOffset((p) => p + 1)}>
              <ChevronRight size={18} />
            </Button>
            {weekOffset !== 0 && (
              <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
                Minggu Ini
              </Button>
            )}
          </div>

 {/* Export buttons */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={exporting || loading} className="gap-2">
              <Download size={16} />
              {exporting ? "Mengekspor..." : "Export PDF"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportImage} disabled={exporting || loading} className="gap-2">
              <Image size={16} />
              {exporting ? "Mengekspor..." : "Export Gambar"}
            </Button>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mb-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-accent/20 border border-accent/40" />
              <span className="text-muted-foreground">Tersedia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/40" />
              <span className="text-muted-foreground">Terisi</span>
            </div>
          </div>

          {/* Schedule grid */}
           <div className="overflow-x-auto" ref={scheduleRef}>
            <div className="min-w-[800px]">
              {/* Header */}
              <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-1">
                <div className="flex items-center justify-center p-2">
                  <Clock size={16} className="text-muted-foreground" />
                </div>
                {weekDates.map((d, i) => (
                  <div
                    key={i}
                    className={`text-center p-2 rounded-lg text-sm font-medium ${
                      isToday(d)
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-secondary/50 text-foreground"
                    }`}
                  >
                    <div className="font-semibold">{dayNames[d.getDay()]}</div>
                    <div className="text-xs text-muted-foreground">{formatShortDate(d)}</div>
                  </div>
                ))}
              </div>

              {/* Time rows */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : (
                timeSlots.map((time) => (
                  <div key={time} className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-1">
                    <div className="flex items-center justify-center text-xs font-medium text-muted-foreground bg-secondary/30 rounded-lg p-2">
                      {time}
                    </div>
                    {weekDates.map((d, i) => {
                      const dateStr = formatDate(d);
                      const booked = isBooked(dateStr, time);
                      const info = booked ? getBookingInfo(dateStr, time) : null;
                      return (
                        <div
                          key={i}
                          className={`rounded-lg p-2 text-center text-xs transition-colors ${
                            booked
                              ? "bg-destructive/15 border border-destructive/30 text-destructive"
                              : "bg-accent/10 border border-accent/20 text-accent-foreground"
                          }`}
                          title={
                            booked && info
                              ? `${info.sport || "Terisi"} (${info.start_time?.slice(0, 5)} - ${info.end_time?.slice(0, 5)})`
                              : "Tersedia"
                          }
                        >
                          {booked ? "Terisi" : "—"}
                        </div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WeeklySchedule;
