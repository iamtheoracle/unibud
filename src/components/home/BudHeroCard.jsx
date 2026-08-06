import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mic, ArrowUp, Sparkles } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useBudLauncher } from "@/lib/BudLauncherContext";

const EASE = [0.16, 1, 0.3, 1];

export const BUD_CHARACTER_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/a733ce83d_generated_image.png";

const SUGGESTIONS = [
  "Plan my day",
  "What's due?",
  "Study tips",
  "Explain a concept",
];

/**
 * BudHeroCard — the intelligent hero of the Home page.
 * Bud lives inside the page, never floating above it.
 * Large avatar, personalized insight, suggested actions, and a message input
 * that routes directly to the Bud conversation.
 *
 * Inspired by Apple Intelligence, Notion AI, and Perplexity.
 */
export default function BudHeroCard({ firstName = "Scholar", insight = "You're all caught up. A perfect time to get ahead." }) {
  const { openWithPrompt, openVoice } = useBudLauncher();
  const [message, setMessage] = useState("");

  const submit = () => {
    if (message.trim()) {
      openWithPrompt(message.trim());
      setMessage("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="glass-strong rounded-[28px] p-6 relative overflow-hidden"
    >
      {/* Subtle brand-tinted gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg, hsl(var(--primary) / 0.04) 0%, transparent 45%)" }}
      />

      <div className="relative">
        {/* Bud avatar — large, centered, breathing */}
        <div className="flex justify-center mb-5">
          <div className="w-32 h-32 rounded-full overflow-hidden bud-breathe crystal-bloom relative">
            <Image
              src={BUD_CHARACTER_URL}
              alt="Bud — your companion"
              fittingType="fill"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Greeting + personalized insight */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-primary" strokeWidth={2.2} />
            <p className="text-[12px] text-muted-foreground font-medium">Hey {firstName}, Bud here</p>
          </div>
          <p className="text-[16px] font-medium text-foreground leading-snug max-w-[300px] mx-auto">
            {insight}
          </p>
        </div>

        {/* Suggested action chips */}
        <div className="flex flex-wrap gap-2 justify-center mt-5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => openWithPrompt(s)}
              className="px-3.5 py-2 rounded-full bg-muted/40 border border-border text-[12px] font-medium text-muted-foreground spring-tap hover:bg-muted/60 hover:text-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Message input — Apple Intelligence style */}
        <div className="flex items-center gap-2 mt-5 px-4 h-12 rounded-2xl bg-muted/30 border border-border">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Ask Bud anything…"
            className="flex-1 bg-transparent border-none outline-none text-[14px] text-foreground placeholder:text-muted-foreground/50"
          />
          <button
            onClick={openVoice}
            className="w-8 h-8 rounded-full grid place-items-center text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors spring-tap"
            aria-label="Talk to Bud"
          >
            <Mic className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </button>
          <button
            onClick={submit}
            className="w-8 h-8 rounded-full bg-primary grid place-items-center text-primary-foreground spring-tap disabled:opacity-40 transition-opacity"
            aria-label="Send to Bud"
            disabled={!message.trim()}
          >
            <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}