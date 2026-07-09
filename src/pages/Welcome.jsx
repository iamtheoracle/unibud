import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/");
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F5F7] to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#28A745] to-[#1a7a35] flex items-center justify-center shadow-[0_8px_32px_rgba(40,167,69,0.3)] mb-6"
        >
          <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-heading font-extrabold text-[28px] tracking-tight text-[#1A1A1A]"
        >
          Welcome to UNIBUD
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-[14px] text-[#86868B] mt-2 max-w-[280px] leading-relaxed"
        >
          The future starts together. Your university journey, all in one place.
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="px-6 pb-10 space-y-3"
      >
        <button
          onClick={() => navigate("/register")}
          className="w-full py-4 rounded-2xl bg-[#28A745] text-white font-heading font-semibold text-[15px] shadow-sm flex items-center justify-center gap-1.5 hover:bg-[#1a7a35] transition-colors"
        >
          Create Account
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-4 rounded-2xl bg-white text-[#1A1A1A] font-heading font-semibold text-[15px] border border-black/[0.08] shadow-sm flex items-center justify-center gap-1.5 hover:bg-[#F5F5F7] transition-colors"
        >
          Sign In
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 text-[#86868B] text-[13px] font-medium hover:text-[#1A1A1A] transition-colors"
        >
          Explore as Guest (limited)
        </button>
      </motion.div>
    </div>
  );
}