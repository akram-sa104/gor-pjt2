import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminBookingItem } from "@/lib/api";
import { toast } from "sonner";

interface Props {
  bookings: AdminBookingItem[];
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Dibatalkan",
};

const ExportBookingButtons = ({ bookings }: Props) => {
  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx");
      const data = bookings.map((b, i) => ({
        No: i + 1,
        User: b.user_name,
        Email: b.user_email,
        Lapangan: b.court_name,
        Tipe: b.court_type,
        Tanggal: b.booking_date.slice(0, 10),
        "Jam Mulai": b.start_time.slice(0, 5),
        "Jam Selesai": b.end_time.slice(0, 5),
        Status: statusLabels[b.status] || b.status,
        Catatan: b.notes || "-",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Booking");

      // Auto-width columns
      const colWidths = Object.keys(data[0] || {}).map((key) => ({
        wch: Math.max(key.length, ...data.map((row) => String((row as any)[key] || "").length)) + 2,
      }));
      ws["!cols"] = colWidths;

      XLSX.writeFile(wb, `data-booking-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Data berhasil diexport ke Excel");
    } catch {
      toast.error("Gagal export ke Excel");
    }
  };

  const exportToPDF = async () => {
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFontSize(16);
      doc.text("Data Booking - GOR Jasa Tirta II", 14, 20);
      doc.setFontSize(10);
      doc.text(`Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`, 14, 28);
      doc.text(`Total: ${bookings.length} booking`, 14, 34);

      autoTable(doc, {
        startY: 40,
        head: [["No", "User", "Email", "Lapangan", "Tanggal", "Jam", "Status"]],
        body: bookings.map((b, i) => [
          i + 1,
          b.user_name,
          b.user_email,
          b.court_name,
          b.booking_date.slice(0, 10),
          `${b.start_time.slice(0, 5)} - ${b.end_time.slice(0, 5)}`,
          statusLabels[b.status] || b.status,
        ]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [37, 99, 235] },
      });

      doc.save(`data-booking-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Data berhasil diexport ke PDF");
    } catch {
      toast.error("Gagal export ke PDF");
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportToExcel} className="gap-1.5">
        <FileSpreadsheet className="h-4 w-4" /> Excel
      </Button>
      <Button variant="outline" size="sm" onClick={exportToPDF} className="gap-1.5">
        <FileText className="h-4 w-4" /> PDF
      </Button>
    </div>
  );
};

export default ExportBookingButtons;
