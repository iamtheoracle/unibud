import React from "react";
import { NOTIFICATION_FILTERS } from "./icons";

export default function NotificationFilterBar({ active, onChange, unreadCount }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
      {NOTIFICATION_FILTERS.map((f) => {
        const isActive = active === f.key;
        const showDot = f.key === "unread" && unreadCount > 0;
        return (
          <button
            key={f.key}
            onClick={() => onChange(f.key)}
            className={`relative flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-semibold spring-tap transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.label}
            {showDot && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}