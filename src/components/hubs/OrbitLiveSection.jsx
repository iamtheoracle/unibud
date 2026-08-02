import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ExternalLink, Radio, RefreshCw } from "lucide-react";
import { EqualizerBars, LiveIndicator, BreakingBadge, CinematicGlow, OrbitSearchingBars } from "@/components/hubs/HubAnimations";

const EASE = [0.16, 1, 0.3, 1];

/** Per-hub web search prompts — Orbit fetches real, verifiable information. */
const HUB_PROMPTS = {
  movies_tv: "Search for real, current movies in cinemas and new streaming releases. For each provide: title, a brief description, source name (e.g. IMDb), a rating if available, and a real URL to the official page or YouTube trailer.",
  sports: "Search for real, current live and upcoming sports matches across major leagues (Premier League, Champions League, NBA, etc). For each provide: the teams, score if available, competition name, status (live/scheduled/finished), source (e.g. BBC Sport), and a real URL.",
  music: "Search for real, current trending music, new album releases, and popular artists. For each provide: artist name, song or album title, and a real link to Spotify, YouTube, or Apple Music.",
  news_tech: "Search for real, current news headlines from trusted publishers (BBC News, Reuters, The Guardian). Focus on education, technology, science, and business. For each provide: headline, source name, and a real article URL.",
  gaming: "Search for real, current gaming news, new game releases, and esports tournament schedules. For each provide: title, source (e.g. IGN, Steam), and a real URL.",
  creators: "Search for real, current trending creative content and design inspiration. For each provide: title, creator, source (e.g. Behance, YouTube), and a real URL.",
  careers: "Search for real, current internship and graduate job opportunities for university students. For each provide: job title, company, source (LinkedIn, Indeed), and a real URL.",
  events: "Search for real, current university campus events, academic conferences, and student-focused events. For each provide: event name, date, source, and a real URL.",
  discussions: "Search for real, current trending discussion topics relevant to university students. For each provide: topic title, source, and a real URL.",
  academics: "Search for real, current academic research highlights and open educational resources. For each provide: title, source, and a real URL.",
};

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          source: { type: "string" },
          url: { type: "string" },
          meta: { type: "string" },
        },
      },
    },
  },
};

function getDecoration(hub) {
  switch (hub.id) {
    case "music": return <EqualizerBars color={hub.color} />;
    case "sports": return <LiveIndicator />;
    case "news_tech": return <BreakingBadge />;
    default: return null;
  }
}

function OrbitLiveCard({ item, hub, index }) {
  const decoration = getDecoration(hub);
  const isCinematic = hub.id === "movies_tv";
  return (
    <motion.a
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: EASE }}
      href={item.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block p-3 rounded-[16px] glass-card spring-tap overflow-hidden"
    >
      {isCinematic && <CinematicGlow />}
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          {decoration}
          {item.source && <span className="text-[10px] text-muted-foreground/70">{item.source}</span>}
        </div>
        <p className="text-[13px] font-semibold text-foreground line-clamp-2 leading-tight">{item.title}</p>
        {item.subtitle && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{item.subtitle}</p>}
        <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium text-muted-foreground">
          <ExternalLink className="w-3 h-3" />
          {item.source ? `Open on ${item.source}` : "Open source"}
        </div>
      </div>
    </motion.a>
  );
}

export default function OrbitLiveSection({ hub }) {
  const prompt = HUB_PROMPTS[hub.id];

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["orbit-live", hub.id],
    queryFn: async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Orbit, UNIBUD's community intelligence engine. ${prompt} Return up to 8 real items. Every URL must be real and verifiable. Do not fabricate any item, score, title, or URL. If you cannot verify something, omit it entirely.`,
        add_context_from_internet: true,
        model: "gemini_3_flash",
        response_json_schema: RESPONSE_SCHEMA,
      });
      return result.items || [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (!prompt) return null;

  const items = data || [];

  return (
    <div className="px-5 pb-4">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-success gentle-pulse" />
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Orbit Live</h2>
          <span className="text-[10px] text-muted-foreground/50">· real-time</span>
        </div>
        <button
          onClick={() => refetch()}
          className="w-7 h-7 rounded-full grid place-items-center text-muted-foreground spring-tap"
          aria-label="Refresh"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2.5 p-3 rounded-[16px] glass-card">
          <OrbitSearchingBars color={hub.color} />
          <p className="text-[12px] text-muted-foreground">Orbit is searching the web for real updates...</p>
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-2">
          {items.map((item, i) => (
            <OrbitLiveCard key={i} item={item} hub={hub} index={i} />
          ))}
        </div>
      ) : (
        <div className="p-3 rounded-[16px] glass-card text-center">
          <p className="text-[12px] text-muted-foreground">Orbit couldn't find live updates right now. Try again in a moment.</p>
        </div>
      )}
    </div>
  );
}