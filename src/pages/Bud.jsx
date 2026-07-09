import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, BookOpen, Brain, Lightbulb, Mic, ArrowLeft, MoreHorizontal } from "lucide-react";
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
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <Link to="/" className="w-8 h-8 rounded-lg hover:bg-muted/60 flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#28A745] to-[#1a7a35] flex items-center justify-center shadow-md">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="font-heading font-bold text-[15px]">Bud</h1>
            <p className="text-[10px] text-emerald-500 font-medium">Online · Ready to help</p>
          </div>
        </div>
        <button className="w-8 h-8 rounded-lg hover:bg-muted/60 flex items-center justify-center">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3 pb-4">
        {!hasMessages && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-8 text-center"
          >
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#28A745] to-[#1a7a35] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-heading font-bold text-xl mb-1">Hey there! I'm Bud 👋</h2>
            <p className="text-[13px] text-muted-foreground mb-6 max-w-xs mx-auto">
              Your study companion. I'm here to help you learn, practice, and stay on track. What shall we work on?
            </p>
            <div className="grid grid-cols-2 gap-2">
              {suggestedTopics.map((topic, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  onClick={() => sendMessage(topic.label)}
                  className="p-3 rounded-2xl bg-white border border-border/50 text-left card-hover shadow-sm"
                >
                  <span className="text-lg mb-1 block">{topic.icon}</span>
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[85%] ${
              msg.role === "user"
                ? "bg-primary text-white rounded-2xl rounded-br-md px-4 py-2.5"
                : "bg-white border border-border/50 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm"
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

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-border/50 rounded-2xl rounded-bl-md w-fit shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-primary" />
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 pb-24">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder="Ask Bud anything..."
              className="w-full px-4 py-3 pr-10 rounded-2xl bg-white border border-border/50 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Mic className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim()}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#28A745] to-[#1a7a35] flex items-center justify-center text-white shadow-md disabled:opacity-50 disabled:shadow-none transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}