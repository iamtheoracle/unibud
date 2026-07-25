import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Pin, Archive, CheckCheck } from "lucide-react";
import { NOTIFICATION_ICONS, CATEGORY_META, PRIORITY_DOT } from "./icons";

export default function NotificationItem({ item, onAction }) {
  const navigate = useNavigate();
  const cat = item.category || "system";
  const meta = CATEGORY_META[cat] || CATEGORY_META.system;
  const Icon = NOTIFICATION_ICONS[item.icon] || meta.icon;
  const dotColor = PRIORITY_DOT[item.priority] || "bg-primary";
  const unread = !item.is_read;
  const mergedCount = item._mergedCount || item.batch_count || 1;
  const time = item.created_date
    ? new Date(item.created_date).toLocaleString("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "";

  const open = () => {
    if (item.link) navigate(item.link);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={`group relative rounded-[20px] p-3.5 glass ${unread ? "border-l-[3px] border-l-primary" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 ${meta.tint}`}>
          <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
        </div>

        <button onClick={open} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <p className={`font-heading font-semibold text-[12.5px] leading-tight ${unread ? "text-foreground" : "text-muted-foreground"}`}>
              {item.title}
            </p>
            {unread && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`} />}
            {item.priority === "critical" && (
              <span className="text-[9px] font-bold uppercase tracking-wide text-destructive">Critical</span>
            )}
          </div>
          <p className="text-[11.5px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">
            {mergedCount > 1 ? `${mergedCount} updates — ${item.title}` : item.message}
          </p>
          <p className="text-[10px] text-muted-foreground/70 mt-1.5">{time}</p>
        </button>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onAction("pin")} className="w-7 h-7 rounded-full hover:bg-muted/60 flex items-center justify-center spring-tap" aria-label="Pin">
            <Pin className={`w-3.5 h-3.5 ${item.pinned ? "fill-primary text-primary" : "text-muted-foreground"}`} />
          </button>
          <button onClick={() => onAction("read")} className="w-7 h-7 rounded-full hover:bg-muted/60 flex items-center justify-center spring-tap" aria-label="Mark read">
            <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => onAction("archive")} className="w-7 h-7 rounded-full hover:bg-muted/60 flex items-center justify-center spring-tap" aria-label="Archive">
            <Archive className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}