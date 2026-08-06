import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUnibudContext } from "@/lib/UnibudContext";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Generates a single contextual insight line from the observation layer.
 */
function getContextualLine(ctx) {
  if (ctx.dueToday > 0) {
    return `${ctx.dueToday} assignment${ctx.dueToday > 1 ? "s" : ""} due today`;
  }
  if (ctx.nextExamDays !== null && ctx.nextExamDays <= 7) {
    return `Exam in ${ctx.nextExamDays} day${ctx.nextExamDays !== 1 ? "s" : ""}`;
  }
  if (ctx.nextLectureIn !== null && ctx.nextLectureIn <= 60 && ctx.nextLectureIn > 0) {
    return `Next class in ${ctx.nextLectureIn} min`;
  }
  if (ctx.unreadMessages > 0) {
    return `${ctx.unreadMessages} unread message${ctx.unreadMessages > 1 ? "s" : ""}`;
  }
  return "I'm here when you need me";
}

/**
 * BudBriefingBar — compact Bud presence at the top of workspace pages.
 *
 * Bud doesn't disappear when you enter a workspace. This bar keeps Bud's
 * understanding visible — one line of context, a count badge, and a tap
 * that brings you home to the full Bud interface.
 */
export default function BudBriefingBar() {
  const ctx = useUnibudContext();
  const navigate = useNavigate();
  const line = getContextualLine(ctx);
  const count = (ctx.dueToday || 0) + (ctx.unreadMessages || 0) + (ctx.examSoonCount || 0);

  return (
    <motion.button
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      onClick={() => { hapticTap(); navigate("/home"); }}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl glass mb-5 spring-tap hover:bg-white/[0.06]"
    >
      {/* Bud mark — compact living orb */}
      <div className="relative w-8 h-8 rounded-full bg-foreground/[0.08] grid place-items-center shrink-0">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/70 grid place-items-center bud-breathe">
          <div className="w-2 h-0.5 rounded-full bg-primary-foreground/90" />
        </div>
      </div>

      {/* Contextual insight */}
      <div className="flex-1 text-left min-w-0">
        <p className="text-[12px] font-semibold text-foreground truncate">{line}</p>
        <p className="text-[10px] text-muted-foreground">Tap to talk to Bud</p>
      </div>

      {/* Count badge */}
      {count > 0 && (
        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold shrink-0">
          {count}
        </span>
      )}
    </motion.button>
  );
}