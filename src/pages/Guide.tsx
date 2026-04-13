import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Book, UserPlus, LogIn, CalendarCheck, Clock, MapPin, CheckCircle, Bell, Star, Download, ChevronRight, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: UserPlus,
    title: "1. Registrasi Akun",
    desc: "Buat akun terlebih dahulu dengan mengklik tombol 'Register' di halaman utama. Isi nama lengkap, email, nomor telepon, dan password. Setelah berhasil, Anda akan diarahkan ke halaman login.",
  },
  {
    icon: LogIn,
    title: "2. Login",
    desc: "Masuk ke akun Anda menggunakan email dan password yang sudah didaftarkan. Jika lupa password, gunakan fitur 'Lupa Password' untuk mereset.",
  },
  {
    icon: MapPin,
    title: "3. Pilih Lantai",
    desc: "Di halaman Booking, pilih lantai yang tersedia. Lantai 1 untuk Yoga, Senam, dan Tenis Meja. Lantai 2 untuk Futsal, Voli, Badminton, dan Basket. Setiap lantai hanya memiliki 1 area multifungsi.",
  },
  {
    icon: CalendarCheck,
    title: "4. Pilih Olahraga & Tanggal",
    desc: "Pilih jenis olahraga yang ingin dilakukan, lalu tentukan tanggal booking. Pastikan memilih tanggal yang belum penuh.",
  },
  {
    icon: Clock,
    title: "5. Pilih Jam",
    desc: "Pilih rentang waktu yang diinginkan. Klik slot jam untuk booking minimal 1 jam. Klik slot tambahan untuk memperpanjang durasi. Slot berwarna merah berarti sudah terisi.",
  },
  {
    icon: CheckCircle,
    title: "6. Konfirmasi Booking",
    desc: "Periksa kembali detail booking Anda (lantai, olahraga, tanggal, jam). Tambahkan catatan jika perlu, lalu klik 'Booking Sekarang'. Status awal booking adalah 'Pending'.",
  },
  {
    icon: Bell,
    title: "7. Tunggu Persetujuan",
    desc: "Admin akan mereview dan menyetujui/menolak booking Anda. Anda akan menerima notifikasi saat status booking berubah. Cek notifikasi di ikon lonceng pada navbar.",
  },
  {
    icon: Star,
    title: "8. Beri Review",
    desc: "Setelah booking selesai dan disetujui, Anda dapat memberikan rating dan review untuk pengalaman Anda. Review membantu kami meningkatkan pelayanan.",
  },
];

const faqs = [
  {
    q: "Berapa minimal durasi booking?",
    a: "Minimal 1 jam. Anda bisa booking dari 1 jam hingga beberapa jam sekaligus.",
  },
  {
    q: "Apakah bisa booking di lantai yang sama pada jam yang sudah terisi?",
    a: "Tidak. Karena setiap lantai hanya memiliki 1 area multifungsi, jika sudah ada booking pada jam tertentu, lantai tersebut tidak tersedia sampai booking selesai.",
  },
  {
    q: "Bagaimana cara membatalkan booking?",
    a: "Buka Dashboard > Riwayat Booking, lalu klik tombol 'Batalkan' pada booking yang masih berstatus Pending.",
  },
  {
    q: "Kapan booking saya disetujui?",
    a: "Admin akan mereview booking Anda dan memberikan persetujuan. Anda akan menerima notifikasi saat status berubah.",
  },
  {
    q: "Olahraga apa saja yang tersedia?",
    a: "Lantai 1: Yoga, Senam, Tenis Meja. Lantai 2: Futsal, Voli, Badminton, Basket.",
  },
];

const Guide = () => {
  const handleDownloadPDF = () => {
    // Trigger PDF download from public folder
    const link = document.createElement("a");
    link.href = "/manual-book-gor.pdf";
    link.download = "Manual-Book-GOR-Jasa-Tirta-II.pdf";
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6">
              <Book size={18} />
              <span className="text-sm font-medium">Panduan Lengkap</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Manual Book <span className="text-primary">GOR Jasa Tirta II</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              Panduan lengkap cara melakukan booking lapangan di GOR Jasa Tirta II.
              Ikuti langkah-langkah berikut untuk memulai.
            </p>
            <Button onClick={handleDownloadPDF} className="gradient-primary text-primary-foreground gap-2">
              <Download size={18} />
              Download PDF
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Langkah-Langkah Booking
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex gap-4 p-6 rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <step.icon className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Lantai */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Informasi Lantai & Fasilitas
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Monitor className="text-primary" size={22} />
                Lantai 1
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Area multifungsi yang dapat digunakan untuk berbagai aktivitas indoor.
              </p>
              <ul className="space-y-2">
                {["🧘 Yoga", "💪 Senam", "🏓 Tenis Meja"].map((s) => (
                  <li key={s} className="flex items-center gap-2 text-foreground text-sm">
                    <ChevronRight size={14} className="text-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-xl bg-card border border-border"
            >
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Smartphone className="text-primary" size={22} />
                Lantai 2
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Lapangan utama untuk olahraga bola dan permainan net.
              </p>
              <ul className="space-y-2">
                {["⚽ Futsal", "🏐 Voli", "🏸 Badminton", "🏀 Basket"].map((s) => (
                  <li key={s} className="flex items-center gap-2 text-foreground text-sm">
                    <ChevronRight size={14} className="text-primary" />
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Pertanyaan Umum (FAQ)
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl bg-card border border-border"
              >
                <h4 className="font-semibold text-foreground mb-2">{faq.q}</h4>
                <p className="text-muted-foreground text-sm">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Guide;
