import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const FILTER_SECTIONS = [
  {
    key: "category",
    label: "Category",
    options: [
      { id: "lecture", label: "Lectures" },
      { id: "campus_event", label: "Campus Events" },
      { id: "club_meeting", label: "Club Meetings" },
      { id: "sports", label: "Sports" },
      { id: "concert", label: "Music" },
      { id: "hackathon", label: "Hackathons" },
      { id: "workshop", label: "Workshops" },
      { id: "seminar", label: "Seminars" },
      { id: "voice_space", label: "Voice Rooms" },
      { id: "graduation", label: "Graduation" },
    ],
  },
  {
    key: "scope",
    label: "Scope",
    options: [
      { id: "university", label: "My University" },
      { id: "faculty", label: "My Faculty" },
      { id: "department", label: "My Department" },
    ],
  },
];

/**
 * LiveFilterSheet — bottom sheet for filtering live streams.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onApply: (filters) => void
 *  - currentFilters: { category?: string, scope?: string }
 */
export default function LiveFilterSheet({ open, onClose, onApply, currentFilters = {} }) {
  const [filters, setFilters] = useState(currentFilters);

  const toggle = (sectionKey, optionId) => {
    setFilters((prev) => ({
      ...prev,
      [sectionKey]: prev[sectionKey] === optionId ? undefined : optionId,
    }));
  };

  const handleApply = () => {
    onApply?.(filters);
    onClose?.();
  };

  const handleReset = () => setFilters({});

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed bottom-0 left-0 right-0 z-50 crystal-dock rounded-t-[28px] safe-area-pb max-h-[80vh] overflow-y-auto no-scrollbar"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 sticky top-0 crystal-dock z-10">
              <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4 text-foreground" strokeWidth={2.2} style={{ width: 18, height: 18 }} />
              </div>
              <h3 className="font-heading font-bold text-[16px] text-foreground flex-1">Filter Live</h3>
              <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
                <X className="w-4 h-4 text-foreground" strokeWidth={2.2} style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Filter sections */}
            <div className="px-5 pb-4 space-y-5">
              {FILTER_SECTIONS.map((section) => (
                <div key={section.key}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">{section.label}</h4>
                  <div className="flex flex-wrap gap-2">
                    {section.options.map((opt) => {
                      const isSelected = filters[section.key] === opt.id;
                      return (
                        <motion.button
                          key={opt.id}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => toggle(section.key, opt.id)}
                          className={cn(
                            "flex items-center gap-1 px-3.5 py-2 rounded-full text-[12px] font-bold spring-tap",
                            isSelected ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3" strokeWidth={3} style={{ width: 12, height: 12 }} />}
                          {opt.label}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="flex items-center gap-2 px-5 py-4 safe-area-pb">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="flex-1 h-11 rounded-full glass text-[13px] font-bold text-foreground spring-tap"
              >
                Reset
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleApply}
                className="flex-[2] h-11 rounded-full bg-primary text-[13px] font-bold text-primary-foreground spring-tap"
              >
                Apply Filters
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}