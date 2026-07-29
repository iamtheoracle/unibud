import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, MessageSquare, FileText, Languages, Lightbulb, Search, PenLine, X, Zap,
} from "lucide-react";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { useNavigate } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1];

const AI_ACTIONS = [
  { id: "ask", label: "Ask Bud", icon: MessageSquare, prompt: "I have a question. Can you help me?", color: "text-foreground" },
  { id: "summarize", label: "Summarize", icon: FileText, prompt: "Summarize the content I'm looking at right now and give me the key takeaways.", color: "text-foreground" },
  { id: "translate", label: "Translate", icon: Languages, prompt: "Translate the following text for me. I'll paste it now:", color: "text-foreground" },
  { id: "explain", label: "Explain", icon: Lightbulb, prompt: "Explain this concept to me in simple terms with an example:", color: "text-foreground" },
  { id: "notes", label: "Generate Notes", icon: PenLine, prompt: "Generate structured study notes from the following content:", color: "text-foreground" },
  { id: "search", label: "Search", icon: Search, prompt: "Search the platform for: ", color: "text-foreground" },
  { id: "create", label: "Create", icon: Zap, prompt: "Help me create content. What would you like to create? A post, assignment, or something else?", color: "text-foreground" },
];

/**
 * AICommandBar — AI Everywhere.
 *
 * A compact floating pill that expands into a grid of AI actions.
 * Available on every screen without leaving the current task.
 * Each action routes to Bud with a contextual prompt.
 */
export default function AICommandBar() {
  const [expanded, setExpanded] = useState(false);
  const { openWithPrompt } = useBudLauncher();
  const navigate = useNavigate();

  const handleAction = (action) => {
    if (action.id === "search") {
      navigate("/discover");
      openWithPrompt(action.prompt);
    } else {
      openWithPrompt(action.prompt);
    }
    setExpanded(false);
  };

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9990] bg-background/40 backdrop-blur-sm"
            onClick={() => setExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Action grid */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9991] w-[min(360px,calc(100vw-2rem))]"
          >
            <div className="crystal-card glass-shine p-4 edge-light">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[12px] font-semibold text-foreground">AI Assistant</span>
                </div>
                <button
                  onClick={() => setExpanded(false)}
                  className="w-6 h-6 rounded-lg hover:bg-white/[0.08] flex items-center justify-center spring-tap text-muted-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {AI_ACTIONS.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03, ease: EASE }}
                      onClick={() => handleAction(action)}
                      className="flex flex-col items-start gap-1.5 p-3 rounded-xl glass hover:bg-white/[0.08] spring-tap text-left"
                    >
                      <div className="w-7 h-7 rounded-lg bg-foreground/[0.08] flex items-center justify-center">
                        <Icon className="w-4 h-4 text-foreground" />
                      </div>
                      <span className="text-[12px] font-semibold text-foreground">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger pill */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5, ease: EASE }}
        onClick={() => setExpanded(!expanded)}
        className="fixed bottom-20 right-4 z-[9991] crystal-dock rounded-full flex items-center gap-2 px-4 py-2.5 spring-tap edge-light"
        aria-label="AI Assistant"
      >
        <motion.div
          animate={expanded ? { rotate: 90 } : { rotate: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="w-6 h-6 rounded-full bg-foreground/90 flex items-center justify-center glow-pulse"
        >
          {expanded ? (
            <X className="w-3.5 h-3.5 text-background" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-background" />
          )}
        </motion.div>
        {!expanded && (
          <span className="text-[12px] font-semibold text-foreground">Ask Bud</span>
        )}
      </motion.button>
    </>
  );
}