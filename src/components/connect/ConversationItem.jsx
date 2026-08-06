import React from "react";

const GRADIENTS = {
  purple: "linear-gradient(135deg, #7c3aed, #a78bfa)",
  pink: "linear-gradient(135deg, #ec4899, #f472b6)",
  green: "linear-gradient(135deg, #10b981, #34d399)",
  blue: "linear-gradient(135deg, #3b82f6, #60a5fa)",
  violet: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
  amber: "linear-gradient(135deg, #f59e0b, #fcd34d)",
};

/**
 * ConversationItem — single conversation row: gradient avatar (optional
 * online dot), name + badge, last message, time, and unread pill.
 */
export default function ConversationItem({ initial, gradient = "purple", name, badge, lastMessage, time, unread, online, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0 w-full text-left spring-tap">
      <div
        className="relative w-11 h-11 rounded-full flex-shrink-0 grid place-items-center font-semibold text-[15px] text-white"
        style={{ background: GRADIENTS[gradient] || GRADIENTS.purple }}
      >
        {initial}
        {online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success ring-2 ring-background" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-foreground truncate">{name}</span>
          {badge && <span className="text-[10px] text-primary flex-shrink-0">{badge}</span>}
        </div>
        <p className="text-[13px] text-muted-foreground truncate">{lastMessage}</p>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <span className="text-[11px] text-muted-foreground/60">{time}</span>
        {unread ? (
          <span
            className="block mt-1 ml-auto w-fit px-2 py-0.5 rounded-full text-[10px] font-bold text-primary-foreground"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
          >
            {unread}
          </span>
        ) : null}
      </div>
    </button>
  );
}