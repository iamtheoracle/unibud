import React, { useState } from "react";
import { Search, Plus, Package, Heart, X, MessageCircle, MapPin, Sparkles, ShieldCheck, Gift, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import GlassCard from "@/components/ui/GlassCard";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";
import ListingComposer from "@/components/marketplace/ListingComposer";
import SellerRatingBadge from "@/components/marketplace/SellerRatingBadge";
import ReviewComposer from "@/components/marketplace/ReviewComposer";

const CATEGORIES = ["All", "Textbooks", "Electronics", "Furniture", "Accommodation", "Tutoring", "Services", "Tickets", "Other"];
const catIcons = { textbooks: "📚", electronics: "💻", furniture: "🪑", accommodation: "🏠", tutoring: "🎓", services: "⚡", tickets: "🎫", other: "📦" };
const catColors = { textbooks: "from-info to-info/80", electronics: "from-purple to-purple/80", furniture: "from-warning to-warning/80", accommodation: "from-success to-success/80", tutoring: "from-success to-success/80", services: "from-destructive to-destructive/80", tickets: "from-primary to-primary/80", other: "from-muted to-muted-foreground/50" };
const condLabel = { new: "New", like_new: "Like New", good: "Good", fair: "Fair" };

const DEMO_LISTINGS = [
  { id: "d1", title: "Engineering Mathematics Textbook", price: 5500, category: "textbooks", condition: "good", seller_name: "Femi A.", location: "Faculty of Eng.", is_verified: true, contact: "0801 234 5678", description: "Gently used, no notes inside. Covers ENG 201 syllabus." },
  { id: "d2", title: "HP Laptop - Core i5, 8GB RAM", price: 185000, category: "electronics", condition: "good", seller_name: "Chioma E.", location: "Main Campus", is_verified: true, contact: "WhatsApp: 0809 876 5432", description: "Battery still strong, comes with charger. SSD upgraded to 256GB." },
  { id: "d3", title: "Free study desk & chair", price: 0, is_free: true, category: "furniture", condition: "fair", seller_name: "David O.", location: "South Campus", is_verified: false, contact: "DM me on campus", description: "Moving out — desk and chair free to whoever collects first." },
];

export default function Marketplace() {
  const { isDemoMode } = useDemoMode();
  const { toast } = useToast();
  const [activeCat, setActiveCat] = useState("All");
  const [search, setSearch] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [contactListing, setContactListing] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [savedItems, setSavedItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("marketplace_saved") || "[]"); } catch { return []; }
  });

  const { data: listings, isLoading } = useQuery({
    queryKey: ["marketplaceListings"],
    queryFn: () => base44.entities.MarketplaceListing.filter({ status: "active" }, "-created_date", 50),
    enabled: !isDemoMode,
  });

  const { data: reviews } = useQuery({
    queryKey: ["marketplaceReviews"],
    queryFn: () => base44.entities.MarketplaceReview.list("-created_date", 200),
    enabled: !isDemoMode,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const allListings = isDemoMode ? DEMO_LISTINGS : (listings || []);
  const byCat = activeCat === "All" ? allListings : allListings.filter((l) => l.category === activeCat.toLowerCase());
  const filtered = byCat.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return l.title?.toLowerCase().includes(q) || (l.description || "").toLowerCase().includes(q) || (l.location || "").toLowerCase().includes(q);
  });

  const ratingForSeller = (sellerId, fallbackKey) => {
    if (isDemoMode) {
      const demo = { d1: { avg: 4.8, count: 14 }, d2: { avg: 4.6, count: 9 }, d3: { avg: 5.0, count: 3 } };
      return demo[fallbackKey] || { avg: 0, count: 0 };
    }
    const sellerReviews = (reviews || []).filter((r) => r.seller_id === sellerId);
    if (sellerReviews.length === 0) return { avg: 0, count: 0 };
    const avg = sellerReviews.reduce((s, r) => s + (r.rating || 0), 0) / sellerReviews.length;
    return { avg: Math.round(avg * 10) / 10, count: sellerReviews.length };
  };

  const toggleSave = (e, itemId) => {
    e.stopPropagation();
    const newSaved = savedItems.includes(itemId) ? savedItems.filter((id) => id !== itemId) : [...savedItems, itemId];
    setSavedItems(newSaved);
    try { localStorage.setItem("marketplace_saved", JSON.stringify(newSaved)); } catch {}
  };

  const copyContact = (contact) => {
    navigator.clipboard?.writeText(contact);
    toast({ title: "Contact copied", description: "Reach out to the seller directly." });
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="pt-12 pb-3 px-5">
        <div className="flex items-center gap-1.5">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Marketplace</h1>
          <span className="px-2 py-0.5 rounded-full bg-success/12 text-success text-[10px] font-bold flex items-center gap-1"><Gift className="w-3 h-3" /> Free</span>
        </div>
        <p className="text-[13px] text-muted-foreground mt-0.5">Buy, sell & share on campus — no fees, ever.</p>
      </div>

      {/* Trust banner */}
      <div className="px-4 mb-3">
        <div className="rounded-[16px] p-3 glass flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-primary/12 text-primary flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug">
            <span className="font-semibold text-foreground">Free to list · no payment required.</span> Connect with students directly and trade on your own terms.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-3 flex gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search marketplace..." className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-card border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 soft-shadow" />
        </div>
        <button onClick={() => setComposerOpen(true)} className="w-12 h-12 rounded-[16px] bg-primary flex items-center justify-center soft-shadow spring-tap gold-glow" aria-label="List an item">
          <Plus className="w-[18px] h-[18px] text-primary-foreground" />
        </button>
      </div>

      {/* Categories */}
      <div className="px-4 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className={"px-4 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap " + (activeCat === cat ? "bg-foreground text-background soft-shadow" : "bg-card border border-border/40 text-muted-foreground")}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="px-4 space-y-3">
        {isLoading && !isDemoMode ? (
          [1, 2, 3].map((i) => <div key={i} className="h-[100px] rounded-[20px] shimmer" />)
        ) : filtered.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
            <EmptyState
              icon={Package}
              title="No listings yet"
              description="Be the first to list something — it's free."
              action={
                <button onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
                  <Plus className="w-3.5 h-3.5" /> List an item
                </button>
              }
            />
          </div>
        ) : (
          filtered.map((item, i) => (
            <GlassCard key={item.id || i} variant="solid" className="p-4 cursor-pointer" delay={i * 0.05}>
              <div className="flex gap-3.5" onClick={() => setContactListing(item)}>
                <div className={"w-20 h-20 rounded-[16px] bg-gradient-to-br " + (catColors[item.category] || "from-muted to-muted-foreground/50") + " flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"}>
                  {item.images?.[0] ? <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" /> : (catIcons[item.category] || "📦")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-heading font-semibold text-[13px] leading-snug text-foreground">{item.title}</p>
                    <button onClick={(e) => toggleSave(e, item.id)} className="flex-shrink-0 spring-tap">
                      <Heart className={"w-4 h-4 " + (savedItems.includes(item.id) ? "text-primary fill-primary" : "text-muted-foreground")} strokeWidth={1.8} />
                    </button>
                  </div>
                  {item.is_free ? (
                    <p className="font-heading font-bold text-[16px] text-success mt-1 flex items-center gap-1"><Gift className="w-3.5 h-3.5" /> Free</p>
                  ) : (
                    <p className="font-heading font-bold text-[16px] text-primary mt-1">₦{(item.price || 0).toLocaleString()}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {item.condition && <span className="px-2 py-0.5 rounded-full bg-muted text-[9px] font-semibold">{condLabel[item.condition] || item.condition}</span>}
                    {item.location && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {item.location}</span>}
                  </div>
                  <div className="mt-1.5">
                    <SellerRatingBadge rating={ratingForSeller(item.created_by_id, item.id).avg} count={ratingForSeller(item.created_by_id, item.id).count} compact />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      <ListingComposer open={composerOpen} onClose={() => setComposerOpen(false)} />

      <ReviewComposer
        open={!!reviewTarget}
        listing={reviewTarget}
        sellerName={reviewTarget?.seller_name}
        onClose={() => setReviewTarget(null)}
      />

      {/* Contact sheet */}
      <AnimatePresence>
        {contactListing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setContactListing(null)}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm safe-area-px">
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] glass-strong p-5 safe-area-pb">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-[17px] text-foreground">Contact seller</h3>
                <button onClick={() => setContactListing(null)} className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap"><X className="w-[18px] h-[18px]" /></button>
              </div>
              <div className="flex gap-3 mb-3">
                <div className={"w-16 h-16 rounded-[16px] bg-gradient-to-br " + (catColors[contactListing.category] || "from-muted to-muted-foreground/50") + " flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"}>
                  {contactListing.images?.[0] ? <img src={contactListing.images[0]} alt={contactListing.title} className="w-full h-full object-cover" /> : (catIcons[contactListing.category] || "📦")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-[14px] text-foreground">{contactListing.title}</p>
                  {contactListing.is_free ? (
                    <p className="font-bold text-success text-[15px] mt-0.5">Free</p>
                  ) : (
                    <p className="font-bold text-primary text-[15px] mt-0.5">₦{(contactListing.price || 0).toLocaleString()}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground">{contactListing.seller_name} · {contactListing.location}</p>
                </div>
              </div>
              {contactListing.description && <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">{contactListing.description}</p>}
              <div className="rounded-[16px] p-3.5 bg-muted/30 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-1.5">Seller reputation</p>
                <SellerRatingBadge rating={ratingForSeller(contactListing.created_by_id, contactListing.id).avg} count={ratingForSeller(contactListing.created_by_id, contactListing.id).count} />
                {currentUser && contactListing.created_by_id && currentUser.id !== contactListing.created_by_id && (
                  <button
                    onClick={() => { setReviewTarget(contactListing); setContactListing(null); }}
                    className="mt-2.5 w-full py-2.5 rounded-[14px] glass text-[12px] font-semibold text-foreground spring-tap flex items-center justify-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 text-warning" /> Rate this seller
                  </button>
                )}
              </div>
              <div className="rounded-[16px] p-3.5 bg-muted/30 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-1">Reach {contactListing.seller_name}</p>
                <p className="text-[13px] font-medium text-foreground break-words">{contactListing.contact || "No contact provided"}</p>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => copyContact(contactListing.contact)} disabled={!contactListing.contact}
                  className="flex-1 py-3 rounded-[16px] bg-primary text-primary-foreground font-semibold text-[13px] spring-tap flex items-center justify-center gap-2 disabled:opacity-50">
                  <MessageCircle className="w-4 h-4" /> Copy contact
                </button>
                <a href={contactListing.contact?.startsWith("+") || /\d{8,}/.test(contactListing.contact || "") ? `https://wa.me/${(contactListing.contact || "").replace(/[^0-9]/g, "")}` : "#"} target="_blank" rel="noreferrer"
                  className="flex-1 py-3 rounded-[16px] glass font-semibold text-[13px] spring-tap flex items-center justify-center gap-2 text-foreground">
                  <Sparkles className="w-4 h-4 text-success" /> Message on WhatsApp
                </a>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/70 mt-3">Trade directly with students. UNIBUD does not handle payments or take fees.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}