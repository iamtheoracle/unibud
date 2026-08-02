import React from "react";
import { Link } from "react-router-dom";
import { Activity as ActivityIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

const SOCIAL_TYPES = ["comment", "mention", "reply", "message", "social"];

export default function ActivityCard() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["card-activity"],
    queryFn: () => base44.entities.Notification.list("-created_date", 10),
    staleTime: 30000,
  });

  if (isLoading) return <ListSkeleton rows={3} />;

  const activity = (notifications || []).filter((n) =>
    SOCIAL_TYPES.includes(n.type) || SOCIAL_TYPES.includes(n.category)
  );

  if (activity.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2">
        <ActivityIcon className="w-4 h-4 text-muted-foreground" />
        <p className="text-[12px] text-muted-foreground">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activity.slice(0, 4).map((n) => (
        <Link key={n.id} to="/notifications" className="flex items-start gap-2.5 spring-tap">
          <ActivityIcon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-foreground truncate">{n.title}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-1">{n.message}</p>
          </div>
          {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
        </Link>
      ))}
      <Link to="/notifications" className="block text-[12px] font-medium text-primary pt-1">
        All activity →
      </Link>
    </div>
  );
}