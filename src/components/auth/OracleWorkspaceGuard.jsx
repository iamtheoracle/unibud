import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { resolveWorkspace } from "@/lib/auth/oracleRouter";
import { isAuthorizedFor } from "@/lib/auth/oracleGuard";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

/**
 * OracleWorkspaceGuard — invisible workspace enforcement.
 *
 * Wraps protected workspace routes. If the authenticated user's role is not
 * authorized for the current path, Oracle silently redirects them to their
 * own workspace. No error page, no access denied message — the user simply
 * never sees a workspace they aren't permitted to use.
 *
 * This is the security layer that makes Oracle an invisible operating system:
 * routing decisions are enforced on every navigation, not just on login.
 */
export default function OracleWorkspaceGuard({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState("checking"); // checking → authorized | redirecting
  const redirectTimerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    (async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        const role = user.role || "student";
        const authorized = isAuthorizedFor(location.pathname, role);

        if (cancelled) return;

        if (!authorized) {
          // Oracle silently redirects to the user's correct workspace
          const ws = resolveWorkspace(user);
          setState("redirecting");
          const timer = setTimeout(() => {
            window.location.href = ws.path;
          }, 600);
          if (!cancelled) redirectTimerRef.current = timer;
        } else {
          setState("authorized");
        }
      } catch {
        if (cancelled) return;
        setState("redirecting");
        const timer = setTimeout(() => {
          navigate("/login", { replace: true });
        }, 150);
        redirectTimerRef.current = timer;
      }
    })();
    return () => {
      cancelled = true;
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, [location.pathname, navigate]);

  if (state === "authorized") return children;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div
          className="ambient-orb absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px]"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, hsl(0 0% 100% / 0.06), transparent 70%)" }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-14 h-14 rounded-full crystal-card glass-shine flex items-center justify-center edge-light bud-breathe mb-4">
          <div className="w-7 h-7 rounded-full bg-foreground/90 flex items-center justify-center glow-pulse">
            <div className="w-3 h-3 rounded-full bg-background" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary stream-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary stream-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary stream-dot" />
        </div>
      </motion.div>
    </div>
  );
}