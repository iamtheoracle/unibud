import React from "react";
import { CheckSquare, StickyNote, FileText, PenLine, ListChecks, ClipboardList, Link as LinkIcon, AlertTriangle, Clock, Check, User } from "lucide-react";

const TYPE_ICON = { task: CheckSquare, note: StickyNote, document: FileText, whiteboard: PenLine, checklist: ListChecks, study_plan: ClipboardList, file: LinkIcon };
const STATUS_STYLE = {
  open: "bg-muted/50 text-muted-foreground", in_progress: "bg-information/15 text-information",
  blocked: "bg-error/15 text-error", needs_review: "bg-warning/15 text-warning",
  approved: "bg-success/15 text-success", done: "bg-success/15 text-success",
};

export default function ItemCard({ item, onOpen }) {
  const Icon = TYPE_ICON[item.type] || CheckSquare;
  const checklistDone = item.type === "checklist" ? (item.blocks || []).filter((b) => b.done).length : 0;
  const checklistTotal = item.type === "checklist" ? (item.blocks || []).length : 0;
  const overdue = item.due_date && item.due_date < new Date().toISOString().slice(0, 10) && item.status !== "done" && item.status !== "approved";

  return (
    <button onClick={() => onOpen(item)} className="w-full text-left glass-card p-3.5 card-hover">
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent/12 flex items-center justify-center text-accent shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
          {item.content && item.type !== "whiteboard" && (
            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{item.content.replace(/[#*`>]/g, "")}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_STYLE[item.status] || ""}`}>{item.status.replace("_", " ")}</span>
            {item.priority === "urgent" && <span className="text-[10px] font-semibold text-error flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" /> urgent</span>}
            {overdue && <span className="text-[10px] font-semibold text-error flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> overdue</span>}
            {item.assignee_name && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><User className="w-2.5 h-2.5" /> {item.assignee_name.split(" ")[0]}</span>}
            {checklistTotal > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> {checklistDone}/{checklistTotal}</span>}
          </div>
        </div>
      </div>
    </button>
  );
}