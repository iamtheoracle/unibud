import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const ELEVATION = {
  glass: "glass rounded-[20px]",
  crystal: "crystal-card rounded-[20px]",
  elevated: "crystal-card rounded-[22px] glass-shine",
  flat: "bg-muted/30 rounded-[18px] border border-border/20",
};

const RADIUS = {
  md: "rounded-[16px]",
  lg: "rounded-[20px]",
  xl: "rounded-[24px]",
  "2xl": "rounded-[28px]",
};

/**
 * PremiumCard — the unified card primitive for UNIBUD OS.
 *
 * Structured layout: cover media → header (avatar + title + badge) →
 * body (description + metadata) → footer (actions).
 * Every card across the app shares this skeleton for consistency.
 *
 * Props:
 *  - coverUrl: hero image URL
 *  - coverAspectRatio: "16:9" | "1:1" | "4:3" | "3:2" (default "16:9")
 *  - avatarUrl, avatarSize, avatarRing
 *  - title, subtitle, verified, badge
 *  - tags: string[]
 *  - metadata: { icon, text }[]
 *  - actions: ReactNode (rendered in footer)
 *  - onClick: whole-card tap
 *  - variant: "glass" | "crystal" | "elevated" | "flat"
 *  - elevation: radius key
 *  - delay: stagger delay
 *  - className: extra classes on root
 */
export default function PremiumCard({
  coverUrl,
  coverAspectRatio = "16:9",
  avatarUrl,
  avatarSize = 40,
  avatarRing = false,
  title,
  subtitle,
  verified = false,
  badge,
  tags = [],
  metadata = [],
  actions,
  onClick,
  variant = "crystal",
  radius = "lg",
  delay = 0,
  className = "",
  children,
}) {
  const aspectClass =
    coverAspectRatio === "1:1" ? "aspect-square" :
    coverAspectRatio === "4:3" ? "aspect-[4/3]" :
    coverAspectRatio === "3:2" ? "aspect-[3/2]" :
    "aspect-video";

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className={cn(ELEVATION[variant] || ELEVATION.crystal, RADIUS[radius] || RADIUS.lg, "overflow-hidden", onClick ? "cursor-pointer" : "", "hover-lift", className)}
      onClick={onClick}
    >
      {/* Cover media */}
      {coverUrl && (
        <div className={cn("relative overflow-hidden", aspectClass)}>
          <Image
            src={coverUrl}
            alt={title || ""}
            fittingType="fill"
            className="w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          {badge && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full glass-strong text-[10px] font-bold text-foreground">
              {badge}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header row */}
        {(avatarUrl || title) && (
          <div className="flex items-start gap-3 mb-2">
            {avatarUrl && (
              <div
                className={cn(
                  "flex-shrink-0 rounded-full overflow-hidden bg-muted",
                  avatarRing && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                )}
                style={{ width: avatarSize, height: avatarSize }}
              >
                <Image src={avatarUrl} alt="" fittingType="fill" className="w-full h-full" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {title && (
                  <h3 className="font-heading font-bold text-[15px] text-foreground truncate leading-tight">
                    {title}
                  </h3>
                )}
                {verified && (
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 1.8 3 .2.9 2.8 2.3 1.9-1 2.8 1 2.8-2.3 1.9-.9 2.8-3 .2L12 22l-2.4-1.8-3-.2-.9-2.8L3.4 15.3l1-2.8-1-2.8 2.3-1.9.9-2.8 3-.2L12 2z" />
                    <path d="M9.5 12.5l1.8 1.8 3.5-3.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              {subtitle && (
                <p className="text-[12px] text-muted-foreground truncate mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        )}

        {/* Body — children or description */}
        {children && <div className="text-[13px] text-foreground/80 leading-relaxed mb-3">{children}</div>}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 4).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-muted/60 text-[10px] font-semibold text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadata */}
        {metadata.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {metadata.map((m, i) => (
              <div key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                {m.icon && <m.icon className="w-3 h-3" strokeWidth={2} />}
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer actions */}
        {actions && (
          <div className="flex items-center gap-2 pt-2 border-t border-border/30">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}