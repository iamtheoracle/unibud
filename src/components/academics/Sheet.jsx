import React from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Sheet — reusable bottom sheet for academic forms.
 */
export default function Sheet({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="relative w-full max-w-[520px] glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb max-h-[88vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-[18px] text-foreground">{title}</h2>
              <button onClick={onClose} className="text-[13px] font-semibold text-muted-foreground">Close</button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}