import React from "react";
import { Megaphone, CalendarDays, Radio } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * PortalActivityFeed — realtime institutional activity stream.
 * Renders announcements + events (create events) merged newest-first.
 */
const KIND = {
  announcement: { icon: Megaphone, tint: "text-primary bg-primary/10" },
  event: { icon: CalendarDays, tint: "text-information bg-information/10" },
};

export default function PortalActivityFeed({ activity, loading }) {
  if (loading && activity.length === 0) {
    return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 rounded-xl shimmer" />)}</div>;
  }
  if (activity.length === 0) {
    return <p className="text-[13px] text-muted-foreground">No recent activity. Publish an announcement or schedule an event to see it here in real time.</p>;
  }
  return (
    <div className="space-y-2">
      {activity.map((a) => {
        const meta = KIND[a.kind] || KIND.announcement;
        const Icon = meta.icon;
        return (
          <div key={a.id} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.tint}`}>
              <Icon className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold truncate">{a.title || "Untitled"}</p>
              <p className="text-[11px] text-muted-foreground capitalize truncate">{(a.sub || "").replace(/_/g, " ")}{a.priority ? ` · ${a.priority}` : ""}{a.status ? ` · ${a.status}` : ""}</p>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5" />{a.at ? formatDistanceToNow(new Date(a.at), { addSuffix: true }) : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}