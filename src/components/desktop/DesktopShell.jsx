import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import { Outlet, useLocation } from "react-router-dom";
import DesktopSidebar from "@/components/desktop/DesktopSidebar";
import DesktopRightRail from "@/components/desktop/DesktopRightRail";
import DesktopWindow from "@/components/desktop/DesktopWindow";
import DesktopBudDock from "@/components/desktop/DesktopBudDock";
import CommandPalette from "@/components/desktop/CommandPalette";
import { WindowManagerProvider, useWindowManager } from "@/lib/desktop/WindowManagerContext";
import { cn } from "@/lib/utils";

const MODULE_TITLES = {
  bud: "Bud",
  notifications: "Notifications",
  calendar: "Calendar",
  tasks: "Tasks",
};

function WindowLayer() {
  const wm = useWindowManager();
  if (!wm || wm.windows.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 5000 }}>
      <AnimatePresence>
        {wm.windows.map((win) => (
          <DesktopWindow key={win.id} window={win}>
            {win.module === "bud" && <DesktopBudDock window={win} />}
          </DesktopWindow>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DesktopShellInner() {
  const location = useLocation();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [railSection, setRailSection] = useState("notifications");
  const wm = useWindowManager();

  // Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleOpenWindow = useCallback((module, title) => {
    wm?.openWindow(module, title || MODULE_TITLES[module] || module);
  }, [wm]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Left sidebar */}
      <DesktopSidebar onOpenWindow={handleOpenWindow} />

      {/* Center workspace */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <div className="flex items-center gap-3 h-12 px-4 border-b border-border/30 bg-background/40 backdrop-blur-xl flex-shrink-0">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-2 h-8 px-3 rounded-[10px] glass spring-tap flex-1 max-w-[400px]"
          >
            <Search className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2.2} />
            <span className="text-[12px] text-muted-foreground">Search UNIBUD...</span>
            <div className="ml-auto flex items-center gap-0.5">
              <kbd className="text-[8px] font-bold text-muted-foreground px-1 py-0.5 rounded bg-white/5">⌘</kbd>
              <kbd className="text-[8px] font-bold text-muted-foreground px-1 py-0.5 rounded bg-white/5">K</kbd>
            </div>
          </button>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto app-content relative">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            <Outlet />
          </motion.div>

          {/* Floating windows layer */}
          <WindowLayer />
        </div>
      </main>

      {/* Right rail */}
      <DesktopRightRail
        activeSection={railSection}
        onSectionChange={setRailSection}
        onOpenWindow={handleOpenWindow}
      />

      {/* Command palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

/**
 * DesktopShell — wraps the desktop workspace layout.
 * Used as a layout route in App.jsx for large screens.
 * Falls through to AppShell on mobile (detected by parent).
 */
export default function DesktopShell() {
  return (
    <WindowManagerProvider>
      <DesktopShellInner />
    </WindowManagerProvider>
  );
}