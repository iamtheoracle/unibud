import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

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
    }, 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-[#0D0D0D] flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-[0_8px_40px_rgba(218,175,55,0.3)]"
        style={{ background: 'linear-gradient(135deg, #DAAF37, #B8941E)' }}
      >
        <svg className="w-10 h-10 text-[#0D0D0D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="font-heading font-extrabold text-[24px] tracking-tight text-white mt-6"
      >
        UNIBUD
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="text-[13px] text-[#DAAF37] mt-1.5 font-medium"
      >
        The Future Starts Together.
      </motion.p>
    </motion.div>
  );
}