import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Send, Heart, ArrowLeft, Radio } from "lucide-react";

const DEMO_HOST = {
  name: "Dr. Ibrahim",
  handle: "Physics · PHY 203 — Live Tutorial",
  avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
  poster: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80",
};
const DEMO_CHAT = [
  { id: 1, name: "Adaeze", msg: "Good evening Dr!", me: false },
  { id: 2, name: "Tunde", msg: "Can you repeat the quantum tunneling part?", me: false },
  { id: 3, name: "Chioma", msg: "This explanation is so clear", me: false },
  { id: 4, name: "Dr. Ibrahim", msg: "Sure Tunde — going back to it now.", me: false },
];

/**
 * LiveStream — live broadcast viewer screen.
 * Video stage + live chat + floating reactions + viewer count.
 * Chat and reactions are fully interactive; the video stage is a poster
 * placeholder awaiting a real streaming/media backend.
 */
export default function LiveStream() {
  const { streamId } = useParams();
  const navigate = useNavigate();
  const [viewers, setViewers] = useState(1240);
  const [messages, setMessages] = useState(DEMO_CHAT);
  const [input, setInput] = useState("");
  const [reactions, setReactions] = useState([]);
  const chatRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setViewers((v) => Math.max(0, v + Math.floor(Math.random() * 7) - 3)), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), name: "You", msg: input.trim(), me: true }]);
    setInput("");
  };

  const react = () => {
    const id = Date.now() + Math.random();
    setReactions((r) => [...r, { id, x: Math.random() * 70 + 15 }]);
    setTimeout(() => setReactions((r) => r.filter((x) => x.id !== id)), 3000);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col safe-area-pt">
      {/* Video stage */}
      <div className="relative aspect-video bg-gradient-to-br from-secondary to-background overflow-hidden">
        <img src={DEMO_HOST.poster} alt="" className="w-full h-full object-cover opacity-30" />
        <button onClick={() => navigate(-1)} className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center spring-tap">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error text-white text-[10px] font-bold">
          <Radio className="w-3 h-3" /> LIVE
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur text-white text-[10px] font-semibold">
          <Eye className="w-3 h-3" /> {viewers.toLocaleString()}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <img src={DEMO_HOST.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30" />
          <div>
            <p className="text-[12px] font-bold text-white">{DEMO_HOST.name}</p>
            <p className="text-[10px] text-white/70">{DEMO_HOST.handle}</p>
          </div>
        </div>
        {/* Floating reactions */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {reactions.map((r) => (
              <motion.div
                key={r.id}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -240, opacity: [0, 1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 3, ease: "easeOut" }}
                className="absolute bottom-6"
                style={{ left: `${r.x}%` }}
              >
                <Heart className="w-7 h-7 fill-error text-error" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat */}
      <div ref={chatRef} className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-2.5">
        <p className="text-center text-[10px] text-muted-foreground py-1">Be respectful. Chat is visible to everyone watching.</p>
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-3 py-1.5 ${m.me ? "bg-foreground text-background" : "bg-card border border-border/30"}`}>
              {!m.me && <p className="text-[10px] font-semibold text-primary mb-0.5">{m.name}</p>}
              <p className="text-[12px] leading-snug">{m.msg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input + actions */}
      <div className="border-t border-border/20 p-3 flex items-center gap-2 safe-area-pb">
        <button onClick={react} className="w-10 h-10 rounded-full bg-card border border-border/30 flex items-center justify-center spring-tap flex-shrink-0">
          <Heart className="w-5 h-5 text-error" />
        </button>
        <div className="flex-1 flex items-center gap-2 bg-card border border-border/30 rounded-full px-4 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Say something..."
            className="flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <button onClick={send} className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center spring-tap flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}