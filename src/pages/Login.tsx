import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
   setLoading(true);
    try {
       const res = await login(email, password);
      toast.success("Login berhasil!");
       navigate(res?.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login gagal";
      toast.error(message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-foreground">Selamat Datang</h1>
            <p className="text-muted-foreground text-sm mt-1">Masuk ke akun GOR Anda</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
               <Input type="email" placeholder="Email" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input type={showPw ? "text" : "password"} placeholder="Password" className="pl-10 pr-10" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="rounded border-border" />
                <span className="text-muted-foreground">Ingat saya</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline font-medium">Lupa password?</Link>
            </div>
           <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Memproses..." : "Login"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Belum punya akun?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};

export default Login;
