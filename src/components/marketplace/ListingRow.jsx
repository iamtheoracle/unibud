import React from "react";
import { Heart, ShieldCheck } from "lucide-react";

/**
 * ListingRow — compact marketplace listing: emoji/image tile, title, price
 * (with optional unit), location + verified + meta, and a save heart.
 */
export default function ListingRow({ icon = "📦", title, price = 0, priceUnit, free, location, verified, meta, saved, onToggleSave, onClick }) {
  return (
    <div onClick={onClick} className="flex gap-3 py-2.5 border-b border-border/20 last:border-0 cursor-pointer spring-tap">
      <div className="w-[70px] h-[70px] rounded-2xl bg-muted/40 border border-border/30 grid place-items-center text-[24px] flex-shrink-0 overflow-hidden">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-foreground truncate">{title}</p>
        {free ? (
          <p className="text-[15px] font-bold text-success mt-0.5">Free</p>
        ) : (
          <p className="text-[15px] font-bold text-primary mt-0.5">
            ₦{price.toLocaleString()}
            {priceUnit && <span className="text-[11px] text-muted-foreground font-medium">/{priceUnit}</span>}
          </p>
        )}
        <div className="flex gap-2 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
          {location && <span>{location}</span>}
          {verified && (
            <span className="text-success flex items-center gap-0.5">
              <ShieldCheck className="w-2.5 h-2.5" /> Verified
            </span>
          )}
          {meta && <span>{meta}</span>}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }}
        className="w-7 h-7 rounded-full bg-muted/30 grid place-items-center flex-shrink-0 self-center spring-tap"
        aria-label="Save listing"
      >
        <Heart className={"w-3.5 h-3.5 " + (saved ? "text-primary fill-primary" : "text-muted-foreground")} />
      </button>
    </div>
  );
}