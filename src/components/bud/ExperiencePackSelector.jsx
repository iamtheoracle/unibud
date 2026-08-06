import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, User, Briefcase, Palette, Building2,
  Code2, HeartPulse, Wallet, Plane, Check, Layers, ChevronDown,
} from "lucide-react";

const ICONS = {
  GraduationCap, User, Briefcase, Palette, Building2,
  Code2, HeartPulse, Wallet, Plane,
};

/**
 * ExperiencePackSelector — Compact pill showing active packs.
 * Tap to open a sheet for enabling/disabling experience packs.
 *
 * Packs adapt Bud's knowledge and tools to different life contexts.
 * Multiple packs can be active simultaneously.
 */
export default function ExperiencePackSelector({ activePacks, onTogglePack, disabled }) {
  const [expanded, setExpanded] = useState(false);

  const packCount = activePacks.length;
  const primaryIcon = ICONS["GraduationCap"]; // Student is default primary
  const primaryPack = activePacks[0] || "student";

  // Find the icon for the primary pack
  const packIcons = {
    student: "GraduationCap",
    adult: "User",
    professional: "Briefcase",
    creator: "Palette",
    business: "Building2",
    developer: "Code2",
    health: "HeartPulse",
    finance: "Wallet",
    travel: "Plane",
  };
  const PrimaryIcon = ICONS[packIcons[primaryPack]] || GraduationCap;

  const ALL_PACKS = [
    { id: "student", name: "Student", icon: "GraduationCap", color: "text-primary", bg: "bg-primary/10", description: "Academic life & campus" },
    { id: "adult", name: "Adult", icon: "User", color: "text-purple-500", bg: "bg-purple-500/10", description: "Daily life management" },
    { id: "professional", name: "Professional", icon: "Briefcase", color: "text-blue-500", bg: "bg-blue-500/10", description: "Career & networking" },
    { id: "creator", name: "Creator", icon: "Palette", color: "text-pink-500", bg: "bg-pink-500/10", description: "Content & branding" },
    { id: "business", name: "Business", icon: "Building2", color: "text-emerald-500", bg: "bg-emerald-500/10", description: "Entrepreneurship" },
    { id: "developer", name: "Developer", icon: "Code2", color: "text-green-500", bg: "bg-green-500/10", description: "Programming & tech" },
    { id: "health", name: "Health", icon: "HeartPulse", color: "text-red-500", bg: "bg-red-500/10", description: "Wellness & fitness" },
    { id: "finance", name: "Finance", icon: "Wallet", color: "text-amber-500", bg: "bg-amber-500/10", description: "Budgeting & investing" },
    { id: "travel", name: "Travel", icon: "Plane", color: "text-cyan-500", bg: "bg-cyan-500/10", description: "Planning & destinations" },
  ];

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => !disabled && setExpanded(!expanded)}
        disabled={disabled}
        className="flex items-center gap-1 px-2 py-1.5 rounded-[10px] bg-card border border-border/30 spring-tap disabled:opacity-50"
        title="Experience Packs"
      >
        <Layers className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
        <span className="text-[10px] font-semibold text-foreground">{packCount}</span>
        <ChevronDown className={`w-2.5 h-2.5 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2} />
      </button>

      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full right-0 mt-1.5 z-50 w-[240px] max-h-[320px] overflow-y-auto no-scrollbar glass-strong rounded-[16px] p-1.5 soft-shadow"
            >
              <div className="px-2.5 py-1.5 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Experience Packs</p>
                <p className="text-[9px] text-muted-foreground/70 mt-0.5">Adapt Bud to your life context</p>
              </div>

              {ALL_PACKS.map((pack) => {
                const Icon = ICONS[pack.icon];
                const isActive = activePacks.includes(pack.id);
                return (
                  <button
                    key={pack.id}
                    onClick={() => onTogglePack(pack.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[12px] spring-tap transition-colors text-left ${
                      isActive ? pack.bg : "hover:bg-muted/40"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-[10px] ${pack.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${pack.color}`} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold ${isActive ? pack.color : "text-foreground"}`}>{pack.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{pack.description}</p>
                    </div>
                    {isActive && (
                      <div className={`w-5 h-5 rounded-full ${pack.bg} flex items-center justify-center flex-shrink-0`}>
                        <Check className={`w-3 h-3 ${pack.color}`} strokeWidth={2.5} />
                      </div>
                    )}
                  </button>
                );
              })}

              <div className="px-2.5 py-1.5 mt-1 border-t border-border/20">
                <p className="text-[9px] text-muted-foreground">
                  Multiple packs combine Bud's knowledge. Student is always recommended.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}