import React, { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, RefreshCw, AlertCircle } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * WorkspaceCard — the expandable card shell that wraps every modular card.
 *
 * Props:
 *   - card: the card definition from the registry
 *   - attention: boolean — if true, shows a subtle attention indicator
 *   - defaultExpanded: boolean
 *   - children: the card content
 */
export default function WorkspaceCard({
  card,
  attention = false,
  defaultExpanded = false,
  onRefresh,
  children,
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try { await onRefresh(); } catch {}
    setRefreshing(false);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="crystal-card overflow-hidden"
    >
      {/* Card header */}
      <div
        className={`flex items-center gap-3 px-4 py-3.5 ${card.expandable ? "cursor-pointer spring-tap" : ""}`}
        onClick={card.expandable ? () => setExpanded((e) => !e) : undefined}
      >
        {/* Attention indicator */}
        {attention && (
          <div className="w-2 h-2 rounded-full bg-primary gentle-pulse flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-bold text-foreground tracking-tight">{card.title}</h3>
        </div>

        {/* Refresh button */}
        {card.refreshable && onRefresh && (
          <button
            onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
            className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center spring-tap text-muted-foreground"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        )}

        {/* Expand/collapse chevron */}
        {card.expandable && (
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25, ease: EASE }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        )}
      </div>

      {/* Card content */}
      {card.expandable ? (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <div className="h-px bg-border/40 mb-3" />
                <Suspense fallback={<CardSkeleton />}>
                  {children}
                </Suspense>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        <div className="px-4 pb-4">
          <Suspense fallback={<CardSkeleton />}>
            {children}
          </Suspense>
        </div>
      )}
    </motion.section>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-3 rounded-full shimmer w-3/4" />
      <div className="h-3 rounded-full shimmer w-1/2" />
      <div className="h-3 rounded-full shimmer w-2/3" />
    </div>
  );
}