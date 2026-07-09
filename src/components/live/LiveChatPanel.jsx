import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, X, Send, Lock } from "lucide-react";

const MOCK_MESSAGES = [
  { id: 1, author: "Dr. Sarah", role: "lecturer", content: "Welcome everyone! Today we're covering Binary Search Trees.", time: "08:01" },
  { id: 2, author: "Blessing", role: "student", content: "Quick question — is a BST the same as a heap?", time: "08:15" },
  { id: 3, author: "Dr. Sarah", role: "lecturer", content: "Great question! No, a BST maintains left < root < right, while a heap has parent-child ordering only.", time: "08:16" },
  { id: 4, author: "Michael", role: "student", content: "That makes sense, thanks!", time: "08:17" },
];

export default function LiveChatPanel({ onClose }) {
  const [tab, setTab] = useState("group");
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), author: "You", role: "student", content: input.trim(), time: new Date().toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
  };

  return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute inset-0 z-50 bg-card flex flex-col">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/30">
        <MessageSquare className="w-5 h-5 text-primary" />
        <p className="font-heading font-bold text-[14px] text-foreground flex-1">Class Chat</p>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex gap-1 px-3 py-2 border-b border-border/30">
        <button onClick={() => setTab("group")} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold transition-colors ${tab === "group" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>Group Chat</button>
        <button onClick={() => setTab("private")} className={`flex-1 py-2 rounded-xl text-[12px] font-semibold transition-colors ${tab === "private" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          <span className="flex items-center justify-center gap-1"><Lock className="w-3 h-3" /> Private</span>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={`flex flex-col ${msg.author === "You" ? "items-end" : "items-start"}`}>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={`text-[10px] font-bold ${msg.role === "lecturer" ? "text-primary" : "text-muted-foreground"}`}>{msg.author}</span>
              {msg.role === "lecturer" && <span className="text-[8px] px-1 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Lecturer</span>}
              <span className="text-[9px] text-muted-foreground">{msg.time}</span>
            </div>
            <div className={`max-w-[85%] px-3.5 py-2 text-[12px] leading-relaxed ${msg.author === "You" ? "bg-foreground text-background rounded-2xl rounded-br-md" : "bg-muted text-foreground rounded-2xl rounded-bl-md"}`}>{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="px-3 py-3 border-t border-border/30">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder={tab === "private" ? "Message privately..." : "Type a message..."} className="flex-1 px-4 py-2.5 rounded-2xl bg-muted text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={handleSend} disabled={!input.trim()} className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}