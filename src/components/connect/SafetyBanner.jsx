import React from "react";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function SafetyBanner() {
  const navigate = useNavigate();

  return (
    <div className="px-4 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-gradient-to-br from-success to-success/80 rounded-[20px] p-4 flex items-center gap-3.5 elevated-shadow"
      >
        <div className="w-11 h-11 rounded-[16px] bg-white/15 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <p className="font-heading font-semibold text-[13px] text-white">Stay Safe on Connect</p>
          <p className="text-[11px] text-white/70 mt-0.5">Report, block, or review community guidelines anytime.</p>
        </div>
        <button onClick={() => navigate("/student-support")} className="px-3.5 py-2 rounded-full bg-white/15 text-white text-[11px] font-semibold flex-shrink-0 spring-tap">Learn</button>
      </motion.div>
    </div>
  );
}