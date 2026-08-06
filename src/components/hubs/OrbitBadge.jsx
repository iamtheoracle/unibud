import React from "react";
import { Atom } from "lucide-react";

/**
 * OrbitBadge — small badge indicating the hub is powered by Orbit,
 * UNIBUD's community engine. Shown in every hub to establish that
 * communities belong to Orbit, not Bud.
 */
export default function OrbitBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-card text-[10px] font-semibold text-muted-foreground uppercase tracking-wide w-fit">
      <Atom className="w-3 h-3" />
      Powered by Orbit
    </div>
  );
}