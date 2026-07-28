import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, MessageSquare, Send, Maximize2 } from "lucide-react";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { useBudMemory } from "@/hooks/useBudMemory";
import { base44 } from "@/api/base44Client";
import BudVoiceOrb from "@/components/bud/BudVoiceOrb";
import BudVoiceMode, { speak, stopSpeak } from "@/components/bud/BudVoiceMode";
import BudMemoryTimeline from "@/components/bud/BudMemoryTimeline";
import BudContextCards from "@/components/bud/BudContextCards";
import { useBudProactive } from "@/hooks/useBudProactive";
import { useBudBehaviour } from "@/hooks/useBudBehaviour";
import { useUnibudContext } from "@/lib/UnibudContext";
import { useNavigate } from "react-router-dom";

const SYSTEM =
  "You are Bud, a calm, warm, and encouraging university companion. You observe, remember, and support without asking unnecessary questions. " +
  "Keep replies short, friendly, and human — never robotic, never childish. Reference what you already know about the student when relevant.";

const SUGGESTIONS = ["What should I focus on today?", "Quiz me on my weakest topic", "Plan my study week"];

/**
 * BudCompanion — the expandable living-Bud panel. Voice mode, conversation
 * (with injected memory so the student never repeats themselves), and a
 * transparent memory timeline with full privacy controls.
 */
export default function BudCompanion() {
  const { open, setOpen, voiceMode, setVoiceMode, pendingPrompt, clearPrompt } = useBudLauncher();
  const bud = useBudMemory();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(voiceMode ? "voice" : "chat");
  const [budState, setBudState] = useState("idle");
  const scrollRef = useRef(null);
  const ctx = useUnibudContext();
  const navigate = useNavigate();
  const cards = useBudProactive(ctx);
  useBudBehaviour(ctx, bud);

  useEffect(() => {
    if (open) setTab(voiceMode ? "voice" : "chat");
    if (!open) { stopSpeak(); setBudState("idle"); }
  }, [open, voiceMode]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const memoryContext = bud.memories.slice(0, 8).map((m) => `- ${m.content}`).join("\n");

  const send = async (text) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content }]);
    setLoading(true);
    setBudState("thinking");
    try {
      const prompt = SYSTEM + (memoryContext ? `\nWhat you already know about this student:\n${memoryContext}\n` : "") + `Student: ${content}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const reply = typeof res === "string" ? res : res?.response || res?.text || "I'm here for you.";
      setMessages((m) => [...m, { role: "bud", content: reply }]);
      setBudState("speaking");
      if (tab === "voice") speak(reply);
      setTimeout(() => setBudState("idle"), 1800);
      // passive learning: observe the interaction
      bud.observe({ summary: `Student asked: "${content}". Bud replied concisely.`, source: "conversation" });
    } catch {
      setMessages((m) => [...m, { role: "bud", content: "I'm right here — try again in a moment." }]);
      setBudState("idle");
    } finally {
      setLoading(false);
    }
  };

  // Auto-send a prompt handed in from the launcher (BudHero quick prompts).
  useEffect(() => {
    if (open && pendingPrompt) {
      const p = pendingPrompt;
      clearPrompt();
      setTab("chat");
      const t = setTimeout(() => send(p), 280);
      return () => clearTimeout(t);
    }
  }, [open, pendingPrompt]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="relative w-full max-w-[520px] glass-strong rounded-t-[32px] flex flex-col max-h-[86vh] safe-area-pb overflow-hidden"
          >
            {/* header */}
            <div className="flex items-center gap-3 px-4 pt-3 pb-3 border-b border-border/30 flex-shrink-0">
              <BudVoiceOrb size={40} state={budState} />
              <div className="flex-1 min-w-0">
                <p className="font-heading font-bold text-[15px] text-foreground leading-tight">Bud</p>
                <p className="text-[11px] text-muted-foreground">{bud.memories.length ? `Knows ${bud.memories.length} things about you` : "Your living companion"}</p>
              </div>
              <div className="flex items-center gap-1 p-1 rounded-full glass">
                <button onClick={() => setTab("chat")} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold spring-tap ${tab === "chat" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  <MessageSquare className="w-3 h-3 inline -mt-0.5 mr-1" />Chat
                </button>
                <button onClick={() => { setVoiceMode(true); setTab("voice"); }} className={`px-2.5 py-1 rounded-full text-[11px] font-semibold spring-tap ${tab === "voice" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                  <Mic className="w-3 h-3 inline -mt-0.5 mr-1" />Voice
                </button>
              </div>
              <button onClick={() => { setOpen(false); navigate("/bud"); }} className="w-8 h-8 rounded-full glass text-foreground flex items-center justify-center spring-tap" aria-label="Open Bud's home">
                <Maximize2 className="w-4 h-4" strokeWidth={2} />
              </button>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full glass text-foreground flex items-center justify-center spring-tap" aria-label="Close Bud">
                <X className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
              {tab === "voice" ? (
                <BudVoiceMode onTranscript={(t) => send(t)} budState={budState} reply={messages.filter((m) => m.role === "bud").slice(-1)[0]?.content || ""} />
              ) : (
                <>
                <BudContextCards cards={cards} onPrompt={(p) => send(p)} onNavigate={(to) => { setOpen(false); navigate(to); }} />
                <div ref={scrollRef} className="px-4 py-3 space-y-2.5 min-h-[160px]">
                  {messages.length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-[13px] text-muted-foreground mb-3">Hi — I'm Bud. What would you like to work on?</p>
                      <div className="flex flex-col gap-2">
                        {SUGGESTIONS.map((s) => (
                          <button key={s} onClick={() => send(s)} className="px-3 py-2.5 rounded-[16px] glass text-left text-[12px] text-foreground spring-tap">{s}</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[82%] px-4 py-2.5 rounded-[20px] text-[13px] leading-relaxed msg-in ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "glass text-foreground rounded-bl-md"}`}>{m.content}</div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="glass px-4 py-3 rounded-[20px] rounded-bl-md flex gap-1.5">
                        {[0, 0.15, 0.3].map((d) => <span key={d} className="w-2 h-2 rounded-full bg-primary stream-dot" style={{ animationDelay: `${d}s` }} />)}
                      </div>
                    </div>
                  )}
                  </div>
                  </>
                  )}

                  {/* memory timeline */}
              <div className="border-t border-border/30">
                <BudMemoryTimeline
                  memories={bud.memories}
                  paused={bud.paused}
                  onTogglePause={bud.togglePause}
                  onRemove={bud.remove}
                  onExport={bud.exportMemory}
                  onClear={bud.clearAll}
                  loading={bud.loading}
                />
              </div>
            </div>

            {tab === "chat" && (
              <div className="flex gap-2 items-center px-4 py-3 border-t border-border/30 flex-shrink-0">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask Bud anything…"
                  className="flex-1 h-[48px] px-4 rounded-[18px] bg-muted/50 border border-border text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 min-w-0"
                />
                <button onClick={() => send()} disabled={loading} className="w-12 h-12 rounded-[18px] bg-primary text-primary-foreground flex items-center justify-center spring-tap disabled:opacity-50 ice-glow flex-shrink-0" aria-label="Send">
                  <Send className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}