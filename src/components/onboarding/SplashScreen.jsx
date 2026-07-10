import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import UnibudLogo from "@/components/brand/UnibudLogo";

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

      {/* Official Logo */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10"
      >
        <UnibudLogo variant="gold" size="xl" showLine />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="relative z-10 text-[13px] text-primary font-heading font-semibold mt-4"
      >
        The Future Starts Together.
      </motion.p>

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