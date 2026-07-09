import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, Heart } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const SUGGESTIONS = [
  "I'm feeling stressed about exams",
  "I can't focus on studying",
  "I'm feeling homesick",
  "I'm overwhelmed with assignments",
];

const SYSTEM_PROMPT = `You are Bud, a warm and caring student companion in a private wellness space. The student is reaching out about their wellbeing. Be empathetic, supportive, and natural — like a trusted senior student friend. Keep responses short (2-4 sentences). Never use clinical language or act like a therapist. If the student seems to be in crisis, gently suggest they reach out to campus support services. Use simple, warm English.`;

export default function WellnessBud() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text) => {
    const msg = text || input;
    if (!msg.trim() || loading) return;
    setInput("");
    const userMsg = { role: "user", content: msg };
    setMessages((p) => [...p, userMsg]);
    setLoading(true);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${SYSTEM_PROMPT}\n\nStudent: ${msg}`,
      });
      setMessages((p) => [...p, { role: "bud", content: res }]);
    } catch {
      setMessages((p) => [...p, { role: "bud", content: "I'm here for you. Everything will be okay." }]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <GlassCard variant="solid" className="p-4" delay={0.05}>
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-semibold text-[14px] text-foreground">Talk to Bud — Private Space</h3>
        </div>
        <p className="text-[11px] text-muted-foreground">This is your private space. Nothing here is shared.</p>
      </GlassCard>

      {messages.length === 0 && (
        <div className="space-y-2">
          {SUGGESTIONS.map((s, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => send(s)}
              className="w-full text-left p-3.5 rounded-[14px] bg-card border border-border/40 text-[12px] text-foreground spring-tap hover:bg-muted/30"
            >
              {s}
            </motion.button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div ref={scrollRef} className="space-y-2.5 max-h-[400px] overflow-y-auto no-scrollbar pb-2">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-[16px] text-[12px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-card border border-border/40 text-foreground rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border/40 rounded-[16px] rounded-bl-md px-3.5 py-3">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Share what's on your mind..."
          className="flex-1 px-4 py-3 rounded-[14px] bg-card border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          className="w-12 h-12 rounded-[14px] bg-primary text-primary-foreground flex items-center justify-center spring-tap disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}