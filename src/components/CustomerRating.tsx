import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, MessageSquare, ThumbsUp, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { reviewService, type Review } from "@/services/reviewService";
import { useOrder } from "@/contexts/OrderContext";

interface CustomerRatingProps {
  themeColor: string;
  shopName: string;
  shopId: string;
}

const StarRating = ({
  value,
  onSelect,
  onHover,
  interactive = false,
  size = "md",
}: {
  value: number;
  onSelect?: (r: number) => void;
  onHover?: (r: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClass = { sm: "h-3 w-3", md: "h-5 w-5", lg: "h-8 w-8" }[size];
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          whileTap={interactive ? { scale: 0.9 } : {}}
          className={interactive ? "cursor-pointer" : "cursor-default"}
          onClick={() => interactive && onSelect?.(star)}
          onMouseEnter={() => interactive && onHover?.(star)}
          onMouseLeave={() => interactive && onHover?.(0)}
        >
          <Star
            className={`${sizeClass} transition-colors`}
            style={{
              fill: star <= value ? "hsl(var(--primary))" : "transparent",
              color: star <= value ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
            }}
          />
        </motion.button>
      ))}
    </div>
  );
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

export function CustomerRating({ themeColor, shopName, shopId }: CustomerRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [distribution, setDistribution] = useState<Record<number, number>>({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [loading, setLoading] = useState(true);

  const { deviceId, customerName } = useOrder();

  const fetchReviews = useCallback(async () => {
    if (!shopId) return;
    try {
      setLoading(true);
      const data = await reviewService.getReviews(shopId);
      setReviews(data.data);
      setAverageRating(data.averageRating);
      setTotalReviews(data.totalReviews);
      setDistribution(data.distribution);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [shopId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setIsSubmitting(true);
    try {
      await reviewService.submitReview(shopId, { rating, comment, customerName: customerName.trim() || 'Anonymous', deviceId });
      toast.success("Thank you for your review!");
      setShowForm(false);
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabel = ["", "Poor", "Fair", "Good", "Very Good", "Excellent!"][rating] || "";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Rating Summary */}
      <div className="rounded-2xl p-4" style={{ backgroundColor: "hsl(var(--primary) / 0.08)" }}>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold">{averageRating || "—"}</p>
              <StarRating value={Math.round(averageRating)} size="sm" />
              <p className="text-xs text-muted-foreground mt-1">{totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = distribution[stars] || 0;
                const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-xs">
                    <span className="w-3">{stars}</span>
                    <Star className="h-3 w-3" style={{ color: "hsl(var(--primary))" }} />
                    <div className="flex-1 h-2 rounded-full bg-background overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: "hsl(var(--primary))" }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Write / Edit Review */}
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div key="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Button onClick={() => setShowForm(true)} className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Write a Review
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-border bg-card p-4 space-y-4"
          >
            <div className="text-center">
              <p className="text-sm font-medium mb-2">How was your experience?</p>
              <div className="flex justify-center">
                <StarRating
                  value={hoverRating || rating}
                  onSelect={setRating}
                  onHover={setHoverRating}
                  interactive
                  size="lg"
                />
              </div>
              {rating > 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted-foreground mt-2">
                  {ratingLabel}
                </motion.p>
              )}
            </div>

            <Textarea
              placeholder="Share your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            Recent Reviews
          </h3>
          <div className="space-y-3">
            {reviews.map((review, index) => (
              <motion.div
                key={review._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border/50 bg-card/50 p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{review.customerName}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{timeAgo(review.createdAt)}</span>
                    </div>
                    <StarRating value={review.rating} size="sm" />
                    {review.comment && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{review.comment}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {!loading && reviews.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">No reviews yet. Be the first!</p>
      )}
    </motion.section>
  );
}
