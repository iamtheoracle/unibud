import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, ArrowLeft, MoreHorizontal, Mic } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";

const suggestedTopics = [
  { icon: "📚", label: "Help me study Binary Trees", category: "Study" },
  { icon: "📝", label: "Quiz me on Linear Algebra", category: "Practice" },
  { icon: "💡", label: "Explain Quantum Entanglement", category: "Learn" },
  { icon: "📅", label: "Plan my study schedule", category: "Organize" },
];

export default function Bud() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Bud, a warm and encouraging study companion for university students. You're not a cold assistant — you're a trusted friend who happens to be incredibly knowledgeable. Speak naturally using simple English. Use emojis sparingly. Be supportive and make learning feel enjoyable. If a student struggles, try a different teaching approach — use analogies, stories, or step-by-step breakdowns.

Student message: ${text}

Respond helpfully, concisely, and warmly as Bud.`,
      });
      setMessages((prev) => [...prev, { role: "bud", content: response, time: new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bud", content: "Hey, I'm having a bit of trouble connecting right now. Let's try again in a moment! 🌟", time: new Date() }]);
    }
    setIsTyping(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5 flex items-center gap-3"
      >
        <Link to="/" className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
          <ArrowLeft className="w-[18px] h-[18px]" />
        </Link>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-card" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-[15px] text-foreground">Bud</h1>
            <p className="text-[10px] text-success font-medium">Online · Ready to help</p>
          </div>
        </div>
        <button className="w-9 h-9 rounded-[12px] hover:bg-muted/60 flex items-center justify-center spring-tap">
          <MoreHorizontal className="w-[18px] h-[18px] text-muted-foreground" />
        </button>
      </motion.div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-4 no-scrollbar">
        {!hasMessages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="pt-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-5 gold-glow"
            >
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <h2 className="font-heading font-bold text-[22px] text-foreground mb-1.5">Hey there! I'm Bud 👋</h2>
            <p className="text-[13px] text-muted-foreground mb-7 max-w-xs mx-auto leading-relaxed">
              Your study companion. I'm here to help you learn, practice, and stay on track. What shall we work on?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {suggestedTopics.map((topic, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => sendMessage(topic.label)}
                  className="p-3.5 rounded-[20px] bg-card border border-border/40 text-left card-hover soft-shadow"
                >
                  <span className="text-xl mb-1.5 block">{topic.icon}</span>
                  <p className="text-[12px] font-medium text-foreground leading-snug">{topic.label}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{topic.category}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-[20px] rounded-br-md px-4 py-2.5 soft-shadow"
                : "bg-card border border-border/40 rounded-[20px] rounded-bl-md px-4 py-2.5 soft-shadow"
            }`}>
              {msg.role === "bud" && (
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-[10px] font-semibold text-primary">Bud</span>
                </div>
              )}
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/40 rounded-[20px] rounded-bl-md w-fit soft-shadow"
            >
              <Sparkles className="w-3 h-3 text-primary" />
              <div className="flex gap-1.5">
                {[0, 150, 300].map((delay) => (
                  <motion.div
                    key={delay}
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: delay / 1000 }}
                    className="w-2 h-2 bg-primary rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 pb-24">
        <div className="flex items-end gap-2.5">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask Bud anything..."
              className="w-full px-4 py-3 pr-11 rounded-[20px] bg-card border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 soft-shadow"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground spring-tap">
              <Mic className="w-[18px] h-[18px]" />
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-[20px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground elevated-shadow disabled:opacity-50 disabled:shadow-none transition-all"
          >
            <Send className="w-[18px] h-[18px]" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}