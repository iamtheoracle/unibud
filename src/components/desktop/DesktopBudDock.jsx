import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * DesktopBudDock — docked Bud AI panel for desktop mode.
 * A lightweight, persistent Bud conversation surface.
 *
 * Props:
 *  - window: object (window state from WindowManager)
 *  - onOpenFull: () => void — open full Bud panel
 */
export default function DesktopBudDock({ window: win }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: input.trim() }]);
    setInput("");
    // Bud response is handled by the full Bud pipeline when user opens it
    // This dock is a quick-input surface
  }, [input]);

  return (
    <div className="flex flex-col h-full bg-background/60">
      {/* Header */}
      <div className="flex items-center gap-2 h-10 px-3 border-b border-border/30 flex-shrink-0">
        <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
        </div>
        <span className="text-[12px] font-bold text-foreground flex-1">Bud</span>
        <span className="text-[9px] text-muted-foreground">Ready to help</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <motion.div
              animate={{ scale: [1, 1.05, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3"
            >
              <Sparkles className="w-6 h-6 text-primary" strokeWidth={1.8} />
            </motion.div>
            <p className="text-[13px] font-bold text-foreground mb-1">How can I help?</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed max-w-[220px]">
              Ask me about your courses, assignments, campus events, or anything else.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "max-w-[80%] rounded-[12px] px-3 py-2 text-[12px] leading-relaxed",
                  m.role === "user" ? "bg-primary text-primary-foreground self-end" : "glass text-foreground self-start"
                )}
              >
                {m.text}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border/30 flex-shrink-0">
        <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-[12px] glass">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder="Ask Bud anything..."
            className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={handleSend}
            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center spring-tap flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}