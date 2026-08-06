import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, CalendarDays, Clock, MapPin, Users, Tag, Upload, Sparkles, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const EVENT_TYPES = [
  { id: "social", label: "Social", color: "hsl(251 90% 67%)" },
  { id: "academic", label: "Academic", color: "hsl(217 91% 60%)" },
  { id: "sports", label: "Sports", color: "hsl(142 71% 45%)" },
  { id: "cultural", label: "Cultural", color: "hsl(280 65% 60%)" },
  { id: "career_fair", label: "Career Fair", color: "hsl(24 90% 55%)" },
  { id: "hackathon", label: "Hackathon", color: "hsl(200 80% 55%)" },
  { id: "workshop", label: "Workshop", color: "hsl(160 70% 45%)" },
  { id: "club_meeting", label: "Club Meeting", color: "hsl(330 75% 55%)" },
  { id: "orientation", label: "Orientation", color: "hsl(46 74% 55%)" },
  { id: "volunteer", label: "Volunteer", color: "hsl(142 71% 45%)" },
  { id: "study_marathon", label: "Study Marathon", color: "hsl(217 91% 60%)" },
  { id: "other", label: "Other", color: "hsl(0 0% 64%)" },
];

/**
 * CampusEventComposer — event creation sheet with all event types, schedule,
 * location, cover, and Bud AI assistance.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onCreate: (eventData) => void
 */
export default function CampusEventComposer({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "social",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    capacity: "",
    is_free: true,
    price: "",
  });
  const [showTypes, setShowTypes] = useState(false);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.title || !form.date) return;
    onCreate?.(form);
    onClose?.();
  };

  const selectedType = EVENT_TYPES.find((t) => t.id === form.type) || EVENT_TYPES[0];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[7000] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-0 left-0 right-0 z-[7001] rounded-t-[24px] overflow-hidden safe-area-pb"
          >
            <div className="crystal-card rounded-t-[24px] pb-4 max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3" />

              <div className="flex items-center justify-between px-4 mt-3">
                <h3 className="font-heading font-bold text-[18px] text-foreground">Create Event</h3>
                <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                </button>
              </div>

              <div className="px-4 mt-4 space-y-3">
                {/* Bud assist */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-[12px] glass">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <Sparkles className="w-3 h-3 text-primary" strokeWidth={2.2} />
                  </motion.div>
                  <p className="text-[11px] text-muted-foreground flex-1">Bud can suggest attendees and generate invitations.</p>
                </div>

                {/* Cover upload */}
                <button className="w-full h-24 rounded-[14px] border border-dashed border-border/50 flex flex-col items-center justify-center gap-1 spring-tap glass">
                  <Upload className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
                  <span className="text-[10px] text-muted-foreground font-medium">Add Cover Image</span>
                </button>

                {/* Title */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Event Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="What's happening?"
                    className="w-full mt-1 h-10 px-3 rounded-[12px] glass text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Tell students about your event..."
                    rows={3}
                    className="w-full mt-1 p-3 rounded-[12px] glass text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/30 resize-none"
                  />
                </div>

                {/* Event type */}
                <div>
                  <button
                    onClick={() => setShowTypes(!showTypes)}
                    className="w-full flex items-center justify-between h-10 px-3 rounded-[12px] glass spring-tap"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
                      <span className="text-[12px] text-foreground">{selectedType.label}</span>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", showTypes && "rotate-180")} strokeWidth={2.2} />
                  </button>

                  <AnimatePresence>
                    {showTypes && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {EVENT_TYPES.map((type) => (
                            <button
                              key={type.id}
                              onClick={() => { update("type", type.id); setShowTypes(false); }}
                              className={cn(
                                "px-2.5 py-1.5 rounded-full text-[10px] font-bold spring-tap",
                                form.type === type.id ? "text-white" : "glass text-muted-foreground"
                              )}
                              style={form.type === type.id ? { background: type.color } : {}}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Date & time */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date</label>
                    <div className="relative mt-1">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => update("date", e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-[12px] glass text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Start Time</label>
                    <div className="relative mt-1">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
                      <input
                        type="time"
                        value={form.start_time}
                        onChange={(e) => update("start_time", e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-[12px] glass text-[12px] text-foreground outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
                    <input
                      value={form.location}
                      onChange={(e) => update("location", e.target.value)}
                      placeholder="Lecture hall, building, or online"
                      className="w-full h-10 pl-9 pr-3 rounded-[12px] glass text-[12px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Capacity (optional)</label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
                    <input
                      type="number"
                      value={form.capacity}
                      onChange={(e) => update("capacity", e.target.value)}
                      placeholder="Max attendees"
                      className="w-full h-10 pl-9 pr-3 rounded-[12px] glass text-[12px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="px-4 mt-4">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleSubmit}
                  disabled={!form.title || !form.date}
                  className={cn(
                    "w-full h-11 rounded-full text-[14px] font-bold spring-tap",
                    form.title && form.date ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}
                >
                  Create Event
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { EVENT_TYPES };