import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="gradient-hero text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-3 gap-8">

         <div className="flex items-center gap-3 mb-3">
            <img src="public/Logo-Perum-Jasa-Tirta-II.png" alt="GOR Jasa Tirta II Logo" className="w-10 h-10 object-contain" />
          <h3 className="text-xl font-bold mb-3">
            <span className="text-accent-light">GOR</span> Jasa Tirta II
          </h3>
          <p className="text-primary-foreground/70 text-sm leading-relaxed">
            Gedung Olahraga modern milik Perum Jasa Tirta II untuk mendukung gaya hidup sehat karyawan dan masyarakat.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Navigasi</h4>
          <div className="flex flex-col gap-2 text-sm text-primary-foreground/70">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link>
            <a href="/#tentang" className="hover:text-primary-foreground transition-colors">Tentang GOR</a>
            <a href="/#fasilitas" className="hover:text-primary-foreground transition-colors">Fasilitas</a>
            <a href="/#galeri" className="hover:text-primary-foreground transition-colors">Galeri</a>
            <Link to="/booking" className="hover:text-primary-foreground transition-colors">Booking</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Kontak</h4>
          <div className="text-sm text-primary-foreground/70 space-y-2">
            <p>Jatiluhur, Purwakarta</p>
            <p>Jawa Barat, Indonesia</p>
            <p>(0264) 201 061</p>
            <p>gor@jasatirta2.co.id</p>
          </div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/50">
        © {new Date().getFullYear()} Perum Jasa Tirta II. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
