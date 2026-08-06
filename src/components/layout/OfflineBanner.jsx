import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * OfflineBanner — a calm, dismissible-free banner shown only when the
 * browser is offline. Reminds students they're seeing cached content.
 */
export default function OfflineBanner() {
  const online = useOnlineStatus();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-0 left-0 right-0 z-[60] flex justify-center safe-area-pt pointer-events-none"
        >
          <div className="mt-2 mx-4 px-3.5 py-2 rounded-full glass-strong soft-shadow flex items-center gap-2 text-[11px] font-semibold text-foreground">
            <WifiOff className="w-3.5 h-3.5 text-warning" />
            You're offline — showing cached content
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}