import { useState, useEffect } from "react";

/**
 * useDesktopLayout — detects screen size and returns breakpoint info.
 * Phone: < 768px | Tablet: 768–1024 | Desktop: 1024–1536 | Ultrawide: > 1536
 */
export function useDesktopLayout() {
  const [breakpoint, setBreakpoint] = useState("phone");

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w >= 1536) setBreakpoint("ultrawide");
      else if (w >= 1024) setBreakpoint("desktop");
      else if (w >= 768) setBreakpoint("tablet");
      else setBreakpoint("phone");
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    breakpoint,
    isPhone: breakpoint === "phone",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop" || breakpoint === "ultrawide",
    isUltrawide: breakpoint === "ultrawide",
    isLargeScreen: breakpoint === "tablet" || breakpoint === "desktop" || breakpoint === "ultrawide",
  };
}