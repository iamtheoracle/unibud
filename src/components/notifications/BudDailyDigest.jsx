import React from "react";
import { Sparkles, BookOpen, Bell, Users, Megaphone, AlertTriangle } from "lucide-react";
import { useSmartNotifications } from "@/lib/notifications/useSmartNotifications";

/**
 * BudDailyDigest — Bud's calm daily briefing. Summarizes today's activity,
 * critical/high items, academic reminders and announcements in one place
 * without overwhelming the user.
 */
export default function BudDailyDigest() {
  const { digestSummary, quiet, digestCount } = useSmartNotifications();
  const d = digestSummary;

  return (
    <div className="rounded-[22px] p-4 glass-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 grid place-items-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-foreground">Your day with Bud</p>
          <p className="text-[10px] text-muted-foreground">
            {d.totalToday} updates today{quiet ? " · quiet hours on" : ""}{digestCount ? ` · ${digestCount} grouped` : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <Stat icon={AlertTriangle} label="Priority" value={d.critical + d.high} tone="destructive" />
        <Stat icon={BookOpen} label="Academic" value={d.academic} tone="primary" />
        <Stat icon={Bell} label="Reminders" value={d.reminders} tone="warning" />
        <Stat icon={Users} label="Social" value={d.social} tone="success" />
      </div>

      {d.top.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] font-bold uppercase text-muted-foreground/70">Needs your attention</p>
          {d.top.map((n) => (
            <div key={n.id} className="flex items-start gap-2 rounded-[12px] bg-muted/30 px-2.5 py-2">
              <Megaphone className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-foreground truncate">{n.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground/70 mt-3">Nothing urgent — you're all caught up. ✨</p>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  const tones = { primary: "text-primary", success: "text-success", warning: "text-warning", destructive: "text-destructive" };
  return (
    <div className="rounded-[12px] bg-muted/40 px-2 py-2 text-center">
      <Icon className={`w-3.5 h-3.5 mx-auto ${tones[tone] || "text-foreground"}`} />
      <p className={`text-[14px] font-bold mt-0.5 ${tones[tone] || "text-foreground"}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}