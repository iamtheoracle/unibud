import React, { useState } from "react";
import { Bell, Moon, Layers, Settings, CheckCheck, ChevronDown } from "lucide-react";
import { useSmartNotifications } from "@/lib/notifications/useSmartNotifications";
import BudDailyDigest from "@/components/notifications/BudDailyDigest";
import SmartNotificationPreferences from "@/components/notifications/SmartNotificationPreferences";

const BUCKET_TONE = {
  critical: "text-destructive bg-destructive/10",
  high: "text-warning bg-warning/10",
  normal: "text-primary bg-primary/10",
  low: "text-muted-foreground bg-muted",
  silent: "text-muted-foreground bg-muted",
};

/**
 * SmartNotifications — the unified, prioritized notification center.
 * Spark orders by urgency/relevance, groups non-critical items into a
 * digest, holds them during quiet hours, and mutes chosen categories.
 */
export default function SmartNotifications() {
  const { show, digest, digestCount, delayed, muted, quiet, unread, markRead, markAllRead } = useSmartNotifications();
  const [showPrefs, setShowPrefs] = useState(false);
  const [openDigest, setOpenDigest] = useState({});

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-[22px] text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Smart Notifications
          </h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {unread} unread{quiet ? " · quiet hours" : ""}{digestCount ? ` · ${digestCount} grouped` : ""}{muted.length ? ` · ${muted.length} muted` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="p-2 rounded-full bg-muted/50 text-muted-foreground spring-tap" title="Mark all read">
            <CheckCheck className="w-4 h-4" />
          </button>
          <button onClick={() => setShowPrefs(!showPrefs)} className={`p-2 rounded-full spring-tap ${showPrefs ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`} title="Preferences">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <BudDailyDigest />
      </div>

      {showPrefs && (
        <div className="mt-4">
          <SmartNotificationPreferences />
        </div>
      )}

      {quiet > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-[14px] bg-warning/10 px-3 py-2">
          <Moon className="w-4 h-4 text-warning" />
          <p className="text-[11px] font-medium text-warning">{delayed.length} non-critical notification{delayed.length === 1 ? "" : "s"} held during quiet hours.</p>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {show.length === 0 && digestCount === 0 && (
          <div className="rounded-[18px] p-6 glass-card text-center">
            <Bell className="w-7 h-7 text-muted-foreground/40 mx-auto mb-1.5" />
            <p className="text-[13px] font-semibold text-foreground">All clear</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">No notifications need your attention right now.</p>
          </div>
        )}

        {show.map(({ n, bucket }) => (
          <button key={n.id} onClick={() => markRead(n.id)} className="w-full text-left rounded-[16px] p-3 glass-card spring-tap">
            <div className="flex items-start gap-2">
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${BUCKET_TONE[bucket] || BUCKET_TONE.normal}`}>{bucket}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground">{n.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
              </div>
              {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
            </div>
          </button>
        ))}

        {Object.keys(digest).length > 0 && (
          <div className="rounded-[16px] p-3 glass-card">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-1.5 mb-2">
              <Layers className="w-3.5 h-3.5" /> Daily digest
            </p>
            {Object.entries(digest).map(([cat, items]) => (
              <div key={cat} className="rounded-[12px] bg-muted/30 mb-1.5">
                <button onClick={() => setOpenDigest((o) => ({ ...o, [cat]: !o[cat] }))} className="w-full flex items-center justify-between px-3 py-2.5">
                  <span className="text-[12px] font-semibold text-foreground capitalize">{cat} · {items.length}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${openDigest[cat] ? "rotate-180" : ""}`} />
                </button>
                {openDigest[cat] && (
                  <div className="px-3 pb-2 space-y-1.5">
                    {items.map((n) => (
                      <div key={n.id} className="text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">{n.title}</span> — {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}