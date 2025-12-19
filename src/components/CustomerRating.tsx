import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Send, MessageSquare, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface CustomerRatingProps {
  themeColor: string;
  shopName: string;
}

const mockReviews: Review[] = [
  {
    id: "1",
    name: "Rahul S.",
    rating: 5,
    comment: "Amazing food and great service! The biryani was absolutely delicious.",
    date: "2 days ago",
  },
  {
    id: "2",
    name: "Priya M.",
    rating: 4,
    comment: "Good quality food. Loved the ambiance. Will visit again!",
    date: "1 week ago",
  },
  {
    id: "3",
    name: "Amit K.",
    rating: 5,
    comment: "Best restaurant in the area. Highly recommended!",
    date: "2 weeks ago",
  },
];

export function CustomerRating({ themeColor, shopName }: CustomerRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const averageRating = 4.7;
  const totalReviews = 128;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Thank you for your review!");
    setRating(0);
    setComment("");
    setShowForm(false);
    setIsSubmitting(false);
  };

  const StarRating = ({
    value,
    onSelect,
    onHover,
    interactive = false,
    size = "md",
  }: {
    value: number;
    onSelect?: (rating: number) => void;
    onHover?: (rating: number) => void;
    interactive?: boolean;
    size?: "sm" | "md" | "lg";
  }) => {
    const sizeClasses = {
      sm: "h-3 w-3",
      md: "h-5 w-5",
      lg: "h-8 w-8",
    };

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
            disabled={!interactive}
          >
            <Star
              className={`${sizeClasses[size]} transition-colors`}
              style={{
                fill: star <= value ? `hsl(${themeColor})` : "transparent",
                color: star <= value ? `hsl(${themeColor})` : "hsl(var(--muted-foreground))",
              }}
            />
          </motion.button>
        ))}
      </div>
    );
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6 space-y-5"
    >
      {/* Rating Summary */}
      <div
        className="rounded-2xl p-4"
        style={{ backgroundColor: `hsl(${themeColor} / 0.08)` }}
      >
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold">{averageRating}</p>
            <StarRating value={Math.round(averageRating)} size="sm" />
            <p className="text-xs text-muted-foreground mt-1">
              {totalReviews} reviews
            </p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const percentage = stars === 5 ? 68 : stars === 4 ? 22 : stars === 3 ? 7 : stars === 2 ? 2 : 1;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{stars}</span>
                  <Star className="h-3 w-3" style={{ color: `hsl(${themeColor})` }} />
                  <div className="flex-1 h-2 rounded-full bg-background overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: `hsl(${themeColor})` }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      <AnimatePresence mode="wait">
        {!showForm ? (
          <motion.div
            key="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Button
              onClick={() => setShowForm(true)}
              className="w-full"
              style={{
                backgroundColor: `hsl(${themeColor})`,
                color: "white",
              }}
            >
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
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground mt-2"
                >
                  {rating === 5
                    ? "Excellent!"
                    : rating === 4
                    ? "Very Good!"
                    : rating === 3
                    ? "Good"
                    : rating === 2
                    ? "Fair"
                    : "Poor"}
                </motion.p>
              )}
            </div>

            <Textarea
              placeholder="Share your experience with others (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] resize-none"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowForm(false);
                  setRating(0);
                  setComment("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
                style={{
                  backgroundColor: `hsl(${themeColor})`,
                  color: "white",
                }}
              >
                {isSubmitting ? (
                  "Submitting..."
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
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <ThumbsUp className="h-4 w-4" />
          Recent Reviews
        </h3>
        <div className="space-y-3">
          {mockReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-border/50 bg-card/50 p-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `hsl(${themeColor} / 0.1)` }}
                >
                  <User
                    className="h-4 w-4"
                    style={{ color: `hsl(${themeColor})` }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate">{review.name}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {review.date}
                    </span>
                  </div>
                  <StarRating value={review.rating} size="sm" />
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {review.comment}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
