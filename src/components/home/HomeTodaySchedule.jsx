import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Clock, MapPin, ChevronRight, CalendarDays } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const todayName = () => DAYS[new Date().getDay()];

function parseHM(s) {
  if (!s) return null;
  const part = s.includes("T") ? s.split("T")[1] : s;
  const [h, m] = part.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return { h, m };
}
function fmt(s) {
  const hm = parseHM(s);
  if (!hm) return s || "—";
  return `${String(hm.h).padStart(2, "0")}:${String(hm.m).padStart(2, "0")}`;
}

export default function HomeTodaySchedule({ nextLecture, nextLectureIn }) {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["homeTodaySchedule"],
    queryFn: () => base44.entities.TimetableEntry.list(),
  });

  const today = todayName();
  const now = new Date();
  const entries = (data || [])
    .filter((e) => e.day === today)
    .sort((a, b) => (a.start_time || "").localeCompare(b.start_time || ""));

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Today's Schedule</h2>
        </div>
        <button onClick={() => navigate("/timetable")} className="text-[11px] font-semibold text-primary flex items-center spring-tap">
          Full timetable <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {nextLectureIn != null && nextLecture && (
        <div className="mb-3 px-3 py-2 rounded-2xl bg-primary/10 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
          <p className="text-[12px] font-medium text-primary truncate">{nextLecture.course_title || nextLecture.course_code} starts in ~{nextLectureIn} min</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-12 rounded-xl shimmer" />)}</div>
      ) : entries.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-[13px] text-muted-foreground">No classes today. A great moment to get ahead.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.slice(0, 5).map((e) => {
            const hm = parseHM(e.start_time);
            let past = false;
            if (hm) { const d = new Date(now); d.setHours(hm.h, hm.m, 0, 0); past = d < now; }
            return (
              <div key={e.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${past ? "opacity-45" : "bg-muted/30"}`}>
                <div className="text-center w-12 shrink-0">
                  <p className="text-[12px] font-bold text-foreground">{fmt(e.start_time)}</p>
                  <p className="text-[9px] text-muted-foreground">{fmt(e.end_time)}</p>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground truncate">{e.course_title || e.course_code}</p>
                  <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{e.location || e.type || "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </motion.section>
  );
}