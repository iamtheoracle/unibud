import React from "react";
import { motion } from "framer-motion";
import { MessageCircle, Users, BookOpen, ShoppingBag } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * EmptyChatState — premium glass empty state for when no conversation is selected.
 * Encourages students to start connecting within the UNIBUD ecosystem.
 */
export default function EmptyChatState({ onNewConversation }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="crystal-bloom mb-5"
      >
        <div className="w-18 h-18 rounded-[24px] glass-card flex items-center justify-center edge-light" style={{ width: 72, height: 72 }}>
          <MessageCircle className="w-8 h-8 text-muted-foreground/60" strokeWidth={1.6} />
        </div>
      </motion.div>

      <h2 className="font-heading font-bold text-[19px] text-foreground mb-2 tracking-tight">
        Your conversations
      </h2>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[260px] mb-6">
        Connect with friends, classmates, lecturers, and communities. Every conversation lives within your campus ecosystem.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-[280px] w-full mb-6">
        {[
          { icon: MessageCircle, label: "Direct Chat" },
          { icon: Users, label: "Community" },
          { icon: BookOpen, label: "Study Group" },
          { icon: ShoppingBag, label: "Marketplace" },
        ].map((feature) => (
          <div key={feature.label} className="flex flex-col items-center gap-2 p-3.5 rounded-[16px] glass-card">
            <feature.icon className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
            <span className="text-[10px] font-medium text-foreground/80">{feature.label}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onNewConversation}
        className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold spring-tap"
      >
        Start a Conversation
      </button>
    </div>
  );
}