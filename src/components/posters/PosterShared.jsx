import React from "react";
import { motion } from "framer-motion";
import UnibudMark from "@/components/brand/UnibudMark";
import {
  SPRING, glassEntrance, scaleEntranceDelay,
} from "@/lib/glassPresets";
import { GlassSheen, DynamicLighting } from "@/components/portal/Glass";

// ─── Poster Header ───────────────────────────────────────────────────────────
export function PosterHeader({ number, title, subtitle }) {
  return (
    <motion.div
      {...glassEntrance}
      className="relative overflow-hidden rounded-[32px] glass-strong elevated-shadow p-8 lg:p-12 text-center"
    >
      <DynamicLighting color="primary" secondary="46 70% 55%" />
      <div className="relative flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.bouncy}
          className="w-16 h-16 rounded-[22px] glass border border-primary/20 flex items-center justify-center gold-glow"
        >
          <UnibudMark className="w-8 h-8 text-primary" />
        </motion.div>
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

// ─── Entity Card (for OS, modules, etc.) ─────────────────────────────────────
export function EntityCard({ item, delay = 0 }) {
  return (
    <motion.div
      {...scaleEntranceDelay(delay)}
      whileHover={{ y: -4, transition: SPRING.hover }}
      className="relative overflow-hidden p-5 rounded-[22px] glass border border-border/20"
    >
      <GlassSheen />
      <div className="relative">
        <div className={`w-12 h-12 rounded-[16px] ${item.bg} flex items-center justify-center mb-3`}>
          <item.icon className={`w-5 h-5 ${item.color}`} strokeWidth={2.2} />
        </div>
        <h4 className="font-heading font-bold text-[14px] text-foreground">{item.name}</h4>
        {item.tagline && <p className="text-[10px] font-semibold text-primary mt-0.5">{item.tagline}</p>}
        {item.description && <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{item.description}</p>}
        {item.count && <p className="text-[20px] font-heading font-extrabold text-foreground mt-2">{item.count}</p>}
        {item.modules && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.modules.map((m) => (
              <span key={m} className="px-2 py-0.5 rounded-full bg-muted/40 text-[9px] font-semibold text-muted-foreground">{m}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Flow Step ────────────────────────────────────────────────────────────────
export function FlowStep({ step, isLast }) {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING.gentle, delay: step.step * 0.08 }}
        className="flex items-center gap-2 px-3 py-2 rounded-[14px] glass border border-border/20"
      >
        <div className={`w-7 h-7 rounded-[10px] ${step.bg || "bg-primary/10"} flex items-center justify-center flex-shrink-0`}>
          <step.icon className={`w-3.5 h-3.5 ${step.color || "text-primary"}`} strokeWidth={2.2} />
        </div>
        <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">{step.name}</span>
      </motion.div>
      {!isLast && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ ...SPRING.smooth, delay: step.step * 0.08 + 0.04 }}
          className="w-6 h-px bg-primary/30 flex-shrink-0 origin-left"
        />
      )}
    </div>
  );
}

// ─── Integration Card ─────────────────────────────────────────────────────────
export function IntegrationCard({ item, delay = 0 }) {
  return (
    <motion.div
      {...scaleEntranceDelay(delay)}
      whileHover={{ y: -3, transition: SPRING.hover }}
      className="flex items-center gap-3 p-4 rounded-[18px] glass border border-border/20"
    >
      <div className={`w-10 h-10 rounded-[14px] ${item.bg || "bg-muted/40"} flex items-center justify-center flex-shrink-0`}>
        <item.icon className={`w-4 h-4 ${item.color || "text-foreground"}`} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="font-heading font-semibold text-[13px] text-foreground">{item.name}</h5>
        <p className="text-[10px] text-muted-foreground mt-0.5">{item.description}</p>
      </div>
      <span className="px-2 py-0.5 rounded-full bg-muted/40 text-[9px] font-semibold text-muted-foreground whitespace-nowrap">{item.category}</span>
    </motion.div>
  );
}