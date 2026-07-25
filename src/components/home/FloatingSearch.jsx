import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const CHIPS = ["Courses", "Notes", "Assignments", "PDFs", "Messages", "Study Groups", "Bud"];

/**
 * FloatingSearch — premium floating search bar. Interface prepared for
 * Courses, Notes, Assignments, PDFs, Messages, Study Groups, and Bud.
 */
export default function FloatingSearch() {
  const [focus, setFocus] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <div className="flex items-center gap-2.5 h-[52px] px-4 rounded-2xl glass-strong">
        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        <input
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          type="text"
          placeholder="What would you like to learn today?"
          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none min-w-0"
        />
      </div>
      <AnimatePresence>
        {focus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 mt-3">
              {CHIPS.map((c) => (
                <span key={c} className="px-3 py-1.5 rounded-full glass text-[11px] font-medium text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}