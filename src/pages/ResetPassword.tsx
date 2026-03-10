import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Loader2, ArrowLeft, Eye, EyeOff, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(email, code, newPassword);
      toast.success("Password berhasil direset! Silakan login.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Gagal mereset password");
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
            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <KeyRound className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Masukkan kode yang dikirim ke email Anda beserta password baru
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
              <Input
                type="email"
                placeholder="Email terdaftar"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Kode Reset</label>
              <Input
                type="text"
                placeholder="Masukkan 6 digit kode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={loading}
                maxLength={6}
                className="text-center tracking-widest text-lg font-mono"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Password Baru</label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Konfirmasi Password</label>
              <Input
                type="password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-11">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Memproses..." : "Reset Password"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/login" className="text-primary font-semibold hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Login
            </Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  );
};
export default ResetPassword;