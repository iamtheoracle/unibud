import React from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Search, Brain, Newspaper, Radio } from "lucide-react";
import DiscoverCard from "@/components/discover/DiscoverCard";

const CATEGORIES = [
  { emoji: "👥", label: "Communities", to: "/communities" },
  { emoji: "👤", label: "People", to: "/connect" },
  { emoji: "📚", label: "Courses", to: "/courses" },
  { emoji: "🔬", label: "Research", to: "/research" },
  { emoji: "🎙️", label: "Creators", to: "/creator-studio" },
  { emoji: "📅", label: "Events", to: "/events" },
  { emoji: "🛒", label: "Marketplace", to: "/marketplace" },
  { emoji: "💼", label: "Jobs", to: "/opportunities" },
];

const AI_RECS = [
  { label: "People You Should Know", count: "4 suggestions", to: "/connect" },
  { label: "Communities You Should Join", count: "3 suggestions", to: "/communities" },
  { label: "Courses You May Like", count: "2 suggestions", to: "/courses" },
  { label: "Events Near You", count: "5 upcoming", to: "/events" },
];

const NEWS = [
  { text: "Faculty Senate approves new AI curriculum", time: "2h" },
  { text: "SUG announces student town hall", time: "5h" },
  { text: "Nigerian government increases research grants", time: "1d" },
];

const LIVE = [
  { emoji: "🎤", label: "AI Club Talk" },
  { emoji: "📚", label: "Study With Me" },
  { emoji: "🎧", label: "Podcast: Tech" },
];

/**
 * DiscoveryFeed — the prototype's five glass cards: trending communities,
 * explore categories, AI recommendations, campus news, and live now.
 */
export default function DiscoveryFeed({ data }) {
  const navigate = useNavigate();
  const communities = (data?.communities || []).slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      {/* Trending Communities */}
      <DiscoverCard icon={<Flame className="w-4 h-4 text-primary" />} title="Trending Communities" action="See all" onAction={() => navigate("/communities")}>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
          {communities.length ? (
            communities.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/community/${c.id}`)}
                className="flex-shrink-0 w-32 p-3 rounded-2xl glass border border-border/40 text-left spring-tap"
              >
                <p className="font-bold text-[13px] text-foreground truncate">{c.name || c.title || "Community"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{c.description || "Tap to open"}</p>
              </button>
            ))
          ) : (
            ["AI Club", "Data Science", "Robotics"].map((n) => (
              <div key={n} className="flex-shrink-0 w-32 p-3 rounded-2xl glass border border-border/40">
                <p className="font-bold text-[13px] text-foreground">{n}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Tap to open</p>
              </div>
            ))
          )}
        </div>
      </DiscoverCard>

      {/* Explore Categories */}
      <DiscoverCard icon={<Search className="w-4 h-4 text-primary" />} title="Explore Categories" action="All" onAction={() => navigate("/discover")}>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.label}
              onClick={() => navigate(c.to)}
              className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-muted/30 border border-border/30 spring-tap"
            >
              <span className="text-[22px] leading-none">{c.emoji}</span>
              <span className="text-[10px] font-medium text-muted-foreground text-center leading-tight">{c.label}</span>
            </button>
          ))}
        </div>
      </DiscoverCard>

      {/* AI Recommendations */}
      <DiscoverCard icon={<Brain className="w-4 h-4 text-primary" />} title="AI Recommendations" action="More" onAction={() => navigate("/bud")}>
        <div className="flex flex-col">
          {AI_RECS.map((r) => (
            <button
              key={r.label}
              onClick={() => navigate(r.to)}
              className="flex items-center justify-between py-2 border-b border-border/20 last:border-0 spring-tap text-left"
            >
              <span className="text-[13px] text-foreground/90">{r.label}</span>
              <span className="text-[11px] text-muted-foreground">{r.count}</span>
            </button>
          ))}
        </div>
      </DiscoverCard>

      {/* Campus News */}
      <DiscoverCard icon={<Newspaper className="w-4 h-4 text-primary" />} title="Campus News" action="More" onAction={() => navigate("/notifications")}>
        <div className="flex flex-col">
          {NEWS.map((n, i) => (
            <div key={i} className={`flex items-center justify-between py-2 ${i < NEWS.length - 1 ? "border-b border-border/20" : ""}`}>
              <span className="text-[13px] text-foreground/90 pr-2">{n.text}</span>
              <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">{n.time}</span>
            </div>
          ))}
        </div>
      </DiscoverCard>

      {/* Live Now */}
      <DiscoverCard icon={<Radio className="w-4 h-4 text-primary" />} title="Live Now" action="View all" onAction={() => navigate("/events")}>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {LIVE.map((l) => (
            <span
              key={l.label}
              className="px-3.5 py-1.5 rounded-full bg-muted/30 border border-border/40 text-[12px] text-foreground/80 whitespace-nowrap"
            >
              {l.emoji} {l.label}
            </span>
          ))}
        </div>
      </DiscoverCard>
    </div>
  );
}