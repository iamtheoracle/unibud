import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const EVENT_COLORS = {
  exam: "bg-destructive",
  assignment: "bg-warning",
  class: "bg-info",
  tradition: "bg-purple",
  study_session: "bg-success",
  live_class: "bg-info",
  personal: "bg-primary",
  deadline: "bg-destructive",
  event: "bg-purple",
  mentorship: "bg-success",
};

export default function CalendarGrid({ currentDate, setCurrentDate, events, onDayClick, selectedDate }) {
  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const result = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      result.push({ day: daysInPrevMonth - i, otherMonth: true, date: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d).toISOString().split("T")[0];
      result.push({ day: d, otherMonth: false, date: dateStr });
    }
    const remaining = 42 - result.length;
    for (let d = 1; d <= remaining; d++) {
      result.push({ day: d, otherMonth: true, date: null });
    }
    return result;
  }, [currentDate]);

  const eventsByDate = useMemo(() => {
    const map = {};
    (events || []).forEach((e) => {
      if (!e.date) return;
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const monthName = currentDate.toLocaleString("default", { month: "long", year: "numeric" });
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-heading font-bold text-[16px] text-foreground">{monthName}</h3>
        <div className="flex gap-1.5">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="w-8 h-8 rounded-full bg-card border border-border/40 flex items-center justify-center spring-tap"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="w-8 h-8 rounded-full bg-card border border-border/40 flex items-center justify-center spring-tap"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const dayEvents = d.date ? eventsByDate[d.date] || [] : [];
          const isToday = d.date === todayStr;
          const isSelected = d.date === selectedDate;

          return (
            <button
              key={i}
              onClick={() => d.date && onDayClick(d.date)}
              disabled={!d.date}
              className={`relative aspect-square rounded-[10px] flex flex-col items-center justify-center transition-all ${
                d.otherMonth
                  ? "opacity-30"
                  : isSelected
                  ? "bg-primary text-primary-foreground"
                  : isToday
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-muted/50"
              }`}
            >
              <span className={`text-[11px] font-medium ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                {d.day}
              </span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((e, ei) => (
                    <div
                      key={ei}
                      className={`w-1 h-1 rounded-full ${EVENT_COLORS[e.type] || "bg-primary"} ${isSelected ? "bg-primary-foreground" : ""}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}