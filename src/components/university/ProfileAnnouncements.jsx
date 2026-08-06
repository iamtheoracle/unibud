import React from "react";
import { motion } from "framer-motion";
import { Megaphone, Pin, ExternalLink, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ANNOUNCEMENT_PRIORITY_META, AUDIENCE_META, formatDateTime } from "@/components/university/universityConstants";
import EmptyState from "@/components/ui/EmptyState";

const EASE = [0.16, 1, 0.3, 1];

export default function ProfileAnnouncements({ institutionId, search }) {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["uni-announcements", institutionId],
    queryFn: () => base44.entities.StaffAnnouncement.filter({ institution_id: institutionId, status: "published" }, "-created_date", 50),
    staleTime: 60000,
  });

  const filtered = (announcements || []).filter((a) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (a.title || "").toLowerCase().includes(q) || (a.message || "").toLowerCase().includes(q);
  });

  // Sort: pinned first, then by created_date
  const sorted = [...filtered].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-[100px] rounded-[18px] shimmer" />)}</div>;
  }

  if (sorted.length === 0) {
    return (
      <div className="crystal-card">
        <EmptyState
          icon={Megaphone}
          title={search ? "No results" : "No announcements"}
          description={search ? "Try a different search term." : "Official announcements from your institution will appear here."}
          budGuidance="Check back later — your university publishes important updates here."
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {sorted.map((a, i) => {
        const priMeta = ANNOUNCEMENT_PRIORITY_META[a.priority] || ANNOUNCEMENT_PRIORITY_META.normal;
        return (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }}
            className="crystal-card p-3.5"
          >
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              {a.pinned && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-[8px] font-bold text-primary">
                  <Pin className="w-2.5 h-2.5" /> Pinned
                </span>
              )}
              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${priMeta.bg} ${priMeta.color}`}>{priMeta.label}</span>
              <span className="px-1.5 py-0.5 rounded-full bg-muted/30 text-[8px] font-medium text-muted-foreground">
                {AUDIENCE_META[a.audience] || a.audience}{a.target_name ? ` · ${a.target_name}` : ""}
              </span>
            </div>
            <h3 className="font-heading font-bold text-[14px] text-foreground leading-snug">{a.title}</h3>
            <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed line-clamp-3">{a.message}</p>
            <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-border/30">
              <div className="flex items-center gap-2">
                {a.author_name && <span className="text-[10px] text-muted-foreground font-medium">{a.author_name}</span>}
                <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                  <Clock className="w-2.5 h-2.5" /> {formatDateTime(a.created_date)}
                </span>
              </div>
              {a.link_url && (
                <a href={a.link_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-[10px] text-primary spring-tap font-medium">
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}