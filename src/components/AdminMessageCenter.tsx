import { useState, useEffect } from "react";
import { MessageSquare, Star, Mail, Send, Loader2, ChevronDown, ChevronUp, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api, InboxMessage, MessageReply } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const AdminMessageCenter = () => {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "contact" | "review">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, MessageReply[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [sendingReply, setSendingReply] = useState<string | null>(null);

  useEffect(() => {
    api.getInbox()
      .then(setMessages)
      .catch(() => toast.error("Gagal memuat pesan"))
      .finally(() => setLoading(false));
  }, []);

  const getKey = (m: InboxMessage) => `${m.source}-${m.id}`;

  const toggleExpand = async (msg: InboxMessage) => {
    const key = getKey(msg);
    if (expandedId === key) {
      setExpandedId(null);
      return;
    }
    setExpandedId(key);
    if (!replies[key]) {
      try {
        const r = await api.getReplies(msg.source, msg.id);
        setReplies((prev) => ({ ...prev, [key]: r }));
      } catch { /* ignore */ }
    }
  };

  const sendReply = async (msg: InboxMessage) => {
    const key = getKey(msg);
    const text = replyText[key]?.trim();
    if (!text) return;
    setSendingReply(key);
    try {
      await api.replyMessage({
        source: msg.source,
        source_id: msg.id,
        reply_message: text,
        user_id: msg.user_id || undefined,
      });
      const r = await api.getReplies(msg.source, msg.id);
      setReplies((prev) => ({ ...prev, [key]: r }));
      setReplyText((prev) => ({ ...prev, [key]: "" }));
      toast.success("Balasan terkirim");
    } catch {
      toast.error("Gagal mengirim balasan");
    } finally {
      setSendingReply(null);
    }
  };

  const filtered = messages.filter((m) => filter === "all" || m.source === filter);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-foreground mb-6">Pusat Pesan</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {([
          { key: "all", label: "Semua", icon: MessageSquare },
          { key: "contact", label: "Kontak", icon: Mail },
          { key: "review", label: "Review", icon: Star },
        ] as const).map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
            className={filter === key ? "gradient-primary text-primary-foreground" : ""}
          >
            <Icon className="h-4 w-4 mr-1" /> {label}
          </Button>
        ))}
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">Belum ada pesan</div>
        )}
        {filtered.map((msg) => {
          const key = getKey(msg);
          const isExpanded = expandedId === key;
          return (
            <motion.div
              key={key}
              layout
              className="bg-card rounded-xl shadow-corporate border border-border overflow-hidden"
            >
              <button
                onClick={() => toggleExpand(msg)}
                className="w-full p-4 text-left flex items-start gap-3"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.source === "review" ? "bg-warning/10" : "bg-primary/10"
                }`}>
                  {msg.source === "review" ? (
                    <Star className="h-4 w-4 text-warning" />
                  ) : (
                    <Mail className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-foreground text-sm">{msg.name}</span>
                    <span className="text-xs text-muted-foreground">{msg.email}</span>
                    {!msg.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  {msg.subject && <p className="text-xs text-muted-foreground mb-0.5">{msg.subject}</p>}
                  {msg.rating && (
                    <div className="flex gap-0.5 mb-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3 w-3 ${s <= msg.rating! ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-foreground line-clamp-2">{msg.message || "(Tidak ada pesan)"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-4 space-y-3">
                      {/* Full message */}
                      <div className="bg-secondary rounded-lg p-3">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{msg.message || "(Tidak ada pesan)"}</p>
                      </div>

                      {/* Replies */}
                      {replies[key]?.map((r) => (
                        <div key={r.id} className="flex gap-2">
                          <Reply className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <div className="flex-1 bg-primary/5 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-foreground">{r.admin_name}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(r.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{r.message}</p>
                          </div>
                        </div>
                      ))}

                      {/* Reply form */}
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Tulis balasan..."
                          value={replyText[key] || ""}
                          onChange={(e) => setReplyText((prev) => ({ ...prev, [key]: e.target.value }))}
                          rows={2}
                          className="flex-1"
                          disabled={sendingReply === key}
                        />
                        <Button
                          onClick={() => sendReply(msg)}
                          disabled={sendingReply === key || !replyText[key]?.trim()}
                          size="icon"
                          className="gradient-primary text-primary-foreground h-auto"
                        >
                          {sendingReply === key ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </>
  );
};

export default AdminMessageCenter;
