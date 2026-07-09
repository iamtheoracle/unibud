import React from "react";
import { TrendingUp, Calendar, CheckCircle2, Flame } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "GPA", value: "4.20", icon: TrendingUp, color: "text-success" },
  { label: "Attendance", value: "87%", icon: CheckCircle2, color: "text-info" },
  { label: "Due", value: "3", icon: Calendar, color: "text-warning" },
  { label: "Streak", value: "5d", icon: Flame, color: "text-warning" },
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
          className="bg-card rounded-2xl shadow-sm border border-border/30 p-2.5 text-center"
        >
          <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} strokeWidth={2} />
          <p className="font-heading font-bold text-[14px] text-foreground">{stat.value}</p>
          <p className="text-[9px] text-muted-foreground font-medium">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}