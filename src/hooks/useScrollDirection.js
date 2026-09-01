import { useState, useEffect } from "react";

// Scroll-aware navigation: hide on scroll down, reveal on scroll up.
// Always visible near the top of the page.
export function useScrollDirection({ threshold = 8, topThreshold = 12 } = {}) {
  const [visible, setVisible] = useState(true);
  const [direction, setDirection] = useState("up");

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      if (y <= topThreshold) {
        setVisible(true);
        setDirection("up");
      } else if (y > lastY + threshold) {
        setVisible(false);
        setDirection("down");
      } else if (y < lastY - threshold) {
        setVisible(true);
        setDirection("up");
      }
      lastY = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold, topThreshold]);

  return { visible, direction };
}