import React, { useEffect } from "react";

/** PresenceIndicator — shows active collaborators with live status + the
 *  item they're currently viewing/editing. Driven by usePresence. */
const STATUS_DOT = { active: "bg-success", viewing: "bg-information", editing: "bg-accent", idle: "bg-muted-foreground" };

export default function PresenceIndicator({ active = [], onItem }) {
  if (!active.length) return null;
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
      {active.map((p) => (
        <div key={p.user_id} className="flex items-center gap-1.5 bg-muted/40 rounded-full pl-1 pr-2 py-0.5 shrink-0" title={`${p.user_name} · ${p.status}`}>
          <div className="relative">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
              {(p.user_name || "?").slice(0, 1).toUpperCase()}
            </div>
            <span className={`absolute -bottom-0 -right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${STATUS_DOT[p.status] || "bg-muted-foreground"}`} />
          </div>
          <div className="leading-tight">
            <p className="text-[10px] font-semibold text-foreground">{p.user_name.split(" ")[0]}</p>
            {p.current_item_title && <p className="text-[9px] text-muted-foreground truncate max-w-[90px]">{p.current_item_title}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}