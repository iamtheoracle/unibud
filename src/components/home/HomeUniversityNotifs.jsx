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
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">University Notifications</h2>
        </div>
        <button onClick={() => navigate("/communication")} className="text-[11px] font-semibold text-primary flex items-center spring-tap">
          All <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[0, 1].map((i) => <div key={i} className="h-14 rounded-xl shimmer" />)}</div>
      ) : items.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-muted-foreground">No announcements right now.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((a) => (
            <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/30">
              {a.pinned ? <Pin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" /> : <Megaphone className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground">{a.title}</p>
                {a.message ? <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{a.message}</p> : null}
                {a.author_name ? <p className="text-[10px] text-muted-foreground/70 mt-1">{a.author_name}</p> : null}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${PRIORITY_TONE[a.priority] || "bg-primary/15 text-primary"}`}>
                {a.priority || "normal"}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}