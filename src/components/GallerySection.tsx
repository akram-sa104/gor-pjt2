import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { api, GalleryItem } from "@/lib/api";
// Fallback images if API fails
import futsalImg from "@/assets/futsal-court.jpg";
import badmintonImg from "@/assets/badminton-court.jpg";
import tribuneImg from "@/assets/tribune.jpg";
import exteriorImg from "@/assets/exterior-gor.jpg";
import heroImg from "@/assets/hero-gor.jpg";

const fallbackImages = [
  { src: futsalImg, title: "Lapangan Futsal", category: "lapangan" },
  { src: badmintonImg, title: "Lapangan Badminton", category: "lapangan" },
  { src: tribuneImg, title: "Tribun Penonton", category: "tribun" },
  { src: exteriorImg, title: "Eksterior GOR", category: "exterior" },
  { src: heroImg, title: "Tampak Depan GOR", category: "exterior" },
];

const categoryLabels: Record<string, string> = {
  lapangan: "Lapangan",
  tribun: "Tribun",
  exterior: "Exterior",
  fasilitas: "Fasilitas",
};
const getImageSrc = (url: string) => {
  if (url.startsWith("http")) return url;
  const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
  return `${baseUrl}${url}`;
};

const GallerySection = () => {
  const [filter, setFilter] = useState("Semua");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<{ src: string; title: string; category: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(["Semua"]);

 useEffect(() => {
    api.getGallery()
      .then((items: GalleryItem[]) => {
        if (items.length > 0) {
          const mapped = items.map((item) => ({
            src: getImageSrc(item.image_url),
            title: item.title || "Tanpa judul",
            category: item.category,
          }));
          setGalleryItems(mapped);
          const uniqueCats = ["Semua", ...Array.from(new Set(items.map((i) => i.category)))];
          setCategories(uniqueCats);
        } else {
          setGalleryItems(fallbackImages);
          setCategories(["Semua", "lapangan", "tribun", "exterior"]);
        }
      })
      .catch(() => {
        setGalleryItems(fallbackImages);
        setCategories(["Semua", "lapangan", "tribun", "exterior"]);
      })
      .finally(() => setLoading(false));
  }, []);
  const filtered = filter === "Semua" ? galleryItems : galleryItems.filter((img) => img.category === filter);

  return (
    <section id="galeri" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Galeri</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-3">Galeri Foto GOR</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Lihat berbagai sudut fasilitas GOR Perum Jasa Tirta II</p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
               {cat === "Semua" ? "Semua" : categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((img, i) => (
              <motion.div
                key={img.title + i}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative group rounded-xl overflow-hidden cursor-pointer aspect-[4/3]"
                onClick={() => setLightbox(img.src)}
              >
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <div className="absolute inset-0 bg-primary-dark/0 group-hover:bg-primary-dark/60 transition-colors duration-300 flex items-end">
                  <div className="p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-primary-foreground font-semibold">{img.title}</p>
                    <p className="text-primary-foreground/70 text-sm">{categoryLabels[img.category] || img.category}</p>
                  </div>
                </div>
                 </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button className="absolute top-6 right-6 text-primary-foreground hover:text-accent transition-colors" onClick={() => setLightbox(null)}>
              <X size={32} />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={lightbox}
              alt="GOR"
              className="max-w-full max-h-[85vh] rounded-xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default GallerySection;
