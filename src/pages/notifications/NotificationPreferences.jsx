import React, { useState } from "react";
import {
  Bell, Moon, Clock, Sparkles, Volume2, Layers, ClipboardList, GraduationCap,
  CalendarClock, CalendarDays, Flame, Building2, Users, Briefcase, Brain,
  Send, CheckCheck, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useSmartNotifications } from "@/lib/notifications/useSmartNotifications";
import ScreenShell from "@/components/layout/ScreenShell";

const CATEGORY_GROUPS = [
  { key: "assignment", icon: ClipboardList, label: "Assignment deadlines", desc: "7-day, 3-day, 24h, 6h, 1h & overdue reminders" },
  { key: "exam", icon: GraduationCap, label: "Examinations", desc: "Upcoming exams, countdown & revision nudges" },
  { key: "timetable", icon: CalendarClock, label: "Timetable", desc: "Upcoming class & schedule reminders" },
  { key: "event", icon: CalendarDays, label: "Campus events", desc: "Today & tomorrow campus event alerts" },
  { key: "streak", icon: Flame, label: "Study streaks", desc: "Daily, milestone, recovery & weekly summary" },
  { key: "campus", icon: Building2, label: "Campus notices", desc: "Announcements, faculty & department notices" },
  { key: "community", icon: Users, label: "Community", desc: "Messages, mentions, replies & group activity" },
  { key: "career", icon: Briefcase, label: "Career", desc: "Internships, jobs, events & deadlines" },
  { key: "bud", icon: Brain, label: "Bud smart nudges", desc: "Context-aware study habits & focus prompts" },
];

const FREQUENCIES = [
  { key: "minimal", label: "Minimal", desc: "Only 7-day, 24h & 1h reminders" },
  { key: "balanced", label: "Balanced", desc: "7d, 3d, 24h, 6h, 1h (recommended)" },
  { key: "frequent", label: "Frequent", desc: "Every lead from 7d down to 3h" },
];

const TONES = [
  { key: "supportive", label: "Supportive", desc: "Warm, encouraging" },
  { key: "playful", label: "Playful", desc: "Light & friendly" },
  { key: "formal", label: "Formal", desc: "Calm & clear" },
  { key: "concise", label: "Concise", desc: "Short, to the point" },
];

const SNOOZE_OPTIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 60, label: "1 hour" },
  { value: 120, label: "2 hours" },
];

const PRIORITIES = ["critical", "high", "normal", "low"];

export default function NotificationPreferences() {
  const { toast } = useToast();
  const {
    prefs, savingPrefs, savePrefs, muteCategory, unmuteCategory,
    setBudTone, setReminderFrequency, setSnoozeDefault,
  } = useSmartNotifications();
  const [sendingTest, setSendingTest] = useState(false);

  const muted = (k) => Array.isArray(prefs.muted_categories) && prefs.muted_categories.includes(k);

  const sendTest = async () => {
    setSendingTest(true);
    try {
      await base44.entities.Notification.create({
        title: "Bud is ready when you are",
        message: "This is a test notification so you can see how Bud's reminders will appear.",
        type: "bud", category: "bud", priority: "normal", icon: "Sparkles", link: "/home",
        source: "bud-engine",
      });
      toast({ title: "Test notification sent" });
    } catch {
      toast({ title: "Could not send test", variant: "destructive" });
    }
    setSendingTest(false);
  };

  return (
    <ScreenShell
      back backTo="/notifications"
      title="Notification preferences"
      subtitle="Bud's reminders, your way"
      actions={
        <button
          onClick={sendTest}
          disabled={sendingTest}
          className="h-10 px-3 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold flex items-center gap-1.5 spring-tap ice-glow disabled:opacity-50"
        >
          {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Test
        </button>
      }
    >
      <Card icon={Moon} title="Quiet hours" desc="Non-critical reminders are held during these hours.">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-[10px] text-muted-foreground">
            From
            <input
              type="time"
              value={prefs.quiet_hours_start || ""}
              onChange={(e) => savePrefs({ quiet_hours_start: e.target.value })}
              className="oracle-input mt-1"
            />
          </label>
          <label className="text-[10px] text-muted-foreground">
            Until
            <input
              type="time"
              value={prefs.quiet_hours_end || ""}
              onChange={(e) => savePrefs({ quiet_hours_end: e.target.value })}
              className="oracle-input mt-1"
            />
          </label>
        </div>
      </Card>

      <Card icon={Clock} title="Reminder frequency" desc="How early and often Bud nudges you before a deadline.">
        <div className="space-y-1.5">
          {FREQUENCIES.map((f) => (
            <ChoiceRow
              key={f.key}
              active={prefs.reminder_frequency === f.key}
              onClick={() => setReminderFrequency(f.key)}
              label={f.label}
              desc={f.desc}
            />
          ))}
        </div>
      </Card>

      <Card icon={Volume2} title="Bud's tone" desc="The voice Bud uses across every reminder.">
        <div className="grid grid-cols-2 gap-2">
          {TONES.map((t) => (
            <button
              key={t.key}
              onClick={() => setBudTone(t.key)}
              className={`text-left p-2.5 rounded-[12px] border spring-tap ${prefs.bud_tone === t.key ? "border-primary bg-primary/5" : "border-border/40 bg-card"}`}
            >
              <p className="text-[12px] font-semibold text-foreground">{t.label}</p>
              <p className="text-[10px] text-muted-foreground">{t.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card icon={Clock} title="Default snooze" desc="How long a reminder hides when you snooze it.">
        <div className="flex gap-1.5">
          {SNOOZE_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSnoozeDefault(s.value)}
              className={`flex-1 py-2 rounded-[10px] text-[11px] font-semibold spring-tap ${prefs.snooze_default_minutes === s.value ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Card>

      <Card icon={Bell} title="Minimum priority to alert" desc="Only reminders at or above this priority break through.">
        <div className="flex gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => savePrefs({ min_priority_to_alert: p })}
              className={`flex-1 py-1.5 rounded-[10px] text-[11px] font-semibold spring-tap capitalize ${prefs.min_priority_to_alert === p ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </Card>

      <Card icon={Layers} title="Daily digest" desc="Group low & normal priority reminders into one summary.">
        <ToggleRow value={!!prefs.digest_mode} onChange={(v) => savePrefs({ digest_mode: v })} />
      </Card>

      <div className="mb-2 px-1 mt-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Reminder categories
        </p>
      </div>
      <div className="space-y-2">
        {CATEGORY_GROUPS.map((c) => {
          const isMuted = muted(c.key);
          return (
            <button
              key={c.key}
              onClick={() => (isMuted ? unmuteCategory(c.key) : muteCategory(c.key))}
              className="w-full flex items-center gap-3 rounded-[16px] bg-card border border-border/40 px-3.5 py-3 text-left spring-tap"
            >
              <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                <c.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground">{c.label}</p>
                <p className="text-[10px] text-muted-foreground truncate">{c.desc}</p>
              </div>
              <span className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${isMuted ? "bg-muted" : "bg-primary"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isMuted ? "left-0.5" : "left-[18px]"}`} />
              </span>
            </button>
          );
        })}
      </div>

      {savingPrefs && (
        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-3 px-1">
          <CheckCheck className="w-3 h-3" /> Saving…
        </p>
      )}
    </ScreenShell>
  );
}

function Card({ icon: Icon, title, desc, children }) {
  return (
    <div className="rounded-[20px] p-4 glass-card space-y-3 mb-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-[18px] h-[18px] text-primary" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-foreground">{title}</p>
          <p className="text-[10px] text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ChoiceRow({ active, onClick, label, desc }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-left spring-tap ${active ? "bg-primary/5 border border-primary" : "bg-muted/30 border border-transparent"}`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{desc}</p>
      </div>
      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${active ? "bg-primary border-primary" : "border-border"}`} />
    </button>
  );
}

function ToggleRow({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center gap-3 rounded-[12px] bg-muted/30 px-3 py-2.5 text-left spring-tap">
      <span className="flex-1 text-[12px] font-semibold text-foreground">{value ? "On" : "Off"}</span>
      <span className={`relative w-9 h-5 rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}