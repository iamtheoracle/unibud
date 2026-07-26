import React from "react";
import { Link } from "react-router-dom";
import { Users, CalendarDays, ChevronRight } from "lucide-react";
import { computeProgress } from "@/lib/collaboration/collabEngine";

const TYPE_LABEL = { study_group: "Study Group", project: "Project", research: "Research", club: "Club", community: "Community", department: "Department", course: "Course", leadership: "Leadership", personal: "Personal", team: "Team" };

export default function WorkspaceCard({ workspace }) {
  const progress = computeProgress(workspace._items || []);
  return (
    <Link to={`/collaboration/${workspace.id}`}
      className="glass-card p-4 card-hover block">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-wide">{TYPE_LABEL[workspace.type] || workspace.type}</p>
          <h3 className="text-[15px] font-bold text-foreground truncate mt-0.5">{workspace.title}</h3>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{workspace.status}</span>
      </div>
      {workspace.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{workspace.description}</p>}
      <div className="flex items-center justify-between mt-3">
        <div className="flex -space-x-1.5">
          {(workspace.members || []).slice(0, 4).map((m) => (
            <div key={m.user_id} className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary">
              {(m.name || "?").slice(0, 1).toUpperCase()}
            </div>
          ))}
          {(workspace.members || []).length > 4 && (
            <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-bold text-muted-foreground">
              +{workspace.members.length - 4}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {workspace.members?.length || 0}</span>
          {workspace.due_date && <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> {workspace.due_date}</span>}
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground">{progress}%</span>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    </Link>
  );
}