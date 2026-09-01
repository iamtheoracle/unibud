import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Megaphone, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_ANNOUNCEMENTS = [
  { id: "d1", title: "Mid-Semester Exams Begin July 21st", message: "Check your exam timetable", author_name: "Academic Office", created_date: new Date(Date.now() - 2 * 3600000).toISOString(), priority: "high" },
  { id: "d2", title: "New Scholarship: Merit Awards 2026", message: "Applications now open", author_name: "Financial Aid", created_date: new Date(Date.now() - 5 * 3600000).toISOString(), priority: "normal" },
  { id: "d3", title: "Campus Wi-Fi Upgrade Complete", message: "Faster speeds across all buildings", author_name: "ICT Department", created_date: new Date(Date.now() - 24 * 3600000).toISOString(), priority: "low" },
];

const typeColors = {
  high: "bg-destructive/10 text-destructive",
  urgent: "bg-destructive/10 text-destructive",
  normal: "bg-info/10 text-info",
  low: "bg-muted text-muted-foreground",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  return Math.floor(diff / 86400000) + "d ago";
}

export default function AnnouncementsCard() {
  const { isDemoMode } = useDemoMode();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["homeAnnouncements"],
    queryFn: () => base44.entities.StaffAnnouncement.filter({ status: "published" }, "-created_date", 5),
    enabled: !isDemoMode,
  });

  const items = isDemoMode ? DEMO_ANNOUNCEMENTS : (announcements || []);

  if (isLoading && !isDemoMode) {
    return (
      <div>
        <SectionHeader title="Announcements" icon={Megaphone} action="All" actionLink="/notifications" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-[60px] rounded-[20px] shimmer" />)}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div>
        <SectionHeader title="Announcements" icon={Megaphone} action="All" actionLink="/notifications" />
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
          <EmptyState icon={Inbox} title="No announcements yet" description="University and departmental announcements will appear here" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Announcements" icon={Megaphone} action="All" actionLink="/notifications" />
      <div className="space-y-2">
        {items.map((a, i) => (
          <GlassCard key={a.id || i} variant="solid" className="p-3" delay={0.3 + i * 0.04}>
            <div className="flex items-start gap-3">
              <div className={"w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 " + (typeColors[a.priority] || typeColors.normal)}>
                <Megaphone className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-[12px] leading-snug">{a.title}</p>
                {a.message && <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{a.message}</p>}
                <div className="flex items-center gap-2 mt-1">
                  {a.author_name && <span className="text-[10px] text-muted-foreground">{a.author_name}</span>}
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{timeAgo(a.created_date)}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}