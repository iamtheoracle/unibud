import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fallbackIfEmpty } from "@/lib/mock/useMockFallback";
import { DISCOVER_MOCK } from "@/lib/social/discoverMock";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useUnibudContext } from "@/lib/UnibudContext";
import OsTopBar from "@/components/layout/OsTopBar";
import DiscoveryFeed from "@/components/discover/DiscoveryFeed";
import ExploreView from "@/components/discover/ExploreView";

const EASE = [0.16, 1, 0.3, 1];

const QUICK = [
  { emoji: "📰", label: "News", to: "/notifications" },
  { emoji: "💼", label: "Jobs", to: "/opportunities" },
  { emoji: "🎓", label: "Scholarships", to: "/scholarships" },
  { emoji: "🏠", label: "Housing", to: "/campus" },
  { emoji: "🛒", label: "Marketplace", to: "/marketplace" },
  { emoji: "💳", label: "Wallet", to: "/wallet" },
  { emoji: "🚌", label: "Transport", to: "/campus" },
];

const TABS = [
  { key: "quad", label: "Quad" },
  { key: "discovery", label: "Discovery" },
  { key: "explore", label: "Explore" },
];

/**
 * Discover — redesigned discovery hub. A greeting top bar, a content-nav
 * (Quad → post feed route, Discovery + Explore as in-page views), the glass
 * discovery feed, and an adaptive quick-access bar. Reuses the existing
 * data layer (entities + mock fallback) and demo-mode gating.
 */
export default function Discover() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const ctx = useUnibudContext();
  const [view, setView] = useState("discovery");

  const enabled = !isDemoMode;
  const useData = (key, fn, mock) =>
    fallbackIfEmpty(useQuery({ queryKey: [key], queryFn: fn, enabled }).data, mock);

  const data = {
    communities: useData("discoverCommunities", () => base44.entities.Community.list("-created_date", 8), DISCOVER_MOCK.communities),
    quadPosts: useData("discoverQuad", () => base44.entities.QuadPost.list("-created_date", 12), DISCOVER_MOCK.quadPosts),
    events: useData("discoverEvents", () => base44.entities.CampusEvent.list("-created_date", 8), DISCOVER_MOCK.events),
    opportunities: useData("discoverOpps", () => base44.entities.Opportunity.list("-created_date", 8), DISCOVER_MOCK.opportunities),
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 pt-3 pb-28 safe-area-pt">
      <OsTopBar user={ctx.user} />

      {/* Content nav: Quad | Discovery | Explore */}
      <div className="flex gap-5 px-1 pb-3 border-b border-border/20">
        {TABS.map((t) => {
          const on = view === t.key;
          return (
            <button
              key={t.key}
              onClick={() => (t.key === "quad" ? navigate("/quad") : setView(t.key))}
              className={`relative text-[15px] font-semibold spring-tap pb-1 ${on ? "text-foreground" : "text-muted-foreground/50"}`}
            >
              {t.label}
              {on && (
                <span
                  className="absolute -bottom-[9px] left-0 w-full h-[2.5px] rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active view */}
      <div className="pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {view === "discovery" ? <DiscoveryFeed data={data} /> : <ExploreView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Adaptive quick-access bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pt-5 pb-2">
        {QUICK.map((q, i) => (
          <button
            key={q.label}
            onClick={() => navigate(q.to)}
            className={`px-4 py-1.5 rounded-full glass border border-border/40 text-[12px] font-medium text-muted-foreground whitespace-nowrap spring-tap ${
              i === 0 ? "text-primary border-primary/30 bg-primary/10" : ""
            }`}
          >
            <span className="mr-1">{q.emoji}</span>
            {q.label}
          </button>
        ))}
      </div>
    </div>
  );
}