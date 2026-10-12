import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ArrowUpRight, LockKeyhole, UserRound, MessageCircle,
  Building2, ChevronDown, Globe2, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import WelcomeLogo from "@/components/welcome/WelcomeLogo";
import { hapticTap, hapticImpact } from "@/lib/haptics";

const ease = [0.16, 1, 0.3, 1];

export default function Welcome() {
  const navigate = useNavigate();
  const { enterDemoMode } = useDemoMode();
  const reduceMotion = useReducedMotion();
  const [showStaffOptions, setShowStaffOptions] = useState(false);

  useEffect(() => {
    let active = true;
    base44.auth.isAuthenticated()
      .then((authenticated) => {
        if (active && authenticated) navigate("/", { replace: true });
      })
      .catch(() => {
        // A failed session check should leave the public welcome screen available.
      });
    return () => { active = false; };
  }, [navigate]);

  const tap = (action) => () => {
    hapticTap();
    action();
  };

  const handleGuest = () => {
    hapticImpact();
    enterDemoMode();
    navigate("/bud", { replace: true });
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#090B10] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-[-18%] h-[28rem] w-[28rem] rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="absolute right-[-22%] top-[24%] h-[25rem] w-[25rem] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute bottom-[-18rem] left-[12%] h-[30rem] w-[30rem] rounded-full bg-amber-500/[0.08] blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(#fff 0.7px, transparent 0.7px)", backgroundSize: "22px 22px" }} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-xl flex-col px-5 pb-7 pt-[max(env(safe-area-inset-top),1.5rem)]">
        <header className="flex items-center justify-between">
          <WelcomeLogo tone="white" size="md" />
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
            A My Realm product
          </span>
        </header>

        <section className="flex flex-1 flex-col justify-center py-10">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-[11px] font-medium text-white/70">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              One space. Many sides of you.
            </div>
            <h1 className="max-w-lg text-[clamp(2.7rem,11vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.065em]">
              Your life has
              <span className="block bg-gradient-to-r from-white via-white to-white/45 bg-clip-text text-transparent">more than one side.</span>
            </h1>
            <p className="mt-5 max-w-sm text-[15px] leading-7 text-white/60">
              Find your people, get things moving, and drop into conversations that matter to you.
            </p>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.5, ease }}
            className="mt-9 rounded-[28px] border border-white/[0.12] bg-[#141720]/80 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl"
          >
            <button
              type="button"
              onClick={tap(() => navigate("/register"))}
              className="flex h-[54px] w-full items-center justify-between rounded-[19px] bg-white px-5 text-left text-[14px] font-semibold text-[#0A0C11] transition-transform active:scale-[0.985]"
            >
              Create an account
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={tap(() => navigate("/login"))}
              className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-[19px] border border-white/10 bg-white/[0.045] text-[14px] font-semibold text-white transition-colors hover:bg-white/[0.08]"
            >
              <LockKeyhole className="h-4 w-4 text-white/60" />
              Sign in
            </button>

            <div className="my-3 flex items-center gap-3 px-1">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/35">Or explore</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              onClick={tap(handleGuest)}
              className="flex min-h-[50px] w-full items-center gap-3 rounded-[18px] px-3 text-left transition-colors hover:bg-white/[0.05]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/10 text-violet-200">
                <UserRound className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-semibold">Continue as guest</span>
                <span className="mt-0.5 block text-[11px] text-white/45">Go straight to BUD. No account needed.</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-white/40" />
            </button>

            <Link
              to="/riff"
              onClick={() => hapticTap()}
              className="flex min-h-[50px] w-full items-center gap-3 rounded-[18px] px-3 text-left transition-colors hover:bg-white/[0.05]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200">
                <MessageCircle className="h-[18px] w-[18px]" />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-semibold">Enter Riff</span>
                <span className="mt-0.5 block text-[11px] text-white/45">Open conversations, no account required.</span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-white/40" />
            </Link>
          </motion.div>
        </section>

        <footer className="relative">
          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <Link to="/onboarding/language-region" className="inline-flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white/75">
              <Globe2 className="h-3.5 w-3.5" /> Language & region
            </Link>
            <button
              type="button"
              onClick={tap(() => setShowStaffOptions((shown) => !shown))}
              className="inline-flex items-center gap-1.5 text-[11px] text-white/45 hover:text-white/75"
              aria-expanded={showStaffOptions}
            >
              <Building2 className="h-3.5 w-3.5" /> Staff access
              <ChevronDown className={`h-3 w-3 transition-transform ${showStaffOptions ? "rotate-180" : ""}`} />
            </button>
          </div>
          <AnimatePresence>
            {showStaffOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <Link to="/university-staff-login" className="mt-3 flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-xs font-medium text-white/75">
                  University staff sign in
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-4 text-center text-[10px] text-white/25">© 2026 My Realm Network Limited</p>
        </footer>
      </div>
    </main>
  );
}
