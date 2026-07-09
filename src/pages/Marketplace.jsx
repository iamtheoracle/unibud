import React, { useState } from "react";
import { Search, Filter, Star, MapPin, Shield, Heart } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const categories = ["All", "Textbooks", "Electronics", "Furniture", "Tutoring", "Services"];

const listings = [
  { title: "Engineering Mathematics Textbook", price: 5500, category: "textbooks", condition: "Like New", seller: "Femi A.", rating: 4.8, location: "Faculty of Eng.", image: null, verified: true },
  { title: "HP Laptop - Core i5, 8GB RAM", price: 185000, category: "electronics", condition: "Good", seller: "Chioma E.", rating: 4.5, location: "Main Campus", image: null, verified: true },
  { title: "Study Desk & Chair Set", price: 12000, category: "furniture", condition: "Fair", seller: "David O.", rating: 4.2, location: "South Campus", image: null, verified: false },
  { title: "Python Programming Tutoring", price: 3000, category: "tutoring", condition: null, seller: "Aisha B.", rating: 4.9, location: "Online/Campus", image: null, verified: true },
  { title: "Graphic Design Services", price: 8000, category: "services", condition: null, seller: "Emeka N.", rating: 4.7, location: "Online", image: null, verified: false },
  { title: "Calculus Textbook Bundle (3)", price: 8500, category: "textbooks", condition: "Good", seller: "Grace O.", rating: 4.6, location: "Science Faculty", image: null, verified: true },
];

const catIcons = { textbooks: "📚", electronics: "💻", furniture: "🪑", tutoring: "🎓", services: "⚡" };
const catColors = { textbooks: "from-info to-info/80", electronics: "from-purple to-purple/80", furniture: "from-warning to-warning/80", tutoring: "from-success to-success/80", services: "from-destructive to-destructive/80" };

export default function Marketplace() {
  const [activeCat, setActiveCat] = useState("All");

  const filtered = activeCat === "All" ? listings : listings.filter((l) => l.category === activeCat.toLowerCase());

  return (
    <div className="min-h-screen">
      <div className="pt-12 pb-3 px-5">
        <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Marketplace</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Buy, sell & discover on campus</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-3 flex gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search marketplace..."
            className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-card border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 soft-shadow"
          />
        </div>
        <button className="w-12 h-12 rounded-[16px] bg-card border border-border/40 flex items-center justify-center soft-shadow spring-tap">
          <Filter className="w-[18px] h-[18px] text-muted-foreground" />
        </button>
      </div>

      {/* Categories */}
      <div className="px-4 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-4 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap ${
                activeCat === cat
                  ? "bg-foreground text-background soft-shadow"
                  : "bg-card border border-border/40 text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="px-4 space-y-3 pb-8">
        {filtered.map((item, i) => (
          <GlassCard key={i} variant="solid" className="p-4" delay={i * 0.05}>
            <div className="flex gap-3.5">
              <div className={`w-20 h-20 rounded-[16px] bg-gradient-to-br ${catColors[item.category] || "from-muted to-muted-foreground/50"} flex items-center justify-center text-2xl flex-shrink-0`}>
                {catIcons[item.category] || "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-heading font-semibold text-[13px] leading-snug text-foreground">{item.title}</p>
                  <button className="flex-shrink-0 spring-tap">
                    <Heart className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                  </button>
                </div>
                <p className="font-heading font-bold text-[16px] text-primary mt-1">₦{item.price.toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {item.condition && (
                    <span className="px-2 py-0.5 rounded-full bg-muted text-[9px] font-semibold">{item.condition}</span>
                  )}
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span className="text-[10px] font-medium">{item.rating}</span>
                  </div>
                  {item.verified && (
                    <div className="flex items-center gap-0.5">
                      <Shield className="w-3 h-3 text-success" />
                      <span className="text-[9px] text-success font-medium">Verified</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{item.location}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}