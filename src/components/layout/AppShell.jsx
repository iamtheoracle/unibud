import React, { useEffect, useState, Suspense } from "react";
import { useNavigate, useLocation, useOutlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import RouteLoading from "@/components/RouteLoading";
import { BudLauncherProvider } from "@/lib/BudLauncherContext";
import BottomNav from "@/components/layout/BottomNav";
import EcosystemRail from "@/components/layout/EcosystemRail";
import OfflineBanner from "@/components/layout/OfflineBanner";
import BudCompanion from "@/components/bud/BudCompanion";
import BudLivingOrb from "@/components/bud/BudLivingOrb";
import ContextPulse from "@/components/layout/ContextPulse";
import { UnibudContextProvider } from "@/lib/UnibudContext";
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

  useEffect(() => {
    base44.auth.isAuthenticated().then((ok) => {
      if (!ok) navigate("/login", { replace: true });
      setChecking(false);
    });
  }, [navigate]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <BudLauncherProvider>
      <UnibudContextProvider>
      <ClassroomModeProvider>
        <div className="min-h-screen w-full">
          <ContextPulse />
          <OfflineBanner />
          <Suspense fallback={<RouteLoading />}>
            <motion.div
              key={location.pathname}
              className="app-content"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {outlet}
            </motion.div>
          </Suspense>
          <EcosystemRail />
          <BottomNav />
          <ClassroomBudGate><BudLivingOrb /></ClassroomBudGate>
          <ClassroomBudGate><BudCompanion /></ClassroomBudGate>
        </div>
      </ClassroomModeProvider>
      </UnibudContextProvider>
    </BudLauncherProvider>
  );
}