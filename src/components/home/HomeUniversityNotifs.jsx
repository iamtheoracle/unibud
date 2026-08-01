import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Megaphone, ChevronRight, Pin } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];

const PRIORITY_TONE = {
  urgent: "bg-destructive/15 text-destructive",
  high: "bg-warning/15 text-warning",
  low: "bg-muted/60 text-muted-foreground",
};

export default function HomeUniversityNotifs() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["homeStaffAnnouncements"],
    queryFn: () => base44.entities.StaffAnnouncement.list("-created_date", 8),
  });

  const items = (data || [])
    .filter((a) => a.status === "published")
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
    .slice(0, 3);

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">Announcements</h2>
        <button onClick={() => navigate("/communication")} className="text-[12px] font-medium text-foreground/60 flex items-center spring-tap hover:text-foreground transition-colors">
          All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-0">{[0, 1].map((i) => <div key={i} className="h-[48px] rounded-lg shimmer" />)}</div>
      ) : items.length === 0 ? (
        <div className="py-4">
          <p className="text-[14px] text-muted-foreground">No announcements right now.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/25">
          {items.map((a) => (
            <div key={a.id} className="flex items-start gap-3 py-3.5">
              {a.pinned ? <Pin className="w-3.5 h-3.5 text-foreground/50 shrink-0 mt-1" strokeWidth={1.8} /> : <Megaphone className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 mt-1" strokeWidth={1.8} />}
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-medium text-foreground">{a.title}</p>
                {a.message ? <p className="text-[13px] text-muted-foreground line-clamp-2 mt-1 leading-snug">{a.message}</p> : null}
                {a.author_name ? <p className="text-[11px] text-muted-foreground/60 mt-1.5">{a.author_name}</p> : null}
              </div>
              {a.priority && a.priority !== "normal" && (
                <span className="text-[10px] font-medium text-muted-foreground/60 shrink-0 mt-1 capitalize">{a.priority}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}