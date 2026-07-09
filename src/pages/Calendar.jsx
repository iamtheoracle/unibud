import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import CalendarDayDetail from "@/components/calendar/CalendarDayDetail";
import AddEventModal from "@/components/calendar/AddEventModal";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAdd, setShowAdd] = useState(false);

  const { data: exams = [] } = useQuery({
    queryKey: ["calendarExams"],
    queryFn: () => base44.entities.Exam.filter({ status: "upcoming" }, "date", 50),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["calendarAssignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 50),
  });

  const { data: traditions = [] } = useQuery({
    queryKey: ["calendarTraditions"],
    queryFn: () => base44.entities.CampusTradition.filter({ status: "upcoming" }, "start_date", 50),
  });

  const { data: liveClasses = [] } = useQuery({
    queryKey: ["calendarLiveClasses"],
    queryFn: () => base44.entities.LiveClass.filter({ status: "scheduled" }, "scheduled_date", 50),
  });

  const { data: customEvents = [] } = useQuery({
    queryKey: ["calendarEvents"],
    queryFn: () => base44.entities.CalendarEvent.list("date", 100),
  });

  const allEvents = [
    ...(exams || []).map((e) => ({ id: `exam-${e.id}`, title: e.title, type: "exam", date: e.date, start_time: e.start_time, location: e.location })),
    ...(assignments || []).map((a) => ({ id: `assign-${a.id}`, title: a.title, type: "assignment", date: a.due_date || a.date })),
    ...(traditions || []).map((t) => ({ id: `trad-${t.id}`, title: t.title, type: "tradition", date: t.start_date, location: t.location })),
    ...(liveClasses || []).map((c) => ({ id: `live-${c.id}`, title: c.title, type: "live_class", date: c.scheduled_date, start_time: c.start_time })),
    ...(customEvents || []).map((e) => ({ id: `custom-${e.id}`, title: e.title, type: e.type, date: e.date, start_time: e.start_time, location: e.location })),
  ];

  return (
    <div className="min-h-screen pb-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5 flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center">
          <CalendarIcon className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground">Calendar</h1>
          <p className="text-[11px] text-muted-foreground">All your academic events in one place</p>
        </div>
      </motion.div>

      <div className="px-4 space-y-4">
        <GlassCard variant="solid" className="p-4" delay={0.05}>
          <CalendarGrid
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            events={allEvents}
            onDayClick={(d) => setSelectedDate(d)}
            selectedDate={selectedDate}
          />
        </GlassCard>

        {selectedDate && (
          <div>
            <CalendarDayDetail
              selectedDate={selectedDate}
              events={allEvents}
              onClose={() => setSelectedDate(null)}
            />
          </div>
        )}

        <button
          onClick={() => setShowAdd(true)}
          className="w-full h-14 rounded-[16px] bg-primary text-primary-foreground font-heading font-semibold text-[14px] flex items-center justify-center gap-2 spring-tap gold-glow"
        >
          <Plus className="w-5 h-5" /> Add Custom Event
        </button>
      </div>

      {showAdd && (
        <AddEventModal
          date={selectedDate || new Date().toISOString().split("T")[0]}
          onClose={() => setShowAdd(false)}
        />
      )}
    </div>
  );
}