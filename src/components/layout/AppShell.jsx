import React, { useEffect, useState, Suspense } from "react";
import { useNavigate, useLocation, useOutlet } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import RouteLoading from "@/components/RouteLoading";
import { BudLauncherProvider } from "@/lib/BudLauncherContext";
import { BudPresenceProvider } from "@/lib/bud/BudPresenceContext";
import { SearchProvider, useSearch } from "@/lib/search/SearchContext";
import PrimaryNavBar from "@/components/layout/PrimaryNavBar";
import GlobalTopBar from "@/components/layout/GlobalTopBar";
import { NavigationProvider, useNavigation } from "@/lib/os/NavigationContext";
import { NavigationAnalyticsProvider } from "@/lib/navigation/navigationAnalytics";
import { CommandBarProvider, useCommandBar } from "@/components/navigation/CommandBar";
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
import "@/lib/os/experienceContract"; // Registers all 7 experience contracts
import "@/lib/os/academicModules"; // Registers 15 academic modules consumed by Campus
import "@/lib/os/socialModules"; // Registers social modules consumed by Square
import "@/lib/os/communicationModules"; // Registers communication modules consumed by Connect
import { VoiceProvider } from "@/lib/voice/VoiceProvider";
import LiveReflectionProvider from "@/components/realtime/LiveReflectionProvider";
import WorldTransitionOverlay from "@/components/layout/WorldTransitionOverlay";
import { useBudPush } from "@/lib/notifications/useBudPush";
import { useAutonomousEngine } from "@/hooks/useAutonomousEngine";
import { useSelfHealingEngine } from "@/hooks/useSelfHealingEngine";
import { ClassroomModeProvider } from "@/lib/classroom/ClassroomModeContext";
import { CreateProvider } from "@/lib/CreateContext";
import { useNavigationState } from "@/hooks/useNavigationState";

function UniversalSearchOverlayWithContext() {
  const { searchOpen, closeSearch } = useSearch();
  const { openCommandBar } = useCommandBar();

  // Open the Command Bar when the search trigger fires
  useEffect(() => {
    if (searchOpen) openCommandBar();
  }, [searchOpen, openCommandBar]);

  // Keep the old overlay for backward compat during transition
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
 * NavigationContextSync — syncs the navigation destination with the OS context.
 * The OS context module-priority adapts based on the active tab.
 */
function NavigationContextSync() {
  const { activeDestId } = useNavigation();
  const { setContext } = useContextSystem();
  useEffect(() => {
    setContext(activeDestId === "quad" ? "academic" : "social");
  }, [activeDestId]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** Wires the navigation state tracker — must be inside Router. */
function NavigationStateTracker() {
  useNavigationState();
  return null;
}

/**
 * AppShell — the authenticated student shell.
 * Uses PrimaryNavBar (4 tabs: Square, Quad, Connect, Me).
 * FloatingBudButton is removed — Bud lives in Me and the Command Bar.
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
      <NavigationProvider>
      <NavigationAnalyticsProvider>
      <CommandBarProvider>
      <NavigationStateTracker />
      <NavigationContextSync />
      <RealtimeContextSync />
      <ClassroomModeProvider>
        <div className="min-h-screen w-full relative z-10">
          <AmbientBackground />
          <ContextPulse />
          <GlobalTopBar />
          <WorldTransitionOverlay />
          <OfflineSyncBanner />
          <div className="relative z-10 max-w-[520px] mx-auto px-4 pt-2">
            <AnnouncementBanner />
          </div>
          <LiveReflectionProvider />
          <Suspense fallback={<RouteLoading />}>
            <motion.div
              key={location.pathname}
              className="app-content pb-28"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 38, mass: 0.8 }}
            >
              {outlet}
            </motion.div>
          </Suspense>
          {/* Single canonical navigation bar — no floating Bud button */}
          <PrimaryNavBar />
          <BudPresenceReactor />
          <BudSheet />
          <UniversalSearchOverlayWithContext />
          <ConsentBanner />
        </div>
      </ClassroomModeProvider>
      </CommandBarProvider>
      </NavigationAnalyticsProvider>
      </NavigationProvider>
      </OSContextProvider>
      </UnibudContextProvider>
      </SearchProvider>
      </VoiceProvider>
      </BudPresenceProvider>
      </CreateProvider>
    </BudLauncherProvider>
  );
}