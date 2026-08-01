import React, { useEffect, useState, Suspense } from "react";
import { useNavigate, useLocation, useOutlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import RouteLoading from "@/components/RouteLoading";
import { BudLauncherProvider } from "@/lib/BudLauncherContext";
import AdaptiveNav from "@/components/navigation/AdaptiveNav";
import EcosystemRail from "@/components/layout/EcosystemRail";
import OfflineBanner from "@/components/layout/OfflineBanner";
import BudCompanion from "@/components/bud/BudCompanion";
import BudLivingOrb from "@/components/bud/BudLivingOrb";
import AmbientBackground from "@/components/layout/AmbientBackground";
import ContextPulse from "@/components/layout/ContextPulse";
import { UnibudContextProvider } from "@/lib/UnibudContext";
import QuickActionCapsule from "@/components/navigation/QuickActionCapsule";
import LiveReflectionProvider from "@/components/realtime/LiveReflectionProvider";
import EdgeContextSwipe from "@/components/layout/EdgeContextSwipe";
import { useBudPush } from "@/lib/notifications/useBudPush";
import { ClassroomModeProvider, ClassroomBudGate } from "@/lib/classroom/ClassroomModeContext";

/**
 * AppShell — the authenticated student shell: page content + floating
 * Bud Orb + bottom navigation. Guards auth for all tab routes.
 */
export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutlet();
  const [checking, setChecking] = useState(true);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useBudPush();

  useEffect(() => {
    base44.auth.isAuthenticated().then((ok) => {
      if (!ok) navigate("/login", { replace: true });
      setChecking(false);
    });
  }, [navigate]);

  if (checking) {
    return <RouteLoading />;
  }

  return (
    <BudLauncherProvider>
      <UnibudContextProvider>
      <ClassroomModeProvider>
        <div className="min-h-screen w-full relative z-10">
          <AmbientBackground />
          <QuickActionCapsule />
          <ContextPulse />
          <OfflineBanner />
          <EdgeContextSwipe />
          <LiveReflectionProvider />
          <Suspense fallback={<RouteLoading />}>
            <motion.div
              key={location.pathname}
              className="app-content pt-14"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 38, mass: 0.8 }}
            >
              {outlet}
            </motion.div>
          </Suspense>
          <EcosystemRail />
          <AdaptiveNav />
          <ClassroomBudGate><BudLivingOrb /></ClassroomBudGate>
          <ClassroomBudGate><BudCompanion /></ClassroomBudGate>
        </div>
      </ClassroomModeProvider>
      </UnibudContextProvider>
    </BudLauncherProvider>
  );
}