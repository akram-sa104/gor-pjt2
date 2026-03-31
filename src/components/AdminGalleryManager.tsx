import { useState, useEffect, useRef } from "react";
import { Loader2, Plus, Trash2, Edit2, X, Save, Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api, GalleryItem } from "@/lib/api";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const categories = [
  { value: "lapangan", label: "Lapangan" },
  { value: "tribun", label: "Tribun" },
  { value: "exterior", label: "Exterior" },
  { value: "fasilitas", label: "Fasilitas" },
];

const AdminGalleryManager = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", image_url: "", category: "lapangan" });
  const [saving, setSaving] = useState(false);
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getGallery()
      .then(setItems)
      .catch(() => toast.error("Gagal memuat galeri"))
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setForm({ title: "", image_url: "", category: "lapangan" });
    setShowForm(false);
    setEditingId(null);
    setUploadMode("upload");
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/gallery/upload`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      // Build full URL for display
      const baseUrl = API_BASE.replace('/api', '');
      setForm((f) => ({ ...f, image_url: `${baseUrl}${data.image_url}` }));
      toast.success("Gambar berhasil diupload");
    } catch (err: any) {
      toast.error(err.message || "Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url.trim()) {
      toast.error("Gambar wajib diisi");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await api.updateGallery(editingId, form);
        setItems(items.map((i) => (i.id === editingId ? { ...i, ...form } as GalleryItem : i)));
        toast.success("Foto berhasil diperbarui");
      } else {
        const res = await api.addGallery(form);
        setItems([{ id: res.id, ...form, created_at: new Date().toISOString() } as GalleryItem, ...items]);
        toast.success("Foto berhasil ditambahkan");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setForm({ title: item.title || "", image_url: item.image_url, category: item.category });
    setEditingId(item.id);
    setShowForm(true);
    setUploadMode("url");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus foto ini?")) return;
    try {
      await api.deleteGallery(id);
      setItems(items.filter((i) => i.id !== id));
      toast.success("Foto berhasil dihapus");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus");
    }
  };

   const getImageSrc = (url: string) => {
    if (url.startsWith("http")) return url;
    const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
    return `${baseUrl}${url}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Kelola Galeri</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-1.5">
          <Plus className="h-4 w-4" /> Tambah Foto
        </Button>
      </div>

      {showForm && (
        <div className="bg-card rounded-xl shadow-corporate p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">
              {editingId ? "Edit Foto" : "Tambah Foto Baru"}
            </h2>
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Judul</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Judul foto"
              />
            </div>
             {/* Upload mode toggle */}
            <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Gambar *</label>
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  size="sm"
                  variant={uploadMode === "upload" ? "default" : "outline"}
                  onClick={() => setUploadMode("upload")}
                  className="gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload File
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={uploadMode === "url" ? "default" : "outline"}
                  onClick={() => setUploadMode("url")}
                  className="gap-1.5"
                >
                  <Link className="h-3.5 w-3.5" /> Input URL
                </Button>
              </div>
              {uploadMode === "upload" ? (
                <div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full gap-2 h-20 border-dashed border-2"
                  >
                    {uploading ? (
                      <><Loader2 className="h-5 w-5 animate-spin" /> Mengupload...</>
                    ) : (
                      <><Upload className="h-5 w-5" /> Klik untuk pilih gambar (maks 5MB)</>
                    )}
                  </Button>
                </div>
              ) : (
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                )}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Kategori</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            {form.image_url && (
              <div className="rounded-lg overflow-hidden border border-border max-w-xs">
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingId ? "Simpan Perubahan" : "Tambah Foto"}
            </Button>
          </form>
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-card rounded-xl shadow-corporate p-8 text-center">
          <p className="text-muted-foreground">Belum ada foto di galeri.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-card rounded-xl shadow-corporate overflow-hidden group">
              <div className="aspect-[4/3] relative">
                <img
                 src={getImageSrc(item.image_url)}
                  alt={item.title || "Gallery"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary" onClick={() => handleEdit(item)} className="h-8 gap-1">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)} className="h-8 gap-1">
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </Button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-medium text-foreground text-sm truncate">{item.title || "Tanpa judul"}</p>
                <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AdminGalleryManager;
