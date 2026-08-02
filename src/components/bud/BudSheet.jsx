import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { getScreenContext } from "@/lib/budScreenContext";
import { base44 } from "@/api/base44Client";
import { useVoice } from "@/lib/voice/VoiceProvider";

const SUGGESTIONS = ["Plan my study week", "Explain a concept", "What should I focus on today?"];

const BUD_SYSTEM_PROMPT =
  "You are Bud, a warm, calm, and encouraging academic companion for a university student. " +
  "Keep replies short, friendly, and helpful — never robotic.";

/**
 * BudSheet — the Bud conversation sheet. Opens Bud instantly.
 */
export default function BudSheet() {
  const { open, setOpen, pendingPrompt, clearPrompt, voiceMode, setVoiceMode } = useBudLauncher();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const screenContext = getScreenContext(location.pathname);
  const suggestions = screenContext.suggestedPrompts || SUGGESTIONS;
  const { speak, settings: voiceSettings } = useVoice();

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setLoading(true);
    try {
      const contextClause = screenContext.description
        ? ` The student is currently on the ${screenContext.name} screen — ${screenContext.description}. Tailor your response to this context.`
        : "";
      const historyClause = messages.length > 0
        ? "\n\nRecent conversation:\n" + messages.slice(-6).map(m => `${m.role === "user" ? "Student" : "Bud"}: ${m.content}`).join("\n")
        : "";
      const res = await base44.integrations.Core.InvokeLLM({ prompt: BUD_SYSTEM_PROMPT + contextClause + historyClause + "\n\nStudent message: " + content });
      const reply = typeof res === "string" ? res : res?.response || res?.text || "I'm here for you.";
      setMessages((m) => [...m, { role: "bud", content: reply }]);
      if (voiceSettings.autoSpeak && !voiceSettings.muted) speak(reply);
    } catch {
      setMessages((m) => [...m, { role: "bud", content: "I'm right here — try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-send pending prompt from quick actions
  useEffect(() => {
    if (open && pendingPrompt) {
      send(pendingPrompt);
      clearPrompt();
    }
  }, [open, pendingPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-focus input when opened in voice mode
  useEffect(() => {
    if (open && !voiceMode) {
      const el = document.getElementById("bud-input");
      if (el) el.focus();
    }
  }, [open, voiceMode]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="relative w-full max-w-[520px] glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb max-h-[82vh] flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-heading font-bold text-[15px] text-foreground">Bud</p>
                  <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{screenContext.name}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">Your academic companion</p>
              </div>
              <button onClick={() => { setVoiceMode(false); setOpen(false); }} className="text-[13px] font-semibold text-muted-foreground hover:text-foreground spring-tap">
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 mb-4 min-h-[120px]">
              {messages.length === 0 && (
                <p className="text-[13px] text-muted-foreground text-center py-8">Hi! I'm Bud. What would you like to work on?</p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      m.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "glass text-foreground rounded-bl-md"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass px-4 py-3 rounded-2xl rounded-bl-md flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              )}
            </div>

            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="px-3 py-2 rounded-full glass text-[12px] text-foreground spring-tap">
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2 items-center">
              <input
                id="bud-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={voiceMode ? "Tap mic to speak…" : "Ask Bud anything…"}
                className="flex-1 h-[48px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25 min-w-0"
                inputMode="text"
                autoComplete="off"
              />
              <button
                onClick={() => send()}
                disabled={loading}
                className="px-4 h-12 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[14px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow flex-shrink-0"
              >
                Send
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}