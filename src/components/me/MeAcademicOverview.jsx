import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { GraduationCap, Calendar, FileText, TrendingUp } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function MeAcademicOverview({ user }) {
  const navigate = useNavigate();

  const { data: timetable = [] } = useQuery({
    queryKey: ["me", "timetable-count"],
    queryFn: () => base44.entities.TimetableEntry.list("-created_date", 50),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["me", "exams-count"],
    queryFn: () => base44.entities.ExamSchedule.list("-created_date", 50),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["me", "assignments-count"],
    queryFn: () => base44.entities.Assignment.list("-created_date", 50),
  });

  const gpa = user?.gpa || user?.cgpa || "—";

  const stats = [
    { icon: Calendar, value: timetable.length, label: "Classes", to: "/timetable" },
    { icon: FileText, value: assignments.length, label: "Due", to: "/assignments" },
    { icon: GraduationCap, value: exams.length, label: "Exams", to: "/exams" },
    { icon: TrendingUp, value: gpa, label: "GPA", to: "/academics/results" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.2 }}
      className="rounded-[24px] p-5 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(16,185,129,0.05), rgba(17,17,17,0.3))",
        border: "1px solid rgba(16,185,129,0.12)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <GraduationCap className="w-4 h-4" style={{ color: "#10B981" }} strokeWidth={2.2} />
        <h3 className="text-[14px] font-bold text-white tracking-tight">Academic Overview</h3>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {stats.map((s) => (
          <button
            key={s.label}
            onClick={() => navigate(s.to)}
            className="flex flex-col items-center py-3 rounded-[14px] active:scale-95 transition-transform"
            style={{ background: "rgba(16,185,129,0.06)" }}
          >
            <s.icon className="w-3.5 h-3.5 mb-1" style={{ color: "#10B981" }} strokeWidth={2.2} />
            <p className="text-[16px] font-bold text-white">{s.value}</p>
            <p className="text-[8px] text-white/50">{s.label}</p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}