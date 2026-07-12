import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Lock, ChevronDown, Building2, UserRound, ShieldCheck, Globe } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import WelcomeBackground from "@/components/welcome/WelcomeBackground";
import WelcomeLogo from "@/components/welcome/WelcomeLogo";
import WelcomeLoader from "@/components/welcome/WelcomeLoader";
import IntroCarousel from "@/components/onboarding/IntroCarousel";
import { useWelcomeBackground } from "@/hooks/useWelcomeBackground";
import { hapticTap, hapticImpact } from "@/lib/haptics";
import { ACCREDITED_INSTITUTIONS } from "@/data/welcomeBackgrounds";

const ease = [0.16, 1, 0.3, 1];
const GOLD = "#C9A24B";

const TRUST_PILLARS = ["Secure", "Private", "Reliable", "Modern"];

export default function Welcome() {
  const navigate = useNavigate();
  const { enterDemoMode } = useDemoMode();
  const reduceMotion = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem("introSeen"));
  const [showStaffOptions, setShowStaffOptions] = useState(false);

  const { background, loaded, tone } = useWelcomeBackground();

  // Text + logo colour adapts to the background for maximum readability.
  const onDark = tone !== "light";
  const textColor = onDark ? "#FFFFFF" : "#0E1111";
  const subColor = onDark ? "rgba(255,255,255,0.80)" : "rgba(14,17,17,0.66)";

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/");
    });
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGuest = () => {
    hapticImpact();
    enterDemoMode();
    navigate("/");
  };

  const tap = (fn) => () => {
    hapticTap();
    fn?.();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative overflow-hidden" style={{ background: "#0A0E0E" }}>
      <WelcomeBackground background={background} loaded={loaded} reduceMotion={reduceMotion} />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <WelcomeLoader key="loader" />
        ) : showIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease }}
            className="flex-1 flex flex-col relative z-10 min-h-[100dvh]"
            style={{ background: "hsl(var(--background))" }}
          >
            <IntroCarousel
              onComplete={() => {
                sessionStorage.setItem("introSeen", "true");
                navigate("/onboarding/language-region");
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease }}
            className="flex-1 flex flex-col relative z-10"
          >
            {/* === Center: Logo + Headline + Description === */}
            <div
              className="flex-1 flex flex-col items-center justify-center px-6"
              style={{ paddingTop: "max(env(safe-area-inset-top), 2.5rem)" }}
            >
              <div className="max-w-md mx-auto w-full flex flex-col items-center">
                {/* Official Logo — auto black/white per background */}
                <WelcomeLogo tone={onDark ? "white" : "black"} size="xl" />

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.7, ease }}
                  className="font-heading font-extrabold text-[27px] md:text-[31px] text-center mt-8 tracking-tight leading-tight"
                  style={{ color: textColor }}
                >
                  Your University Companion
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease }}
                  className="text-[14px] md:text-[15px] text-center mt-3 max-w-[320px] leading-relaxed"
                  style={{ color: subColor }}
                >
                  Everything you need for university life in one place. Learn, connect, collaborate and succeed.
                </motion.p>
              </div>
            </div>

            {/* === Bottom: Actions + Trust === */}
            <div
              className="px-5 relative z-10"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
            >
              <div className="max-w-md mx-auto w-full">
                {/* Glass action panel */}
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.7, ease }}
                  className="rounded-[28px] p-5"
                  style={{
                    background: onDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.72)",
                    backdropFilter: "blur(28px) saturate(1.2)",
                    WebkitBackdropFilter: "blur(28px) saturate(1.2)",
                    border: `1px solid ${onDark ? "rgba(255,255,255,0.18)" : "rgba(14,17,17,0.10)"}`,
                    boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Primary: Create Account — black pill */}
                  <motion.button
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    onClick={tap(() => navigate("/register"))}
                    className="w-full h-[56px] rounded-full flex items-center justify-center gap-2 font-heading font-semibold text-[16px] spring-tap"
                    style={{
                      background: "#0E1111",
                      color: "#FFFFFF",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.40)",
                    }}
                    aria-label="Create your account"
                  >
                    Create Account
                    <ArrowRight className="w-5 h-5" strokeWidth={2.2} />
                  </motion.button>

                  {/* Secondary: Sign In — white glass pill */}
                  <motion.button
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    onClick={tap(() => navigate("/login"))}
                    className="w-full h-[56px] rounded-full flex items-center justify-center gap-2 font-heading font-semibold text-[16px] mt-2.5 spring-tap"
                    style={{
                      background: "rgba(255,255,255,0.82)",
                      color: "#0E1111",
                      border: "1px solid rgba(14,17,17,0.10)",
                    }}
                    aria-label="Sign in — returning users"
                  >
                    <Lock className="w-[18px] h-[18px]" strokeWidth={2} style={{ color: "#0E1111" }} />
                    Sign In
                  </motion.button>

                  {/* Text button: Continue as Guest */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    onClick={tap(handleGuest)}
                    className="w-full mt-3 h-11 flex items-center justify-center gap-1.5 text-[13px] font-medium spring-tap"
                    style={{ color: subColor }}
                    aria-label="Continue as guest"
                  >
                    <UserRound className="w-3.5 h-3.5" strokeWidth={2} />
                    Continue as Guest
                  </motion.button>

                  {/* Language & Region */}
                  <Link
                    to="/onboarding/language-region"
                    onClick={() => hapticTap()}
                    className="w-full mt-1.5 h-9 flex items-center justify-center gap-1.5 text-[12px] font-medium spring-tap"
                    style={{ color: subColor }}
                  >
                    <Globe className="w-3.5 h-3.5" strokeWidth={2} />
                    Language & Region
                  </Link>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px" style={{ background: onDark ? "rgba(255,255,255,0.14)" : "rgba(14,17,17,0.10)" }} />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: subColor }}>Staff</span>
                    <div className="flex-1 h-px" style={{ background: onDark ? "rgba(255,255,255,0.14)" : "rgba(14,17,17,0.10)" }} />
                  </div>

                  {/* Staff + Forgot links */}
                  <div className="flex items-center justify-center gap-3.5">
                    <button
                      onClick={tap(() => {
                        hapticTap();
                        setShowStaffOptions((s) => !s);
                      })}
                      className="text-[12px] font-medium flex items-center gap-1 transition-colors"
                      style={{ color: subColor }}
                    >
                      <Building2 className="w-3 h-3" strokeWidth={2} />
                      Staff
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${showStaffOptions ? "rotate-180" : ""}`}
                      />
                    </button>
                    <span className="w-1 h-1 rounded-full" style={{ background: onDark ? "rgba(255,255,255,0.25)" : "rgba(14,17,17,0.18)" }} />
                    <Link
                      to="/forgot-password"
                      className="text-[12px] font-medium flex items-center gap-1 transition-colors"
                      style={{ color: subColor }}
                    >
                      Forgot Password
                    </Link>
                  </div>

                  {/* Staff options (expandable) */}
                  <AnimatePresence>
                    {showStaffOptions && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease }}
                        className="overflow-hidden"
                      >
                        <button
                          onClick={tap(() => navigate("/university-staff-login"))}
                          className="w-full mt-3 h-[46px] rounded-full flex items-center justify-center gap-2 font-heading font-medium text-[14px] spring-tap"
                          style={{
                            background: onDark ? "rgba(255,255,255,0.08)" : "rgba(14,17,17,0.05)",
                            border: `1px solid ${onDark ? "rgba(255,255,255,0.14)" : "rgba(14,17,17,0.10)"}`,
                            color: textColor,
                          }}
                        >
                          <Building2 className="w-4 h-4" strokeWidth={2} />
                          University Staff Sign In
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Trust section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.85, duration: 0.7, ease }}
                  className="mt-6 text-center"
                >
                  <p className="text-[12.5px] font-medium" style={{ color: onDark ? "rgba(255,255,255,0.88)" : "rgba(14,17,17,0.72)" }}>
                    Trusted by students worldwide.
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: subColor }}>
                    Built for every student journey.
                  </p>

                  {/* Trust pillars */}
                  <div className="flex items-center justify-center gap-1.5 mt-3 flex-wrap">
                    {TRUST_PILLARS.map((p, i) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: subColor }}
                      >
                        {i > 0 && <span style={{ color: GOLD }}>·</span>}
                        <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.2} style={{ color: GOLD }} />
                        {p}
                      </span>
                    ))}
                  </div>

                  {/* Accredited institutions — small monochrome marks */}
                  <div className="flex items-center justify-center gap-2.5 mt-4 flex-wrap opacity-80">
                    {ACCREDITED_INSTITUTIONS.map((name) => (
                      <span
                        key={name}
                        className="text-[10px] font-heading font-semibold tracking-[0.08em] px-2 py-0.5 rounded-md"
                        style={{
                          color: onDark ? "rgba(255,255,255,0.7)" : "rgba(14,17,17,0.6)",
                          border: `1px solid ${onDark ? "rgba(255,255,255,0.16)" : "rgba(14,17,17,0.12)"}`,
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </motion.div>

                {/* Branding */}
                <div className="text-center mt-5">
                  <p className="text-[9px]" style={{ color: onDark ? "rgba(255,255,255,0.45)" : "rgba(14,17,17,0.40)" }}>
                    A My Realm Product · My Realm Network Limited · RC: 9645700
                  </p>
                  <p className="text-[8px] mt-0.5" style={{ color: onDark ? "rgba(255,255,255,0.30)" : "rgba(14,17,17,0.28)" }}>
                    © 2026 My Realm Network Limited. All Rights Reserved.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}