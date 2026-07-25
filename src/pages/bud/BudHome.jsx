import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUnibudContext } from "@/lib/UnibudContext";
import { useBudMemory } from "@/hooks/useBudMemory";
import BudHomeHeader from "@/components/bud/home/BudHomeHeader";
import BudHomeOrb from "@/components/bud/home/BudHomeOrb";
import BudToday from "@/components/bud/home/BudToday";
import BudInsights from "@/components/bud/home/BudInsights";
import BudContextMode from "@/components/bud/home/BudContextMode";
import BudMemoryStrip from "@/components/bud/home/BudMemoryStrip";

/**
 * BudHome — Bud's Living Space. A dedicated companion dashboard that evolves
 * with the student. The layout rotates daily so it never looks identical twice.
 */
export default function BudHome() {
  const ctx = useUnibudContext();
  const bud = useBudMemory();
  const seed = new Date().getDate();

  const sections = [
    { k: "today", el: <BudToday ctx={ctx} /> },
    { k: "insights", el: <BudInsights ctx={ctx} memories={bud.memories} /> },
    { k: "mode", el: <BudContextMode ctx={ctx} /> },
    { k: "memory", el: <BudMemoryStrip memories={bud.memories} /> },
  ];
  const rotated = [...sections].sort(
    (a, b) => ((a.k.charCodeAt(0) + seed) % 7) - ((b.k.charCodeAt(0) + seed) % 7)
  );

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <BudHomeHeader ctx={ctx} />
      <BudHomeOrb ctx={ctx} />
      <AnimatePresence>
        {rotated.map((s, i) => (
          <motion.section
            key={s.k}
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="mt-6"
          >
            {s.el}
          </motion.section>
        ))}
      </AnimatePresence>
    </div>
  );
}