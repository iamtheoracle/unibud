import React from "react";
import { motion } from "framer-motion";
import { SPRING, glassEntrance } from "@/lib/glassPresets";
import { GlassSheen } from "@/components/portal/Glass";

// ─── Poster Hero ─────────────────────────────────────────────────────────────
export function PosterHero({ number, title, subtitle, children }) {
  return (
    <motion.div
      {...glassEntrance}
      className="relative overflow-hidden rounded-[32px] glass-strong elevated-shadow p-8 lg:p-12"
    >
      <GlassSheen />
      <div className="relative flex flex-col items-center gap-4 text-center">
        {children}
        <div>
          <p className="text-[11px] font-bold text-primary uppercase tracking-[0.3em] mb-2">Poster {number}</p>
          <h1 className="font-heading font-extrabold text-[28px] lg:text-[36px] tracking-tight text-foreground">{title}</h1>
          <p className="text-[14px] text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Poster Section ──────────────────────────────────────────────────────────
export function PosterSection({ title, description, children, delay = 0 }) {
  return (
    <motion.div
      {...glassEntrance}
      transition={{ ...SPRING.smooth, delay }}
      className="relative overflow-hidden rounded-[28px] glass border border-border/20 elevated-shadow"
    >
      <GlassSheen />
      {(title || description) && (
        <div className="px-6 py-5 border-b border-border/20">
          {title && <h2 className="font-heading font-bold text-[18px] text-foreground">{title}</h2>}
          {description && <p className="text-[12px] text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── Module Card (centered, for grids) ───────────────────────────────────────
export function ModuleCard({ icon: Icon, name, color = "text-primary", bg = "bg-primary/10", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING.smooth, delay }}
      whileHover={{ y: -3, transition: SPRING.hover }}
      className="relative overflow-hidden flex flex-col items-center p-4 rounded-[20px] glass border border-border/20 text-center"
    >
      <GlassSheen />
      <div className={`w-10 h-10 rounded-[14px] ${bg} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} strokeWidth={2.2} />
      </div>
      <h4 className="font-heading font-semibold text-[12px] text-foreground">{name}</h4>
    </motion.div>
  );
}

// ─── Flow Chip (horizontal flow step) ────────────────────────────────────────
export function FlowChip({ icon: Icon, name, color = "text-primary", bg = "bg-primary/10", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ...SPRING.gentle, delay }}
      className="flex items-center gap-2 px-3 py-2 rounded-[14px] glass border border-border/20 whitespace-nowrap flex-shrink-0"
    >
      <div className={`w-7 h-7 rounded-[10px] ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} strokeWidth={2.2} />
      </div>
      <span className="text-[12px] font-semibold text-foreground">{name}</span>
    </motion.div>
  );
}

// ─── Connector Arrow ─────────────────────────────────────────────────────────
export function ConnectorArrow({ delay = 0 }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ ...SPRING.smooth, delay }}
      className="w-6 h-px bg-primary/30 flex-shrink-0 origin-left"
    />
  );
}