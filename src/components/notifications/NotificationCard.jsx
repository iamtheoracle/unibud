import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Pin, Archive, Check } from "lucide-react";

const CAT_ICON = { assignment: "📝", exam: "📋", timetable: "📅", social: "❤️", campus: "📢", event: "🎉", opportunity: "🎓", bud: "✦", achievement: "🏆", streak: "🔥", community: "👥", career: "💼", system: "🔔", emergency: "🚨", study_group: "📚", message: "💬", reminder: "⏰", task: "✅", comment: "💭", mention: "@", reply: "↩️", library: "📚", transport: "🚌", marketplace: "🛒" };
const CAT_LABEL = { assignment: "Academic", exam: "Academic", timetable: "Academic", social: "Social", campus: "Campus", event: "Events", opportunity: "Academic", bud: "Bud", achievement: "Achievement", streak: "Achievement", community: "Messages", career: "Career", system: "System", emergency: "Campus", study_group: "Academic", message: "Messages", reminder: "Reminder", task: "Tasks", comment: "Social", mention: "Social", reply: "Messages", library: "Academic", transport: "Campus", marketplace: "Marketplace" };

function timeAgo(d) {
  if (!d) return "";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 6e4);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

/**
 * NotificationCard — prototype notification row: category icon, bold title +
 * message, meta with action link, relative time, and a kebab menu preserving
 * pin / mark-read / archive actions.
 */
export default function NotificationCard({ item, onMarkRead, onTogglePin, onArchive }) {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setMenu(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menu]);

  const open = () => {
    onMarkRead?.(item);
    setMenu(false);
    if (item.link) navigate(item.link);
  };

  const isPriority = item.priority === "high" || item.priority === "critical";

  return (
    <div className={`relative rounded-2xl p-3 px-3.5 border flex gap-3 items-start ${isPriority ? "bg-muted/40 border-border/40" : "bg-muted/20 border-border/20"}`}>
      <button onClick={open} className="w-9 h-9 rounded-full bg-muted/40 grid place-items-center text-[16px] flex-shrink-0 spring-tap">
        {CAT_ICON[item.category] || "🔔"}
      </button>
      <button onClick={open} className="flex-1 text-left min-w-0">
        <p className="text-[13px] text-muted-foreground leading-snug">
          <span className="font-semibold text-foreground">{item.title}</span>
          {item.message ? ` — ${item.message}` : ""}
        </p>
        <div className="flex gap-2.5 mt-1 text-[10px] text-muted-foreground/60">
          <span>{CAT_LABEL[item.category] || "System"}{isPriority ? " · High Priority" : ""}</span>
          {item.link && <span className="text-foreground font-medium">View →</span>}
        </div>
      </button>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground/50">{timeAgo(item.created_date)}</span>
        <div className="relative" ref={ref}>
          <button onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }} className="w-6 h-6 rounded-full grid place-items-center text-muted-foreground spring-tap" aria-label="More">
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {menu && (
            <div className="absolute right-0 top-7 z-30 w-36 rounded-xl glass-strong p-1 flex flex-col gap-0.5">
              <button onClick={(e) => { e.stopPropagation(); onTogglePin?.(item); setMenu(false); }} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-foreground hover:bg-muted/60 text-left">
                <Pin className="w-3 h-3" /> {item.pinned ? "Unpin" : "Pin"}
              </button>
              {!item.is_read && (
                <button onClick={(e) => { e.stopPropagation(); onMarkRead?.(item); setMenu(false); }} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-foreground hover:bg-muted/60 text-left">
                  <Check className="w-3 h-3" /> Mark read
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onArchive?.(item); setMenu(false); }} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] text-foreground hover:bg-muted/60 text-left">
                <Archive className="w-3 h-3" /> Archive
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}