import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Mic,
  Upload,
  BookOpen,
  ScanLine,
  History,
  X,
} from "lucide-react";
import { hapticTap, hapticSelect } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

const ACTIONS = [
  { key: "ask", label: "Ask Bud", icon: MessageCircle },
  { key: "voice", label: "Voice Conversation", icon: Mic },
  { key: "upload", label: "Upload File", icon: Upload },
  { key: "study", label: "New Study Session", icon: BookOpen },
  { key: "scan", label: "Scan Document", icon: ScanLine },
  { key: "recent", label: "Recent Conversations", icon: History },
];

/**
 * BudFloatingActions — bottom sheet of quick actions revealed when
 * the student holds the floating Bud head.
 */
export default function BudFloatingActions({ visible, onSelect, onClose }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={() => {
              hapticTap();
              onClose();
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: 400, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 400, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative w-full max-w-[520px] glass-strong rounded-t-[28px] p-5 safe-area-pb"
            style={{
              boxShadow:
                "0 -8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full bg-foreground/15 mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[15px] font-bold text-foreground">Quick Actions</p>
                <p className="text-[11px] text-muted-foreground">Bud is ready to help</p>
              </div>
              <button
                onClick={() => {
                  hapticTap();
                  onClose();
                }}
                className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
              </button>
            </div>

            {/* Action grid */}
            <div className="grid grid-cols-3 gap-3">
              {ACTIONS.map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.key}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.3, ease: EASE }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      hapticSelect();
                      onSelect(action);
                    }}
                    className="flex flex-col items-center gap-2 p-3.5 rounded-[18px] glass-card spring-tap"
                  >
                    <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center">
                      <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground text-center leading-tight">
                      {action.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}