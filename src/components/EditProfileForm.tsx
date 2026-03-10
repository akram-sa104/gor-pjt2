import { useState } from "react";
import { User, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
const EditProfileForm = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    setLoading(true);
    try {
      const updated = await api.updateProfile({ name: name.trim(), phone: phone.trim() });
      updateUser(updated);
      toast.success("Profil berhasil diperbarui");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui profil");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-card rounded-xl shadow-corporate p-6">
      <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <User className="h-4 w-4" /> Profil Saya
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Nama</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Nama lengkap" />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
          <Input defaultValue={user?.email || ""} disabled className="opacity-60" />
          <p className="text-xs text-muted-foreground mt-1">Email tidak dapat diubah</p>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">No. Telepon</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
        </div>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Simpan Perubahan
        </Button>
      </form>
    </div>
  );
};
export default EditProfileForm;