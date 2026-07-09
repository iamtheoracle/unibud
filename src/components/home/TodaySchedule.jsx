import React from "react";
import { motion } from "framer-motion";

const scheduleItems = [
  { time: "08:00", endTime: "10:00", title: "CSC 302 Data Structures", location: "LT3, Faculty of Science", type: "Lecture", accent: "hsl(var(--unibud-green))" },
  { time: "12:00", endTime: "13:00", title: "Mentor Session", location: "Online · Google Meet", type: "Mentoring", accent: "hsl(var(--unibud-blue))" },
  { time: "15:00", endTime: "16:30", title: "PHY 203 Lab Practical", location: "Physics Lab 2", type: "Practical", accent: "hsl(var(--unibud-purple))" },
];

export default function TodaySchedule() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-heading font-bold text-[16px] text-foreground">Today's Schedule</h3>
        <span className="text-[12px] font-semibold text-success">View all</span>
      </div>
      <div className="space-y-2.5">
        {scheduleItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card rounded-2xl shadow-sm border border-border/30 p-3.5 flex items-stretch gap-3"
          >
            <div className="w-[3px] rounded-full flex-shrink-0" style={{ backgroundColor: item.accent }} />
            <div className="text-center min-w-[42px] pt-0.5">
              <p className="font-heading font-bold text-[13px] text-foreground">{item.time}</p>
              <p className="text-[10px] text-muted-foreground">{item.endTime}</p>
            </div>
            <div className="flex-1">
              <p className="font-heading font-semibold text-[14px] text-foreground">{item.title}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.location}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold">{item.type}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}