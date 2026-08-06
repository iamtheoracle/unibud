import React from "react";
import { Megaphone, Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * OfficialPinnedBar — surfaces the most recent official announcement or
 * university event at the top of the Quad feed. Only pulls from real
 * admin/lecturer/club posts — never seed or simulated content.
 */
export default function OfficialPinnedBar({ university }) {
  const { data: official } = useQuery({
    queryKey: ["quadOfficialPinned", university],
    queryFn: async () => {
      const filter = {
        is_seed_content: { $ne: true },
        author_role: { $in: ["admin", "lecturer", "club"] },
        ...(university ? { university } : {}),
      };
      const items = await base44.entities.QuadPost.filter(filter, "-created_date", 1);
      return items?.[0] || null;
    },
    staleTime: 30000,
  });

  if (!official) return null;

  const isEvent = official.type === "event" || official.event_data;
  const Icon = isEvent ? Calendar : Megaphone;

  return (
    <Link
      to={`/quad`}
      className="block mb-3 mx-4"
    >
      <div className="flex items-center gap-3 p-3.5 rounded-[18px] glass-card border border-primary/20 spring-tap">
        <div className="w-9 h-9 rounded-[12px] bg-primary/12 flex items-center justify-center shrink-0">
          <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-0.5">
            {isEvent ? "Official Event" : "Official Announcement"}
          </p>
          <p className="text-[13px] font-semibold text-foreground truncate">
            {official.content?.slice(0, 100) || "Tap to view"}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">
            {official.author_name}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}