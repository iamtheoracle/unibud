import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet as WalletIcon, ShoppingBag } from "lucide-react";

/**
 * EdgeContextSwipe — global edge-swipe gesture that opens the two secondary
 * Context Spaces (Wallet & Marketplace) as quick context overlays.
 *
 *  • Swipe inward from the LEFT edge  → Marketplace
 *  • Swipe inward from the RIGHT edge → Wallet
 *
 * Designed to coexist with the OS back-gesture: only fires on touch devices,
 * ignores starts on form fields / links / buttons, requires a deliberate
 * horizontal travel (>= 96px), and renders a glass peek indicator while dragging.
 */
const EDGE = 22;            // px from screen edge that begins a gesture
const THRESHOLD = 96;       // px of inward travel required to commit
const VERTICAL_LENIENCY = 1.4;

export default function EdgeContextSwipe() {
  const navigate = useNavigate();
  const location = useLocation();
  const [peek, setPeek] = useState({ side: null, progress: 0 });
  const drag = useRef(null);

  // Don't trigger on the target surfaces themselves (avoid fighting the page).
  const isTargetRoute = ["/wallet", "/marketplace"].includes(location.pathname);

  useEffect(() => {
    if (isTargetRoute) return;
    // Only on touch / coarse pointers.
    if (!window.matchMedia || !window.matchMedia("(pointer: coarse)").matches) return;

    const isInteractive = (el) => {
      if (!el || el === document.body) return false;
      const tag = el.tagName;
      if (["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(tag)) return true;
      if (el.isContentEditable) return true;
      if (typeof el.closest === "function") {
        return !!el.closest('button, a, input, textarea, select, [role="button"], [data-no-edgeswipe]');
      }
      return isInteractive(el.parentElement);
    };

    const onStart = (e) => {
      const t = e.touches[0];
      const x = t.clientX, y = t.clientY;
      let side = null;
      if (x <= EDGE) side = "left";
      else if (x >= window.innerWidth - EDGE) side = "right";
      if (!side) return;
      if (isInteractive(e.target)) return;
      drag.current = { side, startX: x, startY: y, x, y, committed: false };
    };

    const onMove = (e) => {
      const d = drag.current;
      if (!d) return;
      const t = e.touches[0];
      const dx = t.clientX - d.startX;
      const dy = t.clientY - d.startY;
      // Bail if the gesture is clearly vertical.
      if (Math.abs(dy) > Math.abs(dx) * VERTICAL_LENIENCY) { drag.current = null; setPeek({ side: null, progress: 0 }); return; }
      // Only count inward travel.
      const inward = d.side === "left" ? dx : -dx;
      if (inward <= 4) { setPeek({ side: null, progress: 0 }); return; }
      const progress = Math.min(1, inward / THRESHOLD);
      d.x = t.clientX; d.progress = progress; d.committed = progress >= 1;
      setPeek({ side: d.side, progress });
    };

    const onEnd = () => {
      const d = drag.current;
      drag.current = null;
      setPeek({ side: null, progress: 0 });
      if (!d || !d.committed) return;
      navigate(d.side === "left" ? "/marketplace" : "/wallet");
    };

    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd, { passive: true });
    window.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", onEnd);
    };
  }, [navigate, isTargetRoute]);

  if (!peek.side) return null;
  const Icon = peek.side === "left" ? ShoppingBag : WalletIcon;
  const label = peek.side === "left" ? "Marketplace" : "Wallet";
  const fromLeft = peek.side === "left";

  return (
    <div
      className="fixed top-0 bottom-0 z-[60] pointer-events-none"
      style={{
        [fromLeft ? "left" : "right"]: 0,
        transform: `translateX(${fromLeft ? "" : "-"}${peek.progress * 64}px)`,
        transition: "transform 0.08s linear",
      }}
      aria-hidden
    >
      <div
        className="h-full flex flex-col items-center justify-center gap-2 px-3"
        style={{ opacity: peek.progress }}
      >
        <div
          className="w-12 h-12 rounded-full crystal-dock flex items-center justify-center ice-glow"
          style={{ transform: `scale(${0.8 + peek.progress * 0.25})` }}
        >
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <span className="text-[10px] font-semibold text-primary bg-card/80 px-2 py-0.5 rounded-full soft-shadow">
          {label}
        </span>
      </div>
    </div>
  );
}