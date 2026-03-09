import { motion } from "framer-motion";
import { Dumbbell, MapPin, Car, TreePine } from "lucide-react";

const advantages = [
  { icon: Dumbbell, title: "Fasilitas Modern", desc: "Dilengkapi peralatan dan lapangan berstandar profesional" },
  { icon: MapPin, title: "Lokasi Strategis", desc: "Berada di area kantor pusat Jatiluhur, mudah diakses" },
  { icon: Car, title: "Area Parkir Luas", desc: "Tersedia area parkir yang luas dan aman untuk kendaraan" },
  { icon: TreePine, title: "Lingkungan Nyaman", desc: "Dikelilingi lingkungan hijau dan asri Waduk Jatiluhur" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const AdvantagesSection = () => (
  <section className="py-20 bg-secondary">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Keunggulan GOR Kami</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Fasilitas olahraga terbaik untuk mendukung gaya hidup sehat</p>
      </motion.div>

      <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {advantages.map((adv) => (
          <motion.div key={adv.title} variants={item} className="bg-card rounded-xl p-6 shadow-corporate hover:shadow-corporate-lg transition-shadow group">
            <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <adv.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{adv.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{adv.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default AdvantagesSection;
