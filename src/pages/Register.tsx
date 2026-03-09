import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Password tidak cocok!");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password minimal 6 karakter!");
      return;
    }
        setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      toast.success("Registrasi berhasil! Silakan login.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-secondary pt-20 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card rounded-2xl shadow-corporate-lg p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Daftar Akun</h1>
            <p className="text-muted-foreground text-sm mt-1">Buat akun untuk mulai booking lapangan</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input placeholder="Nama Lengkap" className="pl-10" value={form.name} onChange={(e) => update("name", e.target.value)} required disabled={loading} />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input type="email" placeholder="Email" className="pl-10" value={form.email} onChange={(e) => update("email", e.target.value)} required disabled={loading} />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                 <Input type="tel" placeholder="Nomor HP" className="pl-10" value={form.phone} onChange={(e) => update("phone", e.target.value)} required disabled={loading} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
               <Input type={showPw ? "text" : "password"} placeholder="Password" className="pl-10 pr-10" value={form.password} onChange={(e) => update("password", e.target.value)} required disabled={loading} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
               <Input type="password" placeholder="Konfirmasi Password" className="pl-10" value={form.confirm} onChange={(e) => update("confirm", e.target.value)} required disabled={loading} />
            </div>
                <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Sudah punya akun?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Login</Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default Register;
