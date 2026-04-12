import { useState } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

interface ReviewFormProps {
  bookingId: number;
  courtName: string;
  onReviewSent: () => void;
}

const ReviewForm = ({ bookingId, courtName, onReviewSent }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Pilih rating terlebih dahulu");
      return;
    }
    setLoading(true);
    try {
      await api.submitReview({ booking_id: bookingId, rating, comment });
      toast.success("Review berhasil dikirim!");
      onReviewSent();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal mengirim review";
      toast.error(message || "Gagal mengirim review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-4 space-y-3"
    >
      <p className="text-sm font-medium text-foreground">Review untuk <span className="text-primary">{courtName}</span></p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            title={`Berikan ${star} bintang`}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => setRating(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoveredStar || rating)
                  ? "fill-warning text-warning"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
        {rating > 0 && <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Tulis komentar (opsional)..."
        rows={2}
        disabled={loading}
      />
      <Button onClick={handleSubmit} disabled={loading} size="sm" className="gradient-primary text-primary-foreground">
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
        Kirim Review
      </Button>
    </motion.div>
  );
};

export default ReviewForm;
