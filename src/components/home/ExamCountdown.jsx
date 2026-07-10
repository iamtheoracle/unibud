import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, MapPin, BookOpen, Sparkles } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: false });

  useEffect(() => {
    if (!targetDate) return;
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: true });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        passed: false,
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

export default function ExamCountdown() {
  const { isDemoMode } = useDemoMode();
  const { data: exams, isLoading } = useQuery({
    queryKey: ["upcomingExams"],
    queryFn: () => base44.entities.Exam.filter({ status: "upcoming" }, "date", 5),
    enabled: !isDemoMode,
  });

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [budTasks, setBudTasks] = useState(null);
  const [budLoading, setBudLoading] = useState(false);

  const upcoming = isDemoMode ? [] : (exams || []).filter(e => new Date(e.date) > new Date());
  const selected = upcoming[selectedIdx] || upcoming[0];

  const timeLeft = useCountdown(selected ? `${selected.date}T${selected.start_time || "09:00"}:00` : null);

  useEffect(() => {
    if (!selected) return;
    setBudTasks(null);
    setBudLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `A student has an upcoming exam: ${selected.title} (${selected.course_code}). Topics: ${(selected.topics || []).join(", ") || "general course content"}. The exam is on ${selected.date}. Generate 4 specific revision tasks they should complete before the exam. Be practical and specific. Return as a JSON array of task strings.`,
      response_json_schema: {
        type: "object",
        properties: {
          tasks: { type: "array", items: { type: "string" } }
        }
      }
    }).then(res => {
      setBudTasks(res?.tasks || []);
    }).catch(() => setBudTasks([])).finally(() => setBudLoading(false));
  }, [selected?.id]);

  if (isLoading) {
    return (
      <div className="h-[200px] rounded-[20px] shimmer" />
    );
  }

  if (!selected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-[20px] p-5 border border-border/40 soft-shadow"
      >
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-[14px] text-foreground">Exam Countdown</h3>
        </div>
        <div className="flex flex-col items-center py-4">
          <div className="w-12 h-12 rounded-[16px] bg-success/10 flex items-center justify-center mb-2">
            <BookOpen className="w-6 h-6 text-success" />
          </div>
          <p className="text-[13px] font-semibold text-foreground">No upcoming exams</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Enjoy the calm — Bud's watching for you</p>
        </div>
      </motion.div>
    );
  }

  const examDateTime = new Date(`${selected.date}T${selected.start_time || "09:00"}:00`);
  const studyHoursRemaining = Math.max(0, Math.floor((examDateTime.getTime() - Date.now()) / 3600000));
  const prepProgress = selected.revision_progress || 0;

  const unitStyle = "flex flex-col items-center justify-center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] p-4 border border-border/40 soft-shadow overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-[10px] bg-primary/10 flex items-center justify-center">
          <Calendar className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-heading font-bold text-[14px] text-foreground flex-1">Exam Countdown</h3>
        {upcoming.length > 1 && (
          <div className="flex gap-1">
            {upcoming.slice(0, 4).map((ex, i) => (
              <button
                key={ex.id}
                onClick={() => setSelectedIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${i === selectedIdx ? "bg-primary w-4" : "bg-muted-foreground/30"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Exam info */}
      <div className="mb-3">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold">{selected.course_code}</span>
          {selected.type && <span className="text-[9px] text-muted-foreground capitalize">{selected.type}</span>}
        </div>
        <p className="font-heading font-semibold text-[13px] text-foreground leading-tight">{selected.course_title || selected.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(selected.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} {selected.start_time || ""}
          </span>
          {selected.location && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />{selected.location}
            </span>
          )}
        </div>
      </div>

      {/* Countdown */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Mins", value: timeLeft.minutes },
          { label: "Secs", value: timeLeft.seconds },
        ].map((u) => (
          <div key={u.label} className={unitStyle + " bg-muted/40 rounded-[12px] py-2"}>
            <span className="font-heading font-extrabold text-[18px] text-foreground tabular-nums leading-none">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-[8px] text-muted-foreground font-medium mt-0.5">{u.label}</span>
          </div>
        ))}
      </div>

      {/* Progress + study hours */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-semibold text-muted-foreground">Revision Progress</span>
            <span className="text-[10px] font-bold text-primary">{prepProgress}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prepProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
            />
          </div>
        </div>
        <div className="text-right">
          <p className="font-heading font-bold text-[14px] text-foreground">{studyHoursRemaining}h</p>
          <p className="text-[8px] text-muted-foreground">study left</p>
        </div>
      </div>

      {/* Bud revision tasks */}
      <div className="p-2.5 rounded-[12px] bg-primary/5 border border-primary/15">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary">Bud's Revision Plan</span>
        </div>
        {budLoading ? (
          <div className="space-y-1">
            {[1,2,3].map(i => <div key={i} className="h-3 rounded shimmer" />)}
          </div>
        ) : budTasks && budTasks.length > 0 ? (
          <div className="space-y-1">
            {budTasks.slice(0, 4).map((task, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-primary/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[7px] font-bold text-primary">{i + 1}</span>
                </span>
                <span className="text-[10px] text-foreground/80 leading-snug">{task}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px] text-muted-foreground">Review your course materials and past questions.</p>
        )}
      </div>
    </motion.div>
  );
}