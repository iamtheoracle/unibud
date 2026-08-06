import React from "react";

export default function OperatorStatusTabs({ tabs, active, onChange, counts = {} }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
      {tabs.map((t) => {
        const isActive = active === t.key;
        const count = counts[t.key] || 0;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-semibold spring-tap transition-colors flex items-center gap-1.5 ${
              isActive ? "bg-primary text-primary-foreground" : "glass text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {count > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold ${
                isActive ? "bg-primary-foreground/25" : "bg-muted"
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}