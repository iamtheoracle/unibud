import React from "react";
import { BookOpen, Calendar, GraduationCap, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_STATS = [
  { label: "GPA", value: "4.20", icon: GraduationCap, color: "text-success" },
  { label: "Due", value: "3", icon: Calendar, color: "text-warning" },
  { label: "Exams", value: "2", icon: BookOpen, color: "text-info" },
  { label: "Streak", value: "5d", icon: Flame, color: "text-primary" },
];

export default function AcademicSnapshot() {
  const { isDemoMode } = useDemoMode();

  const { data: assignments } = useQuery({
    queryKey: ["snapshotAssignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 50),
    enabled: !isDemoMode,
  });
  const { data: exams } = useQuery({
    queryKey: ["snapshotExams"],
    queryFn: () => base44.entities.Exam.filter({ status: "upcoming" }, "date", 10),
    enabled: !isDemoMode,
  });
  const { data: sessions } = useQuery({
    queryKey: ["snapshotSessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 30),
    enabled: !isDemoMode,
  });

  const pendingCount = (assignments || []).filter((a) => a.status === "pending").length;
  const upcomingExams = (exams || []).filter((e) => new Date(e.date) > new Date()).length;

  const sessionDates = (sessions || [])
    .filter((s) => s.session_date)
    .map((s) => s.session_date);
  const uniqueDates = [...new Set(sessionDates)].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let checkDate = today;
  for (let i = 0; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === checkDate) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    } else if (uniqueDates[i] < checkDate) {
      break;
    }
  }

  const stats = isDemoMode
    ? DEMO_STATS
    : [
        { label: "Due", value: String(pendingCount), icon: Calendar, color: "text-warning" },
        { label: "Exams", value: String(upcomingExams), icon: BookOpen, color: "text-info" },
        { label: "Sessions", value: String(sessions?.length || 0), icon: GraduationCap, color: "text-success" },
        { label: "Streak", value: streak + "d", icon: Flame, color: "text-primary" },
      ];

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
          className="bg-card rounded-[20px] soft-shadow border border-border/20 p-3.5 text-center card-hover"
        >
          <stat.icon className={"w-[18px] h-[18px] mx-auto mb-1.5 " + stat.color} strokeWidth={2.2} />
          <p className="font-heading font-bold text-[15px] text-foreground">{stat.value}</p>
          <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}