import React from "react";

/**
 * ServiceCategory — a glass card grouping related university services.
 * Monochrome: category + service icons use neutral foreground tokens.
 */
export default function ServiceCategory({ category, onNavigate }) {
  const Icon = category.icon;
  return (
    <div className="glass-card p-3.5">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-4 h-4 text-foreground" />
        <span className="text-[13px] font-semibold text-foreground">{category.label}</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {category.services.map((s) => {
          const SIcon = s.icon;
          return (
            <button
              key={s.label}
              onClick={() => s.to && onNavigate(s.to)}
              disabled={!s.to}
              className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-muted/30 transition spring-tap disabled:opacity-40"
            >
              <SIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}