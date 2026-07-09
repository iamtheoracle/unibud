import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, MapPin, X } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const TYPE_STYLES = {
  exam: { bg: "bg-destructive/10", text: "text-destructive", label: "Exam" },
  assignment: { bg: "bg-warning/10", text: "text-warning", label: "Assignment" },
  class: { bg: "bg-info/10", text: "text-info", label: "Class" },
  tradition: { bg: "bg-purple/10", text: "text-purple", label: "Tradition" },
  study_session: { bg: "bg-success/10", text: "text-success", label: "Study" },
  live_class: { bg: "bg-info/10", text: "text-info", label: "Live Class" },
  personal: { bg: "bg-primary/10", text: "text-primary", label: "Personal" },
  deadline: { bg: "bg-destructive/10", text: "text-destructive", label: "Deadline" },
  event: { bg: "bg-purple/10", text: "text-purple", label: "Event" },
  mentorship: { bg: "bg-success/10", text: "text-success", label: "Mentorship" },
};

export default function CalendarDayDetail({ selectedDate, events, onClose }) {
  if (!selectedDate) return null;
  const dayEvents = events.filter((e) => e.date === selectedDate);
  const dateLabel = new Date(selectedDate).toLocaleDateString("default", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h4 className="font-heading font-semibold text-[13px] text-foreground">{dateLabel}</h4>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {dayEvents.length === 0 ? (
          <p className="text-[12px] text-muted-foreground text-center py-4">No events on this day</p>
        ) : (
          <div className="space-y-2">
            {dayEvents.map((e, i) => {
              const style = TYPE_STYLES[e.type] || TYPE_STYLES.personal;
              return (
                <GlassCard key={i} variant="solid" className="p-3.5" delay={i * 0.03}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-[12px] ${style.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-[10px] font-bold ${style.text}`}>{style.label.slice(0, 3).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-[12px] text-foreground">{e.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {e.start_time && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />{e.start_time}
                          </span>
                        )}
                        {e.location && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />{e.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}