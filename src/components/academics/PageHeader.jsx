import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { hapticSelect } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/**
 * PageHeader — unified academic sub-page header.
 * Full-bleed sticky glass bar matching ScreenHeader: circular back button,
 * 20px heading, optional action slot. Used by every academic sub-page
 * rendered inside the AppShell, keeping the whole app on one header language.
 */
export default function PageHeader({ title, action }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-center gap-3 -mx-5 px-5 pt-2 pb-3 mb-4 sticky top-0 z-20 glass-strong border-b border-border/20"
    >
      <button
        onClick={() => { hapticSelect(); navigate("/home"); }}
        aria-label="Back"
        className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap flex-shrink-0 border border-border/30"
      >
        <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
      </button>
      <h1 className="flex-1 min-w-0 font-heading font-bold text-[20px] tracking-tight text-foreground truncate">{title}</h1>
      <div className="flex-shrink-0 text-right">{action}</div>
    </motion.div>
  );
}