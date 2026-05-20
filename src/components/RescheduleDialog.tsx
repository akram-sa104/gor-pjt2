import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api, BookingItem, AvailabilitySlot } from "@/lib/api";

const timeSlots = [
  "07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00",
];

interface Props {
  booking: BookingItem & { floor_id?: number };
  floorId: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RescheduleDialog = ({ booking, floorId, open, onClose, onSuccess }: Props) => {
  const [date, setDate] = useState(booking.booking_date.slice(0, 10));
  const [start, setStart] = useState(booking.start_time.slice(0, 5));
  const [end, setEnd] = useState(booking.end_time.slice(0, 5));
  const [booked, setBooked] = useState<AvailabilitySlot[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !date) return;
    api.getAvailability(floorId, date).then(setBooked).catch(() => setBooked([]));
  }, [open, date, floorId]);

  const isBooked = (time: string) => {
    const v = time + ":00";
    return booked.some(s => {
      // Exclude current booking's slot
      if (s.start_time.slice(0,5) === booking.start_time.slice(0,5) &&
          s.end_time.slice(0,5) === booking.end_time.slice(0,5) &&
          date === booking.booking_date.slice(0,10)) return false;
      return v >= s.start_time.slice(0,8) && v < s.end_time.slice(0,8);
    });
  };

  const handleSlotClick = (time: string) => {
    if (isBooked(time)) return;
    const plus1 = `${String(parseInt(time.split(":")[0]) + 1).padStart(2,"0")}:00`;
    if (!start || time < start || time === start) {
      setStart(time); setEnd(plus1);
    } else {
      setEnd(plus1);
    }
  };

  const submit = async () => {
    setSaving(true);
    try {
      await api.rescheduleBooking(booking.id, {
        booking_date: date,
        start_time: `${start}:00`,
        end_time: `${end}:00`,
      });
      toast.success("Booking berhasil diubah");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal mengubah booking";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Jadwal Booking</DialogTitle>
          <DialogDescription>{booking.floor_name} - {booking.sport}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label htmlFor="reschedule-date" className="text-sm font-medium text-foreground">
              Tanggal
            </label>
            <input
              id="reschedule-date"
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              title="Tanggal booking"
              onChange={(e) => { setDate(e.target.value); setStart(""); setEnd(""); }}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Rentang Jam</label>
            <p className="text-xs text-muted-foreground mb-2">
              Klik 1 jam untuk durasi 1 jam, lalu klik jam berikutnya untuk memperpanjang.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {timeSlots.map(t => {
                const b = isBooked(t);
                const isStart = t === start;
                const inRange = start && end && t >= start && t < end;
                return (
                  <button
                    key={t}
                    disabled={b}
                    onClick={() => handleSlotClick(t)}
                    className={`py-2 rounded-md text-xs font-medium transition-all ${
                      b ? "bg-destructive/10 text-destructive/50 line-through cursor-not-allowed"
                      : isStart ? "gradient-primary text-primary-foreground"
                      : inRange ? "bg-primary/20 text-primary border border-primary/40"
                      : "bg-card border border-border hover:border-primary"
                    }`}
                  >{t}</button>
                );
              })}
            </div>
          </div>
          {start && end && (
            <p className="text-sm text-foreground">Jam baru: <span className="font-semibold">{start} - {end}</span></p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button onClick={submit} disabled={saving || !start || !end}>
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleDialog;
