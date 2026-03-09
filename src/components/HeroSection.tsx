import { motion } from "framer-motion";
import { ArrowRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-gor.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-primary-dark/90 via-primary/80 to-accent/40" />

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

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
