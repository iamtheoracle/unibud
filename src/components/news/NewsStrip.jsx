import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper } from "lucide-react";
import { NEWS_CATEGORIES, NEWS_ITEMS, categoryByKey } from "@/lib/mock/newsData";

const EASE = [0.16, 1, 0.3, 1];

function timeLabel(iso) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

/**
 * NewsStrip — a premium, horizontally-scrollable campus news rail backed by the
 * mock news dataset. Drop into any shared surface (Home, Quad, Discover). When a
 * real news API is connected, swap the import source — no UI change.
 */
export default function NewsStrip() {
  const [cat, setCat] = useState("all");
  const items = useMemo(
    () => (cat === "all" ? NEWS_ITEMS : NEWS_ITEMS.filter((n) => n.category === cat)),
    [cat]
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="mb-4"
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="w-6 h-6 rounded-full bg-primary/12 flex items-center justify-center">
          <Newspaper className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
        </span>
        <h2 className="text-[13px] font-bold text-foreground">Campus News</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {[{ key: "all", label: "Top" }, ...NEWS_CATEGORIES.slice(0, 8)].map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap ${
              cat === c.key ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-foreground/70"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {items.map((n, i) => {
          const c = categoryByKey(n.category);
          return (
            <motion.article
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.2), duration: 0.35, ease: EASE }}
              className="flex-shrink-0 w-[230px] rounded-[20px] overflow-hidden glass-card spring-tap"
            >
              {n.cover_url && (
                <div className="h-[110px] w-full bg-muted relative">
                  <img src={n.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  <span
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide backdrop-blur-md text-white"
                    style={{ background: `hsl(${c?.color || "221 83% 50%"} / 0.85)` }}
                  >
                    {c?.label || "News"}
                  </span>
                </div>
              )}
              <div className="p-3">
                <p className="text-[12.5px] font-bold text-foreground leading-snug line-clamp-2">{n.title}</p>
                <p className="text-[10.5px] text-muted-foreground mt-1 line-clamp-2">{n.summary}</p>
                <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground/80">
                  <span className="font-semibold truncate">{n.source}</span>
                  <span>·</span>
                  <span>{timeLabel(n.created_date)}</span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </motion.section>
  );
}