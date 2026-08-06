import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pin, Archive, CheckCheck, MoreHorizontal } from "lucide-react";
import { CATEGORY_META, PRIORITY_DOT } from "./icons";

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

/** Derive inline action buttons from the notification's category and fields. */
function getActions(item) {
  const actions = [];
  if (!item.link) return actions;
  switch (item.category) {
    case "social":
    case "community":
    case "message":
      actions.push({ label: "Reply", primary: true });
      break;
    case "assignment":
    case "task":
      actions.push({ label: "View", primary: true });
      actions.push({ label: "Done", primary: false });
      break;
    case "exam":
      actions.push({ label: "View", primary: true });
      break;
    case "event":
    case "campus":
      actions.push({ label: "Details", primary: true });
      actions.push({ label: "RSVP", primary: false });
      break;
    case "opportunity":
    case "career":
      actions.push({ label: "Apply", primary: true });
      break;
    case "marketplace":
      actions.push({ label: "View", primary: true });
      break;
    case "wallet":
      actions.push({ label: "View", primary: true });
      break;
    case "bud":
      actions.push({ label: "Listen", primary: true });
      break;
    case "achievement":
    case "streak":
      actions.push({ label: "View", primary: true });
      break;
    default:
      actions.push({ label: "Open", primary: true });
  }
  return actions;
}

/**
 * NotificationTimeline — premium glass notification card with priority indicator,
 * category icon, inline action buttons, and pin/read/archive menu.
 */
export default function NotificationTimeline({ item, onMarkRead, onTogglePin, onArchive }) {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  const cat = item.category || "system";
  const meta = CATEGORY_META[cat] || CATEGORY_META.system;
  const Icon = meta.icon;
  const dotColor = PRIORITY_DOT[item.priority] || "bg-primary";
  const unread = !item.is_read;
  const mergedCount = item._mergedCount || item.batch_count || 1;
  const isPriority = item.priority === "high" || item.priority === "critical";
  const actions = getActions(item);

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

  const handleAction = (e, isPrimary) => {
    e.stopPropagation();
    onMarkRead?.(item);
    if (item.link) navigate(item.link);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-[18px] p-3 glass-card spring-tap ${unread ? "border-l-[3px] border-l-primary" : ""} ${item.priority === "critical" ? "ring-1 ring-destructive/20" : ""}`}
    >
      <div className="flex items-start gap-2.5">
        {/* Icon */}
        <button onClick={open} className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 ${meta.tint}`}>
          <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
        </button>

        {/* Content */}
        <button onClick={open} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            {unread && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />}
            <p className={`font-semibold text-[12.5px] leading-tight truncate ${unread ? "text-foreground" : "text-muted-foreground"}`}>
              {item.title}
            </p>
            {item.priority === "critical" && (
              <span className="text-[8px] font-bold uppercase tracking-wide text-destructive px-1 py-0.5 rounded bg-destructive/10">Critical</span>
            )}
            {isPriority && item.priority !== "critical" && (
              <span className="text-[8px] font-bold uppercase tracking-wide text-warning px-1 py-0.5 rounded bg-warning/10">High</span>
            )}
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
            {mergedCount > 1 ? `${mergedCount} updates — ` : ""}{item.message}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[9px] text-muted-foreground/70">{meta.label}</span>
            <span className="text-[9px] text-muted-foreground/40">·</span>
            <span className="text-[9px] text-muted-foreground/70">{timeAgo(item.created_date)}</span>
          </div>
        </button>

        {/* Menu */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="relative" ref={ref}>
            <button onClick={(e) => { e.stopPropagation(); setMenu((m) => !m); }} className="w-6 h-6 rounded-full grid place-items-center text-muted-foreground hover:bg-muted/40 transition-colors" aria-label="More">
              <MoreHorizontal className="w-3.5 h-3.5" strokeWidth={1.8} />
            </button>
            {menu && (
              <div className="absolute right-0 top-7 z-30 w-36 rounded-xl bg-popover border border-border p-1 flex flex-col gap-0.5 premium-shadow">
                <button onClick={(e) => { e.stopPropagation(); onTogglePin?.(item); setMenu(false); }} className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-foreground hover:bg-muted/60 text-left transition-colors">
                  <Pin className="w-3.5 h-3.5" strokeWidth={1.8} /> {item.pinned ? "Unpin" : "Pin"}
                </button>
                {!item.is_read && (
                  <button onClick={(e) => { e.stopPropagation(); onMarkRead?.(item); setMenu(false); }} className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-foreground hover:bg-muted/60 text-left transition-colors">
                    <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.8} /> Mark read
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onArchive?.(item); setMenu(false); }} className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] text-foreground hover:bg-muted/60 text-left transition-colors">
                  <Archive className="w-3.5 h-3.5" strokeWidth={1.8} /> Archive
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {actions.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2.5 pl-12">
          {actions.map((action) => (
            <button
              key={action.label}
              onClick={(e) => handleAction(e, action.primary)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold spring-tap transition-all ${
                action.primary
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}