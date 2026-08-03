import React, { useEffect, useState, Suspense } from "react";
import { useNavigate, useLocation, useOutlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import RouteLoading from "@/components/RouteLoading";
import { BudLauncherProvider } from "@/lib/BudLauncherContext";
import { BudPresenceProvider } from "@/lib/bud/BudPresenceContext";
import { SearchProvider, useSearch } from "@/lib/search/SearchContext";
import MainTabBar from "@/components/layout/MainTabBar";
import FloatingBudButton from "@/components/bud/FloatingBudButton";
import BudPresenceReactor from "@/components/bud/BudPresenceReactor";
import BudSheet from "@/components/bud/BudSheet";
import UniversalSearchOverlay from "@/components/search/UniversalSearchOverlay";
import OfflineSyncBanner from "@/components/resilience/OfflineSyncBanner";
import AnnouncementBanner from "@/components/notifications/AnnouncementBanner";
import ConsentBanner from "@/components/legal/ConsentBanner";
import { useRecentViews } from "@/lib/resilience/useRecentViews";
import AmbientBackground from "@/components/layout/AmbientBackground";
import ContextPulse from "@/components/layout/ContextPulse";
import { UnibudContextProvider } from "@/lib/UnibudContext";
import { ContextProvider as OSContextProvider, useContextSystem } from "@/lib/os/ContextProvider";
import { realtimeEngine } from "@/lib/realtime/engine";
// Initialize v4 registries (side-effect import registers all core modules/experiences/services)
import "@/lib/os/moduleRegistry";
import "@/lib/os/experienceRegistry";
import "@/lib/os/hiddenServiceRegistry";
import { VoiceProvider } from "@/lib/voice/VoiceProvider";
import LiveReflectionProvider from "@/components/realtime/LiveReflectionProvider";
import EdgeContextSwipe from "@/components/layout/EdgeContextSwipe";
import { useBudPush } from "@/lib/notifications/useBudPush";
import { useAutonomousEngine } from "@/hooks/useAutonomousEngine";
import { useSelfHealingEngine } from "@/hooks/useSelfHealingEngine";
import { ClassroomModeProvider } from "@/lib/classroom/ClassroomModeContext";
import { CreateProvider } from "@/lib/CreateContext";

function UniversalSearchOverlayWithContext() {
  const { searchOpen, closeSearch } = useSearch();
  return <UniversalSearchOverlay open={searchOpen} onClose={closeSearch} />;
}

/**
 * RealtimeContextSync — bridges OS context to the Realtime Engine.
 * Must live inside OSContextProvider so it can read the current context.
 */
function RealtimeContextSync() {
  const { contextId } = useContextSystem();
  useEffect(() => {
    realtimeEngine.setContext(contextId);
  }, [contextId]);
  return null;
}

/**
 * AppShell — the authenticated student shell: page content + floating
 * Bud Orb + bottom navigation. Guards auth for all tab routes.
 */
export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutlet();
  const [checking, setChecking] = useState(true);
  const { record } = useRecentViews();
  const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  useBudPush();
  useAutonomousEngine();
  useSelfHealingEngine();

  // Track recently viewed pages for "Continue where you left off"
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/home") return;
    const label = path.split("/").pop().replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()) || "Page";
    record(path, label);
  }, [location.pathname, record]);

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
      <CreateProvider>
      <BudPresenceProvider>
      <VoiceProvider>
      <SearchProvider>
      <UnibudContextProvider>
      <OSContextProvider>
      <RealtimeContextSync />
      <ClassroomModeProvider>
        <div className="min-h-screen w-full relative z-10">
          <AmbientBackground />
          <ContextPulse />
          <OfflineSyncBanner />
          <div className="relative z-10 max-w-[520px] mx-auto px-4 pt-2 safe-area-pt">
            <AnnouncementBanner />
          </div>
          <EdgeContextSwipe />
          <LiveReflectionProvider />
          <Suspense fallback={<RouteLoading />}>
            <motion.div
              key={location.pathname}
              className="app-content safe-area-pt pb-28"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 38, mass: 0.8 }}
            >
              {outlet}
            </motion.div>
          </Suspense>
          <MainTabBar />
          <FloatingBudButton />
          <BudPresenceReactor />
          <BudSheet />
          <UniversalSearchOverlayWithContext />
          <ConsentBanner />
        </div>
      </ClassroomModeProvider>
      </OSContextProvider>
      </UnibudContextProvider>
      </SearchProvider>
      </VoiceProvider>
      </BudPresenceProvider>
      </CreateProvider>
    </BudLauncherProvider>
  );
}