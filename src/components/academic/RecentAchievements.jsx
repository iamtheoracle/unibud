import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Trophy } from "lucide-react";
import { ICON_MAP } from "./AchievementBadge";

/**
 * RecentAchievements — shows the student's 3 most recent achievements
 * inside the Progress Card. Links to the full achievements page.
 */
export default function RecentAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.functions.invoke("checkAchievements", { action: "list" });
        const data = res?.data || res;
        setAchievements((data.achievements || []).slice(0, 3));
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className="h-3 w-3 rounded-full shimmer" />
        <div className="h-3 flex-1 rounded-full shimmer" />
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <Link to="/achievements" className="flex items-center gap-2 py-1 spring-tap">
        <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[12px] text-muted-foreground">No achievements yet — start studying to earn your first!</span>
      </Link>
    );
  }

  return (
    <div className="space-y-1.5">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Recent Achievements</span>
      {achievements.map((ach) => {
        const Icon = ICON_MAP[ach.icon] || Trophy;
        return (
          <Link key={ach.id} to="/achievements" className="flex items-center gap-2.5 spring-tap">
            <div
              className="w-7 h-7 rounded-lg grid place-items-center shrink-0"
              style={{
                background: "hsl(" + (ach.accent_color || "142 71% 45%") + " / 0.14)",
                color: "hsl(" + (ach.accent_color || "142 71% 45%") + ")",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-foreground truncate">{ach.title}</p>
              {ach.date_earned && (
                <p className="text-[10px] text-muted-foreground">
                  {new Date(ach.date_earned).toLocaleDateString("en", { month: "short", day: "numeric" })}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}