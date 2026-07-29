import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { resolveWorkspace } from "@/lib/auth/oracleRouter";
import BrandLogo from "@/components/foundation/BrandLogo";

const EASE = [0.16, 1, 0.3, 1];

/**
 * OracleAuthRouter — the silent workspace evaluator.
 *
 * After authentication, Oracle evaluates the user's role, permissions,
 * institution, and platform access, then loads the correct workspace.
 * No extra login, no different URL — everything is permission-driven.
 */
export default function OracleAuthRouter() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("evaluating"); // evaluating → routing
  const [workspace, setWorkspace] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();

        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        // Oracle silently evaluates: role, permissions, institution, platform access
        const ws = resolveWorkspace(user);
        setWorkspace(ws);
        setStatus("routing");

        // Brief moment for the evaluation to feel intentional, not jarring
        setTimeout(() => {
          window.location.href = ws.path;
        }, 1400);
      } catch (err) {
        // If we can't evaluate, default to student home rather than blocking
        window.location.href = "/home";
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient bloom */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div
          className="ambient-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px]"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, hsl(0 0% 100% / 0.08), transparent 70%)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative z-10 flex flex-col items-center"
      >
        {/* Oracle orb */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
          className="relative mb-8"
        >
          <div className="w-20 h-20 rounded-full crystal-card glass-shine flex items-center justify-center edge-light bud-breathe">
            <div className="w-10 h-10 rounded-full bg-foreground/90 flex items-center justify-center glow-pulse">
              <div className="w-4 h-4 rounded-full bg-background" />
            </div>
          </div>
          {/* Orbiting particles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border border-foreground/10 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary ai-planning" style={{ "--orbit-r": "64px" }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: EASE }}
          className="text-center"
        >
          <p className="text-[16px] font-bold text-foreground mb-1 tracking-tight" style={{ letterSpacing: "-0.01em" }}>
            {status === "evaluating" ? "Oracle is evaluating your workspace" : `Loading ${workspace?.label || "workspace"}`}
          </p>
          <p className="text-[12px] text-muted-foreground">
            {status === "evaluating"
              ? "Reviewing permissions, role, and access"
              : "Preparing your personalized environment"}
          </p>
        </motion.div>

        {/* Streaming indicator */}
        <div className="flex gap-1.5 mt-6">
          <span className="w-1.5 h-1.5 rounded-full bg-primary stream-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary stream-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary stream-dot" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="absolute bottom-8 safe-area-pb"
      >
        <BrandLogo size="xs" />
      </motion.div>
    </div>
  );
}