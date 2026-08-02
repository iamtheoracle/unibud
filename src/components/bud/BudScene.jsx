import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BudHead from "@/components/bud/BudHead";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Activity configurations — each maps a context key to Bud's mood,
 * cycling messages, and a movement pattern.
 */
const ACTIVITY_CONFIG = {
  companion:          { mood: "idle",     messages: ["Bud is here"], movement: "float" },
  reading:            { mood: "thinking", messages: ["Bud is reading your notes", "Reviewing lecture materials"], movement: "float" },
  typing:             { mood: "thinking", messages: ["Bud is writing", "Composing your summary"], movement: "float" },
  searching:         { mood: "thinking", messages: ["Bud is searching", "Looking through results"], movement: "sweep" },
  scanning:          { mood: "thinking", messages: ["Bud is scanning", "Reading your document"], movement: "float" },
  organizing:        { mood: "idle",     messages: ["Bud is organizing", "Arranging things neatly"], movement: "float" },
  celebrating:       { mood: "happy",    messages: ["Well done!"], movement: "bounce" },
  walking:           { mood: "idle",     messages: ["Bud is on it"], movement: "walk" },
  analyzing:         { mood: "thinking", messages: ["Bud is analyzing", "Processing your data"], movement: "float" },
  generating:        { mood: "thinking", messages: ["Bud is generating", "Creating your content"], movement: "float" },
  delivering:        { mood: "happy",    messages: ["Bud is delivering", "Almost there"], movement: "walk" },
  scheduling:        { mood: "idle",     messages: ["Bud is scheduling", "Pinning events"], movement: "float" },
  study_summary:     { mood: "thinking", messages: ["Bud is reviewing your study materials", "Summarizing lecture notes"], movement: "float" },
  assignment_analysis:{ mood: "thinking", messages: ["Bud is analyzing your assignments", "Checking deadlines"], movement: "float" },
  scholarship_search:{ mood: "thinking", messages: ["Bud is searching for scholarships", "Looking through opportunities"], movement: "sweep" },
  exam_preparation:  { mood: "thinking", messages: ["Bud is preparing exam materials", "Reviewing past questions"], movement: "float" },
  campus_navigation: { mood: "thinking", messages: ["Bud is finding your way", "Unfolding the campus map"], movement: "sweep" },
  payment:           { mood: "thinking", messages: ["Bud is verifying your payment", "Confirming transaction"], movement: "float" },
};

const MOVEMENTS = {
  float:   { animate: { y: [0, -5, 0] },          transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } },
  sweep:   { animate: { x: [-6, 6, -6] },          transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } },
  walk:    { animate: { x: [-12, 12, -12], y: [0, -3, 0, -3, 0] }, transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
  bounce:  { animate: { y: [0, -8, 0] },          transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" } },
};

/* ── Activity props — simple SVG elements below Bud ── */

function ReadingProps() {
  return (
    <g>
      <rect x="60" y="100" width="80" height="55" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" transform="rotate(-2 100 127)" />
      <rect x="65" y="105" width="70" height="48" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
      <line x1="73" y1="118" x2="125" y2="118" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1.5" />
      <line x1="73" y1="127" x2="120" y2="127" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1.5" />
      <line x1="73" y1="136" x2="115" y2="136" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1.5" />
      <line x1="73" y1="145" x2="108" y2="145" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1.5" />
    </g>
  );
}

function TypingProps() {
  return (
    <g>
      <rect x="68" y="100" width="64" height="36" rx="4" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
      <motion.rect x="74" y="112" width="3" height="8" fill="hsl(var(--primary))" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
      <rect x="60" y="136" width="80" height="5" rx="2.5" fill="hsl(var(--muted-foreground) / 0.25)" />
      <motion.circle cx="82" cy="134" r="3" fill="hsl(var(--primary) / 0.5)" animate={{ y: [0, -2, 0] }} transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }} />
      <motion.circle cx="118" cy="134" r="3" fill="hsl(var(--primary) / 0.5)" animate={{ y: [0, -2, 0] }} transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut", delay: 0.17 }} />
    </g>
  );
}

function SearchingProps() {
  return (
    <motion.g animate={{ x: [-8, 8, -8] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
      <circle cx="100" cy="120" r="14" fill="none" stroke="hsl(var(--primary))" strokeWidth="3" />
      <line x1="110" y1="130" x2="120" y2="140" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" />
      <rect x="55" y="110" width="22" height="16" rx="2" fill="hsl(var(--card) / 0.5)" stroke="hsl(var(--border) / 0.3)" strokeWidth="0.5" />
      <rect x="123" y="112" width="22" height="16" rx="2" fill="hsl(var(--card) / 0.5)" stroke="hsl(var(--border) / 0.3)" strokeWidth="0.5" />
    </motion.g>
  );
}

function ScanningProps() {
  return (
    <g>
      <rect x="60" y="100" width="80" height="55" rx="5" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" />
      <line x1="70" y1="115" x2="130" y2="115" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1.5" />
      <line x1="70" y1="125" x2="125" y2="125" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1.5" />
      <line x1="70" y1="135" x2="120" y2="135" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1.5" />
      <motion.line x1="62" y1="105" x2="138" y2="105" stroke="hsl(var(--primary))" strokeWidth="2" animate={{ y1: [105, 150, 105], y2: [105, 150, 105] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
    </g>
  );
}

function OrganizingProps() {
  return (
    <g>
      <motion.rect x="55" y="105" width="22" height="22" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.5" animate={{ y: [105, 101, 105] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
      <motion.rect x="82" y="108" width="22" height="22" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.5" animate={{ y: [108, 112, 108] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} />
      <motion.rect x="109" y="103" width="22" height="22" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.5" animate={{ y: [103, 107, 103] }} transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} />
      <motion.rect x="136" y="106" width="22" height="22" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="0.5" animate={{ y: [106, 102, 106] }} transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut", delay: 0.9 }} />
    </g>
  );
}

function CelebratingProps() {
  return (
    <g>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <motion.circle
            key={i}
            cx={100 + Math.cos(rad) * 38}
            cy={55 + Math.sin(rad) * 38}
            r="2.5"
            fill="hsl(var(--gold))"
            animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
          />
        );
      })}
    </g>
  );
}

function WalkingProps() {
  return (
    <g>
      <motion.rect x="85" y="95" width="30" height="22" rx="3" fill="hsl(var(--card))" stroke="hsl(var(--border))" strokeWidth="1" animate={{ y: [95, 92, 95] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
      <line x1="92" y1="103" x2="108" y2="103" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1" />
      <line x1="92" y1="109" x2="105" y2="109" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1" />
    </g>
  );
}

function renderProps(activity) {
  const map = {
    reading: ReadingProps, study_summary: ReadingProps, exam_preparation: ReadingProps,
    typing: TypingProps, generating: TypingProps, payment: TypingProps,
    searching: SearchingProps, scholarship_search: SearchingProps, campus_navigation: SearchingProps,
    scanning: ScanningProps,
    organizing: OrganizingProps, scheduling: OrganizingProps,
    celebrating: CelebratingProps,
    walking: WalkingProps, delivering: WalkingProps,
  };
  const Comp = map[activity];
  return Comp ? <Comp /> : null;
}

/**
 * BudScene — Bud performing a contextual activity.
 *
 * Replaces every generic spinner with Bud doing something purposeful:
 * reading papers, typing on a laptop, searching with a magnifying glass,
 * scanning documents, organizing sticky notes, walking with a briefing, etc.
 *
 * @param {string}  activity    — context key (reading, typing, searching, scanning, organizing, celebrating, walking, etc.)
 * @param {number}  size        — pixel width of the scene
 * @param {string}  message     — override the cycling message
 * @param {boolean} showMessage — show/hide the text below Bud
 */
export default function BudScene({ activity = "companion", size = 100, message, showMessage = true, className = "" }) {
  const config = ACTIVITY_CONFIG[activity] || ACTIVITY_CONFIG.companion;
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = message ? [message] : config.messages;

  useEffect(() => {
    if (!showMessage || messages.length <= 1) return;
    const timer = setInterval(() => setMsgIndex((i) => (i + 1) % messages.length), 3000);
    return () => clearInterval(timer);
  }, [messages.length, showMessage]);

  const movement = MOVEMENTS[config.movement] || MOVEMENTS.float;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size * 0.9 }}>
        {/* Activity props */}
        <svg viewBox="0 0 200 180" width={size} height={size * 0.9} className="overflow-visible absolute inset-0">
          {renderProps(activity)}
        </svg>

        {/* Bud's floating head */}
        <motion.div
          className="absolute"
          style={{ left: "50%", top: "2%", transform: "translateX(-50%)" }}
          animate={movement.animate}
          transition={movement.transition}
        >
          <BudHead size={size * 0.5} mood={config.mood} glow />
        </motion.div>
      </div>

      {/* Cycling message */}
      {showMessage && (
        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="text-[12px] text-muted-foreground mt-3 text-center max-w-[220px] leading-relaxed"
        >
          {messages[msgIndex]}
        </motion.p>
      )}
    </div>
  );
}