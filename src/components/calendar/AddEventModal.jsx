import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { X, Loader2 } from "lucide-react";

const TYPES = [
  { key: "personal", label: "Personal", color: "text-primary" },
  { key: "deadline", label: "Deadline", color: "text-destructive" },
  { key: "event", label: "Event", color: "text-purple" },
  { key: "mentorship", label: "Mentorship", color: "text-success" },
];

export default function AddEventModal({ date, onClose }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [type, setType] = useState("personal");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await base44.entities.CalendarEvent.create({
      title,
      type,
      date,
      start_time: startTime || undefined,
      location: location || undefined,
    });
    qc.invalidateQueries({ queryKey: ["calendarEvents"] });
    setSaving(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-card rounded-t-[28px] sm:rounded-[24px] p-5 soft-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-[16px] text-foreground">Add Event</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full px-4 py-3 rounded-[14px] bg-muted/50 border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div className="grid grid-cols-2 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setType(t.key)}
                  className={`py-2.5 rounded-[12px] text-[11px] font-semibold spring-tap ${
                    type === t.key ? `bg-primary/10 ${t.color}` : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-4 py-3 rounded-[14px] bg-muted/50 border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="px-4 py-3 rounded-[14px] bg-muted/50 border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              onClick={save}
              disabled={saving || !title.trim()}
              className="w-full h-12 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap disabled:opacity-40"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Event"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}