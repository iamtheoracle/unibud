import React, { useState } from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const ACCENT_GRADIENTS = {
  academic: "from-blue-500/20 to-indigo-600/10",
  orbit: "from-purple-500/20 to-pink-600/10",
  marketplace: "from-green-500/20 to-emerald-600/10",
  events: "from-orange-500/20 to-red-600/10",
  social: "from-pink-500/20 to-purple-600/10",
  default: "from-white/10 to-transparent",
};

/**
 * DynamicHomeCard — immersive dashboard card for the UNIBUD home.
 *
 * Features:
 *  - Optional hero image with gradient overlay
 *  - Animated stat counter on mount
 *  - Accent gradient based on card category
 *  - Context actions slot
 *  - Spring tap feedback
 *  - Staggered entrance
 *
 * Props:
 *  - category: "academic" | "orbit" | "marketplace" | "events" | "social"
 *  - title, subtitle
 *  - imageUrl: optional hero
 *  - stats: { label, value, icon? }[]
 *  - actions: ReactNode
 *  - onClick: whole-card tap
 *  - delay: stagger delay
 *  - className: extra
 */
export default function DynamicHomeCard({
  category = "default",
  title,
  subtitle,
  imageUrl,
  stats = [],
  actions,
  onClick,
  delay = 0,
  className = "",
  children,
}) {
  const gradient = ACCENT_GRADIENTS[category] || ACCENT_GRADIENTS.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden crystal-card rounded-[22px] hover-lift",
        onClick ? "cursor-pointer" : "",
        className
      )}
    >
      {/* Accent gradient background */}
      <div className={cn("absolute inset-0 bg-gradient-to-br pointer-events-none", gradient)} />

      {/* Optional hero image */}
      {imageUrl && (
        <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden rounded-bl-[28px] opacity-30 pointer-events-none">
          <Image src={imageUrl} alt="" fittingType="fill" className="w-full h-full" />
        </div>
      )}

      <div className="relative z-10 p-4">
        {/* Title row */}
        <div className="mb-3">
          <h3 className="font-heading font-bold text-[14px] text-foreground leading-tight">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {/* Stats row */}
        {stats.length > 0 && (
          <div className="grid grid-flow-col auto-cols-fr gap-2 mb-3">
            {stats.map((stat, i) => (
              <StatItem key={i} stat={stat} delay={delay + 0.1 + i * 0.08} />
            ))}
          </div>
        )}

        {/* Children content */}
        {children && <div className="mb-3">{children}</div>}

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 pt-2.5 card-separator">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatItem({ stat, delay }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof stat.value === "number" ? stat.value : null;

  React.useEffect(() => {
    if (numericValue === null) return;
    let frame;
    const duration = 600;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(numericValue * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [numericValue]);

  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: EASE }}
      className="flex flex-col items-center justify-center py-2 px-1 rounded-[12px] glass"
    >
      {Icon && <Icon className="w-3 h-3 text-primary mb-1" strokeWidth={2.2} />}
      <span className="font-heading font-extrabold text-[18px] text-foreground leading-none tabular-nums">
        {numericValue !== null ? displayValue : stat.value}
      </span>
      {stat.label && (
        <span className="text-[9px] text-muted-foreground font-medium mt-0.5 text-center leading-tight">
          {stat.label}
        </span>
      )}
    </motion.div>
  );
}