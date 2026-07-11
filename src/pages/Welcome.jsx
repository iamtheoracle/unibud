import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, ChevronDown, Building2, PlayCircle, KeyRound } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import WelcomeBackground from "@/components/welcome/WelcomeBackground";
import WelcomeLoader from "@/components/welcome/WelcomeLoader";

const ease = [0.16, 1, 0.3, 1];

export default function Welcome() {
  const navigate = useNavigate();
  const { enterDemoMode } = useDemoMode();
  const [isLoading, setIsLoading] = useState(true);
  const [showStaffOptions, setShowStaffOptions] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then((authed) => {
      if (authed) navigate("/");
    });
    const timer = setTimeout(() => setIsLoading(false), 1400);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleDemoMode = () => {
    enterDemoMode();
    navigate("/");
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col relative overflow-hidden">
      <WelcomeBackground />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <WelcomeLoader key="loader" />
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
                {/* Official Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.8, ease }}
                >
                  <img
                    src="https://media.base44.com/images/public/6a4fb1dfadf0c26bef23ff57/2942a37eb_generated_image.png"
                    alt="UNIBUD — The Future Starts Together"
                    className="w-[200px] md:w-[230px] h-auto select-none"
                    draggable={false}
                  />
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.7, ease }}
                  className="font-heading font-extrabold text-[27px] md:text-[31px] text-foreground text-center mt-8 tracking-tight leading-tight"
                >
                  Your University Companion
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease }}
                  className="text-[14px] md:text-[15px] text-muted-foreground text-center mt-3 max-w-[320px] leading-relaxed"
                >
                  Everything you need for university life in one place. Learn, connect, collaborate and succeed.
                </motion.p>
              </div>
            </div>

            {/* === Bottom: Actions + Links + Trust === */}
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
                  className="glass rounded-[28px] p-5"
                >
                  {/* Primary: Get Started */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/register")}
                    className="w-full h-[54px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[16px] flex items-center justify-center gap-2 spring-tap gold-glow"
                    aria-label="Get Started — Create your account"
                  >
                    Get Started
                    <ArrowRight className="w-5 h-5" strokeWidth={2.2} />
                  </motion.button>

                  {/* Secondary: Sign In */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate("/login")}
                    className="w-full h-[54px] rounded-2xl bg-card/60 border border-border/40 text-foreground font-heading font-semibold text-[16px] flex items-center justify-center gap-2 spring-tap mt-2.5"
                    aria-label="Sign In — Returning users"
                  >
                    <Lock className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2} />
                    Sign In
                  </motion.button>

                  {/* Tertiary links */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.85, duration: 0.6 }}
                    className="flex items-center justify-center gap-3.5 mt-4"
                  >
                    <button
                      onClick={() => setShowStaffOptions(!showStaffOptions)}
                      className="text-[12px] text-muted-foreground font-medium flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <Building2 className="w-3 h-3" strokeWidth={2} />
                      Staff
                      <ChevronDown
                        className={`w-3 h-3 transition-transform ${showStaffOptions ? "rotate-180" : ""}`}
                      />
                    </button>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <button
                      onClick={handleDemoMode}
                      className="text-[12px] text-muted-foreground font-medium flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <PlayCircle className="w-3 h-3" strokeWidth={2} />
                      Demo
                    </button>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <Link
                      to="/forgot-password"
                      className="text-[12px] text-muted-foreground font-medium flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                      <KeyRound className="w-3 h-3" strokeWidth={2} />
                      Forgot
                    </Link>
                  </motion.div>

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
                          onClick={() => navigate("/university-staff-login")}
                          className="w-full mt-3 h-[46px] rounded-2xl bg-muted/40 border border-border/30 text-foreground font-heading font-medium text-[14px] flex items-center justify-center gap-2 spring-tap"
                        >
                          <Building2 className="w-4 h-4" strokeWidth={2} />
                          University Staff Sign In
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Trust line */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="text-center text-[12px] text-muted-foreground/70 mt-6"
                >
                  Trusted by students, lecturers and universities.
                </motion.p>

                {/* Branding */}
                <div className="text-center mt-3">
                  <p className="text-[9px] text-muted-foreground/50">
                    A My Realm Product · My Realm Network Limited · RC: 9645700
                  </p>
                  <p className="text-[8px] text-muted-foreground/35 mt-0.5">
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