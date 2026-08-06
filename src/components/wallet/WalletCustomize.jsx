import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";

export default function WalletCustomize({ open, onClose, board, labels }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[560px] z-50 bg-card rounded-t-[28px] p-5 safe-area-pb soft-shadow"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
            <h3 className="font-heading font-bold text-[16px] mb-1">Customize your board</h3>
            <p className="text-[11px] text-muted-foreground mb-4">Hide, show, or reorder modules. Spark remembers this.</p>
            <div className="space-y-2">
              {board.board.order.map((k) => {
                const hidden = board.board.hidden.includes(k);
                return (
                  <div key={k} className="flex items-center gap-2 p-2.5 rounded-[14px] bg-muted/30">
                    <span className={`flex-1 text-[13px] font-medium ${hidden ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {labels[k] || k}
                    </span>
                    <button onClick={() => board.move(k, -1)} className="w-8 h-8 rounded-full bg-card border border-border/40 flex items-center justify-center spring-tap">
                      <ChevronUp className="w-4 h-4 text-foreground" />
                    </button>
                    <button onClick={() => board.move(k, 1)} className="w-8 h-8 rounded-full bg-card border border-border/40 flex items-center justify-center spring-tap">
                      <ChevronDown className="w-4 h-4 text-foreground" />
                    </button>
                    <button onClick={() => board.toggleHidden(k)} className="w-8 h-8 rounded-full bg-card border border-border/40 flex items-center justify-center spring-tap">
                      {hidden ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
                    </button>
                  </div>
                );
              })}
            </div>
            <button onClick={onClose} className="w-full mt-4 py-3 rounded-[16px] bg-primary text-primary-foreground font-semibold text-[13px] spring-tap">
              Done
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}