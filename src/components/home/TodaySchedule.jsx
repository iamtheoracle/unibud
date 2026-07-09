import React from "react";
import { motion } from "framer-motion";

const scheduleItems = [
  { time: "08:00", endTime: "10:00", title: "CSC 302 Data Structures", location: "LT3, Faculty of Science", type: "Lecture", accent: "#28A745" },
  { time: "12:00", endTime: "13:00", title: "Mentor Session", location: "Online · Google Meet", type: "Mentoring", accent: "#3B82F6" },
  { time: "15:00", endTime: "16:30", title: "PHY 203 Lab Practical", location: "Physics Lab 2", type: "Practical", accent: "#A855F7" },
];

export default function TodaySchedule() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-heading font-bold text-[16px] text-[#1A1A1A]">Today's Schedule</h3>
        <span className="text-[12px] font-semibold text-[#28A745]">View all</span>
      </div>
      <div className="space-y-2.5">
        {scheduleItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-3.5 flex items-stretch gap-3"
          >
            <div className="w-[3px] rounded-full flex-shrink-0" style={{ backgroundColor: item.accent }} />
            <div className="text-center min-w-[42px] pt-0.5">
              <p className="font-heading font-bold text-[13px] text-[#1A1A1A]">{item.time}</p>
              <p className="text-[10px] text-[#86868B]">{item.endTime}</p>
            </div>
            <div className="flex-1">
              <p className="font-heading font-semibold text-[14px] text-[#1A1A1A]">{item.title}</p>
              <p className="text-[11px] text-[#86868B] mt-0.5">{item.location}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-[#28A745]/10 text-[#28A745] text-[10px] font-semibold">{item.type}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}