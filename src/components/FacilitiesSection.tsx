import { motion } from "framer-motion";
import { Heart, Activity, Target, Goal, Volleyball, Trophy, Dribbble, Users, DoorOpen, Bath, Car, Lightbulb, ShieldCheck, Building2 } from "lucide-react";

const floorFacilities = [
  {
    floor: "Lantai 1",
    description: "Area serbaguna untuk aktivitas kebugaran dan olahraga ringan",
    sports: [
      { icon: Heart, title: "Yoga", desc: "Ruang nyaman untuk latihan yoga dengan suasana tenang" },
      { icon: Activity, title: "Senam", desc: "Area luas untuk senam aerobik dan kebugaran" },
      { icon: Target, title: "Tenis Meja", desc: "Fasilitas tenis meja dengan peralatan standar" },
    ],
  },
  {
    floor: "Lantai 2",
    description: "Lapangan utama untuk berbagai cabang olahraga",
    sports: [
      { icon: Goal, title: "Futsal", desc: "Lapangan futsal dengan lantai berkualitas tinggi" },
      { icon: Volleyball, title: "Voli", desc: "Lapangan voli dengan net standar kompetisi" },
      { icon: Trophy, title: "Badminton", desc: "Lapangan badminton dengan pencahayaan optimal" },
      { icon: Dribbble, title: "Basket", desc: "Lapangan basket dengan ring standar" },
    ],
  },
];
const generalFacilities = [
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
         <p className="text-muted-foreground max-w-lg mx-auto">GOR Perum Jasa Tirta II memiliki 2 lantai dengan berbagai fasilitas olahraga</p>
      </motion.div>

            {/* Floor-based sports */}
      <div className="space-y-10 mb-14">
        {floorFacilities.map((floor, fi) => (
          <motion.div
            key={floor.floor}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: fi * 0.15 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{floor.floor}</h3>
                <p className="text-sm text-muted-foreground">{floor.description}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {floor.sports.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-xl p-5 shadow-corporate hover:shadow-corporate-lg hover:-translate-y-1 transition-all group cursor-default"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <s.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">{s.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
      {/* General facilities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl font-bold text-foreground mb-2">Fasilitas Pendukung</h3>
        <p className="text-muted-foreground">Fasilitas tambahan untuk kenyamanan pengunjung</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {generalFacilities.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          transition={{ delay: i * 0.06, duration: 0.4 }}
            className="bg-card rounded-xl p-5 shadow-corporate hover:shadow-corporate-lg hover:-translate-y-1 transition-all group cursor-default"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <f.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
             <h4 className="font-semibold text-foreground mb-1">{f.title}</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FacilitiesSection;
