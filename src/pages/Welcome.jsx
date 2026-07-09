import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, ArrowRight, Lock, Globe, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/");
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col relative overflow-hidden">
      {/* Hero image — top section */}
      <div className="relative h-[42vh] flex-shrink-0">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80"
          alt="Students collaborating on campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0D]/40 via-[#0D0D0D]/60 to-[#0D0D0D]" />

        {/* Wordmark overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #DAAF37, #B8941E)' }}>
              <svg className="w-4.5 h-4.5 text-[#0D0D0D]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="font-heading font-extrabold text-[22px] tracking-tight text-white">UNIBUD</h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-[12px] text-[#DAAF37] mt-1 font-medium tracking-wide"
          >
            The Future Starts Together.
          </motion.p>
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 flex flex-col justify-end px-6 pb-8">
        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-5"
        >
          <h2 className="font-heading font-bold text-[26px] leading-[1.2] tracking-tight text-white">
            Your University.<br />
            Your Journey.<br />
            <span className="text-[#DAAF37]">Our Mission.</span>
          </h2>
          <p className="text-[13px] text-[#A3A3A3] mt-3 leading-relaxed">
            UNIBUD is your all-in-one campus companion to help you study smarter, stay organized, connect with others and unlock opportunities.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="space-y-3"
        >
          <button
            onClick={() => navigate("/register")}
            className="w-full h-[54px] rounded-2xl bg-[#DAAF37] text-[#0D0D0D] font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-[#C49E2E] transition-colors premium-shadow"
          >
            <UserPlus className="w-[18px] h-[18px]" strokeWidth={2.2} />
            Create Account
            <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full h-[54px] rounded-2xl bg-transparent text-white font-heading font-semibold text-[15px] border border-[#262626] flex items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-colors"
          >
            <Lock className="w-[18px] h-[18px]" strokeWidth={2} />
            Sign In
            <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full h-[54px] rounded-2xl bg-transparent text-white font-heading font-semibold text-[15px] border border-[#262626] flex items-center justify-center gap-2 hover:bg-[#1A1A1A] transition-colors"
          >
            <Globe className="w-[18px] h-[18px]" strokeWidth={2} />
            Explore as Guest
            <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#737373]" strokeWidth={2} />
            <p className="text-[11px] text-[#A3A3A3]">
              Your data is <span className="text-[#16A34A] font-semibold">safe</span> with us.
            </p>
          </div>
          <p className="text-[10px] text-[#737373] mt-1.5">
            By continuing, you agree to our <span className="underline cursor-pointer">Terms & Privacy Policy.</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}