import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Coffee } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const MESSAGES = [
  { icon: CheckCircle2, title: "Everything for today is complete.", sub: "You're on top of it." },
  { icon: Sparkles, title: "You're ahead of schedule.", sub: "Keep the momentum going." },
  { icon: Coffee, title: "Time for a break.", sub: "You've earned it." },
];

export default function TaskEmptyState({ section }) {
  const msg = useMemo(() => {
    if (section === "Today") return MESSAGES[0];
    if (section === "Overdue") return { icon: CheckCircle2, title: "Nothing overdue.", sub: "You're all caught up." };
    return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  }, [section]);

  const Icon = msg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
    >
      <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-muted-foreground/50" strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-medium text-foreground">{msg.title}</p>
      <p className="text-[13px] text-muted-foreground/60 mt-1">{msg.sub}</p>
    </motion.div>
  );
}