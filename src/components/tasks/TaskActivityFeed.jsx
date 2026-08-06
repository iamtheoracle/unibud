import React from "react";
import {
  CheckCircle2, MessageSquare, UserPlus, FileUp, Flag, Eye, ThumbsDown, Loader, Clock, Archive, Check,
} from "lucide-react";

const ICONS = {
  created: CheckCircle2, assigned: UserPlus, reassigned: UserPlus, accepted: Check, status_changed: Loader,
  checklist_completed: CheckCircle2, checklist_added: CheckCircle2, milestone_reached: Flag, file_uploaded: FileUp,
  commented: MessageSquare, review_requested: Eye, approved: CheckCircle2, rejected: ThumbsDown, completed: CheckCircle2, archived: Archive,
};

export default function TaskActivityFeed({ activity }) {
  const items = activity || [];
  return (
    <div className="crystal-card p-4">
      <h3 className="text-[13px] font-heading font-semibold mb-3">Activity</h3>
      <div className="space-y-3">
        {items.map((a) => {
          const Icon = ICONS[a.action] || Clock;
          return (
            <div key={a.id} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-muted/50 grid place-items-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px]"><span className="font-semibold">{a.actor_name}</span> {a.detail}</p>
                <span className="text-[10px] text-muted-foreground">{new Date(a.created_date).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</span>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="text-[12px] text-muted-foreground">No activity yet.</p>}
      </div>
    </div>
  );
}