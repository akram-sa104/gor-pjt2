import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { api, GalleryItem } from "@/lib/api";
import aboutImg from "@/assets/exterior-gor.jpg";

const getImageSrc = (url: string) => {
  if (url.startsWith("http")) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
  return `${baseUrl}${url}`;
};

const points = [
  "Dibangun untuk mendukung kesehatan karyawan dan masyarakat",
  "Fasilitas berstandar profesional dan terawat dengan baik",
  "Bagian dari program CSR Perum Jasa Tirta II",
  "Terbuka untuk umum dengan sistem booking online",
];

const AboutSection = () => {
  const [images, setImages] = useState<string[]>([aboutImg]);
  const [current, setCurrent] = useState(0);

         useEffect(() => {
    api.getGallery()
      .then((items: GalleryItem[]) => {
        const aboutItems = items.filter((i) => i.category === "about");
        if (aboutItems.length > 0) {
          setImages(aboutItems.map((i) => getImageSrc(i.image_url)));
        }
      })
      .catch(() => {});
  }, []);
  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [images.length, next]);
  return (
    <section id="tentang" className="py-20 bg-background relative overflow-hidden">
      {/* Water wave separator top */}
      <div className="absolute top-0 left-0 right-0">
        <svg className="w-full h-12 text-secondary" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <motion.path
            d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,0 L0,0 Z"
            fill="currentColor"
            animate={{
              d: [
                "M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,0 L0,0 Z",
                "M0,20 C240,0 480,40 720,20 C960,0 1200,40 1440,20 L1440,0 L0,0 Z",
                "M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,0 L0,0 Z",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
         <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-xl overflow-hidden shadow-corporate-lg aspect-[4/3]"
          >
            <AnimatePresence mode="popLayout">
              <motion.img
                key={current}
                src={images[current]}
                alt="GOR Perum Jasa Tirta II"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.08, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.95, filter: "blur(6px)" }}
                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </AnimatePresence>
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    title={`Tampilkan gambar ${i + 1}`}
                    onClick={() => setCurrent(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                      i === current ? "bg-accent w-4" : "bg-primary-foreground/50"
                    }`}
                  />
                ))}
              </div>
            )}
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
};

export default AboutSection;
