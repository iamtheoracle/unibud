import React, { useState } from "react";
import { Search, Plus, X, MessageCircle, Sparkles, Star, Flag, Bell, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useUnibudContext } from "@/lib/UnibudContext";
import ListingComposer from "@/components/marketplace/ListingComposer";
import SellerRatingBadge from "@/components/marketplace/SellerRatingBadge";
import ReviewComposer from "@/components/marketplace/ReviewComposer";
import ReportModal from "@/components/ecosystem/ReportModal";
import MarketplaceCard from "@/components/marketplace/MarketplaceCard";
import ListingRow from "@/components/marketplace/ListingRow";
import ServiceRow from "@/components/marketplace/ServiceRow";

const catIcons = { textbooks: "📚", past_questions: "📋", electronics: "💻", furniture: "🪑", accommodation: "🏠", tutoring: "🎓", services: "⚡", freelancers: "🧑‍💻", jobs: "💼", tickets: "🎫", other: "📦" };
const catColors = { textbooks: "from-information to-information/80", past_questions: "from-primary to-primary/80", electronics: "from-accent to-accent/80", furniture: "from-warning to-warning/80", accommodation: "from-success to-success/80", tutoring: "from-success to-success/80", services: "from-destructive to-destructive/80", freelancers: "from-information to-information/80", jobs: "from-accent to-accent/80", tickets: "from-primary to-primary/80", other: "from-muted to-muted-foreground/50" };

const CAT_TILES = [
  { emoji: "📚", label: "Textbooks", cat: "textbooks" },
  { emoji: "💻", label: "Electronics", cat: "electronics" },
  { emoji: "🏠", label: "Housing", cat: "accommodation" },
  { emoji: "🪑", label: "Furniture", cat: "furniture" },
  { emoji: "🎓", label: "Tutoring", cat: "tutoring" },
  { emoji: "🧑‍💻", label: "Freelancers", cat: "freelancers" },
  { emoji: "⚡", label: "Services", cat: "services" },
  { emoji: "📦", label: "Other", cat: "other" },
];

const FILTERS = ["Nearby", "My Institution", "Department", "Verified", "Recently Added"];
const SERVICE_CATS = ["tutoring", "services", "freelancers"];

const DEMO_LISTINGS = [
  { id: "d1", title: "Data Structures & Algorithms", price: 15500, category: "textbooks", is_verified: true, location: "2 km", seller_name: "Femi A.", contact: "0801 234 5678", description: "Gently used. Covers CSC402 syllabus." },
  { id: "d2", title: 'MacBook Pro 14" M2', price: 1850000, category: "electronics", is_verified: true, location: "1.5 km", seller_name: "Chioma E.", contact: "WhatsApp: 0809 876 5432", description: "Battery strong, charger included." },
  { id: "d3", title: "Shared Room near Campus", price: 120000, price_unit: "mo", category: "accommodation", is_verified: true, location: "500m", seller_name: "David O.", contact: "DM me", description: "Shared room, close to campus." },
  { id: "d4", title: "Hostel 5 — Single Room", price: 150000, price_unit: "sem", category: "accommodation", location: "UNILAG", seller_name: "Hostel Office", meta: "2 beds left", contact: "0800 000 0000" },
  { id: "d5", title: "Roommate Wanted", price: 70000, price_unit: "mo", category: "accommodation", location: "UNILAG", seller_name: "Zara", meta: "Female only", contact: "0800 111 2222" },
  { id: "d6", title: "Tutor: Mathematics", price: 5000, price_unit: "hr", category: "tutoring", seller_name: "Tunde B.", contact: "0801 222 3333", rating: 4.9, reviews: 34 },
  { id: "d7", title: "Designer", price: 15000, category: "freelancers", seller_name: "Dara", contact: "0802 333 4444", rating: 4.8, reviews: 22 },
  { id: "d8", title: "Photographer", price: 25000, category: "services", seller_name: "Peter", contact: "0803 444 5555", rating: 4.9, reviews: 18 },
];

function initials(name) {
  if (!name) return "U";
  return name.trim().charAt(0).toUpperCase() || "U";
}

export default function Marketplace() {
  const { isDemoMode } = useDemoMode();
  const { toast } = useToast();
  const navigate = useNavigate();
  const ctx = useUnibudContext();
  const [activeCat, setActiveCat] = useState("All");
  const [scope, setScope] = useState("Nearby");
  const [search, setSearch] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [contactListing, setContactListing] = useState(null);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);
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

  const base = isDemoMode ? DEMO_LISTINGS : (listings || []);
  const verifiedOnly = scope === "Verified";
  let arr = base;
  if (activeCat !== "All") arr = arr.filter((l) => l.category === activeCat);
  if (verifiedOnly) arr = arr.filter((l) => l.is_verified);
  if (search.trim()) {
    const q = search.toLowerCase();
    arr = arr.filter((l) => l.title?.toLowerCase().includes(q) || (l.description || "").toLowerCase().includes(q) || (l.location || "").toLowerCase().includes(q));
  }
  const housing = arr.filter((l) => l.category === "accommodation");
  const services = arr.filter((l) => SERVICE_CATS.includes(l.category));
  const featured = arr.filter((l) => l.category !== "accommodation" && !SERVICE_CATS.includes(l.category));
  const isEmpty = featured.length === 0 && services.length === 0 && housing.length === 0;

  const ratingForSeller = (sellerId, fallbackKey) => {
    if (isDemoMode) {
      const demo = { d1: { avg: 4.8, count: 14 }, d2: { avg: 4.6, count: 9 }, d3: { avg: 5.0, count: 3 }, d6: { avg: 4.9, count: 34 }, d7: { avg: 4.8, count: 22 }, d8: { avg: 4.9, count: 18 } };
      return demo[fallbackKey] || { avg: 0, count: 0 };
    }
    const sellerReviews = (reviews || []).filter((r) => r.seller_id === sellerId);
    if (sellerReviews.length === 0) return { avg: 0, count: 0 };
    const avg = sellerReviews.reduce((s, r) => s + (r.rating || 0), 0) / sellerReviews.length;
    return { avg: Math.round(avg * 10) / 10, count: sellerReviews.length };
  };

  const toggleSave = (itemId) => {
    const newSaved = savedItems.includes(itemId) ? savedItems.filter((id) => id !== itemId) : [...savedItems, itemId];
    setSavedItems(newSaved);
    try { localStorage.setItem("marketplace_saved", JSON.stringify(newSaved)); } catch {}
  };
  const copyContact = (contact) => {
    navigator.clipboard?.writeText(contact);
    toast({ title: "Contact copied", description: "Reach out to the seller directly." });
  };

  const name = ctx?.user?.full_name || "Scholar";
  const rec = featured[0] || housing[0];

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 pt-3 pb-28 safe-area-pt">
      {/* Top bar */}
      <div className="flex justify-between items-center px-1 pt-2 pb-3">
        <h1 className="font-heading font-bold text-[20px] text-foreground tracking-tight">
          Marketplace <span className="text-[12px] font-normal text-muted-foreground/60">Campus</span>
        </h1>
        <div className="flex items-center gap-2.5">
          <button onClick={() => navigate("/notifications")} className="relative w-8 h-8 rounded-full glass grid place-items-center spring-tap">
            <Bell className="w-4 h-4 text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
          <button onClick={() => setComposerOpen(true)} className="w-8 h-8 rounded-full bg-primary grid place-items-center spring-tap ice-glow" aria-label="List an item">
            <Plus className="w-4 h-4 text-primary-foreground" />
          </button>
          <button onClick={() => navigate("/me")} className="w-8 h-8 rounded-full grid place-items-center font-semibold text-[12px] text-primary-foreground spring-tap" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
            {initials(name)}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full glass border border-border/40 mb-3">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search books, hostels, services, tutors..." className="flex-1 bg-transparent border-none outline-none text-[14px] text-foreground placeholder:text-muted-foreground/50" />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setScope(f)}
            className={`px-3.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap spring-tap border ${
              scope === f ? "text-primary border-primary/30 bg-primary/10" : "text-muted-foreground border-border/40 bg-muted/20"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3.5">
        {/* Categories */}
        <MarketplaceCard title="Categories" action={activeCat !== "All" ? "Clear" : "See all"} onAction={() => setActiveCat("All")}>
          <div className="grid grid-cols-4 gap-1.5">
            {CAT_TILES.map((t) => {
              const on = activeCat === t.cat;
              return (
                <button
                  key={t.cat}
                  onClick={() => setActiveCat(on ? "All" : t.cat)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-2xl border spring-tap ${on ? "bg-primary/10 border-primary/30" : "bg-muted/20 border-border/20"}`}
                >
                  <span className="text-[22px] leading-none">{t.emoji}</span>
                  <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight">{t.label}</span>
                </button>
              );
            })}
          </div>
        </MarketplaceCard>

        {isLoading && !isDemoMode ? (
          [1, 2, 3].map((i) => <div key={i} className="h-[90px] rounded-[20px] shimmer" />)
        ) : isEmpty ? (
          <div className="crystal-card p-4">
            <EmptyState icon={Package} title="No listings found" description="Try a different filter, or be the first to list something — it's free." action={<button onClick={() => setComposerOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap"><Plus className="w-3.5 h-3.5" /> List an item</button>} />
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <MarketplaceCard title="Featured Listings" action="View all" onAction={() => setActiveCat("All")}>
                {featured.map((item) => (
                  <ListingRow
                    key={item.id}
                    icon={catIcons[item.category] || "📦"}
                    title={item.title}
                    price={item.price}
                    priceUnit={item.price_unit}
                    free={item.is_free}
                    location={item.location}
                    verified={item.is_verified}
                    meta={item.meta}
                    saved={savedItems.includes(item.id)}
                    onToggleSave={() => toggleSave(item.id)}
                    onClick={() => setContactListing(item)}
                  />
                ))}
              </MarketplaceCard>
            )}

            {services.length > 0 && (
              <MarketplaceCard title="Services Marketplace" action="More" onAction={() => setActiveCat("services")}>
                {services.map((item, i) => {
                  const r = item.rating != null ? { avg: item.rating, count: item.reviews || 0 } : ratingForSeller(item.created_by_id, item.id);
                  return (
                    <ServiceRow
                      key={item.id}
                      initial={initials(item.seller_name || item.title)}
                      name={item.title}
                      rating={r.avg || "—"}
                      reviews={r.count}
                      priceLabel={item.is_free ? "Free" : `₦${(item.price || 0).toLocaleString()}${item.price_unit ? "/" + item.price_unit : ""}`}
                      onClick={() => setContactListing(item)}
                    />
                  );
                })}
              </MarketplaceCard>
            )}

            {housing.length > 0 && (
              <MarketplaceCard title="Housing" action="Explore" onAction={() => setActiveCat("accommodation")}>
                {housing.map((item) => (
                  <ListingRow
                    key={item.id}
                    icon="🏠"
                    title={item.title}
                    price={item.price}
                    priceUnit={item.price_unit}
                    free={item.is_free}
                    location={item.location}
                    verified={item.is_verified}
                    meta={item.meta}
                    saved={savedItems.includes(item.id)}
                    onToggleSave={() => toggleSave(item.id)}
                    onClick={() => setContactListing(item)}
                  />
                ))}
              </MarketplaceCard>
            )}
          </>
        )}

        {/* Bud AI recommendation */}
        {rec && (
          <div className="rounded-2xl p-3.5 flex items-center gap-3" style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
            <div className="w-8 h-8 rounded-full grid place-items-center text-[14px] text-primary-foreground flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" }}>✦</div>
            <p className="flex-1 text-[12px] font-medium text-muted-foreground leading-snug">
              <span className="text-primary font-semibold">Bud recommends:</span> "{rec.title}" for your courses — ₦{(rec.price || 0).toLocaleString()} from a verified seller nearby.
            </p>
            <button onClick={() => setContactListing(rec)} className="text-[11px] font-semibold text-primary spring-tap whitespace-nowrap">View →</button>
          </div>
        )}
      </div>

      <ListingComposer open={composerOpen} onClose={() => setComposerOpen(false)} />
      <ReviewComposer open={!!reviewTarget} listing={reviewTarget} sellerName={reviewTarget?.seller_name} onClose={() => setReviewTarget(null)} />
      <ReportModal open={!!reportTarget} onClose={() => setReportTarget(null)} contentType="marketplace_listing" contentId={reportTarget?.id} reportedUserId={reportTarget?.created_by_id} reportedUserName={reportTarget?.seller_name} />

      {/* Contact seller sheet */}
      <AnimatePresence>
        {contactListing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setContactListing(null)} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 backdrop-blur-sm safe-area-px">
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 380, damping: 32 }} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] glass-strong p-5 safe-area-pb">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-bold text-[17px] text-foreground">Contact seller</h3>
                <button onClick={() => setContactListing(null)} className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap"><X className="w-[18px] h-[18px]" /></button>
              </div>
              <div className="flex gap-3 mb-3">
                <div className={"w-16 h-16 rounded-[16px] bg-gradient-to-br " + (catColors[contactListing.category] || "from-muted to-muted-foreground/50") + " flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"}>
                  {catIcons[contactListing.category] || "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-[14px] text-foreground">{contactListing.title}</p>
                  {contactListing.is_free ? (
                    <p className="font-bold text-success text-[15px] mt-0.5">Free</p>
                  ) : (
                    <p className="font-bold text-primary text-[15px] mt-0.5">₦{(contactListing.price || 0).toLocaleString()}{contactListing.price_unit ? `/${contactListing.price_unit}` : ""}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground">{contactListing.seller_name} · {contactListing.location}</p>
                </div>
              </div>
              {contactListing.description && <p className="text-[12px] text-muted-foreground mb-3 leading-relaxed">{contactListing.description}</p>}
              <div className="rounded-[16px] p-3.5 bg-muted/30 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-1.5">Seller reputation</p>
                <SellerRatingBadge rating={ratingForSeller(contactListing.created_by_id, contactListing.id).avg} count={ratingForSeller(contactListing.created_by_id, contactListing.id).count} />
                {currentUser && contactListing.created_by_id && currentUser.id !== contactListing.created_by_id && (
                  <button onClick={() => { setReviewTarget(contactListing); setContactListing(null); }} className="mt-2.5 w-full py-2.5 rounded-[14px] glass text-[12px] font-semibold text-foreground spring-tap flex items-center justify-center gap-1.5"><Star className="w-3.5 h-3.5 text-warning" /> Rate this seller</button>
                )}
                <button onClick={() => { setReportTarget(contactListing); setContactListing(null); }} className="mt-2 w-full py-2 rounded-[12px] text-[11px] font-semibold text-muted-foreground hover:text-destructive spring-tap flex items-center justify-center gap-1.5"><Flag className="w-3.5 h-3.5" /> Report listing</button>
              </div>
              <div className="rounded-[16px] p-3.5 bg-muted/30 mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-1">Reach {contactListing.seller_name}</p>
                <p className="text-[13px] font-medium text-foreground break-words">{contactListing.contact || "No contact provided"}</p>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => copyContact(contactListing.contact)} disabled={!contactListing.contact} className="flex-1 py-3 rounded-[16px] bg-primary text-primary-foreground font-semibold text-[13px] spring-tap flex items-center justify-center gap-2 disabled:opacity-50"><MessageCircle className="w-4 h-4" /> Copy contact</button>
                <a href={contactListing.contact?.startsWith("+") || /\d{8,}/.test(contactListing.contact || "") ? `https://wa.me/${(contactListing.contact || "").replace(/[^0-9]/g, "")}` : "#"} target="_blank" rel="noreferrer" className="flex-1 py-3 rounded-[16px] glass font-semibold text-[13px] spring-tap flex items-center justify-center gap-2 text-foreground"><Sparkles className="w-4 h-4 text-success" /> WhatsApp</a>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/70 mt-3">Trade directly with students. UNIBUD does not handle payments or take fees.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}