import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import { Clock, MapPin, Calendar, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_CLASSES = [
  { id: "d1", code: "CSC 301", title: "Data Structures", time: "8:00 AM", endTime: "10:00 AM", location: "LT 5", color: "from-info to-info/80", isNow: true },
  { id: "d2", code: "MTH 201", title: "Linear Algebra", time: "11:00 AM", endTime: "1:00 PM", location: "Room 204", color: "from-purple to-purple/80", isNow: false },
  { id: "d3", code: "PHY 203", title: "Quantum Mechanics", time: "2:00 PM", endTime: "4:00 PM", location: "Lab 3", color: "from-success to-success/80", isNow: false },
];

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const COLOR_MAP = ["from-info to-info/80", "from-purple to-purple/80", "from-success to-success/80", "from-warning to-warning/80", "from-destructive to-destructive/80"];

export default function TodayScheduleCard() {
  const { isDemoMode } = useDemoMode();
  const todayName = DAY_NAMES[new Date().getDay()];
  const now = new Date();

  const { data: timetable, isLoading } = useQuery({
    queryKey: ["todayScheduleCard"],
    queryFn: () => base44.entities.TimetableEntry.list(),
    enabled: !isDemoMode,
  });

  const classes = isDemoMode
    ? DEMO_CLASSES
    : (timetable || [])
        .filter((e) => (e.day || "").toLowerCase() === todayName)
        .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""))
        .map((e, i) => ({
          id: e.id,
          code: e.course_code || "",
          title: e.course_title || "",
          time: e.start_time || "",
          endTime: e.end_time || "",
          location: e.location || "",
          color: COLOR_MAP[i % COLOR_MAP.length],
          isNow: false,
        }));

  if (isLoading && !isDemoMode) {
    return (
      <div>
        <SectionHeader title="Today's Classes" icon={Calendar} action="Timetable" actionLink="/academics" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-[60px] rounded-[20px] shimmer" />)}
        </div>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div>
        <SectionHeader title="Today's Classes" icon={Calendar} action="Timetable" actionLink="/academics" />
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
          <EmptyState icon={Inbox} title="No classes today" description="Your timetable will appear here once you add your courses" action={<Link to="/academics" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">View Timetable</Link>} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Today's Classes" subtitle={classes.length + " classes"} icon={Calendar} action="Timetable" actionLink="/academics" />
      <div className="space-y-2">
        {classes.map((cls, i) => (
          <GlassCard key={cls.id || i} variant="solid" className={"p-3 " + (cls.isNow ? "ring-2 ring-primary/20" : "")} delay={0.1 + i * 0.05}>
            <div className="flex items-start gap-3">
              <div className={"w-1 h-full min-h-[48px] rounded-full bg-gradient-to-b " + cls.color} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-heading font-bold text-[13px]">{cls.code}</span>
                  {cls.isNow && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary text-[9px] font-bold text-primary-foreground animate-pulse-soft">NOW</span>
                  )}
                </div>
                {cls.title && <p className="text-[12px] text-muted-foreground mb-1.5">{cls.title}</p>}
                <div className="flex items-center gap-3">
                  {cls.time && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{cls.time}{cls.endTime ? " – " + cls.endTime : ""}</span>
                    </div>
                  )}
                  {cls.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{cls.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}