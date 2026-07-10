import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles } from "lucide-react";
import UnibudMark from "@/components/brand/UnibudMark";

export default function EmptyChatState({ onNewConversation }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 soft-shadow"
      >
        <UnibudMark className="w-10 h-10 text-primary" />
      </motion.div>

      <h2 className="font-heading font-bold text-[20px] text-foreground mb-2">
        Your conversations
      </h2>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[260px] mb-6">
        Connect with classmates, lecturers, mentors, and study groups. Every conversation supports learning, teamwork, and campus life.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-[300px] w-full mb-6">
        {[
          { icon: MessageCircle, label: "Direct Chat", color: "text-blue" },
          { icon: Sparkles, label: "Oracle Assist", color: "text-primary" },
        ].map((feature) => (
          <div key={feature.label} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border/30 soft-shadow">
            <feature.icon className={"w-5 h-5 " + feature.color} strokeWidth={2} />
            <span className="text-[11px] font-medium text-foreground">{feature.label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNewConversation}
        className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold spring-tap gold-glow"
      >
        Start a Conversation
      </button>
    </div>
  );
}