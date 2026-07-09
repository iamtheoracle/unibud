import React from "react";
import { ArrowLeft, Bell, BookOpen, Users, Award, AlertTriangle, Settings, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";

const notifications = [
  { title: "Assignment Due Tomorrow", message: "Data Structures Assignment 3 is due in 24 hours", type: "academic", time: "1h ago", read: false },
  { title: "New Scholarship Available", message: "Africa Merit Scholarship 2026 — you may be eligible", type: "opportunity", time: "3h ago", read: false },
  { title: "Chioma Eze connected with you", message: "You now have a new study connection", type: "social", time: "5h ago", read: true },
  { title: "Mid-Semester Exams Schedule", message: "Exams begin July 21st. Check your timetable", type: "academic", time: "8h ago", read: true },
  { title: "Campus Wi-Fi Upgrade", message: "Wi-Fi speeds improved across all buildings", type: "system", time: "1d ago", read: true },
  { title: "Study Streak Achievement!", message: "You've maintained a 5-day study streak 🔥", type: "achievement", time: "1d ago", read: true },
];

const typeConfig = {
  academic: { icon: BookOpen, color: "bg-info/10 text-info" },
  opportunity: { icon: Award, color: "bg-success/10 text-success" },
  social: { icon: Users, color: "bg-purple/10 text-purple" },
  system: { icon: Settings, color: "bg-muted text-muted-foreground" },
  achievement: { icon: Award, color: "bg-warning/10 text-warning" },
  emergency: { icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
};

export default function Notifications() {
  return (
    <div className="min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5 flex items-center gap-3"
      >
        <Link to="/" className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
          <ArrowLeft className="w-[18px] h-[18px]" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading font-bold text-[18px] text-foreground">Notifications</h1>
        </div>
        <button className="text-[12px] font-medium text-primary spring-tap">Mark all read</button>
      </motion.div>

      <div className="px-4 space-y-2.5 pb-8">
        {notifications.map((n, i) => {
          const cfg = typeConfig[n.type] || typeConfig.system;
          const Icon = cfg.icon;
          return (
            <GlassCard key={i} variant="solid" className={`p-3.5 ${!n.read ? "border-l-[3px] border-l-primary" : ""}`} delay={i * 0.04}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-heading font-semibold text-[12px] ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{n.time}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}