import React from "react";
import { Pin, PinOff, Archive, Trash2, Paperclip, ExternalLink, Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/**
 * AnnouncementListItem — one announcement row for the admin communications list.
 * Shows status, priority, audience, attachments, link, read count, and actions.
 */
const STATUS = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", cls: "bg-warning/15 text-warning" },
  published: { label: "Published", cls: "bg-success/15 text-success" },
  archived: { label: "Archived", cls: "bg-muted text-muted-foreground" },
};
const PRIORITY = {
  low: "text-muted-foreground",
  normal: "text-information",
  high: "text-warning",
  urgent: "text-destructive",
};

export default function AnnouncementListItem({ a, readCount, onTogglePin, onArchive, onDelete }) {
  const st = STATUS[a.status] || STATUS.published;
  return (
    <div className="glass-card radius-lg p-3.5 space-y-2">
      <div className="flex items-start gap-2">
        {a.pinned && <Pin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" fill="currentColor" />}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[14px] leading-snug truncate">{a.title}</p>
          {a.message && <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2">{a.message}</p>}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${st.cls}`}>{st.label}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="capitalize">{a.audience?.replace(/_/g, " ")}{a.target_name ? ` · ${a.target_name}` : ""}</span>
        <span className={PRIORITY[a.priority] || PRIORITY.normal}>{a.priority}</span>
        {a.attachments?.length > 0 && <span className="flex items-center gap-1"><Paperclip className="w-3 h-3" />{a.attachments.length}</span>}
        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{readCount ?? 0} read</span>
        {a.publish_date && a.status === "scheduled" && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(a.publish_date), { addSuffix: true })}</span>}
        {a.author_name && <span>· {a.author_name}</span>}
        <span>· {formatDistanceToNow(new Date(a.created_date), { addSuffix: true })}</span>
      </div>

      {(a.link_url || a.attachments?.length) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {a.link_url && <a href={a.link_url} target="_blank" rel="noreferrer" className="text-[11px] flex items-center gap-1 text-primary hover:underline"><ExternalLink className="w-3 h-3" />Open link</a>}
          {a.attachments?.map((att, i) => (
            <a key={i} href={att.url} target="_blank" rel="noreferrer" className="text-[11px] flex items-center gap-1 text-muted-foreground hover:text-foreground"><Paperclip className="w-3 h-3" />{att.name}</a>
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 pt-1 border-t border-border/40">
        <Action icon={a.pinned ? PinOff : Pin} label={a.pinned ? "Unpin" : "Pin"} onClick={() => onTogglePin(a)} />
        {a.status !== "archived" && <Action icon={Archive} label="Archive" onClick={() => onArchive(a)} />}
        <Action icon={Trash2} label="Delete" danger onClick={() => onDelete(a)} />
      </div>
    </div>
  );
}

const Action = ({ icon: Icon, label, onClick, danger }) => (
  <button onClick={onClick} className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-full hover:bg-muted/60 spring-tap ${danger ? "text-destructive" : "text-muted-foreground"}`}>
    <Icon className="w-3 h-3" />{label}
  </button>
);