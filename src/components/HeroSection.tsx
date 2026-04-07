import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { api, GalleryItem } from "@/lib/api";
import heroImg from "@/assets/hero-gor.jpg";

const getImageSrc = (url: string) => {
  if (url.startsWith("http")) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
  return `${baseUrl}${url}`;
};
const HeroSection = () => {
  const [images, setImages] = useState<string[]>([heroImg]);
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    api.getGallery()
      .then((items: GalleryItem[]) => {
        const heroItems = items.filter((i) => i.category === "hero");
        if (heroItems.length > 0) {
          setImages(heroItems.map((i) => getImageSrc(i.image_url)));
        }
      })
      .catch(() => {});
  }, []);
  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [images.length, next]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="popLayout">
        <motion.div
          key={current}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${images[current]})` }}
          initial={{ opacity: 0, scale: 1.1, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
          transition={{
            duration: 1.5,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary/80 to-accent/40" />
        {/* Water wave overlay */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg className="w-full h-24 text-background" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <motion.path
            d="M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,70 L1440,120 L0,120 Z"
            fill="currentColor"
            animate={{
              d: [
                "M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,70 L1440,120 L0,120 Z",
                "M0,60 C360,20 720,80 1080,30 C1260,10 1380,70 1440,50 L1440,120 L0,120 Z",
                "M0,40 C360,100 720,0 1080,60 C1260,90 1380,50 1440,70 L1440,120 L0,120 Z",
              ],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="relative container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl mx-auto"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 bg-accent/20 text-accent-foreground border border-accent/30">
            Perum Jasa Tirta II
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-primary-foreground leading-tight mb-6">
            GOR Perum<br />Jasa Tirta II
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl mx-auto mb-10 leading-relaxed">
            Fasilitas olahraga modern untuk karyawan dan masyarakat di kawasan Jatiluhur, Purwakarta
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/booking">
              <Button size="lg" className="gradient-accent text-accent-foreground hover:opacity-90 px-8 h-12 text-base font-semibold">
                Booking Sekarang <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <a href="#fasilitas">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 h-12 text-base font-semibold">
                <Eye className="mr-2 h-4 w-4" /> Lihat Fasilitas
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

       {/* Slide indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                i === current ? "bg-accent w-6" : "bg-primary-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
