import React from "react";
import { Star } from "lucide-react";

export default function SellerRatingBadge({ rating = 0, count = 0, compact = false }) {
  if (count === 0) {
    return (
      <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1">
        <Star className="w-3 h-3" strokeWidth={1.5} /> New seller
      </span>
    );
  }
  const full = Math.round(rating);
  const size = compact ? "w-3 h-3" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={size + (n <= full ? " text-warning fill-warning" : " text-muted-foreground/30")}
            strokeWidth={1.5}
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold text-foreground">{rating.toFixed(1)}</span>
      <span className="text-[10px] text-muted-foreground">({count})</span>
    </div>
  );
}