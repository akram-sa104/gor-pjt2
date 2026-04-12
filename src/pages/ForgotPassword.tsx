import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api } from "@/lib/api";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengirim email reset";
      toast.error(message || "Gagal mengirim email reset");
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
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Email Terkirim!</h1>
              <p className="text-muted-foreground text-sm">
                Kami telah mengirim kode reset password ke <span className="font-medium text-foreground">{email}</span>. 
                Gunakan kode tersebut di halaman reset password.
              </p>
              <div className="pt-2 space-y-2">
                <Link to="/reset-password">
                  <Button className="w-full gradient-primary text-primary-foreground">
                    Masukkan Kode Reset
                  </Button>
                </Link>
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Kembali ke Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground">Lupa Password</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Masukkan email Anda dan kami akan mengirim kode untuk mereset password
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email terdaftar"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-11">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {loading ? "Mengirim..." : "Kirim Kode Reset"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-6">
                <Link to="/login" className="text-primary font-semibold hover:underline flex items-center justify-center gap-1">
                  <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Login
                </Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </>
  );
};
export default ForgotPassword;