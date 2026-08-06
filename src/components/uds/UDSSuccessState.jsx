import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

/** UDSSuccessState — elegant confirmation with a small celebration. */
export default function UDSSuccessState({ title = "Done", message, celebrate = true, action, className }) {
  useEffect(() => {
    if (!celebrate) return;
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 }, colors: ["#7FD8FF", "#ffffff"], disableForReducedMotion: true, scalar: 0.8 });
  }, [celebrate]);

  return (
    <div className={cn("glass-card radius-xl p-8 text-center", className)}>
      <div className="w-14 h-14 radius-pill bg-success/15 mx-auto flex items-center justify-center mb-3">
        <span className="text-success font-heading font-bold text-xl">✓</span>
      </div>
      <p className="text-subtitle font-heading font-semibold text-foreground">{title}</p>
      {message && <p className="text-body text-muted-foreground mt-1.5">{message}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}