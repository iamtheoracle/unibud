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
 * NotificationCard — editorial divider-based notification row.
 * Category icon, bold title + message, meta, time, and a kebab menu
 * preserving pin / mark-read / archive actions.
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
    <div className="flex gap-3 items-start py-4 spring-tap group">
      <button onClick={open} className="w-9 h-9 rounded-full bg-muted/40 grid place-items-center text-[16px] flex-shrink-0 hover:bg-muted/60 transition-colors">
        {CAT_ICON[item.category] || "🔔"}
      </button>
      <button onClick={open} className="flex-1 text-left min-w-0">
        <p className="text-[14px] text-muted-foreground leading-snug">
          <span className="font-medium text-foreground">{item.title}</span>
          {item.message ? ` — ${item.message}` : ""}
        </p>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground/60">
          <span>{CAT_LABEL[item.category] || "System"}{isPriority ? " · High Priority" : ""}</span>
          {item.link && <span className="text-primary font-medium">View →</span>}
        </div>
      </button>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground/50">{timeAgo(item.created_date)}</span>
        <div className="relative" ref={ref}>
          <button onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }} className="w-7 h-7 rounded-full grid place-items-center text-muted-foreground hover:bg-muted/40 transition-colors" aria-label="More">
            <MoreHorizontal className="w-4 h-4" strokeWidth={1.8} />
          </button>
          {menu && (
            <div className="absolute right-0 top-8 z-30 w-36 rounded-xl bg-popover border border-border p-1 flex flex-col gap-0.5 premium-shadow">
              <button onClick={(e) => { e.stopPropagation(); onTogglePin?.(item); setMenu(false); }} className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/60 text-left transition-colors">
                <Pin className="w-3.5 h-3.5" strokeWidth={1.8} /> {item.pinned ? "Unpin" : "Pin"}
              </button>
              {!item.is_read && (
                <button onClick={(e) => { e.stopPropagation(); onMarkRead?.(item); setMenu(false); }} className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/60 text-left transition-colors">
                  <Check className="w-3.5 h-3.5" strokeWidth={1.8} /> Mark read
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onArchive?.(item); setMenu(false); }} className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] text-foreground hover:bg-muted/60 text-left transition-colors">
                <Archive className="w-3.5 h-3.5" strokeWidth={1.8} /> Archive
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}