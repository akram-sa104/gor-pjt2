import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import aboutImg from "@/assets/exterior-gor.jpg";

const points = [
  "Dibangun untuk mendukung kesehatan karyawan dan masyarakat",
  "Fasilitas berstandar profesional dan terawat dengan baik",
  "Bagian dari program CSR Perum Jasa Tirta II",
  "Terbuka untuk umum dengan sistem booking online",
];

const AboutSection = () => (
  <section id="tentang" className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <img src={aboutImg} alt="GOR Perum Jasa Tirta II" className="rounded-xl shadow-corporate-lg w-full object-cover aspect-[4/3]" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Tentang GOR</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Gedung Olahraga<br />Perum Jasa Tirta II
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            GOR Perum Jasa Tirta II merupakan fasilitas olahraga modern yang berlokasi di area kantor pusat Jatiluhur, Purwakarta. Gedung ini dibangun sebagai wujud komitmen perusahaan dalam mendukung gaya hidup sehat bagi karyawan dan masyarakat sekitar.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Dengan berbagai fasilitas lengkap seperti lapangan futsal, badminton, dan tribun penonton, GOR ini menjadi pusat kegiatan olahraga yang nyaman dan representatif.
          </p>
          <div className="space-y-3">
            {points.map((p) => (
              <div key={p} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <span className="text-foreground text-sm">{p}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutSection;
