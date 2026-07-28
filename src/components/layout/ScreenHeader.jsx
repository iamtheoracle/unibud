import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { hapticSelect } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ScreenHeader — the unified sticky title bar for every UNIBUD surface.
 * Full-bleed glass bar (-mx-5 px-5), 20px heading, 12px subtitle, optional
 * back button + actions slot. sticky by default; pass sticky={false} when a
 * sub-control (e.g. a tab rail) needs to be the sticky element instead.
 */
export default function ScreenHeader({ title, subtitle, back, backTo, actions, sticky = true, className = "" }) {
  const navigate = useNavigate();
  const onBack = () => {
    hapticSelect();
    if (backTo) navigate(backTo);
    else navigate(-1);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`flex items-center gap-3 -mx-5 px-5 pt-2 pb-3 ${sticky ? "sticky top-0 z-20 glass-strong border-b border-border/20" : "border-b border-border/15"} ${className}`}
    >
      {back && (
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap flex-shrink-0 border border-border/30"
        >
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <h1 className="font-heading font-bold text-[20px] tracking-tight text-foreground truncate leading-tight">
            {title}
          </h1>
        )}
        {subtitle && <div className="text-[12px] text-muted-foreground font-medium truncate">{subtitle}</div>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </motion.div>
  );
}