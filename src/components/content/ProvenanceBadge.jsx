import React from "react";
import { Globe, ShieldCheck, Megaphone, Newspaper } from "lucide-react";

/**
 * ProvenanceBadge — clearly identifies the source of external content.
 *
 * Labels: External Update · Official Source · Public Announcement · Verified News
 * Always shown on externally sourced content so students know it is NOT
 * student-created.
 */

const LABEL_STYLES = {
  "External Update": { badge: "bg-information/10", text: "text-information", icon: Globe },
  "Official Source": { badge: "bg-primary/10", text: "text-primary", icon: ShieldCheck },
  "Public Announcement": { badge: "bg-warning/10", text: "text-warning", icon: Megaphone },
  "Verified News": { badge: "bg-accent/10", text: "text-accent", icon: Newspaper },
};

export default function ProvenanceBadge({ label, sourceName, size = "sm" }) {
  const style = LABEL_STYLES[label] || LABEL_STYLES["External Update"];
  const Icon = style.icon;
  const isXs = size === "xs";
  const padding = isXs ? "px-2 py-0.5" : "px-2.5 py-1";
  const textSize = isXs ? "text-[9px]" : "text-[10px]";
  const iconSize = isXs ? "w-2.5 h-2.5" : "w-3 h-3";

  return (
    <div className={`inline-flex items-center rounded-full ${style.badge} ${padding}`}>
      <Icon className={`${iconSize} ${style.text}`} strokeWidth={2.5} />
      <span className={`${textSize} font-bold ${style.text} uppercase tracking-wider ml-1`}>
        {label}
      </span>
      {sourceName && (
        <span className={`${textSize} text-muted-foreground font-medium normal-case tracking-normal ml-1`}>
          · {sourceName}
        </span>
      )}
    </div>
  );
}