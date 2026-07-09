import React from "react";
import { TrendingUp, Calendar, CheckCircle2, Flame } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "GPA", value: "4.20", icon: TrendingUp, color: "text-success" },
  { label: "Attendance", value: "87%", icon: CheckCircle2, color: "text-info" },
  { label: "Due", value: "3", icon: Calendar, color: "text-warning" },
  { label: "Streak", value: "5d", icon: Flame, color: "text-primary" },
];

export default function AcademicSnapshot() {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
          className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3 text-center card-hover"
        >
          <stat.icon className={`w-[18px] h-[18px] mx-auto mb-1.5 ${stat.color}`} strokeWidth={2.2} />
          <p className="font-heading font-bold text-[15px] text-foreground">{stat.value}</p>
          <p className="text-[9px] text-muted-foreground font-medium mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}