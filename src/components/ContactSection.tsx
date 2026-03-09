import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
       setLoading(true);
    try {
      await api.sendContact(form);
      toast.success("Pesan berhasil dikirim! Kami akan segera menghubungi Anda.");
      setForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim pesan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="kontak" className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Kontak</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-3">Hubungi Kami</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Hubungi kami untuk informasi lebih lanjut mengenai GOR</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Alamat</h4>
                  <p className="text-sm text-muted-foreground">GOR Perum Jasa Tirta II<br />Jatiluhur, Purwakarta, Jawa Barat</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Telepon</h4>
                  <p className="text-sm text-muted-foreground">(0264) 201 061</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Email</h4>
                  <p className="text-sm text-muted-foreground">gor@jasatirta2.co.id</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden shadow-corporate h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.9!2d107.38!3d-6.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzMnMDAuMCJTIDEwN8KwMjInNDguMCJF!5e0!3m2!1sen!2sid!4v1"
                width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" title="Lokasi GOR"
              />
            </div>
          </motion.div>

           <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <form onSubmit={handleSubmit} className="bg-card rounded-xl p-6 md:p-8 shadow-corporate space-y-5">
              <h3 className="text-xl font-bold text-foreground mb-2">Kirim Pesan</h3>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Nama Lengkap</label>
                   <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Masukkan nama Anda" required disabled={loading} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" required disabled={loading} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Pesan</label>
                <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tulis pesan Anda..." rows={4} required disabled={loading} />
              </div>
                 <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground hover:opacity-90 h-11">
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {loading ? "Mengirim..." : "Kirim Pesan"}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
