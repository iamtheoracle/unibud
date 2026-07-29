import React from "react";

const GRADIENTS = {
  purple: "linear-gradient(135deg, #7c3aed, #a78bfa)",
  pink: "linear-gradient(135deg, #ec4899, #f472b6)",
  amber: "linear-gradient(135deg, #f59e0b, #fcd34d)",
  blue: "linear-gradient(135deg, #3b82f6, #60a5fa)",
};

/**
 * ServiceRow — service marketplace entry: gradient avatar, name, rating +
 * review count, and a price label.
 */
export default function ServiceRow({ initial, gradient = "purple", name, rating, reviews, priceLabel, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0 cursor-pointer spring-tap">
      <div
        className="w-10 h-10 rounded-full grid place-items-center text-[15px] font-semibold text-white flex-shrink-0"
        style={{ background: GRADIENTS[gradient] || GRADIENTS.purple }}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground">⭐ {rating} · {reviews} reviews</p>
      </div>
      <span className="text-[13px] font-semibold text-primary flex-shrink-0">{priceLabel}</span>
    </div>
  );
}