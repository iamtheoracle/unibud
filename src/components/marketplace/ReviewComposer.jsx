import React, { useState } from "react";
import { Star, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function ReviewComposer({ open, listing, sellerName, onClose }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reset = () => { setRating(0); setHover(0); setComment(""); };
  const close = () => { reset(); onClose(); };

  const submit = async () => {
    if (!listing) return;
    if (rating < 1) { toast({ title: "Select a rating", variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      await base44.entities.MarketplaceReview.create({
        listing_id: listing.id,
        seller_id: listing.created_by_id,
        rating,
        comment: comment.trim() || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["marketplaceReviews"] });
      toast({ title: "Thanks for your review", description: `You rated ${sellerName || "the seller"} ${rating} star${rating > 1 ? "s" : ""}.` });
      reset();
      onClose();
    } catch {
      toast({ title: "Could not submit review", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm safe-area-px"
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] glass-strong p-5 safe-area-pb"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-heading font-bold text-[17px] text-foreground">Rate your experience</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">How was trading with {sellerName || "this seller"}?</p>
              </div>
              <button onClick={close} className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
                <X className="w-[18px] h-[18px]" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 py-5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="spring-tap"
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={"w-9 h-9 " + ((hover || rating) >= n ? "text-warning fill-warning" : "text-muted-foreground/30")}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share a quick note about the exchange (optional)..."
              className="input-base mb-4 min-h-[88px] resize-none"
              maxLength={280}
            />

            <button
              onClick={submit}
              disabled={submitting || rating < 1}
              className="w-full py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit review"}
            </button>
            <p className="text-center text-[10px] text-muted-foreground/70 mt-3">
              Your rating helps other students trade with confidence.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}