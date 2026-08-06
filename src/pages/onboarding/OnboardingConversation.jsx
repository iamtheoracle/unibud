import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import MeetBudOrb from "@/components/bud/MeetBudOrb";
import SparkField from "@/components/foundation/SparkField";
import BrandLogo from "@/components/foundation/BrandLogo";
import ChatBubble from "@/components/onboarding/ChatBubble";
import ChoiceChip from "@/components/onboarding/ChoiceChip";

const EASE = [0.16, 1, 0.3, 1];
const PERSONA = "Andrew";

/** Light inference helpers — Bud never asks for info it can already guess. */
function inferUniversity(text) {
  const t = text.trim();
  return t || "University of Benin";
}
function inferCourse(text) {
  const t = text.trim();
  const lower = t.toLowerCase();
  if (lower.includes("computer") || lower.includes("cs")) return "Computer Science";
  return t || "Computer Science";
}
function inferLevel(text) {
  const t = text.trim();
  return t || "300 Level";
}

export default function OnboardingConversation() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: 0, role: "bud", text: `Hi ${PERSONA}! 👋 Welcome to UNIBUD. What brings you here today?` },
  ]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chips, setChips] = useState(null);
  const profile = useRef({ university: "University of Benin", course: "Computer Science", level: "300 Level" });
  const scrollRef = useRef(null);
  const idRef = useRef(1);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, chips]);

  const pushBud = (text) => setMessages((m) => [...m, { id: idRef.current++, role: "bud", text }]);

  const think = (ms, cb) => {
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      cb();
    }, ms);
  };

  const advance = (userText) => {
    const s = step;
    if (s === 0) {
      think(750, () => pushBud("That's great! Which university do you attend?"));
      setStep(1);
    } else if (s === 1) {
      profile.current.university = inferUniversity(userText);
      think(750, () => pushBud(`Nice, ${profile.current.university}! What are you studying there?`));
      setStep(2);
    } else if (s === 2) {
      profile.current.course = inferCourse(userText);
      const isCS = profile.current.course.toLowerCase().includes("computer");
      think(750, () =>
        pushBud(isCS ? "Computer Science — great field! What level are you in?" : "Interesting! And what level are you currently?")
      );
      setStep(3);
    } else if (s === 3) {
      profile.current.level = inferLevel(userText);
      think(1100, () => {
        pushBud(
          `Perfect. I've identified you as a University Student 🎓 — studying ${profile.current.course}, ${profile.current.level} at ${profile.current.university}. That sound right?`
        );
        setChips(["Yes, that's correct", "Let me adjust that"]);
      });
      setStep(4);
    }
  };

  const send = () => {
    const text = input.trim();
    if (!text || thinking || chips) return;
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text }]);
    setInput("");
    advance(text);
  };

  const onChip = (label) => {
    setMessages((m) => [...m, { id: idRef.current++, role: "user", text: label }]);
    setChips(null);
    if (label.startsWith("Yes")) {
      think(700, () => {
        pushBud("Awesome! Now let's secure your account.");
        setTimeout(() => navigate("/onboarding/security"), 1100);
      });
    } else {
      think(700, () => {
        pushBud("No problem. Let's start over — what brings you here?");
        profile.current = { university: "University of Benin", course: "Computer Science", level: "300 Level" };
        setStep(0);
      });
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      <SparkField count={12} />
      <div className="relative z-10 w-full max-w-[460px] mx-auto flex-1 flex flex-col px-5 safe-area-pt">
        {/* Header */}
        <div className="flex items-center justify-between pt-5 pb-3">
          <button onClick={() => navigate("/welcome")} className="text-[13px] font-medium text-muted-foreground spring-tap">
            Back
          </button>
          <BrandLogo size="sm" />
          <span className="w-10" />
        </div>

        {/* Bud presence */}
        <div className="flex flex-col items-center pt-2 pb-3">
          <MeetBudOrb />
        </div>

        {/* Chat */}
        <div ref={scrollRef} className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar pb-3">
          {messages.map((m) => (
            <ChatBubble key={m.id} role={m.role} text={m.text} />
          ))}
          {thinking && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="self-start glass px-4 py-3 rounded-[18px] rounded-bl-[5px] flex items-center gap-1.5"
            >
              <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="stream-dot w-1.5 h-1.5 rounded-full bg-primary" />
            </motion.div>
          )}
          {chips && (
            <div className="flex flex-wrap gap-2 mt-1">
              {chips.map((label) => (
                <ChoiceChip key={label} label={label} onClick={() => onChip(label)} />
              ))}
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 pb-6 safe-area-pb">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type your reply…"
            autoComplete="off"
            disabled={thinking || !!chips}
            className="flex-1 h-12 px-5 rounded-full bg-muted/50 border border-border text-[15px] text-foreground placeholder:text-muted-foreground/60 backdrop-blur-xl focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25 transition-all disabled:opacity-50"
          />
          <button
            onClick={send}
            disabled={thinking || !!chips || !input.trim()}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground grid place-items-center spring-tap ice-glow disabled:opacity-40"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}