import React from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, MessageCircle } from "lucide-react";
import {
  getIcon, LOST_FOUND_CATEGORIES, formatEventDate,
} from "./campusConstants";

export default function LostFoundCard({ item, index = 0, onContact }) {
  const catMeta = LOST_FOUND_CATEGORIES[item.category] || LOST_FOUND_CATEGORIES.other;
  const Icon = getIcon(catMeta.icon);
  const isLost = item.type === "lost";
  const accentColor = item.accent_color || (isLost ? "0 72% 51%" : "142 71% 45%");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden card-hover"
    >
      <div className="flex gap-3 p-3.5">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-16 h-16 rounded-[14px] object-cover flex-shrink-0"
          />
        ) : (
          <div
            className="w-16 h-16 rounded-[14px] flex items-center justify-center flex-shrink-0"
            style={{ background: `hsl(${accentColor} / 0.10)` }}
          >
            <Icon className="w-6 h-6" style={{ color: `hsl(${accentColor})` }} strokeWidth={2} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide"
              style={{
                background: `hsl(${accentColor} / 0.10)`,
                color: `hsl(${accentColor})`,
              }}
            >
              {isLost ? "Lost" : "Found"}
            </span>
            <span className="text-[10px] text-muted-foreground">{catMeta.label}</span>
            {item.status === "claimed" && (
              <span className="px-1.5 py-0.5 rounded-full bg-success/10 text-success text-[9px] font-bold ml-auto">Claimed</span>
            )}
          </div>

          <h3 className="font-heading font-semibold text-[13px] text-foreground truncate">{item.title}</h3>

          {item.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{item.description}</p>
          )}

          <div className="flex items-center gap-3 mt-1.5">
            {item.location && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="w-2.5 h-2.5" />
                <span className="truncate max-w-[80px]">{item.location}</span>
              </div>
            )}
            {item.date_lost_found && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-2.5 h-2.5" />
                <span>{formatEventDate(item.date_lost_found)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-3.5 pb-3.5 flex items-center justify-between border-t border-border/20 pt-2.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {item.reporter_image ? (
            <img src={item.reporter_image} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] font-bold text-muted-foreground">
                {(item.reporter_name || "U").charAt(0)}
              </span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground truncate">{item.reporter_name}</span>
        </div>
        {item.status === "active" && (
          <button
            onClick={() => onContact?.(item)}
            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold spring-tap flex items-center gap-1"
          >
            <MessageCircle className="w-3 h-3" /> Contact
          </button>
        )}
      </div>
    </motion.div>
  );
}