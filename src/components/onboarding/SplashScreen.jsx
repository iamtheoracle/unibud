import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import UnibudMark from "@/components/brand/UnibudMark";

const ease = [0.16, 1, 0.3, 1];
const GOLD = "#C9A24B";

export default function SplashScreen() {
  const [phase, setPhase] = useState(() =>
    sessionStorage.getItem("splashShown") ? "done" : "show"
  );

  useEffect(() => {
    if (phase !== "show") return;
    const t1 = setTimeout(() => setPhase("fade"), 2400);
    const t2 = setTimeout(() => {
      sessionStorage.setItem("splashShown", "true");
      setPhase("done");
    }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Subtle background lighting */}
      <motion.div
        className="absolute top-[20%] left-[10%] w-[60%] h-[40%] rounded-full bg-primary/[0.06] blur-[100px] pointer-events-none"
        animate={{ x: [0, 30, 0], y: [0, 15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Official B&W Logo Lockup */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease }}
        className="relative z-10 flex flex-col items-center"
      >
        <span className="text-foreground inline-flex">
          <UnibudMark className="w-14 h-14" />
        </span>
        <span
          className="font-heading font-extrabold tracking-[0.14em] leading-none mt-3 text-[34px] text-foreground"
        >
          UNIBUD
        </span>
        <span className="font-heading font-medium tracking-[0.22em] uppercase mt-2 text-[10px] text-muted-foreground">
          The Future Starts Together
        </span>
        {/* Premium gold accent line — only place gold is used */}
        <span
          className="mt-3 h-[2px] w-10 rounded-full"
          style={{ background: GOLD, boxShadow: `0 0 14px ${GOLD}66` }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="relative z-10 text-[9px] text-muted-foreground/60 font-medium tracking-wide mt-10"
      >
        A My Realm Product
      </motion.p>
    </motion.div>
  );
}