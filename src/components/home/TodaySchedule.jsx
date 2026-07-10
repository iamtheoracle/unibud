import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calendar, Link2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDemoMode } from "@/lib/DemoModeContext";
import EmptyState from "@/components/ui/EmptyState";

const DEMO_SCHEDULE = [
  { time: "08:00", endTime: "10:00", title: "CSC 302 Data Structures", location: "LT3, Faculty of Science", type: "Lecture", accent: "hsl(var(--unibud-green))" },
  { time: "12:00", endTime: "13:00", title: "Mentor Session", location: "Online · Google Meet", type: "Mentoring", accent: "hsl(var(--unibud-blue))" },
  { time: "15:00", endTime: "16:30", title: "PHY 203 Lab Practical", location: "Physics Lab 2", type: "Practical", accent: "hsl(var(--unibud-purple))" },
];

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export default function TodaySchedule() {
  const { isDemoMode } = useDemoMode();
  const todayName = DAY_NAMES[new Date().getDay()];

  const { data: timetable, isLoading } = useQuery({
    queryKey: ["todayTimetable"],
    queryFn: () => base44.entities.TimetableEntry.list(),
    enabled: !isDemoMode,
  });

  const schedule = isDemoMode
    ? DEMO_SCHEDULE
    : (timetable || [])
        .filter((e) => (e.day || "").toLowerCase() === todayName)
        .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
        .map((e) => ({
          time: e.start_time,
          endTime: e.end_time,
          title: e.course_code + (e.course_title ? " " + e.course_title : ""),
          location: e.location || "",
          type: e.type || "Class",
          accent: "hsl(var(--unibud-green))",
        }));

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-heading font-bold text-[16px] text-foreground">Today's Schedule</h3>
        <Link to="/academics" className="text-[12px] font-semibold text-primary spring-tap">View all</Link>
      </div>

      {isLoading && !isDemoMode ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[72px] rounded-[20px] shimmer" />
          ))}
        </div>
      ) : schedule.length === 0 ? (
        <div className="bg-card rounded-[20px] soft-shadow border border-border/20">
          <EmptyState
            icon={Calendar}
            title="No classes today"
            description="Your timetable will appear here once you add your courses"
            action={
              <Link to="/academics" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
                <Link2 className="w-3.5 h-3.5" /> Go to Timetable
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-2.5">
          {schedule.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-[20px] soft-shadow border border-border/20 p-4 flex items-stretch gap-3.5 card-hover"
            >
              <div className="w-[3px] rounded-full flex-shrink-0" style={{ backgroundColor: item.accent }} />
              <div className="text-center min-w-[44px] pt-0.5">
                <p className="font-heading font-bold text-[13px] text-foreground">{item.time}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.endTime}</p>
              </div>
              <div className="flex-1">
                <p className="font-heading font-semibold text-[14px] text-foreground">{item.title}</p>
                {item.location && <p className="text-[11px] text-muted-foreground mt-0.5">{item.location}</p>}
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold">{item.type}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}