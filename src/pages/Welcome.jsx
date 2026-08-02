import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

const BG_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/73b30d148_generated_image.png";
const LOGO_URL = "https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/7de0fdf43_6C287179-9048-4978-AA9F-F2B45C76A69A.png";

/**
 * Welcome — premium campus sunset landing with UNIBUD varsity branding.
 * Full-bleed background photo, gradient overlay, mountain logo,
 * welcome headline, and Sign Up / Log In CTAs.
 */
export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/home", { replace: true });
    });
  }, [navigate]);

  return (
    <div className="fixed inset-0 w-full overflow-hidden flex flex-col items-center justify-between bg-black safe-area-pt safe-area-pb">
      {/* Background photo */}
      <div className="absolute inset-0 z-0">
        <Image src={BG_URL} alt="" fittingType="fill" className="w-full h-full object-cover" />
      </div>

      {/* Gradient overlay for text legibility */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: "linear-gradient(180deg, rgba(5,8,13,0.78) 0%, rgba(5,8,13,0.42) 35%, rgba(5,8,13,0.72) 65%, rgba(5,8,13,0.96) 100%)" }}
      />

      {/* Top branding */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="relative z-10 flex flex-col items-center pt-[14vh] px-8 text-center w-full max-w-[360px]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
          className="w-[200px] mb-2"
        >
          <Image src={LOGO_URL} alt="UNIBUD" fittingType="fit" className="w-full h-auto" />
        </motion.div>
      </motion.div>

      {/* Center welcome text */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
        className="relative z-10 flex flex-col items-center px-8 text-center w-full max-w-[340px]"
      >
        <h1 className="font-heading font-bold text-[28px] leading-tight text-white tracking-tight">
          Welcome to UNIBUD
        </h1>
        <p className="mt-2 text-[15px] text-white/70 font-body leading-relaxed max-w-[280px]">
          Empowering students to reach their fullest potential.
        </p>
      </motion.div>

      {/* Bottom CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
        className="relative z-10 w-full max-w-[340px] px-8 pb-[4vh] flex flex-col gap-3"
      >
        <button
          onClick={() => navigate("/register")}
          className="w-full h-[54px] rounded-2xl font-heading font-bold text-[16px] spring-tap ice-glow text-white"
          style={{ backgroundColor: "#1A3A6B" }}
        >
          Sign Up
        </button>
        <button
          onClick={() => navigate("/login")}
          className="w-full h-[54px] rounded-2xl font-heading font-bold text-[16px] spring-tap text-white"
          style={{ backgroundColor: "transparent", border: "1.5px solid rgba(255,255,255,0.3)" }}
        >
          Log In
        </button>
      </motion.div>
    </div>
  );
}