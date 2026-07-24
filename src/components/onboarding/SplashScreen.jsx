import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1];
const GOLD = "#C9A24B";

export default function SplashScreen() {
  const [phase, setPhase] = useState(() =>
    sessionStorage.getItem("splashShown") ? "done" : "show"
  );

  useEffect(() => {
    if (phase !== "show") return;
    const t1 = setTimeout(() => setPhase("fade"), 2200);
    const t2 = setTimeout(() => {
      sessionStorage.setItem("splashShown", "true");
      setPhase("done");
    }, 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Subtle gold ambient glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[40%] rounded-full blur-[120px] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${GOLD}14, transparent 70%)` }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* UNIBUD wordmark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease }}
        className="relative z-10 flex flex-col items-center"
      >
        <span
          className="font-heading font-extrabold tracking-[0.18em] text-white text-[34px] leading-none"
          style={{ letterSpacing: "0.18em" }}
        >
          UNIBUD
        </span>
        {/* Gold accent line */}
        <motion.span
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 40, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7, ease }}
          className="mt-4 h-[2px] rounded-full"
          style={{ background: GOLD, boxShadow: `0 0 14px ${GOLD}66` }}
        />
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6, ease }}
          className="mt-4 text-[11px] text-white/70 font-medium tracking-[0.22em] uppercase"
        >
          Learn Better. Grow Together.
        </motion.p>
      </motion.div>
    </motion.div>
  );
}