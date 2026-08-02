import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import HubEmptyState from "@/components/hubs/HubEmptyState";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Extracts common display fields from any entity item, so the feed can
 * render different entity types (QuadPost, FootballNews, Course, etc.)
 * without hub-specific rendering code.
 */
function getItemData(item, entityName) {
  if (entityName === "FootballMatch") {
    return {
      id: item.id,
      title: `${item.home_team || "?"} vs ${item.away_team || "?"}`,
      image: null,
      subtitle: item.competition || "",
      meta: item.status === "live" ? "● LIVE" : item.status || "",
    };
  }

  const title = item.title || item.content || item.name || item.course_name || "Untitled";
  const image =
    item.image_url || item.cover_url || item.banner_url ||
    (Array.isArray(item.media_urls) ? item.media_urls[0] : null);
  const subtitle = item.summary || item.description || item.author_name || "";
  const meta =
    item.author_name || item.source || item.course_code || item.category ||
    item.company || item.host || (item.price != null ? `₦${item.price}` : "") ||
    item.date || "";

  return {
    id: item.id,
    title: String(title).substring(0, 120),
    image,
    subtitle: typeof subtitle === "string" ? subtitle.substring(0, 140) : "",
    meta: typeof meta === "string" ? meta : "",
  };
}

function HubGridItem({ item, hub, index }) {
  const Icon = hub.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: EASE }}
      className="rounded-[16px] overflow-hidden glass-card spring-tap"
    >
      {item.image ? (
        <div className="aspect-square">
          <Image src={item.image} fittingType="fill" className="w-full h-full" />
        </div>
      ) : (
        <div className="aspect-square grid place-items-center" style={{ background: `hsl(${hub.color} / 0.08)` }}>
          <Icon className="w-8 h-8" style={{ color: `hsl(${hub.color} / 0.4)` }} strokeWidth={1.5} />
        </div>
      )}
      <div className="p-2.5">
        <p className="text-[12px] font-semibold text-foreground line-clamp-2 leading-tight">{item.title}</p>
        {item.meta && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{item.meta}</p>}
      </div>
    </motion.div>
  );
}

function HubListItem({ item, hub, index }) {
  const Icon = hub.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: EASE }}
      className="flex items-center gap-3 p-3 rounded-[16px] glass-card spring-tap"
    >
      <div className="w-12 h-12 rounded-[12px] overflow-hidden shrink-0" style={{ background: `hsl(${hub.color} / 0.08)` }}>
        {item.image ? (
          <Image src={item.image} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="w-full h-full grid place-items-center">
            <Icon className="w-5 h-5" style={{ color: `hsl(${hub.color} / 0.5)` }} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground line-clamp-1">{item.title}</p>
        {item.subtitle && <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.subtitle}</p>}
        {item.meta && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{item.meta}</p>}
      </div>
    </motion.div>
  );
}

/**
 * HubFeed — queries the hub's configured entity and renders results in a
 * grid (visual hubs) or list (text hubs) layout. Shows Bud empty states
 * when no content exists yet.
 */
export default function HubFeed({ hub }) {
  const { data, isLoading } = useQuery({
    queryKey: ["hub-feed", hub.id],
    queryFn: async () => {
      const entity = base44.entities[hub.entity];
      if (!entity) return [];
      return await entity.filter(hub.entityFilter || {}, "-created_date", 20);
    },
  });

  const items = data || [];
  const Icon = hub.icon;

  // Loading state
  if (isLoading) {
    if (hub.feedType === "grid") {
      return (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[16px] overflow-hidden glass-card">
              <div className="aspect-square shimmer" />
              <div className="p-2.5">
                <div className="h-3 w-3/4 shimmer rounded-full" />
                <div className="h-2 w-1/2 shimmer rounded-full mt-1.5" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-[16px] glass-card">
            <div className="w-12 h-12 rounded-[12px] shimmer" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-2/3 shimmer rounded-full" />
              <div className="h-2 w-1/3 shimmer rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state — beautiful, encourages first conversation. Never fake data.
  if (items.length === 0) {
    return <HubEmptyState hub={hub} />;
  }

  const processed = items.map((item) => getItemData(item, hub.entity));

  // Grid layout — visual content
  if (hub.feedType === "grid") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {processed.map((item, i) => (
          <HubGridItem key={item.id} item={item} hub={hub} index={i} />
        ))}
      </div>
    );
  }

  // List layout — text content
  return (
    <div className="space-y-2.5">
      {processed.map((item, i) => (
        <HubListItem key={item.id} item={item} hub={hub} index={i} />
      ))}
    </div>
  );
}