import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen, ClipboardList, GraduationCap, CalendarClock, TrendingUp,
  Award, ChevronRight, Sparkles, Target,
} from "lucide-react";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * AcademicOverview — clean white academic dashboard.
 * Shows GPA ring, courses, assignments, exams, and progress.
 *
 * Props:
 *  - gpa: number
 *  - gpaMax: number
 *  - courses: [{ id, code, name, color, progress }]
 *  - assignments: [{ id, title, due, subject, priority }]
 *  - upcomingExams: [{ id, title, date, subject }]
 *  - attendance: { percentage, total, present }
 *  - onAction: (actionId) => void
 */
export default function AcademicOverview({
  gpa = 0,
  gpaMax = 5.0,
  courses = [],
  assignments = [],
  upcomingExams = [],
  attendance = { percentage: 0, total: 0, present: 0 },
  onAction,
}) {
  const gpaPercent = Math.min(100, (gpa / gpaMax) * 100);

  return (
    <div className="space-y-4">
      {/* GPA & Progress hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="p-4 rounded-[20px] glass flex items-center gap-4"
      >
        {/* GPA Ring */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="263.89"
              initial={{ strokeDashoffset: 263.89 }}
              animate={{ strokeDashoffset: 263.89 - (263.89 * gpaPercent) / 100 }}
              transition={{ duration: 1, ease: EASE, delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-bold text-foreground tabular-nums">{gpa.toFixed(1)}</span>
            <span className="text-[8px] text-muted-foreground uppercase tracking-wider">GPA</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[15px] font-bold text-foreground">Academic Progress</h3>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {gpa >= 4.5 ? "Excellent standing — keep it up!" :
             gpa >= 3.5 ? "Good progress. Aim higher!" :
             "Let's work on improving your GPA."}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <MiniStat icon={CalendarClock} label="Attendance" value={`${attendance.percentage}%`} />
            <MiniStat icon={Award} label="Rank" value="Top 15%" />
          </div>
        </div>
      </motion.div>

      {/* Bud study suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
        className="p-3 rounded-[16px] glass flex items-center gap-2.5"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          className="w-8 h-8 rounded-full gradient-bud flex items-center justify-center flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 text-white" strokeWidth={2.2} />
        </motion.div>
        <p className="text-[12px] text-foreground flex-1">
          {assignments.length > 0
            ? `${assignments.length} assignments due this week. I can help you prioritize.`
            : "Your study streak is on fire! Ready for today's session?"}
        </p>
        <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
      </motion.div>

      {/* Courses grid */}
      {courses.length > 0 && (
        <div>
          <SectionHeader title="My Courses" count={courses.length} action={() => onAction?.("courses")} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {courses.slice(0, 4).map((course, i) => (
              <motion.button
                key={course.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.3, ease: EASE }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onAction?.("course")}
                className="p-3 rounded-[16px] glass spring-tap text-left"
              >
                <div
                  className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-2"
                  style={{ background: `${course.color || "hsl(var(--chocolate))"}15` }}
                >
                  <BookOpen className="w-4 h-4" strokeWidth={2.2} style={{ color: course.color || "hsl(var(--chocolate))" }} />
                </div>
                <p className="text-[11px] font-bold text-foreground truncate">{course.code}</p>
                <p className="text-[9px] text-muted-foreground truncate">{course.name}</p>
                {course.progress != null && (
                  <div className="mt-1.5">
                    <div className="h-1 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: EASE }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                    <span className="text-[8px] text-muted-foreground mt-0.5">{course.progress}%</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Assignments & Exams row */}
      <div className="grid grid-cols-2 gap-2">
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: EASE }}
          className="p-3 rounded-[16px] glass"
          onClick={() => onAction?.("assignments")}
        >
          <div className="flex items-center justify-between mb-2">
            <ClipboardList className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <span className="text-[10px] font-bold text-primary">{assignments.length}</span>
          </div>
          <p className="text-[12px] font-bold text-foreground">Assignments</p>
          <p className="text-[9px] text-muted-foreground">Due this week</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
          className="p-3 rounded-[16px] gradient-chocolate text-white"
          onClick={() => onAction?.("exams")}
        >
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="w-4 h-4" strokeWidth={2.2} />
            <span className="text-[10px] font-bold">{upcomingExams.length}</span>
          </div>
          <p className="text-[12px] font-bold">Exams</p>
          <p className="text-[9px] text-white/70">Upcoming</p>
        </motion.div>
      </div>

      {/* Upcoming exams list */}
      {upcomingExams.length > 0 && (
        <div>
          <SectionHeader title="Upcoming Exams" action={() => onAction?.("exams")} />
          <div className="space-y-2 mt-2">
            {upcomingExams.slice(0, 2).map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.05, duration: 0.3, ease: EASE }}
                className="flex items-center gap-3 p-3 rounded-[14px] glass spring-tap"
                onClick={() => onAction?.("exam")}
              >
                <div className="w-10 h-10 rounded-[12px] bg-chocolate/10 flex flex-col items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-foreground truncate">{exam.title}</p>
                  <p className="text-[10px] text-muted-foreground">{exam.subject}</p>
                </div>
                <span className="text-[10px] font-bold text-primary px-2 py-1 rounded-full bg-primary/10">
                  {exam.date}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1">
      <Icon className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
      <span className="text-[10px] text-muted-foreground">{label}:</span>
      <span className="text-[10px] font-bold text-foreground">{value}</span>
    </div>
  );
}

function SectionHeader({ title, count, action }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-[14px] font-bold text-foreground">{title}</h3>
        {count != null && <span className="text-[10px] text-muted-foreground">({count})</span>}
      </div>
      <button onClick={action} className="text-[11px] font-bold text-primary spring-tap">
        See all
      </button>
    </div>
  );
}