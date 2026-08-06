import React from "react";
import { motion } from "framer-motion";
import { MapPin, CloudSun, GraduationCap } from "lucide-react";

function greeting(tod) {
  return tod === "morning" ? "Good morning" : tod === "afternoon" ? "Good afternoon" : tod === "evening" ? "Good evening" : "Burning the midnight oil";
}
function focusScore(ctx) {
  let s = 72;
  if (ctx.attendanceRate !== null) s += (ctx.attendanceRate - 0.8) * 30;
  if (ctx.dueToday > 0) s -= 8;
  if (ctx.overdueFees > 0) s -= 6;
  if (ctx.nextLectureIn !== null && ctx.nextLectureIn <= 15) s += 4;
  return Math.max(0, Math.min(100, Math.round(s)));
}
function mood(ctx) {
  if (ctx.timeOfDay === "night") return { label: "Tired", cls: "text-warning" };
  if (ctx.overdueFees > 0) return { label: "Stressed", cls: "text-destructive" };
  if (ctx.examWeek) return { label: "Focused", cls: "text-primary" };
  return { label: "Calm", cls: "text-success" };
}

export default function BudHomeHeader({ ctx }) {
  const name = (ctx.user?.full_name || "").split(" ")[0];
  const w = ctx.weather || {};
  const temp = w?.temperature ?? w?.temp ?? w?.current?.temp ?? 24;
  const cond = w?.condition ?? w?.summary ?? w?.scene ?? "Clear";
  const loc = w?.location ?? w?.name ?? "Campus";
  const inClass = ctx.nextLectureIn !== null && ctx.nextLectureIn <= 0 && ctx.nextLecture;
  const m = mood(ctx);
  const score = focusScore(ctx);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{ctx.timeOfDay}</p>
      <h1 className="font-heading font-bold text-[24px] text-foreground leading-tight">{greeting(ctx.timeOfDay)}{name ? `, ${name}` : ""}</h1>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] font-medium text-foreground">
          <CloudSun className="w-3.5 h-3.5 text-primary" /> {Math.round(temp)}° · {cond}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] font-medium text-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary" /> {loc}
        </span>
        {inClass && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] font-medium text-foreground">
            <GraduationCap className="w-3.5 h-3.5 text-primary" /> In {inClass.course_title || "class"}
          </span>
        )}
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] font-semibold ${m.cls}`}>Mood · {m.label}</span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-[11px] font-semibold text-foreground">
          Focus <b className="text-primary">{score}</b>
        </span>
      </div>
    </motion.div>
  );
}