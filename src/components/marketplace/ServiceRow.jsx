import React from "react";

/**
 * ServiceRow — service marketplace entry: monochrome avatar, name, rating +
 * review count, and a price label. (Monochrome system: no decorative color.)
 */
export default function ServiceRow({ initial, name, rating, reviews, priceLabel, onClick }) {
  return (
    <div onClick={onClick} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0 cursor-pointer spring-tap">
      <div
        className="w-10 h-10 rounded-full grid place-items-center text-[15px] font-semibold text-black flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #FFFFFF, #6B6B6B)" }}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground">★ {rating} · {reviews} reviews</p>
      </div>
      <span className="text-[13px] font-semibold text-primary flex-shrink-0">{priceLabel}</span>
    </div>
  );
}