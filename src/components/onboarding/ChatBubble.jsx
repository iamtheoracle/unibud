import React from "react";
import { motion } from "framer-motion";

/**
 * ChatBubble — onboarding conversation bubble.
 * Bud messages: left, glass surface. User messages: right, accent fill.
 */
export default function ChatBubble({ role, text }) {
  const isBud = role === "bud";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-[85%] px-4 py-3 text-[15px] leading-relaxed rounded-[18px] msg-in ${
        isBud
          ? "self-start glass text-foreground rounded-bl-[5px]"
          : "self-end bg-primary text-primary-foreground rounded-br-[5px]"
      }`}
    >
      {text}
    </motion.div>
  );
}