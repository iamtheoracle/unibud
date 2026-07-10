import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Clock, MessageSquare } from "lucide-react";
import SuggestedPrompts from "./SuggestedPrompts";
import QuickActions from "./QuickActions";
import BudCategories from "./BudCategories";
import { formatLastActivity } from "@/lib/agentRegistry";

export default function BudWelcome({ user, onPrompt, conversations, onOpenConversation }) {
  const recentConvs = (conversations || []).slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = user?.preferred_name || user?.full_name?.split(" ")[0] || "there";

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="pt-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-5 gold-glow"
        >
          <Sparkles className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        <h2 className="font-heading font-bold text-[22px] text-foreground mb-1.5">
          {greeting}, {name}! 👋
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
          I'm Bud — your mentor, tutor, and companion. I can help with academics, careers, wellness, campus life, and more. What's on your mind?
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-5"
      >
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">Quick Actions</p>
        <QuickActions onSelect={onPrompt} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-5"
      >
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">Suggested</p>
        <SuggestedPrompts onSelect={onPrompt} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-4"
      >
        <BudCategories onPrompt={onPrompt} />
      </motion.div>

      {recentConvs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mb-4"
        >
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">Recent Conversations</p>
          <div className="space-y-2">
            {recentConvs.map((conv, i) => {
              const lastMsg = conv.messages?.[conv.messages.length - 1];
              const agents = conv.agents_used || [];
              return (
                <button
                  key={conv.id || i}
                  onClick={() => onOpenConversation(conv)}
                  className="w-full text-left p-3 rounded-[16px] bg-card border border-border/40 soft-shadow card-hover spring-tap flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-[12px] bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground truncate">{conv.title || "Conversation"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{lastMsg?.content || "No messages"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground flex-shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {formatLastActivity(agents[0])}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}