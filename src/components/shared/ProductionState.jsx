import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw, WifiOff, AlertCircle, ChevronDown } from "lucide-react";

const PULL_THRESHOLD = 70;

/**
 * ProductionState — reusable state container for production-ready screens.
 * Handles loading (skeleton), empty, error, offline states with pull-to-refresh.
 *
 * Props:
 *  - state: "loading" | "ready" | "empty" | "error" | "offline"
 *  - skeleton: ReactNode (skeleton loader to show while loading)
 *  - emptyState: { icon, title, description, action }
 *  - error: string (error message)
 *  - onRetry: () => void
 *  - onRefresh: () => Promise<void> (for pull-to-refresh)
 *  - children: ReactNode (content when ready)
 *  - enablePullRefresh: boolean
 */
export default function ProductionState({
  state = "ready",
  skeleton,
  emptyState,
  error: errorMsg,
  onRetry,
  onRefresh,
  children,
  enablePullRefresh = true,
}) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY === 0 && enablePullRefresh && onRefresh) {
      setTouchStartY(e.touches[0].clientY);
    }
  }, [enablePullRefresh, onRefresh]);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY === 0 || !enablePullRefresh || !onRefresh) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY;
    if (diff > 0 && window.scrollY === 0) {
      const resistance = Math.min(diff * 0.5, PULL_THRESHOLD * 1.5);
      setPullDistance(resistance);
    }
  }, [touchStartY, enablePullRefresh, onRefresh]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= PULL_THRESHOLD && onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    setPullDistance(0);
    setTouchStartY(0);
  }, [pullDistance, onRefresh]);

  const showPullIndicator = pullDistance > 0 && !isRefreshing;
  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  if (state === "loading") {
    return <div className="px-4 py-4">{skeleton || <DefaultSkeleton />}</div>;
  }

  if (state === "error") {
    return (
      <ErrorState
        message={errorMsg || "Something went wrong"}
        onRetry={onRetry}
      />
    );
  }

  if (state === "offline") {
    return (
      <OfflineState onRetry={onRetry} />
    );
  }

  if (state === "empty" && emptyState) {
    return (
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {showPullIndicator && <PullIndicator progress={pullProgress} />}
        <EmptyStateDisplay {...emptyState} />
      </div>
    );
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined }}
      className="transition-transform"
    >
      {(showPullIndicator || isRefreshing) && (
        <PullIndicator progress={isRefreshing ? 1 : pullProgress} refreshing={isRefreshing} />
      )}
      {children}
    </div>
  );
}

function PullIndicator({ progress, refreshing }) {
  return (
    <div className="flex items-center justify-center py-2">
      <motion.div
        animate={{ rotate: refreshing ? 360 : 0 }}
        transition={{ duration: refreshing ? 0.8 : 0, repeat: refreshing ? Infinity : 0, ease: "linear" }}
        style={{ opacity: refreshing ? 1 : progress }}
      >
        {refreshing ? (
          <RefreshCw className="w-4 h-4 text-primary" strokeWidth={2.2} />
        ) : (
          <ChevronDown
            className="w-4 h-4 text-primary"
            strokeWidth={2.2}
            style={{ transform: `rotate(${progress * 180}deg)` }}
          />
        )}
      </motion.div>
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-[20px] bg-card shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded-full bg-muted" />
              <div className="h-2.5 w-16 rounded-full bg-muted" />
            </div>
          </div>
          <div className="mt-3 h-2.5 w-full rounded-full bg-muted" />
          <div className="mt-1.5 h-2.5 w-3/4 rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

function EmptyStateDisplay({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
          <Icon className="w-7 h-7 text-muted-foreground" strokeWidth={1.6} />
        </div>
      )}
      <h3 className="text-[17px] font-bold text-foreground mb-1.5 tracking-tight">{title}</h3>
      {description && (
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-[20px] bg-destructive/10 flex items-center justify-center mb-5">
        <AlertCircle className="w-7 h-7 text-destructive" strokeWidth={1.6} />
      </div>
      <h3 className="text-[17px] font-bold text-foreground mb-1.5 tracking-tight">Something went wrong</h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-5 h-10 rounded-full bg-primary text-[13px] font-bold text-primary-foreground active:scale-95 transition-transform"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

function OfflineState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center mb-5">
        <WifiOff className="w-7 h-7 text-muted-foreground" strokeWidth={1.6} />
      </div>
      <h3 className="text-[17px] font-bold text-foreground mb-1.5 tracking-tight">You're Offline</h3>
      <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">
        Check your internet connection and try again.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-6 px-5 h-10 rounded-full bg-primary text-[13px] font-bold text-primary-foreground active:scale-95 transition-transform"
        >
          Retry
        </button>
      )}
    </div>
  );
}