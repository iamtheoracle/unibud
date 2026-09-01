import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Newspaper, ExternalLink, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Updates — real ExternalContent records (verified news/announcements).
// Read opens the source; Ask Bud opens Bud with context.
export default function DiscoveryUpdates() {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["discoveryUpdates"],
    queryFn: () => base44.entities.ExternalContent.filter({ is_active: true }, "-published_at", 10),
  });

  const updates = data || [];
  if (updates.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-5">
        <Newspaper className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[15px] text-foreground">Updates</h2>
      </div>
      <div className="px-4 space-y-2.5">
        {updates.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl bg-card border border-border/30 p-3.5"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold uppercase tracking-wide">
                {u.source_label || u.category || "Update"}
              </span>
              {u.source_name && <span className="text-[10px] text-muted-foreground">{u.source_name}</span>}
            </div>
            <p className="font-heading font-semibold text-[13px] text-foreground leading-snug">{u.title}</p>
            {u.summary && <p className="text-[11px] text-muted-foreground leading-relaxed mt-1 line-clamp-3">{u.summary}</p>}
            <div className="flex items-center gap-2 mt-2.5">
              {u.source_url && (
                <a
                  href={u.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 h-7 rounded-full bg-card border border-border/40 text-[11px] font-semibold text-foreground spring-tap"
                >
                  <ExternalLink className="w-3 h-3" /> Read
                </a>
              )}
              <button
                onClick={() => navigate("/bud")}
                className="inline-flex items-center gap-1 px-3 h-7 rounded-full bg-foreground text-background text-[11px] font-semibold spring-tap"
              >
                <Sparkles className="w-3 h-3" /> Ask Bud
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}