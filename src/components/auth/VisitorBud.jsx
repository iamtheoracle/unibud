import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";

const MAX_QUESTIONS = 3;

export default function VisitorBud() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading || count >= MAX_QUESTIONS) return;
    const userMsg = input.trim();
    setMessages((p) => [...p, { role: "user", content: userMsg }]);
    setInput("");
    setLoading(true);
    setCount((c) => c + 1);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
prompt: `You are Bud, the intelligent companion inside UNIBUD. You are not an AI or chatbot — you are Bud, a trusted mentor, tutor, and friend for university students. Your role is to help students learn smarter, stay organized, connect, discover opportunities, and improve their wellbeing. Always speak in simple, natural English that students of every background can easily understand. Never sound robotic or overly technical. Be supportive, friendly, calm, and human. Keep responses short (2-3 sentences), warm, and encouraging. A visitor (not signed in) asks: "${userMsg}"`,
      });
      setMessages((p) => [...p, { role: "bud", content: typeof res === "string" ? res : "I'm here to help!" }]);
    } catch {
      setMessages((p) => [...p, { role: "bud", content: "I'm having trouble right now, but I'm still here for you!" }]);
    }
    setLoading(false);
  };

  const limitReached = count >= MAX_QUESTIONS;

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-4 z-50 w-14 h-14 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-[0_4px_24px_rgba(218,175,55,0.35)]"
      >
        {open ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" strokeWidth={2} />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 z-50 w-[calc(100vw-32px)] max-w-[360px] h-[440px] bg-card rounded-[24px] border border-border/50 elevated-shadow flex flex-col overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="font-heading font-bold text-[14px] text-foreground">Bud</p>
                <p className="text-[10px] text-primary font-medium">Here to help</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
              {messages.length === 0 && (
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <p className="text-[13px] text-foreground leading-relaxed">
                    Hi! I'm Bud 🌟 Your intelligent university companion. Ask me anything — studies, campus life, opportunities, or wellbeing. You have {MAX_QUESTIONS} questions before signing in!
                  </p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "bud" && (
                    <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Sparkles className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 text-[13px] leading-relaxed ${msg.role === "user" ? "bg-foreground text-background rounded-2xl rounded-br-md" : "bg-muted text-foreground rounded-2xl rounded-bl-md"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
                    {[0, 150, 300].map((d) => (
                      <div key={d} className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              {limitReached && !loading && (
                <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3 text-center">
                  <p className="text-[13px] text-foreground font-medium mb-1">That's all for now! 🌟</p>
                  <p className="text-[12px] text-muted-foreground">Create an account to chat with Bud unlimited.</p>
                </div>
              )}
            </div>

            <div className="px-3 py-3 border-t border-border/30">
              {limitReached ? (
                <button onClick={() => { window.location.href = "/register"; }} className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[14px]">
                  Create Account
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask Bud anything..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-muted text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button onClick={handleSend} disabled={!input.trim() || loading} className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}