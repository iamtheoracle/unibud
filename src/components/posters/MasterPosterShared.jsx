import React from "react";
import { motion } from "framer-motion";
import UnibudMark from "@/components/brand/UnibudMark";
import BudOrb from "@/components/brand/BudOrb";
import { Crown } from "lucide-react";
import { SPRING, glassEntrance } from "@/lib/glassPresets";

// ─── Premium Glass Sheen ────────────────────────────────────────────────────
function GlassSheen() {
  return (
    <>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.05), transparent)" }}
      />
    </>
  );
}

// ─── Master Hero ───────────────────────────────────────────────────────────
export function MasterHero() {
  return (
    <motion.div
      {...glassEntrance}
      className="relative overflow-hidden rounded-[40px] glass-strong p-8 lg:p-14 text-center"
    >
      <GlassSheen />
      <div className="relative flex flex-col items-center gap-4">
        {/* UNIBUD Logo — gold for branding */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={SPRING.bouncy}
          className="flex items-center gap-2.5"
        >
          <UnibudMark className="w-10 h-10 text-gold" />
          <span className="font-heading font-extrabold text-[28px] tracking-tight text-foreground">UNIBUD</span>
        </motion.div>
        <p className="text-[12px] font-semibold text-muted-foreground uppercase tracking-[0.25em]">Global Education Operating System</p>

        {/* Connector */}
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />

        {/* Bud Orb — animated My Realm Orbit */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING.bouncy, delay: 0.1 }}
          className="flex flex-col items-center gap-1.5"
        >
          <BudOrb className="w-16 h-16 text-primary emerald-glow" />
          <p className="font-heading font-bold text-[15px] text-primary">Bud</p>
          <p className="text-[10px] text-muted-foreground -mt-0.5">My Realm Orbit</p>
        </motion.div>

        {/* Connector */}
        <div className="w-px h-6 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

        {/* Oracle Core — invisible intelligence */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING.bouncy, delay: 0.2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-[18px] glass border border-primary/20"
        >
          <Crown className="w-5 h-5 text-primary" strokeWidth={2.2} />
          <span className="font-heading font-bold text-[13px] text-foreground">Oracle Core</span>
          <span className="text-[10px] text-muted-foreground ml-1">— Invisible Intelligence</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Master Section ─────────────────────────────────────────────────────────
export function MasterSection({ title, description, items, columns = 5, delay = 0 }) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6",
    7: "grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7",
  };
  return (
    <motion.div
      {...glassEntrance}
      transition={{ ...SPRING.smooth, delay }}
      className="relative overflow-hidden rounded-[32px] glass-strong"
    >
      <GlassSheen />
      {(title || description) && (
        <div className="px-6 lg:px-8 py-5 border-b border-border/20">
          {title && <h2 className="font-heading font-bold text-[18px] text-foreground">{title}</h2>}
          {description && <p className="text-[12px] text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      <div className={`grid ${gridCols[columns] || gridCols[5]} gap-3 p-6`}>
        {items.map((item, i) => (
          <MasterModuleCard key={item.name} {...item} delay={delay + 0.04 + i * 0.02} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Premium Module Card ────────────────────────────────────────────────────
function MasterModuleCard({ icon: Icon, name, color = "text-primary", bg = "bg-primary/10", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING.smooth, delay }}
      whileHover={{ y: -4, transition: SPRING.hover }}
      className="relative overflow-hidden flex flex-col items-center p-3.5 rounded-[18px] glass border border-border/15 text-center"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className={`w-9 h-9 rounded-[13px] ${bg} flex items-center justify-center mb-2`}>
        <Icon className={`w-4 h-4 ${color}`} strokeWidth={2.2} />
      </div>
      <h4 className="font-heading font-semibold text-[11px] text-foreground leading-tight">{name}</h4>
    </motion.div>
  );
}

// ─── Section Connector ──────────────────────────────────────────────────────
export function SectionConnector() {
  return (
    <div className="flex justify-center py-0.5">
      <div className="w-px h-6 bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />
    </div>
  );
}

// ─── Bud Capabilities Section (Bud at center) ──────────────────────────────
export function BudCapabilitiesSection({ items, delay = 0 }) {
  return (
    <motion.div
      {...glassEntrance}
      transition={{ ...SPRING.smooth, delay }}
      className="relative overflow-hidden rounded-[32px] glass-strong"
    >
      <GlassSheen />
      <div className="px-6 lg:px-8 py-5 border-b border-border/20">
        <h2 className="font-heading font-bold text-[18px] text-foreground">Bud AI Capabilities</h2>
        <p className="text-[12px] text-muted-foreground mt-1">Seventeen specialist capabilities orbiting Bud</p>
      </div>
      <div className="p-6">
        {/* Bud at center */}
        <div className="flex flex-col items-center mb-6">
          <BudOrb className="w-20 h-20 text-primary emerald-glow" />
          <p className="font-heading font-bold text-[14px] text-primary mt-2">Bud</p>
          <p className="text-[10px] text-muted-foreground">My Realm Orbit</p>
        </div>
        {/* Capabilities grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {items.map((item, i) => (
            <MasterModuleCard key={item.name} {...item} delay={delay + 0.04 + i * 0.02} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── User Journey Section ──────────────────────────────────────────────────
export function JourneySection({ items, delay = 0 }) {
  return (
    <motion.div
      {...glassEntrance}
      transition={{ ...SPRING.smooth, delay }}
      className="relative overflow-hidden rounded-[32px] glass-strong"
    >
      <GlassSheen />
      <div className="px-6 lg:px-8 py-5 border-b border-border/20">
        <h2 className="font-heading font-bold text-[18px] text-foreground">User Journey</h2>
        <p className="text-[12px] text-muted-foreground mt-1">Complete workflow from Splash to Alumni — Oracle coordinates everything</p>
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-1.5">
          {items.map((item, i) => (
            <React.Fragment key={item.name}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING.gentle, delay: delay + 0.04 + i * 0.03 }}
                className="flex items-center gap-2 px-3 py-2 rounded-[14px] glass border border-border/15 whitespace-nowrap"
              >
                <div className={`w-7 h-7 rounded-[10px] ${item.bg} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-3.5 h-3.5 ${item.color}`} strokeWidth={2.2} />
                </div>
                <span className="text-[12px] font-semibold text-foreground">{item.name}</span>
              </motion.div>
              {i < items.length - 1 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ ...SPRING.smooth, delay: delay + 0.04 + i * 0.03 + 0.02 }}
                  className="w-4 h-px bg-primary/30 flex-shrink-0 origin-left"
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </motion.div>
  );
}