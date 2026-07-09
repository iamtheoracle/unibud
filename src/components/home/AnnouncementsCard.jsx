import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import { Megaphone } from "lucide-react";

const announcements = [
  { title: "Mid-Semester Exams Begin July 21st", source: "Academic Office", time: "2h ago", type: "academic" },
  { title: "New Scholarship: Merit Awards 2026", source: "Financial Aid", time: "5h ago", type: "opportunity" },
  { title: "Campus Wi-Fi Upgrade Complete", source: "ICT Department", time: "1d ago", type: "system" },
];

const typeColors = {
  academic: "bg-info/10 text-info",
  opportunity: "bg-success/10 text-success",
  system: "bg-purple/10 text-purple",
};

export default function AnnouncementsCard() {
  return (
    <div>
      <SectionHeader title="Announcements" icon={Megaphone} action="All" actionLink="/notifications" />
      <div className="space-y-2">
        {announcements.map((a, i) => (
          <GlassCard key={i} variant="solid" className="p-3" delay={0.3 + i * 0.04}>
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColors[a.type]}`}>
                <Megaphone className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-heading font-semibold text-[12px] leading-snug">{a.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{a.source}</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">{a.time}</span>
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}