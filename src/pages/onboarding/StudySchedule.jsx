import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { ArrowRight, SkipForward, Sparkles, Calendar, Bell, Download } from "lucide-react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import SelectionChip from "@/components/onboarding/SelectionChip";
import BudMessage from "@/components/onboarding/BudMessage";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIMES = ["Morning", "Afternoon", "Evening", "Late Night"];
const DURATIONS = ["Less than 30 min", "30–60 min", "1–2 hours", "More than 2 hours"];
const BREAKS = ["5 min", "10 min", "15 min", "20 min"];

export default function StudySchedule() {
  const navigate = useNavigate();
  const [days, setDays] = useState([]);
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [breakLen, setBreakLen] = useState("");
  const [revisionDays, setRevisionDays] = useState([]);
  const [importTimetable, setImportTimetable] = useState(false);
  const [calendarSync, setCalendarSync] = useState(false);
  const [reminders, setReminders] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = (arr, setArr, val) => setArr((p) => (p.includes(val) ? p.filter((x) => x !== val) : [...p, val]));
  const canContinue = days.length > 0 || time || duration || breakLen;

  const handleContinue = async () => {
    setLoading(true);
    try {
      await base44.auth.updateMe({
        study_days: days, preferred_study_time: time, study_duration: duration,
        break_length: breakLen, revision_days: revisionDays,
        import_timetable: importTimetable, calendar_sync: calendarSync, reminders,
        onboarding_step: "interests",
      });
      navigate("/onboarding/interests");
    } catch {}
    setLoading(false);
  };
  const handleSkip = async () => {
    setLoading(true);
    try { await base44.auth.updateMe({ onboarding_step: "interests" }); navigate("/onboarding/interests"); } catch {}
    setLoading(false);
  };

  const Toggle = ({ icon: Icon, label, desc, value, onChange }) => (
    <button onClick={() => onChange(!value)} className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/50">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${value ? "bg-primary/10" : "bg-muted"}`}>
        <Icon className={`w-4 h-4 ${value ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-[13px] font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <div className={`w-9 h-5 rounded-full p-0.5 transition-colors flex-shrink-0 ${value ? "bg-primary" : "bg-muted"}`}>
        <div className={`w-4 h-4 rounded-full bg-card shadow-sm transition-transform ${value ? "translate-x-4" : ""}`} />
      </div>
    </button>
  );

  return (
    <OnboardingLayout step={3} totalSteps={5} stepLabel="Study Schedule" footer={
      <>
        <button onClick={handleContinue} disabled={!canContinue || loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_4px_20px_rgba(218,175,55,0.3)]">
          Continue <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </button>
        <button onClick={handleSkip} disabled={loading} className="w-full h-[44px] rounded-2xl bg-transparent text-muted-foreground font-heading font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:text-foreground transition-colors">
          <SkipForward className="w-3.5 h-3.5" /> Skip for now
        </button>
      </>
    }>
      <BudMessage>When would you like Bud to help you study?</BudMessage>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mb-6">
        <h3 className="text-[13px] font-semibold text-foreground mb-3">Preferred Study Days</h3>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => <SelectionChip key={d} label={d.slice(0, 3)} selected={days.includes(d)} onClick={() => toggle(days, setDays, d)} />)}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6">
        <h3 className="text-[13px] font-semibold text-foreground mb-3">Preferred Study Time</h3>
        <div className="flex flex-wrap gap-2">
          {TIMES.map((t) => <SelectionChip key={t} label={t} selected={time === t} onClick={() => setTime(t)} />)}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mb-6">
        <h3 className="text-[13px] font-semibold text-foreground mb-3">Study Duration</h3>
        <div className="grid grid-cols-2 gap-2">
          {DURATIONS.map((d) => <SelectionChip key={d} label={d} variant="card" selected={duration === d} onClick={() => setDuration(d)} />)}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-6">
        <h3 className="text-[13px] font-semibold text-foreground mb-3">Break Length</h3>
        <div className="flex flex-wrap gap-2">
          {BREAKS.map((b) => <SelectionChip key={b} label={b} selected={breakLen === b} onClick={() => setBreakLen(b)} />)}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mb-6">
        <h3 className="text-[13px] font-semibold text-foreground mb-3">Revision Days</h3>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => <SelectionChip key={d} label={d.slice(0, 3)} selected={revisionDays.includes(d)} onClick={() => toggle(revisionDays, setRevisionDays, d)} />)}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="space-y-2 mb-6">
        <Toggle icon={Download} label="Import Timetable" desc="Sync from your university" value={importTimetable} onChange={setImportTimetable} />
        <Toggle icon={Calendar} label="Calendar Sync" desc="Sync with your calendar app" value={calendarSync} onChange={setCalendarSync} />
        <Toggle icon={Bell} label="Reminders" desc="Get notified before classes" value={reminders} onChange={setReminders} />
      </motion.div>

      <div className="flex items-start gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/10">
        <Sparkles className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">Bud will automatically build personalized study plans around your schedule — simple and effortless.</p>
      </div>
    </OnboardingLayout>
  );
}