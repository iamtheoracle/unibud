import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * ParallaxHero — the standardized hero for all UNIBUD detail pages.
 *
 * Features:
 *  - Parallax scroll (image moves slower than content)
 *  - Gradient overlay for readability
 *  - Floating action bar slot
 *  - Back button slot
 *  - Lazy progressive image loading with blur-up
 *
 * Props:
 *  - coverUrl: hero image
 *  - height: CSS height (default 280px)
 *  - onBack: back handler
 *  - actions: ReactNode (floating action bar)
 *  - overlay: boolean — show gradient overlay
 *  - children: overlaid content (title, badges, etc.)
 */
export default function ParallaxHero({
  coverUrl,
  height = 280,
  onBack,
  actions,
  overlay = true,
  children,
  className = "",
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, height * 0.5]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const smoothY = useSpring(y, { stiffness: 200, damping: 30, mass: 0.5 });

  return (
    <div ref={ref} className={cn("relative w-full overflow-hidden", className)} style={{ height }}>
      {/* Parallax background */}
      {coverUrl ? (
        <motion.div style={{ y: smoothY, scale }} className="absolute inset-0 -bottom-[20%]">
          <Image src={coverUrl} alt="" fittingType="fill" className="w-full h-full" />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-muted to-background" />
      )}

      {/* Gradient overlay */}
      {overlay && (
        <motion.div
          style={{ opacity }}
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none"
        />
      )}

      {/* Top bar — back + actions */}
      <div className="absolute top-0 left-0 right-0 z-20 safe-area-pt">
        <div className="flex items-center justify-between px-4 py-3">
          {onBack && (
            <motion.button
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3, ease: EASE }}
              onClick={onBack}
              className="w-9 h-9 rounded-full glass-strong flex items-center justify-center spring-tap"
            >
              <svg className="w-4.5 h-4.5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18 }}>
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
          {actions && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.3, ease: EASE }}
              className="flex items-center gap-2"
            >
              {actions}
            </motion.div>
          )}
        </div>
      </div>

      {/* Overlaid content */}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
          className="absolute bottom-0 left-0 right-0 z-10 p-5"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}