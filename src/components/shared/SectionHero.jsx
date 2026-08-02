import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Image } from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * SectionHero — large immersive hero for the top of major hub screens
 * (BudHome, SocialHub, Marketplace, Events, AcademicHub).
 *
 * Features:
 *  - Parallax background image
 *  - Gradient overlay for readability
 *  - Animated entrance for content
 *  - Slot for greeting/title, subtitle, and action chips
 *  - Optional ambient orb glow
 *
 * Props:
 *  - backgroundImage: hero image URL
 *  - greeting: short greeting text (e.g. "Good evening")
 *  - title: main heading
 *  - subtitle: supporting text
 *  - children: extra content (stats, briefing, etc.)
 *  - actions: ReactNode (floating action chips)
 *  - height: CSS height (default 200)
 *  - accentColor: CSS color for the glow (default primary)
 */
export default function SectionHero({
  backgroundImage,
  greeting,
  title,
  subtitle,
  children,
  actions,
  height = 200,
  accentColor,
}) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div ref={ref} className="relative w-full overflow-hidden" style={{ height }}>
      {/* Parallax background */}
      {backgroundImage ? (
        <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0 -bottom-[20%]">
          <Image src={backgroundImage} alt="" fittingType="fill" className="w-full h-full" />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-muted to-background" />
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-background pointer-events-none" />

      {/* Ambient glow */}
      {accentColor && (
        <div
          className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-3/4 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: accentColor }}
        />
      )}

      {/* Content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="absolute inset-0 flex flex-col justify-end p-5 safe-area-pt"
      >
        {greeting && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
            className="text-[12px] font-semibold text-white/60 uppercase tracking-wider mb-1"
          >
            {greeting}
          </motion.p>
        )}
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: EASE }}
            className="font-heading font-extrabold text-[26px] text-white leading-tight tracking-tight drop-shadow-lg mb-1"
          >
            {title}
          </motion.h1>
        )}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: EASE }}
            className="text-[13px] text-white/70 leading-relaxed mb-3 max-w-[90%]"
          >
            {subtitle}
          </motion.p>
        )}
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: EASE }}
          >
            {children}
          </motion.div>
        )}
        {actions && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
            className="flex items-center gap-2 mt-3"
          >
            {actions}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}