import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { resolveContext } from "@/lib/navigation/contextMap";

/**
 * useAdaptiveContext — the intelligence behind the 4th dock slot.
 *
 * On entering a workspace (route with a context destination), the slot
 * enters the "context" phase and shows the Context Navigator prominently.
 * The moment the user engages — scrolling, swiping, typing, or tapping into
 * content — it smoothly morphs back to the permanent "Me" tab. A fallback
 * timer also settles it after a few seconds of inactivity.
 */
const PROMINENT_MS = 4500;

export function useAdaptiveContext() {
  const { pathname } = useLocation();
  const ctx = resolveContext(pathname);
  const [phase, setPhase] = useState("me"); // "context" | "me"
  const interactedRef = useRef(false);

  // Reveal the Context Navigator on workspace entry; reset on navigation.
  useEffect(() => {
    interactedRef.current = false;
    if (ctx) {
      setPhase("context");
      const t = setTimeout(() => setPhase("me"), PROMINENT_MS);
      return () => clearTimeout(t);
    }
    setPhase("me");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Settle back to the permanent dock on first genuine interaction.
  useEffect(() => {
    if (phase !== "context") return;
    const settle = () => {
      if (interactedRef.current) return;
      interactedRef.current = true;
      setPhase("me");
    };
    const onScroll = () => settle();
    const onKey = () => settle();
    const onClick = (e) => {
      // Tapping the dock itself is navigation, not engagement with content.
      if (e.target.closest && e.target.closest("nav")) return;
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

  return { ctx, phase };
}