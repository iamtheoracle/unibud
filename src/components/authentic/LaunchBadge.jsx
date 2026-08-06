import React from "react";
import { Sparkles } from "lucide-react";

/**
 * LaunchBadge — clearly designates content as official launch content.
 *
 * This badge must appear on ALL seeded/demo content so users can distinguish
 * official launch content from genuine user-generated activity.
 *
 * Rule: Never present seeded demo content as if it were created by real users.
 */
export default function LaunchBadge({ size = "sm" }) {
  const sizeClasses = {
    sm: "text-[9px] px-1.5 py-0.5",
    md: "text-[10px] px-2 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-primary/15 text-primary font-semibold uppercase tracking-wide ${sizeClasses[size]}`}
    >
      <Sparkles className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      Launch
    </span>
  );
}