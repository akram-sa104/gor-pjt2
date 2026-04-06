import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "@/components/NotificationBell"; 
import UserNotificationBell from "@/components/UserNotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Home", href: "/#home" },
  { label: "Tentang GOR", href: "/#tentang" },
  { label: "Fasilitas", href: "/#fasilitas" },
  { label: "Galeri", href: "/#galeri" },
  { label: "Booking", href: "/booking" },
  { label: "Kontak", href: "/#kontak" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isHome = location.pathname === "/";
  const showBackButton = !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith("/#")) {
      const id = href.replace("/#", "");
      if (isHome) {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
          } else {
        // Navigate to home page with hash
        navigate("/" + "#" + id);
      }
    }
  };

  const navBg = scrolled || !isHome
    ? "bg-background/95 backdrop-blur-md shadow-corporate"
    : "bg-transparent";

  const textColor = scrolled || !isHome ? "text-foreground" : "text-primary-foreground";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4">
                <div className="flex items-center gap-2">
          {showBackButton && (
            <button
              onClick={() => navigate(-1)}
              className={`${textColor} hover:bg-primary/10 p-2 rounded-md transition-colors`}
              aria-label="Kembali"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <Link to="/" className={`font-bold text-lg md:text-xl tracking-tight ${textColor} transition-colors`}>
          <img src="public/Logo-Perum-Jasa-Tirta-II.png" alt="GOR Jasa Tirta II Logo" className="w-10 h-10 object-contain mr-2" />
            <span className="text-gradient font-extrabold">GOR</span>{" "}
            <span className={scrolled || !isHome ? "text-foreground" : "text-primary-foreground"}>Jasa Tirta II</span>
          </Link>
        </div>


        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
                to={link.href.startsWith("/#") ? "/" : link.href}
              onClick={(e) => {
                if (link.href.startsWith("/#")) {
                  e.preventDefault();
                  handleNavClick(link.href);
                }
              }}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-primary/10 ${textColor}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-2">
            {user && <NotificationBell />}
            {user && <UserNotificationBell />}
            {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`${textColor} hover:bg-primary/10 gap-2`}>
                  <User size={18} />
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { logout(); navigate('/'); }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className={`${textColor} hover:bg-primary/10`}>Login</Button>
              </Link>
              <Link to="/register">
                <Button className="gradient-primary text-primary-foreground hover:opacity-90">Register</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className={`lg:hidden ${textColor}`} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-background border-t border-border"
          >
            <div className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                      to={link.href.startsWith("/#") ? "/" : link.href}
                  onClick={(e) => {
                    if (link.href.startsWith("/#")) {
                      e.preventDefault();
                      handleNavClick(link.href);
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                  className="px-3 py-3 rounded-md text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
               {user ? (
                <div className="flex flex-col gap-2 mt-3">
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full gap-2"><LayoutDashboard size={16} /> Dashboard</Button>
                  </Link>
                  <Button variant="destructive" className="w-full gap-2" onClick={() => { logout(); navigate('/'); setMobileOpen(false); }}>
                    <LogOut size={16} /> Logout
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2 mt-3">
                  <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                  <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full gradient-primary text-primary-foreground">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
