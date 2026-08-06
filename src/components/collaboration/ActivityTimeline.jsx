import React from "react";
import { Activity, MessageSquare, UserPlus, Check, AlertTriangle, FileText, History, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ACTION_ICON = {
  created: FileText, updated: Activity, completed: Check, blocked: AlertTriangle,
  commented: MessageSquare, mentioned: Sparkles, approved: Check, joined: UserPlus, left: UserPlus, assigned: UserPlus, version_restored: History,
};

export default function ActivityTimeline({ activity }) {
  if (!activity?.length) {
    return <p className="text-center text-sm text-muted-foreground py-10">No activity yet.</p>;
  }
  return (
    <div className="space-y-1">
      {activity.slice(0, 50).map((a, i) => {
        const Icon = ACTION_ICON[a.action] || Activity;
        return (
          <div key={a.id || i} className="flex gap-3 p-2 rounded-xl hover:bg-muted/30">
            <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground shrink-0">
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground">
                <span className="font-semibold">{a.actor_name}</span>{" "}
                <span className="text-muted-foreground">{a.action.replace("_", " ")}</span>{" "}
                {a.target_title && <span className="font-medium">{a.target_title}</span>}
              </p>
              {a.summary && a.summary !== `${a.action} "${a.target_title}"` && (
                <p className="text-[11px] text-muted-foreground truncate">{a.summary}</p>
              )}
              <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                {formatDistanceToNow(new Date(a.created_date), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}