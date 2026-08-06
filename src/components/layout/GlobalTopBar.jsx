/**
 * GlobalTopBar — the persistent OS-level top bar rendered inside AppShell.
 *
 * Always contains:
 *   • Social / Academic Context Switcher (left pill)
 *   • Lens universal search tap (right)
 *   • Notifications bell (right)
 *
 * This replaces the standalone ContextSwitcher and the per-page OsTopBar.
 * All logic is reused from existing providers — no new state or network calls.
 *
 * Lens: tapping the search icon opens the existing UniversalSearchOverlay via
 * SearchContext (the overlay is already mounted in AppShell).
 *
 * Notifications: tapping the bell navigates to /notifications (matching the
 * behaviour of the old OsTopBar).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Bell } from "lucide-react";
import { useNavigation } from "@/lib/os/NavigationContext";
import { useSearch } from "@/lib/search/SearchContext";
import { hapticSelect, hapticTap } from "@/lib/haptics";
import { useUnibudContext } from "@/lib/UnibudContext";

export default function GlobalTopBar() {
  const navigate = useNavigate();
  const { isSocial, isAcademics, switchWorld } = useNavigation();
  const { openSearch } = useSearch();
  const ctx = useUnibudContext();

  // Unread notification indicator — use context data if available, default true
  // so the badge is visible whenever the data hasn't loaded yet.
  const hasUnread = ctx?.notifications?.some?.((n) => !n.read) ?? true;

  return (
    <div
      className="sticky top-0 z-40 px-4 pt-2 pb-1 safe-area-pt bg-background/80 backdrop-blur-xl"
      aria-label="OS top bar"
    >
      <div className="max-w-[440px] mx-auto flex items-center gap-2">

        {/* ── Context Switcher ── */}
        <div className="relative flex items-center p-1 rounded-full glass-strong flex-1">
          {/* Sliding indicator */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-full"
            style={{
              width: "calc(50% - 4px)",
              left: 4,
              background: "rgb(11, 11, 11)",
              boxShadow:
                "0 2px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
            animate={{ x: isSocial ? 0 : "calc(100% + 0px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 32, mass: 0.7 }}
          />

          <button
            onClick={() => { if (!isSocial) { hapticSelect(); switchWorld("social"); } }}
            className="relative z-10 flex-1 py-2 text-center text-[13px] font-bold tracking-tight transition-opacity duration-300"
            aria-pressed={isSocial}
            aria-label="Switch to Social"
          >
            <motion.span
              style={{
                color: isSocial ? "rgb(255, 255, 255)" : "hsl(var(--muted-foreground))",
                display: "inline-block",
              }}
              animate={{ scale: isSocial ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              Social
            </motion.span>
          </button>

          <button
            onClick={() => { if (!isAcademics) { hapticSelect(); switchWorld("academics"); } }}
            className="relative z-10 flex-1 py-2 text-center text-[13px] font-bold tracking-tight transition-opacity duration-300"
            aria-pressed={isAcademics}
            aria-label="Switch to Academics"
          >
            <motion.span
              style={{
                color: isAcademics ? "rgb(255, 255, 255)" : "hsl(var(--muted-foreground))",
                display: "inline-block",
              }}
              animate={{ scale: isAcademics ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
            >
              Academics
            </motion.span>
          </button>
        </div>

        {/* ── Lens Search ── */}
        <button
          onClick={() => { hapticTap(); openSearch(); }}
          className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Open Lens search"
        >
          <Search className="w-[17px] h-[17px] text-foreground" strokeWidth={2} />
        </button>

        {/* ── Notifications ── */}
        <button
          onClick={() => { hapticTap(); navigate("/notifications"); }}
          className="relative w-9 h-9 rounded-full glass flex items-center justify-center spring-tap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Notifications"
        >
          <Bell className="w-[17px] h-[17px] text-foreground" strokeWidth={2} />
          {hasUnread && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background"
              aria-hidden="true"
            />
          )}
        </button>

      </div>
    </div>
  );
}
