import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, BookOpen, Lightbulb, PenTool, Layers, FileQuestion, FileText, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { askBud } from "@/lib/ai/aiService";

const QUICK_ACTIONS = [
  { icon: BookOpen, label: "Explain", prompt: "Explain the current passage in simple English." },
  { icon: Lightbulb, label: "Summary", prompt: "Summarize the key points from this page." },
  { icon: PenTool, label: "Diagram", prompt: "Draw a text diagram explaining this concept." },
  { icon: Layers, label: "Flashcards", prompt: "Create 5 flashcards from the highlighted text." },
  { icon: FileQuestion, label: "Quiz", prompt: "Create a 3-question quiz based on this page." },
  { icon: Play, label: "Videos", prompt: "Recommend 3 videos that explain this topic." },
];

export default function BookBudPanel({ resourceName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const sendToBud = async (prompt) => {
    setLoading(true);
    setMessages(p => [...p, { role: "user", content: prompt }]);
    setInput("");
    try {
      const res = await askBud(`You are Bud, a warm university tutor. A student is reading "${resourceName}" and needs help. ${prompt} Be concise and friendly.`);
      setMessages(p => [...p, { role: "bud", content: res || "I'm having trouble right now, but I'm still here!" }]);
    } catch {
      setMessages(p => [...p, { role: "bud", content: "I'm having trouble right now, but I'm still here!" }]);
    }
    setLoading(false);
  };

  const handleSend = () => { if (input.trim() && !loading) { sendToBud(input.trim()); setInput(""); } };

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute inset-0 z-50 bg-card flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center gold-glow"><Sparkles className="w-[18px] h-[18px] text-primary-foreground" /></div>
        <div className="flex-1"><p className="font-heading font-bold text-[14px] text-foreground">Bud</p><p className="text-[10px] text-primary font-medium">Reading companion</p></div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>
      <div className="flex gap-1 overflow-x-auto no-scrollbar px-3 py-2.5 border-b border-border/30">
        {QUICK_ACTIONS.map(a => { const Icon = a.icon; return (
          <button key={a.label} onClick={() => sendToBud(a.prompt)} disabled={loading} className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl bg-muted/50 hover:bg-primary/10 transition-colors disabled:opacity-50">
            <Icon className="w-4 h-4 text-primary" /><span className="text-[9px] font-semibold text-foreground">{a.label}</span>
          </button>
        ); })}
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-8"><Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-[13px] text-foreground font-medium mb-1">Ask me about this text</p>
            <p className="text-[11px] text-muted-foreground">I'll explain, summarize, or create study materials.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "bud" && <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-0.5"><Sparkles className="w-3 h-3 text-primary-foreground" /></div>}
            <div className={`max-w-[80%] px-3.5 py-2.5 text-[12px] leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-foreground text-background rounded-2xl rounded-br-md" : "bg-muted text-foreground rounded-2xl rounded-bl-md"}`}>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center flex-shrink-0"><Sparkles className="w-3 h-3 text-primary-foreground" /></div>
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1">{[0, 150, 300].map(d => <div key={d} className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}</div>
          </div>
        )}
      </div>
      <div className="px-3 py-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Ask Bud..." className="flex-1 px-4 py-2.5 rounded-2xl bg-muted text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={handleSend} disabled={!input.trim() || loading} className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}