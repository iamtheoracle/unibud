import React from "react";
import { motion } from "framer-motion";
import { MessageSquarePlus } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * HubEmptyState — shown when a hub has no community discussions yet.
 *
 * Never fabricates content. Instead, encourages the first student to start
 * the conversation. Orbit's role is to organize — not to fake activity.
 */
export default function HubEmptyState({ hub }) {
  const Icon = hub.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col items-center text-center py-12 px-6"
    >
      <div
        className="w-20 h-20 rounded-full grid place-items-center mb-4"
        style={{ background: `hsl(${hub.color} / 0.1)` }}
      >
        <Icon className="w-9 h-9" style={{ color: `hsl(${hub.color} / 0.5)` }} strokeWidth={1.5} />
      </div>
      <p className="text-[15px] font-bold text-foreground">No discussions yet</p>
      <p className="text-[12px] text-muted-foreground mt-1.5 max-w-[260px] leading-relaxed">
        This community is waiting for its first conversation. Share something from a trusted
        source, start a discussion, or ask a question about {hub.description.toLowerCase()}.
      </p>
      <button className="mt-4 px-5 py-2.5 rounded-full bg-foreground text-background text-[13px] font-semibold spring-tap flex items-center gap-2">
        <MessageSquarePlus className="w-4 h-4" />
        Start a Discussion
      </button>
    </motion.div>
  );
}