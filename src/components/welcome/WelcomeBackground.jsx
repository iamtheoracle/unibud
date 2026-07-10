import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Users, Trophy } from "lucide-react";

/**
 * Subtle decorative background for the Welcome screen.
 * Soft gradient orbs + low-opacity university-life icons that drift gently.
 * Purely decorative — aria-hidden, pointer-events-none.
 */
const floatingIcons = [
  { Icon: GraduationCap, position: "top-[7%] right-[7%]", size: "w-16 h-16 md:w-20 md:h-20", delay: 0, duration: 9 },
  { Icon: BookOpen, position: "bottom-[16%] left-[5%]", size: "w-12 h-12 md:w-14 md:h-14", delay: 2.5, duration: 11 },
  { Icon: Users, position: "top-[38%] left-[3%]", size: "w-10 h-10 md:w-12 md:h-12", delay: 4, duration: 10 },
  { Icon: Trophy, position: "bottom-[26%] right-[4%]", size: "w-11 h-11 md:w-13 md:h-13", delay: 1.2, duration: 12 },
];

export default function WelcomeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Soft gradient orbs */}
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[70%] h-[45%] rounded-full bg-primary/[0.06] blur-[100px]"
        animate={{ x: [0, 40, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[40%] rounded-full bg-primary/[0.04] blur-[100px]"
        animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating university-life line icons */}
      {floatingIcons.map(({ Icon, position, size, delay, duration }, i) => (
        <motion.div
          key={i}
          className={`absolute ${position} ${size} text-primary opacity-[0.06]`}
          animate={{ y: [0, -14, 0], rotate: [0, 4, 0] }}
          transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <Icon strokeWidth={1.5} className="w-full h-full" />
        </motion.div>
      ))}
    </div>
  );
}