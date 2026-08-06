import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, ChevronRight } from "lucide-react";
import ConnectedAccounts from "@/components/social/ConnectedAccounts";
import FeedSourceControls from "@/components/social/FeedSourceControls";

/**
 * ConnectedAccountsSettings — advanced settings area for managing
 * connected social accounts. Not part of the daily student experience;
 * accessed from Me → Settings → Connected Accounts.
 */
export default function ConnectedAccountsSettings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-32 safe-area-pt">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-[520px] mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap"
            aria-label="Back"
          >
            <ChevronLeft className="w-[20px] h-[20px] text-foreground" strokeWidth={2} />
          </button>
          <h1 className="text-[18px] font-bold tracking-tight text-foreground">Connected Accounts</h1>
        </div>
      </header>

      <div className="max-w-[520px] mx-auto px-4 pt-4 space-y-6">
        {/* Calendar Sync */}
        <div>
          <div className="flex items-center justify-between mb-1 px-1">
            <h2 className="text-[15px] font-bold tracking-tight text-foreground">Calendar Sync</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3 px-1 leading-relaxed">
            Sync academic events — classes, exams, assignments, and more — to your Google Calendar.
          </p>
          <button
            onClick={() => navigate("/settings/calendar-sync")}
            className="w-full flex items-center gap-3 p-3.5 rounded-[16px] glass-card hover-lift text-left"
          >
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-primary" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-bold text-foreground">Google Calendar</p>
              <p className="text-[11px] text-muted-foreground">One-way sync with color coding & reminders</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Social Accounts */}
        <div>
          <div className="flex items-center justify-between mb-1 px-1">
            <h2 className="text-[15px] font-bold tracking-tight text-foreground">Social Accounts</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3 px-1 leading-relaxed">
            Connect Instagram, LinkedIn, and other social platforms.
          </p>
          <ConnectedAccounts />
        </div>

        {/* Feed source controls */}
        <div>
          <div className="flex items-center justify-between mb-1 px-1">
            <h2 className="text-[15px] font-bold tracking-tight text-foreground">Feed Sources</h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3 px-1 leading-relaxed">
            Control which sources appear in your feed, reorder them, mute noisy ones, and refresh manually.
          </p>
          <FeedSourceControls />
        </div>
      </div>
    </div>
  );
}