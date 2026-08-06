import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { resolveWorkspace } from "@/lib/navigation/contextMap";

/**
 * useAdaptiveContext — the intelligence behind the Context Navigator.
 *
 * On entering a workspace, the Context Navigator enters the "context" phase
 * and shows prominently. The moment the user engages — scrolling, swiping,
 * typing, or tapping into content — it smoothly settles to a compact movable
 * chip. A fallback timer also settles it after a few seconds of inactivity.
 * Tapping the chip re-expands the prominent navigator.
 */
const PROMINENT_MS = 4500;

export function useAdaptiveContext() {
  const { pathname } = useLocation();
  const workspace = resolveWorkspace(pathname);
  const [phase, setPhase] = useState("settled"); // "context" | "settled"
  const interactedRef = useRef(false);

  // Reveal the Context Navigator on workspace entry; reset on navigation.
  useEffect(() => {
    interactedRef.current = false;
    if (workspace) {
      setPhase("context");
      const t = setTimeout(() => setPhase("settled"), PROMINENT_MS);
      return () => clearTimeout(t);
    }
    setPhase("settled");
  }, [pathname]);

  // Settle back to the compact chip on first genuine interaction.
  useEffect(() => {
    if (phase !== "context") return;
    const settle = () => {
      if (interactedRef.current) return;
      interactedRef.current = true;
      setPhase("settled");
    };
    const onScroll = () => settle();
    const onKey = () => settle();
    const onClick = (e) => {
      // Tapping the dock or the Context Navigator itself is navigation, not engagement.
      const t = e.target;
      if (t && t.closest && (t.closest("nav") || t.closest("[data-context-navigator]"))) return;
      settle();
    };
    const opts = { passive: true };
    window.addEventListener("scroll", onScroll, opts);
    window.addEventListener("wheel", onScroll, opts);
    window.addEventListener("touchmove", onScroll, opts);
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [phase]);

  // Re-expand from the chip; reset the interaction guard so it can settle again.
  const expand = () => {
    interactedRef.current = false;
    setPhase("context");
  };

  return { workspace, phase, expand };
}