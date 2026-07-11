import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowDown } from "lucide-react";

const PULL_THRESHOLD = 65;
const MAX_PULL = 110;

export default function PullToRefresh({ onRefresh, children, className = "" }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const pullDistanceRef = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (isRefreshing) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  }, [isRefreshing]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const handleTouchMove = (e) => {
      if (!isPulling.current || isRefreshing) return;
      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;
      if (diff > 0) {
        if (e.cancelable) e.preventDefault();
        const damped = Math.min(diff * 0.45, MAX_PULL);
        pullDistanceRef.current = damped;
        setPullDistance(damped);
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!isPulling.current) return;
      isPulling.current = false;
      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        setIsRefreshing(true);
        setPullDistance(PULL_THRESHOLD);
        pullDistanceRef.current = 0;
        try {
          await onRefresh?.();
        } catch {
          // caller handles errors via toast
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
        pullDistanceRef.current = 0;
      }
    };

    node.addEventListener("touchmove", handleTouchMove, { passive: false });
    node.addEventListener("touchend", handleTouchEnd);
    return () => {
      node.removeEventListener("touchmove", handleTouchMove);
      node.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const rotation = progress * 180;
  const indicatorHeight = isRefreshing ? PULL_THRESHOLD : pullDistance;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      className={className}
      style={{ overscrollBehaviorY: "contain" }}
    >
      <motion.div
        animate={{ y: isRefreshing ? PULL_THRESHOLD : pullDistance }}
        transition={{ type: "spring", stiffness: 500, damping: 40 }}
      >
        <div
          className="flex items-center justify-center overflow-hidden"
          style={{ height: indicatorHeight }}
        >
          <motion.div
            animate={{ opacity: pullDistance > 0 || isRefreshing ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center"
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            ) : (
              <ArrowDown
                className="w-4 h-4 text-primary transition-transform duration-150"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            )}
          </motion.div>
        </div>
        {children}
      </motion.div>
    </div>
  );
}