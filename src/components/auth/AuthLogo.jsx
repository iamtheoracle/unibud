import React from "react";
import { motion } from "framer-motion";
import { Mountain } from "lucide-react";

export default function AuthLogo({ delay = 0, size = "md" }) {
  const dims = size === "lg"
    ? { box: "w-16 h-16 rounded-[20px]", icon: "w-8 h-8", tag: "text-[10px]", title: "text-[28px]", mb: "mb-7" }
    : { box: "w-14 h-14 rounded-[18px]", icon: "w-7 h-7", tag: "text-[9px]", title: "text-[22px]", mb: "mb-6" };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
      className={`flex flex-col items-center ${dims.mb}`}
    >
      <div className={`${dims.box} bg-primary flex items-center justify-center mb-2.5 gold-glow`}>
        <Mountain className={`${dims.icon} text-primary-foreground`} strokeWidth={2.2} />
      </div>
      <p className={`${dims.tag} font-heading font-medium text-muted-foreground tracking-[0.18em] uppercase mb-0.5`}>
        Intelligent University Companion
        </p>
        <h1 className={`${dims.title} font-heading font-extrabold tracking-tight text-foreground leading-none`}>
         UNIBUD
        </h1>
    </motion.div>
  );
}