import React from "react";
import { TrendingUp, Calendar, CheckCircle2, Flame } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "GPA", value: "4.20", icon: TrendingUp, color: "text-[#28A745]" },
  { label: "Attendance", value: "87%", icon: CheckCircle2, color: "text-blue-500" },
  { label: "Due", value: "3", icon: Calendar, color: "text-amber-500" },
  { label: "Streak", value: "5d", icon: Flame, color: "text-orange-500" },
];

export default function AcademicSnapshot() {
  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-2.5 text-center"
        >
          <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} strokeWidth={2} />
          <p className="font-heading font-bold text-[14px] text-[#1A1A1A]">{stat.value}</p>
          <p className="text-[9px] text-[#86868B] font-medium">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}