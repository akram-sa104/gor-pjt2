import { motion } from "framer-motion";
import { Goal, Volleyball, Users, DoorOpen, Bath, Car, Lightbulb, ShieldCheck } from "lucide-react";

const facilities = [
  { icon: Goal, title: "Lapangan Futsal", desc: "Lapangan futsal berstandar dengan rumput sintetis berkualitas" },
  { icon: Volleyball, title: "Lapangan Badminton", desc: "Lapangan badminton dengan lantai kayu dan pencahayaan optimal" },
  { icon: Users, title: "Tribun Penonton", desc: "Tribun penonton nyaman untuk menyaksikan pertandingan" },
  { icon: DoorOpen, title: "Ruang Ganti", desc: "Ruang ganti bersih dengan loker dan fasilitas mandi" },
  { icon: Bath, title: "Toilet Bersih", desc: "Toilet modern yang selalu terjaga kebersihannya" },
  { icon: Car, title: "Area Parkir Luas", desc: "Tersedia parkir luas untuk mobil dan motor" },
  { icon: Lightbulb, title: "Pencahayaan Profesional", desc: "Sistem pencahayaan LED berstandar pertandingan" },
  { icon: ShieldCheck, title: "Keamanan 24 Jam", desc: "Sistem keamanan dan CCTV untuk kenyamanan pengunjung" },
];

const FacilitiesSection = () => (
  <section id="fasilitas" className="py-20 bg-secondary">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="text-accent font-semibold text-sm uppercase tracking-wider">Fasilitas</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-3">Fasilitas Lengkap GOR</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Berbagai fasilitas modern untuk menunjang kegiatan olahraga Anda</p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {facilities.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-card rounded-xl p-6 shadow-corporate hover:shadow-corporate-lg hover:-translate-y-1 transition-all group cursor-default"
          >
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <f.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
            <h3 className="font-semibold text-foreground mb-1.5">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FacilitiesSection;
