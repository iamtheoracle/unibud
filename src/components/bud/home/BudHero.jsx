import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Send, AlertCircle, GraduationCap, MessageCircle, Clock, Wallet, Sun, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useUnibudContext } from "@/lib/UnibudContext";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import BudVoiceOrb from "@/components/bud/BudVoiceOrb";
import BudGrowthStrip from "@/components/bud/home/BudGrowthStrip";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

function greeting(tod) {
  return tod === "morning" ? "Good morning" : tod === "afternoon" ? "Good afternoon" : tod === "evening" ? "Good evening" : "Burning the midnight oil";
}

/**
 * Builds contextual briefing items from the shared observation layer.
 * Only surfaces what's actually relevant — never fabricates.
 */
function buildBriefingItems(ctx) {
  const items = [];
  if (ctx.dueToday > 0) {
    items.push({ icon: AlertCircle, label: `${ctx.dueToday} assignment${ctx.dueToday > 1 ? "s" : ""} due today`, urgent: true });
  }
  if (ctx.nextExamDays !== null && ctx.nextExamDays <= 14) {
    items.push({ icon: GraduationCap, label: `Exam in ${ctx.nextExamDays} day${ctx.nextExamDays !== 1 ? "s" : ""}`, urgent: ctx.nextExamDays <= 3 });
  }
  if (ctx.nextLectureIn !== null && ctx.nextLectureIn <= 60 && ctx.nextLectureIn > 0) {
    items.push({ icon: Clock, label: `Next class in ${ctx.nextLectureIn} min` });
  }
  if (ctx.unreadMessages > 0) {
    items.push({ icon: MessageCircle, label: `${ctx.unreadMessages} unread message${ctx.unreadMessages > 1 ? "s" : ""}` });
  }
  if (ctx.overdueFees > 0) {
    items.push({ icon: Wallet, label: `${ctx.overdueFees} overdue fee${ctx.overdueFees > 1 ? "s" : ""}`, urgent: true });
  }
  return items;
}

/**
 * BudHero — the primary interface. Bud owns the screen.
 *
 * This is not a floating assistant or a chatbot overlay. This IS the
 * application — Bud greets the student, surfaces what matters, and
 * invites them to act. The workspaces below are content Bud orchestrates.
 */
export default function BudHero() {
  const ctx = useUnibudContext();
  const { openWithPrompt, openVoice } = useBudLauncher();
  const [input, setInput] = useState("");

  const name = (ctx.user?.full_name || "").split(" ")[0];
  const briefingItems = buildBriefingItems(ctx);
  const orbState = ctx.nextLectureIn !== null && ctx.nextLectureIn <= 15 ? "speaking" : "idle";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      hapticTap();
      openWithPrompt(input.trim());
      setInput("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center pt-2 pb-4"
    >
      {/* Greeting */}
      <p className="text-[13px] text-muted-foreground font-medium">
        {greeting(ctx.timeOfDay)}{name ? `, ${name}` : ""}
      </p>
      <h1 className="text-[22px] font-bold text-foreground mt-0.5 tracking-tight">I'm Bud.</h1>
      <p className="text-[13px] text-muted-foreground mt-1 text-center max-w-[280px]">
        {briefingItems.length > 0 ? "Here's what's important today." : "I'm here whenever you need me."}
      </p>

      {/* Bud Orb */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
        className="my-5"
      >
        <BudVoiceOrb size={128} state={orbState} />
      </motion.div>

      {/* Briefing items — only what matters */}
      {briefingItems.length > 0 && (
        <div className="w-full space-y-2 mb-5">
          {briefingItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.06, duration: 0.3, ease: EASE }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ${
                  item.urgent ? "glass-strong" : "glass"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${item.urgent ? "text-destructive" : "text-muted-foreground"}`} />
                <span className={`text-[13px] ${item.urgent ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Daily briefing entry point */}
      <Link
        to="/briefing"
        onClick={() => hapticTap()}
        className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl glass mb-4 spring-tap"
      >
        <div className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
          <Sun className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-[13px] font-semibold text-foreground">Today's Briefing</p>
          <p className="text-[11px] text-muted-foreground">Assignments, schedule & notifications</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </Link>

      {/* Input bar — "Ask me anything..." */}
      <form onSubmit={handleSubmit} className="w-full relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything…"
          className="w-full pl-4 pr-20 py-3.5 rounded-full glass-strong text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 spring-tap"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            type="button"
            onClick={openVoice}
            aria-label="Voice"
            className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap"
          >
            <Mic className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send"
            className="w-9 h-9 rounded-full bg-primary grid place-items-center spring-tap disabled:opacity-30"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
      </form>

      {/* Growth — quiet proof that Bud is growing alongside the student */}
      <BudGrowthStrip />
    </motion.div>
  );
}