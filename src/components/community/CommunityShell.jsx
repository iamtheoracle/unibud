import React from "react";
import { Radio } from "lucide-react";

/**
 * CommunityShell — the shared chrome for every themed community hub
 * (Football, Gaming, Music, Communities, Clubs, Events…).
 * Sticky header with wordmark + optional live badge; max-width content well.
 * Matches the Football hub identity: calm, app-like, monochrome.
 */
export default function CommunityShell({ title, icon: Icon, liveLabel, liveTo, children, actions }) {
  return (
    <div className="min-h-screen pb-28 safe-area-pt">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border/15">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center">
              <Icon className="w-4 h-4" strokeWidth={2.2} />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-foreground" style={{ letterSpacing: "-0.02em" }}>
              {title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {actions}
            {liveLabel && (
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-foreground text-background text-[11px] font-semibold spring-tap">
                <span className="w-1.5 h-1.5 rounded-full bg-error live-pulse" /> {liveLabel}
              </button>
            )}
          </div>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 pt-4">{children}</div>
    </div>
  );
}