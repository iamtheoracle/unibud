import React from "react";
import { motion } from "framer-motion";
import { Award, Megaphone, Users, Library } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const PULSE = [
  { icon: Award, title: "New Scholarship", subtitle: "Merit-based · Deadline soon", tone: "primary" },
  { icon: Megaphone, title: "Campus Announcement", subtitle: "Library extended hours", tone: "muted" },
  { icon: Users, title: "Club Event", subtitle: "Tech Society · Friday", tone: "muted" },
  { icon: Library, title: "Library Update", subtitle: "New past questions added", tone: "muted" },
];

/**
 * CampusPulse — small information cards. No social feed yet.
 */
export default function CampusPulse() {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}>
      <h2 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">Campus Pulse</h2>
      <div className="grid grid-cols-2 gap-3">
        {PULSE.map((p, i) => (
          <div key={i} className="p-4 rounded-2xl glass card-hover">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${p.tone === "primary" ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground"}`}>
              <p.icon className="w-[18px] h-[18px]" />
            </div>
            <p className="text-[13px] font-semibold text-foreground leading-tight">{p.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{p.subtitle}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}