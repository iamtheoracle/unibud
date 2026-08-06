import React from "react";
import { Bell, BellOff, Moon, Layers, CheckCheck } from "lucide-react";
import { useSmartNotifications } from "@/lib/notifications/useSmartNotifications";

const CATEGORIES = [
  "academic", "reminder", "task", "assignment", "social", "comment", "mention",
  "message", "campus", "marketplace", "library", "opportunity", "achievement", "system", "emergency",
];

/**
 * SmartNotificationPreferences — per-user controls: quiet hours, digest mode,
 * minimum alert priority and per-category muting. Backed by the
 * NotificationPreference entity (one record per user).
 */
export default function SmartNotificationPreferences() {
  const { prefs, savePrefs, savingPrefs, muteCategory, unmuteCategory } = useSmartNotifications();

  return (
    <div className="rounded-[22px] p-4 glass-card space-y-4">
      <p className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
        <Bell className="w-4 h-4 text-primary" /> Notification preferences
      </p>

      <div className="rounded-[14px] bg-muted/30 p-3 space-y-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5" /> Quiet hours
        </p>
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] text-muted-foreground">
            From
            <input type="time" value={prefs.quiet_hours_start || ""} onChange={(e) => savePrefs({ quiet_hours_start: e.target.value })} className="oracle-input mt-1" />
          </label>
          <label className="text-[10px] text-muted-foreground">
            Until
            <input type="time" value={prefs.quiet_hours_end || ""} onChange={(e) => savePrefs({ quiet_hours_end: e.target.value })} className="oracle-input mt-1" />
          </label>
        </div>
        <p className="text-[10px] text-muted-foreground/70">Non-critical notifications are held during quiet hours and delivered when they end.</p>
      </div>

      <ToggleRow
        icon={Layers}
        label="Digest mode"
        desc="Group low & normal priority notifications into a daily summary."
        value={!!prefs.digest_mode}
        onChange={(v) => savePrefs({ digest_mode: v })}
      />

      <div className="rounded-[14px] bg-muted/30 p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2">Minimum priority to alert</p>
        <div className="flex gap-1.5">
          {["critical", "high", "normal", "low"].map((p) => (
            <button
              key={p}
              onClick={() => savePrefs({ min_priority_to_alert: p })}
              className={`flex-1 py-1.5 rounded-[10px] text-[11px] font-semibold spring-tap ${prefs.min_priority_to_alert === p ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2">Muted categories</p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const muted = prefs.muted_categories?.includes(c);
            return (
              <button
                key={c}
                onClick={() => (muted ? unmuteCategory(c) : muteCategory(c))}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold spring-tap ${muted ? "bg-muted text-muted-foreground line-through" : "bg-primary/10 text-primary"}`}
              >
                {muted ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />} {c}
              </button>
            );
          })}
        </div>
      </div>

      {savingPrefs && <p className="text-[10px] text-muted-foreground flex items-center gap-1"><CheckCheck className="w-3 h-3" /> Saving…</p>}
    </div>
  );
}

function ToggleRow({ icon: Icon, label, desc, value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center gap-3 rounded-[14px] bg-muted/30 px-3 py-2.5 text-left spring-tap">
      <Icon className={`w-4 h-4 ${value ? "text-primary" : "text-muted-foreground"}`} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{desc}</p>
      </div>
      <span className={`relative w-9 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}