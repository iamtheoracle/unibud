import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Share2, Bell, Search, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";
import OrbitBadge from "@/components/hubs/OrbitBadge";
import BudStudyCompanion from "@/components/hubs/BudStudyCompanion";
import BudInviteBar from "@/components/hubs/BudInviteBar";

/**
 * HubShell — the shared foundation every hub uses.
 *
 * Provides: cover artwork, hub icon, member count, active indicator,
 * search, category chips, join button, share, notifications, and a
 * Bud suggestion bar. Content is passed as children.
 */
export default function HubShell({ hub, children }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [joined, setJoined] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(hub.categories[0]);
  const Icon = hub.icon;

  const handleJoin = () => {
    hapticTap();
    setJoined(!joined);
    toast({
      title: joined ? `Left ${hub.label}` : `Joined ${hub.label}`,
      description: joined ? "You can rejoin anytime." : "Bud will keep you updated here.",
    });
  };

  const handleShare = () => {
    hapticTap();
    if (navigator.share) {
      navigator.share({ title: hub.label, text: hub.tagline, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast({ title: "Link copied", description: "Share this hub with your friends." });
    }
  };

  return (
    <div className="min-h-screen pb-32 safe-area-pt">
      {/* ── Cover ── */}
      <div
        className="relative h-36 overflow-hidden"
        style={{ background: `linear-gradient(135deg, hsl(${hub.color} / 0.35), hsl(${hub.color} / 0.05) 70%)` }}
      >
        <div className="absolute inset-0" style={{ background: `radial-gradient(80% 60% at 30% 0%, hsl(${hub.color} / 0.15), transparent)` }} />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap z-10"
          aria-label="Back"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={2} />
        </button>
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button onClick={handleShare} className="w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap" aria-label="Share">
            <Share2 className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full glass-strong grid place-items-center spring-tap" aria-label="Notifications">
            <Bell className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* ── Hub identity ── */}
      <div className="px-5 -mt-8 relative z-10">
        <div
          className="w-16 h-16 rounded-[20px] grid place-items-center glass-strong"
          style={{ boxShadow: `0 0 32px hsl(${hub.color} / 0.2)` }}
        >
          <Icon className="w-8 h-8" style={{ color: `hsl(${hub.color})` }} strokeWidth={2} />
        </div>
        <h1 className="text-[22px] font-bold text-foreground mt-3 tracking-tight">{hub.label}</h1>
        <p className="text-[13px] text-muted-foreground">{hub.tagline}</p>
        <div className="flex items-center gap-3 mt-2 text-[12px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {joined ? "You're here" : "Be the first"}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success gentle-pulse" />
            Active now
          </span>
        </div>
        <button
          onClick={handleJoin}
          className={`mt-3 px-5 py-2 rounded-full text-[13px] font-semibold spring-tap ${
            joined ? "bg-secondary text-secondary-foreground border border-border/40" : "bg-foreground text-background"
          }`}
        >
          {joined ? "Joined ✓" : "Join Hub"}
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-5 py-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${hub.label}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow"
          />
        </div>
      </div>

      {/* ── Categories ── */}
      <div className="pb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 px-5">
          {hub.categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { hapticTap(); setActiveCategory(cat); }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap ${
                activeCategory === cat ? "bg-foreground text-background" : "bg-card text-muted-foreground border border-border/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orbit badge — communities belong to Orbit, not Bud ── */}
      <div className="px-5 pb-3">
        <OrbitBadge />
      </div>

      {/* ── Bud study companion (academic hubs only) ── */}
      {hub.isAcademic && (
        <div className="px-5 pb-4">
          <BudStudyCompanion hub={hub} />
        </div>
      )}

      {/* ── Content ── */}
      <div className="px-5">{children}</div>

      {/* ── @Bud invite bar (non-academic hubs — Bud joins when invited, then leaves) ── */}
      {!hub.isAcademic && (
        <div className="px-5 pt-4">
          <BudInviteBar hub={hub} />
        </div>
      )}
    </div>
  );
}