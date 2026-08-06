import React, { useState } from "react";
import {
  Bell, BellOff, Moon, Clock, CalendarClock, Heart, Briefcase, Users,
  GraduationCap, Flame, Brain, Sparkles, ShieldCheck, Smartphone, Volume2,
  AlarmClock, CalendarDays, Timer,
} from "lucide-react";
import ScreenShell from "@/components/layout/ScreenShell";
import { useBudNotificationPrefs } from "@/lib/notifications/useBudNotificationPrefs";
import { requestPushPermission } from "@/lib/notifications/useBudPush";

const CATEGORY_META = [
  { key: "assignment", label: "Assignment reminders", desc: "Deadlines, due-soon & overdue", icon: GraduationCap },
  { key: "exam", label: "Exam reminders", desc: "Countdown, revision & materials", icon: CalendarClock },
  { key: "streak", label: "Study streak reminders", desc: "Milestones, recovery & weekly summary", icon: Flame },
  { key: "class", label: "Class reminders", desc: "Upcoming classes & timetable changes", icon: Clock },
  { key: "campus", label: "Campus announcements", desc: "Notices, events & emergency alerts", icon: CalendarDays },
  { key: "career", label: "Career notifications", desc: "Opportunities & application deadlines", icon: Briefcase },
  { key: "community", label: "Community notifications", desc: "Messages, mentions & group activity", icon: Users },
  { key: "ai", label: "Bud smart recommendations", desc: "Personalised nudges from your habits", icon: Brain },
];

const DELIVERY_META = [
  { key: "in_app", label: "In-app", desc: "Notification Center & Bud feed", icon: Bell },
  { key: "push", label: "Push notifications", desc: "Device alerts, even outside UNIBUD", icon: Smartphone },
  { key: "lock_screen", label: "Lock screen", desc: "Show on the lock screen (where supported)", icon: ShieldCheck },
  { key: "time_sensitive", label: "Time-sensitive", desc: "Break through focus & quiet hours for urgent items", icon: AlarmClock },
  { key: "silent", label: "Silent", desc: "Deliver without sound", icon: Volume2 },
];

const FREQUENCIES = [
  { key: "minimal", label: "Minimal", desc: "Only within 24h of a deadline" },
  { key: "normal", label: "Balanced", desc: "Standard staged reminders" },
  { key: "frequent", label: "Frequent", desc: "Every stage, more lead time" },
];

const TIMINGS = [
  { key: "early", label: "Early", desc: "Start 7 days ahead" },
  { key: "standard", label: "Standard", desc: "Start 24 hours ahead" },
  { key: "last_minute", label: "Last-minute", desc: "Start 6 hours ahead" },
];

const TONES = [
  { key: "calm", label: "Calm", desc: "Gentle, supportive" },
  { key: "encouraging", label: "Encouraging", desc: "Warm, motivating" },
  { key: "direct", label: "Direct", desc: "Clear, concise" },
];

export default function BudNotificationPreferences() {
  const { prefs, savePrefs, saving, loading } = useBudNotificationPrefs();
  const [permission, setPermission] = useState(
    typeof window !== "undefined" && "Notification" in window ? Notification.permission : "unsupported"
  );

  const grantPush = async () => {
    const result = await requestPushPermission();
    setPermission(result);
    if (result === "granted") {
      savePrefs({ push_permission_granted: true, delivery: { ...prefs.delivery, push: true }, cross_app_enabled: true });
    } else {
      savePrefs({ push_permission_granted: false });
    }
  };

  const toggleCategory = (key) => savePrefs({ categories: { [key]: !prefs.categories[key] } });
  const toggleDelivery = (key) => {
    const next = !prefs.delivery[key];
    savePrefs({ delivery: { [key]: next } });
    if (key === "push" && next && permission !== "granted") grantPush();
  };

  return (
    <ScreenShell
      title="Bud Notifications"
      subtitle="Bud only nudges when it matters — and only if you ask."
      back
      actions={<div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center ice-glow" aria-hidden><Bell className="w-5 h-5 text-primary-foreground" /></div>}
    >
      {/* Master toggle */}
      <section className="crystal-card p-4 mb-4">
        <ToggleRow
          icon={prefs.enabled ? Bell : BellOff}
          label="All Bud notifications"
          desc={prefs.enabled ? "Bud will send reminders based on your settings below." : "Bud won't send any reminders until you turn this on."}
          value={!!prefs.enabled}
          onChange={(v) => savePrefs({ enabled: v })}
        />
      </section>

      {/* Categories */}
      <SectionTitle icon={Sparkles} title="What Bud reminds you about" />
      <section className="space-y-2 mb-5">
        {CATEGORY_META.map((c) => (
          <ToggleRow key={c.key} icon={c.icon} label={c.label} desc={c.desc} value={!!prefs.categories[c.key]} onChange={() => toggleCategory(c.key)} />
        ))}
      </section>

      {/* Delivery */}
      <SectionTitle icon={Smartphone} title="Delivery" />
      <section className="space-y-2 mb-5">
        {DELIVERY_META.map((d) => (
          <ToggleRow key={d.key} icon={d.icon} label={d.label} desc={d.desc} value={!!prefs.delivery[d.key]} onChange={() => toggleDelivery(d.key)} />
        ))}
      </section>

      {/* Cross-app push opt-in + permission */}
      <section className="crystal-card p-4 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <p className="text-[13px] font-bold text-foreground">Reminders outside the app</p>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
          By default, Bud only reminds you inside UNIBUD. To get reminders while you're using other apps — or when UNIBUD is closed — enable this and grant device notification permission.
        </p>
        <ToggleRow
          icon={Smartphone}
          label="Send reminders outside UNIBUD"
          desc="Requires device notification permission"
          value={!!prefs.cross_app_enabled}
          onChange={(v) => {
            savePrefs({ cross_app_enabled: v });
            if (v && permission !== "granted") grantPush();
          }}
        />
        {prefs.cross_app_enabled && (
          <div className="mt-3 flex items-center justify-between rounded-[12px] bg-muted/40 px-3 py-2.5">
            <span className="text-[11px] text-muted-foreground">
              {permission === "granted" ? "Device permission granted ✓" : permission === "denied" ? "Blocked in browser settings" : permission === "unsupported" ? "Not supported on this device" : "Permission not granted yet"}
            </span>
            {permission !== "granted" && permission !== "unsupported" && (
              <button onClick={grantPush} className="px-3 py-1.5 rounded-[10px] bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">
                Grant permission
              </button>
            )}
          </div>
        )}
      </section>

      {/* Scheduling */}
      <SectionTitle icon={Clock} title="Scheduling" />
      <section className="crystal-card p-4 mb-5 space-y-4">
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
          <p className="text-[10px] text-muted-foreground/70">Critical alerts still come through during quiet hours.</p>
        </div>

        <div className="rounded-[14px] bg-muted/30 p-3 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-1.5">
            <CalendarClock className="w-3.5 h-3.5" /> Study hours
          </p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[10px] text-muted-foreground">
              From
              <input type="time" value={prefs.study_hours_start || ""} onChange={(e) => savePrefs({ study_hours_start: e.target.value })} className="oracle-input mt-1" />
            </label>
            <label className="text-[10px] text-muted-foreground">
              Until
              <input type="time" value={prefs.study_hours_end || ""} onChange={(e) => savePrefs({ study_hours_end: e.target.value })} className="oracle-input mt-1" />
            </label>
          </div>
          <p className="text-[10px] text-muted-foreground/70">Bud uses this window for smart study-time nudges.</p>
        </div>

        <ToggleRow icon={CalendarDays} label="Remind on weekends" desc="Let non-critical reminders fire on Saturdays & Sundays" value={!!prefs.weekend_enabled} onChange={(v) => savePrefs({ weekend_enabled: v })} />
      </section>

      {/* Reminder frequency & timing */}
      <SectionTitle icon={AlarmClock} title="Reminder frequency" />
      <section className="space-y-2 mb-5">
        {FREQUENCIES.map((f) => (
          <ChoiceRow key={f.key} active={prefs.reminder_frequency === f.key} label={f.label} desc={f.desc} onClick={() => savePrefs({ reminder_frequency: f.key })} />
        ))}
      </section>

      <SectionTitle icon={CalendarClock} title="Reminder timing" />
      <section className="space-y-2 mb-5">
        {TIMINGS.map((f) => (
          <ChoiceRow key={f.key} active={prefs.reminder_timing === f.key} label={f.label} desc={f.desc} onClick={() => savePrefs({ reminder_timing: f.key })} />
        ))}
      </section>

      {/* Snooze */}
      <SectionTitle icon={Timer} title="Snooze duration" />
      <section className="crystal-card p-4 mb-5">
        <div className="flex items-center gap-3">
          <input
            type="range" min={5} max={60} step={5}
            value={prefs.snooze_duration_minutes}
            onChange={(e) => savePrefs({ snooze_duration_minutes: Number(e.target.value) })}
            className="flex-1 accent-primary"
          />
          <span className="text-[12px] font-semibold text-foreground w-16 text-right">{prefs.snooze_duration_minutes} min</span>
        </div>
      </section>

      {/* Bud tone */}
      <SectionTitle icon={Heart} title="Bud's tone" />
      <section className="space-y-2 mb-8">
        {TONES.map((f) => (
          <ChoiceRow key={f.key} active={prefs.bud_tone === f.key} label={f.label} desc={f.desc} onClick={() => savePrefs({ bud_tone: f.key })} />
        ))}
      </section>

      {saving && <p className="text-[10px] text-muted-foreground flex items-center gap-1 mb-4"><Sparkles className="w-3 h-3" /> Saving…</p>}
      {loading && <p className="text-[10px] text-muted-foreground mb-4">Loading your preferences…</p>}
    </ScreenShell>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-1.5 mb-2.5 px-1">
      <Icon className="w-3.5 h-3.5 text-primary" />
      <h2 className="text-[12px] font-bold uppercase tracking-wide text-muted-foreground/70">{title}</h2>
    </div>
  );
}

function ToggleRow({ icon: Icon, label, desc, value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className="w-full flex items-center gap-3 rounded-[14px] glass-card px-3.5 py-3 text-left spring-tap">
      <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 ${value ? "bg-primary/10" : "bg-muted/40"}`}>
        <Icon className={`w-4 h-4 ${value ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground truncate">{desc}</p>
      </div>
      <span className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${value ? "bg-primary" : "bg-muted"}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </span>
    </button>
  );
}

function ChoiceRow({ active, label, desc, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between rounded-[14px] px-3.5 py-3 text-left spring-tap ${active ? "bg-primary text-primary-foreground" : "glass-card text-foreground"}`}>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold">{label}</p>
        <p className={`text-[10px] truncate ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{desc}</p>
      </div>
      <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${active ? "border-primary-foreground" : "border-border"}`}>
        {active && <span className="w-2 h-2 rounded-full bg-primary-foreground" />}
      </span>
    </button>
  );
}