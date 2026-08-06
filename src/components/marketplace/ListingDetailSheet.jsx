import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import SellerRatingBadge from "@/components/marketplace/SellerRatingBadge";
import {
  X, Heart, MessageCircle, Flag, Star, Shield, MapPin, Tag, Copy, Sparkles, Loader2,
} from "lucide-react";

const CAT_EMOJI = { textbooks: "📚", electronics: "💻", furniture: "🪑", accommodation: "🏠", tutoring: "🎓", services: "⚡", freelancers: "🧑‍💻", campus_business: "🏪", tickets: "🎫", other: "📦" };

function formatPrice(listing) {
  if (listing.is_free) return "Free";
  return `₦${(listing.price || 0).toLocaleString()}${listing.price_unit ? "/" + listing.price_unit : ""}`;
}

export default function ListingDetailSheet({ listing, user, rating, onClose, onReport, onReview }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [imgIndex, setImgIndex] = useState(0);
  const [messaging, setMessaging] = useState(false);
  const [faving, setFaving] = useState(false);

  const images = listing.images || [];
  const isFavorited = (listing.favorited_by || []).includes(user?.id);
  const isOwnListing = listing.created_by_id === user?.id;

  const toggleFavorite = async () => {
    if (!user?.id || faving) return;
    setFaving(true);
    const favoritedBy = listing.favorited_by || [];
    const next = isFavorited ? favoritedBy.filter((id) => id !== user.id) : [...favoritedBy, user.id];
    try {
      await base44.entities.MarketplaceListing.update(listing.id, { favorited_by: next });
      qc.invalidateQueries({ queryKey: ["marketplaceListings"] });
    } catch {
      toast({ title: "Couldn't update", variant: "destructive" });
    }
    setFaving(false);
  };

  const handleMessageSeller = async () => {
    if (!user?.id || !listing.created_by_id || isOwnListing) {
      toast({ title: "This is your listing" });
      return;
    }
    setMessaging(true);
    try {
      const existing = await base44.entities.Conversation.filter({ type: "direct" }, "-created_date", 100);
      const found = existing.find((c) =>
        c.participants?.some((p) => p.user_id === listing.created_by_id) &&
        c.participants?.some((p) => p.user_id === user.id)
      );
      if (found) {
        navigate(`/messages/${found.id}`);
        onClose();
        return;
      }
      const conv = await base44.entities.Conversation.create({
        type: "direct",
        category: "marketplace",
        title: listing.title,
        participants: [
          { user_id: user.id, name: user.full_name, role: "student" },
          { user_id: listing.created_by_id, name: listing.seller_name, role: "student" },
        ],
      });
      navigate(`/messages/${conv.id}`);
      onClose();
    } catch {
      toast({ title: "Couldn't start conversation", variant: "destructive" });
    }
    setMessaging(false);
  };

  const copyContact = () => {
    navigator.clipboard?.writeText(listing.contact || "");
    toast({ title: "Contact copied" });
  };

  return (
    <motion.div className="fixed inset-0 z-[2000] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        className="relative w-full max-w-[520px] mx-auto rounded-t-[28px] glass-strong no-scrollbar"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-2 bg-border" />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center spring-tap">
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Image gallery */}
        {images.length > 0 ? (
          <div className="relative h-56 overflow-hidden rounded-t-[28px]">
            <div className="flex h-full overflow-x-auto no-scrollbar snap-x snap-mandatory">
              {images.map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-full object-cover snap-center shrink-0" loading="lazy" />
              ))}
            </div>
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button key={i} onClick={() => {
                    const container = document.querySelector(".snap-x");
                    if (container) container.scrollTo({ left: i * container.offsetWidth, behavior: "smooth" });
                    setImgIndex(i);
                  }} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIndex ? "bg-white w-4" : "bg-white/40"}`} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center rounded-t-[28px] bg-muted/30">
            <span className="text-[40px]">{CAT_EMOJI[listing.category] || "📦"}</span>
          </div>
        )}

        <div className="p-5 pb-8">
          {/* Title + price */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="text-[18px] font-bold text-foreground leading-tight flex-1">{listing.title}</h2>
            {listing.is_verified && (
              <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[9px] font-bold flex items-center gap-1 shrink-0">
                <Shield className="w-2.5 h-2.5" /> Verified
              </span>
            )}
          </div>
          <p className="text-[20px] font-bold text-primary mb-3">{formatPrice(listing)}</p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="px-2 py-1 rounded-full bg-muted/40 text-[10px] font-medium text-muted-foreground capitalize">{listing.category?.replace("_", " ")}</span>
            {listing.condition && <span className="px-2 py-1 rounded-full bg-muted/40 text-[10px] font-medium text-muted-foreground capitalize">{listing.condition?.replace("_", " ")}</span>}
            {listing.business_name && <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{listing.business_name}</span>}
          </div>

          {/* Location */}
          {listing.location && (
            <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground mb-3">
              <MapPin className="w-3.5 h-3.5" /> {listing.location}
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <p className="text-[13px] text-foreground/80 leading-relaxed mb-3">{listing.description}</p>
          )}

          {/* Tags */}
          {listing.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {listing.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 rounded-full bg-muted/30 text-[10px] text-muted-foreground flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" /> {tag}
                </span>
              ))}
            </div>
          )}

          {/* Seller info */}
          <div className="glass-card p-3 rounded-[14px] mb-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[12px] font-bold text-primary">{(listing.seller_name || "?").charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground truncate">{listing.seller_name}</p>
                <p className="text-[9px] text-muted-foreground">Seller</p>
              </div>
            </div>
            <SellerRatingBadge rating={rating?.avg} count={rating?.count} />
            {user && !isOwnListing && (
              <button onClick={() => { onReview?.(listing); onClose(); }} className="mt-2.5 w-full py-2 rounded-[12px] glass text-[11px] font-semibold text-foreground spring-tap flex items-center justify-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-warning" /> Rate this seller
              </button>
            )}
            <button onClick={() => { onReport?.(listing); onClose(); }} className="mt-2 w-full py-1.5 rounded-[10px] text-[10px] font-semibold text-muted-foreground hover:text-destructive spring-tap flex items-center justify-center gap-1.5">
              <Flag className="w-3 h-3" /> Report listing
            </button>
          </div>

          {/* Actions */}
          {!isOwnListing ? (
            <div className="space-y-2">
              <button
                onClick={handleMessageSeller}
                disabled={messaging}
                className="w-full py-3 rounded-[16px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {messaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                Message Seller
              </button>
              <div className="flex gap-2">
                <button
                  onClick={toggleFavorite}
                  disabled={faving}
                  className={`flex-1 py-2.5 rounded-[14px] font-semibold text-[12px] spring-tap flex items-center justify-center gap-1.5 ${isFavorited ? "bg-primary/10 text-primary" : "glass-card text-foreground"}`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-primary" : ""}`} /> {isFavorited ? "Favorited" : "Favorite"}
                </button>
                {listing.contact && (
                  <button onClick={copyContact} className="flex-1 py-2.5 rounded-[14px] glass-card text-foreground font-semibold text-[12px] spring-tap flex items-center justify-center gap-1.5">
                    <Copy className="w-3.5 h-3.5" /> Copy contact
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-3 rounded-[14px] text-center">
              <p className="text-[12px] text-muted-foreground">This is your listing.</p>
            </div>
          )}

          <p className="text-center text-[9px] text-muted-foreground/60 mt-3">
            <Sparkles className="w-2.5 h-2.5 inline mr-0.5" /> Message securely in-app. Never pay outside UNIBUD.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}