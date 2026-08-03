import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  MessageSquare, Clock, Award, Users, Calendar, FileText, Flame,
} from "lucide-react";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en", { month: "short", day: "numeric" });
}

export default function ActivitySection({ user, isOwnProfile }) {
  const navigate = useNavigate();

  const { data: posts = [] } = useQuery({
    queryKey: ["me", "activity-posts"],
    queryFn: () => base44.entities.QuadPost.filter({ created_by_id: user?.id }, "-created_date", 20),
    enabled: !!user?.id,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["me", "activity-sessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 20),
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["me", "activity-achievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-date_earned", 10),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ["me", "activity-groups"],
    queryFn: () => base44.entities.StudyGroup.list("-created_date", 10),
  });

  const timeline = useMemo(() => {
    const items = [];
    (posts || []).forEach((p) => items.push({
      id: p.id, type: "post", icon: MessageSquare, title: p.content?.slice(0, 80) || "Posted", date: p.created_date, path: "/square",
    }));
    (sessions || []).forEach((s) => items.push({
      id: s.id, type: "study", icon: Clock, title: `Studied ${s.duration_minutes || 0}m`, date: s.session_date || s.created_date, path: "/study-sessions",
    }));
    (achievements || []).forEach((a) => items.push({
      id: a.id, type: "achievement", icon: Award, title: `Earned: ${a.title}`, date: a.date_earned || a.created_date, path: "/achievements/gallery",
    }));
    (groups || []).forEach((g) => items.push({
      id: g.id, type: "group", icon: Users, title: `Joined: ${g.name || "Study Group"}`, date: g.created_date, path: "/study-groups",
    }));
    return items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 30);
  }, [posts, sessions, achievements, groups]);

  if (timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <div className="w-14 h-14 rounded-[18px] bg-muted flex items-center justify-center">
          <Flame className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} />
        </div>
        <p className="text-[13px] text-muted-foreground">No recent activity</p>
        <p className="text-[11px] text-muted-foreground/70">Your activity will appear here as you use UNIBUD</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[13px] font-bold text-foreground tracking-tight mb-1 px-1">Recent Activity</h3>
      {timeline.map((item) => (
        <button
          key={`${item.type}-${item.id}`}
          onClick={() => navigate(item.path)}
          className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
        >
          <div className="w-9 h-9 rounded-[13px] bg-chocolate/10 flex items-center justify-center flex-shrink-0">
            <item.icon className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-foreground truncate">{item.title}</p>
            <p className="text-[10px] text-muted-foreground">{timeAgo(item.date)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}