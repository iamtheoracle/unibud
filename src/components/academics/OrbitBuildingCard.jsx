import React from "react";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const STEPS = [
  "Searching your university's course catalog",
  "Building your weekly timetable",
  "Finding upcoming deadlines",
  "Calibrating your GPA baseline",
];

/**
 * Shown while Orbit browses the web to build the student's academic world.
 * Replaces the normal AcademicHub content until data arrives.
 */
export default function OrbitBuildingCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="bg-card border border-border rounded-2xl p-6 premium-shadow"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="relative w-11 h-11 flex items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"
          />
          <Globe className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <p className="text-[16px] font-semibold text-foreground leading-tight">Orbit is building your world</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">Browsing your university &amp; courses…</p>
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0.2, scale: 0.8 }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-primary shrink-0"
            />
            <span className="text-[13px] text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}