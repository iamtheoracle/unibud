import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Cloud, Check } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * OfflineSyncBanner — shows when offline, and briefly shows a "synced"
 * confirmation when the connection is restored. Replaces the dead-end
 * offline state with clear, actionable feedback.
 */
export default function OfflineSyncBanner() {
  const online = useOnlineStatus();
  const [justReconnected, setJustReconnected] = React.useState(false);
  const prevOnline = React.useRef(online);

  React.useEffect(() => {
    if (!prevOnline.current && online) {
      setJustReconnected(true);
      const t = setTimeout(() => setJustReconnected(false), 2500);
      prevOnline.current = online;
      return () => clearTimeout(t);
    }
    prevOnline.current = online;
  }, [online]);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 inset-x-0 z-50 safe-area-pt"
        >
          <div className="mx-auto max-w-[520px] px-4 pt-2">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-[16px] bg-warning/15 border border-warning/30 backdrop-blur-xl">
              <WifiOff className="w-4 h-4 text-warning shrink-0" strokeWidth={2} />
              <span className="text-[13px] font-medium text-warning-foreground/90 flex-1">
                You're offline — showing saved data.
              </span>
            </div>
          </div>
        </motion.div>
      )}
      {justReconnected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 inset-x-0 z-50 safe-area-pt"
        >
          <div className="mx-auto max-w-[520px] px-4 pt-2">
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-[16px] bg-success/15 border border-success/30 backdrop-blur-xl">
              <Check className="w-4 h-4 text-success shrink-0" strokeWidth={2.2} />
              <span className="text-[13px] font-medium text-success-foreground/90 flex-1">
                Back online — data synced.
              </span>
              <Cloud className="w-3.5 h-3.5 text-success/60" strokeWidth={1.8} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}