import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`max-w-[85%] ${
        isUser
          ? "bg-primary text-primary-foreground rounded-[20px] rounded-br-md px-4 py-2.5 soft-shadow"
          : "bg-card border border-border/40 rounded-[20px] rounded-bl-md px-4 py-2.5 soft-shadow"
      }`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">Bud</span>
          </div>
        )}
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </motion.div>
  );
}