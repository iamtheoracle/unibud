import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Newspaper, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import FootballScoresTicker from "@/components/football/FootballScoresTicker";
import FootballNewsCard from "@/components/football/FootballNewsCard";
import FootballMatchCard from "@/components/football/FootballMatchCard";
import FoodOrderStrip from "@/components/football/FoodOrderStrip";

const DEMO_NEWS = [
  { id: "n1", title: "Haaland breaks Premier League scoring record again", summary: "The Norwegian striker now holds the single-season record after a stunning hat-trick against Newcastle.", image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80", source: "BBC Sport", category: "match_report", read_time_minutes: 4, published_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "n2", title: "Transfer window: Top 5 deals that could happen this week", summary: "Clubs across Europe are finalising moves before the deadline. Here are the biggest rumours with substance.", image_url: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80", source: "Sky Sports", category: "transfer", read_time_minutes: 6, published_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "n3", title: "Champions League draw: Group of death confirmed", summary: "Three former winners are drawn together in what pundits are calling the toughest group in years.", image_url: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=80", source: "ESPN", category: "analysis", read_time_minutes: 5, published_at: new Date(Date.now() - 14400000).toISOString() },
  { id: "n4", title: "Injury update: Star midfielder ruled out for six weeks", summary: "A scan confirmed a hamstring tear; the club assesses alternatives ahead of the derby.", image_url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80", source: "Guardian", category: "injury", read_time_minutes: 3, published_at: new Date(Date.now() - 21600000).toISOString() },
];

/**
 * FootballHub — football news community with live scores, matches, and food.
 * Monochrome, calm, single-scroll: live ticker → news feed → featured match → food.
 */
export default function FootballHub() {
  const { data: matches = [] } = useQuery({
    queryKey: ["footballMatches"],
    queryFn: () => base44.entities.FootballMatch.list("-kickoff", 20),
  });
  const { data: news = [] } = useQuery({
    queryKey: ["footballNews"],
    queryFn: () => base44.entities.FootballNews.list("-published_at", 10),
  });
  const { data: food = [] } = useQuery({
    queryKey: ["foodItems"],
    queryFn: () => base44.entities.FoodItem.list("-created_date", 10),
  });

  const newsItems = news.length > 0 ? news : DEMO_NEWS;
  const featured = matches.find((m) => m.status === "scheduled") || null;

  return (
    <div className="min-h-screen pb-28 safe-area-pt">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/15">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center">
              <Newspaper className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-foreground" style={{ letterSpacing: "-0.02em" }}>
              Football
            </span>
          </div>
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-foreground text-background text-[11px] font-semibold spring-tap">
            <span className="w-1.5 h-1.5 rounded-full bg-error live-pulse" /> Live
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-6">
        {/* Live scores */}
        <FootballScoresTicker matches={matches} />

        {/* Latest news */}
        <section>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Latest news</h2>
            <button className="flex items-center gap-0.5 text-[11px] font-semibold text-primary spring-tap">
              All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {newsItems.slice(0, 4).map((article, i) => (
              <FootballNewsCard key={article.id} article={article} index={i} />
            ))}
          </div>
        </section>

        {/* Featured upcoming match */}
        <section>
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground mb-2.5">Coming up</h2>
          <FootballMatchCard match={featured} />
        </section>

        {/* Food ordering */}
        <FoodOrderStrip items={food} />
      </div>
    </div>
  );
}