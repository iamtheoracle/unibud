import React from "react";
import { Heart, MapPin, Star, BadgeCheck } from "lucide-react";

const FALLBACK_IMG = {
  textbooks: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80",
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&q=80",
  accommodation: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=80",
  furniture: "https://images.unsplash.com/photo-1555041469-a586c9ea5bc2?w=500&q=80",
  tutoring: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=500&q=80",
  freelancers: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f84?w=500&q=80",
  services: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=500&q=80",
  other: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&q=80",
};

/**
 * ListingImageCard — Airbnb-style large image listing card.
 * Image-forward, price overlay, rating, seller verified badge, save heart.
 */
export default function ListingImageCard({ listing, saved, onToggleSave, onClick, rating }) {
  const img = (listing.image_urls && listing.image_urls[0]) || listing.image_url || FALLBACK_IMG[listing.category] || FALLBACK_IMG.other;

  return (
    <button onClick={onClick} className="text-left rounded-2xl bg-card border border-border/30 overflow-hidden card-hover w-full">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/70 backdrop-blur flex items-center justify-center spring-tap"
        >
          <Heart className={`w-4 h-4 ${saved ? "fill-foreground text-foreground" : "text-foreground"}`} strokeWidth={2} />
        </button>
        {listing.is_verified && (
          <span className="absolute bottom-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-background/80 backdrop-blur text-[9px] font-bold text-foreground">
            <BadgeCheck className="w-3 h-3" /> Verified
          </span>
        )}
      </div>
      <div className="p-2.5">
        <div className="flex items-center justify-between">
          <p className="text-[14px] font-bold text-foreground">
            {listing.is_free ? "Free" : `₦${(listing.price || 0).toLocaleString()}${listing.price_unit ? `/${listing.price_unit}` : ""}`}
          </p>
          {rating?.avg > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold text-foreground">
              <Star className="w-2.5 h-2.5 fill-foreground text-foreground" /> {rating.avg}
              <span className="text-muted-foreground">({rating.count})</span>
            </span>
          )}
        </div>
        <p className="text-[12px] font-semibold text-foreground leading-tight mt-1 line-clamp-1">{listing.title}</p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
          <MapPin className="w-2.5 h-2.5" /> {listing.location || "Campus"}
        </p>
      </div>
    </button>
  );
}