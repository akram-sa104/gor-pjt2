import { useState, useEffect } from "react";
import { Loader2, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api, UserItem } from "@/lib/api";

const AdminUserList = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getAllUsers()
      .then(setUsers)
      .catch(() => toast.error("Gagal memuat data user"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Yakin ingin menghapus user "${name}"?`)) return;
    try {
      await api.deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
      toast.success("User berhasil dihapus");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus user");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground mb-6">Data User</h1>
      <div className="bg-card rounded-xl shadow-corporate overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nama</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Telepon</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Terdaftar</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4 text-foreground font-medium">{u.name}</td>
                  <td className="py-3 px-4 text-foreground">{u.email}</td>
                  <td className="py-3 px-4 text-foreground">{u.phone || "-"}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      u.role === "admin" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("id-ID")}
                  </td>
                  <td className="py-3 px-4">
                    {u.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(u.id, u.name)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    {search ? "Tidak ditemukan" : "Belum ada user"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border text-sm text-muted-foreground">
          Total: {filtered.length} user
        </div>
      </div>
    </>
  );
};

export default AdminUserList;
