import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Radio, Building2, MapPin, Users, Calendar, Bookmark } from "lucide-react";
import LiveStreamCard from "./LiveStreamCard";
import EmptyState from "@/components/ui/EmptyState";
import { EASE } from "@/lib/motion/motionPresets";

const SECTIONS = [
  { key: "live", label: "Live Now", icon: Radio, filter: { status: "live" }, empty: "No streams are live right now. Check upcoming events below." },
  { key: "trending", label: "Trending", icon: TrendingUp, filter: { status: "live" }, sort: "-viewer_count", empty: "Trending streams will appear here as they gain viewers." },
  { key: "upcoming", label: "Upcoming Events", icon: Calendar, filter: { status: "upcoming" }, sort: "scheduled_start", empty: "No upcoming events scheduled. Create one to get started." },
  { key: "replays", label: "Recent Replays", icon: Bookmark, filter: { status: "ended" }, sort: "-actual_end", empty: "Replays of past streams will appear here." },
];

/**
 * DiscoverLiveGrid — the Discover Live homepage with categorized sections.
 * Shows: Live Now, Trending, Upcoming Events, Recent Replays.
 * All sections use real data only — beautiful empty states when no content.
 *
 * Props:
 *  - user: current user (for institution scoping)
 *  - onJoinStream: (stream) => void
 *  - maxPerSection: number of items per section (default 6)
 */
export default function DiscoverLiveGrid({ user, onJoinStream, maxPerSection = 6 }) {
  return (
    <div className="space-y-8 pb-8">
      {SECTIONS.map((section) => (
        <DiscoverSection
          key={section.key}
          section={section}
          user={user}
          onJoinStream={onJoinStream}
          max={maxPerSection}
        />
      ))}
    </div>
  );
}

function DiscoverSection({ section, user, onJoinStream, max }) {
  const { data: streams = [], isLoading } = useQuery({
    queryKey: ["discover-live", section.key, user?.data?.institution_id],
    queryFn: async () => {
      const query = { ...section.filter };
      if (user?.data?.institution_id) query.institution_id = user.data.institution_id;
      const sort = section.sort || (section.key === "live" ? "-viewer_count" : "-created_date");
      return await base44.entities.LiveStream.filter(query, sort, max);
    },
    enabled: !!user,
  });

  const Icon = section.icon;

  return (
    <section>
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex items-center gap-2 px-4 mb-3"
      >
        <div className="w-8 h-8 rounded-full glass flex items-center justify-center">
          <Icon className="w-4 h-4 text-foreground" strokeWidth={2.2} />
        </div>
        <h2 className="font-heading font-bold text-[16px] text-foreground">{section.label}</h2>
        {section.key === "live" && streams.length > 0 && (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-destructive ml-1"
          />
        )}
        {streams.length > 0 && (
          <span className="text-[11px] text-muted-foreground ml-auto">{streams.length}</span>
        )}
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] crystal-card rounded-[18px] shimmer" />
          ))}
        </div>
      ) : streams.length === 0 ? (
        <div className="px-4">
          <div className="crystal-card rounded-[18px] py-8">
            <EmptyState
              icon={Icon}
              title="Nothing Here Yet"
              description={section.empty}
              className="py-6"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-4">
          {streams.map((stream, i) => (
            <LiveStreamCard
              key={stream.id}
              stream={stream}
              onJoin={onJoinStream}
              delay={i * 0.06}
            />
          ))}
        </div>
      )}
    </section>
  );
}