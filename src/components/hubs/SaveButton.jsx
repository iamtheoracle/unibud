import React from "react";
import { Bookmark } from "lucide-react";
import { useHighlights } from "@/hooks/useHighlights";

const HUB_CONTENT_TYPE = {
  movies_tv: "movie",
  music: "music",
  sports: "match",
  news_tech: "news_article",
  gaming: "other",
  creators: "other",
  careers: "internship",
  events: "event",
  discussions: "discussion",
  academics: "research_paper",
  marketplace: "other",
  challenge: "other",
};

/**
 * SaveButton — universal save/highlight button.
 * Can be placed on any content card (hub live items, feed items, etc.).
 * Prevents link navigation when clicked inside an <a> tag.
 */
export default function SaveButton({ item, hubId, color }) {
  const { isSaved, save, remove } = useHighlights();
  const saved = isSaved(item.title, item.url);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      remove(item.title, item.url);
    } else {
      save({
        content_type: HUB_CONTENT_TYPE[hubId] || "other",
        title: item.title,
        subtitle: item.subtitle || "",
        source_url: item.url || "",
        source_name: item.source || "",
        image_url: item.image || "",
        hub_id: hubId || "",
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-8 h-8 rounded-full grid place-items-center glass-strong spring-tap shrink-0"
      aria-label={saved ? "Remove from highlights" : "Save to highlights"}
    >
      <Bookmark
        className="w-4 h-4"
        fill={saved ? "currentColor" : "none"}
        strokeWidth={2}
        style={saved ? { color: color ? `hsl(${color})` : "hsl(var(--foreground))" } : {}}
      />
    </button>
  );
}