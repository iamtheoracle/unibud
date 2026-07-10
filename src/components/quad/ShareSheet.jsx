import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check } from "lucide-react";
import { SHARE_TARGETS } from "./quadConstants";

/**
 * Bottom sheet modal for sharing a post to various targets.
 */
export default function ShareSheet({ open, onClose, postUrl }) {
  const [copied, setCopied] = useState(false);
  const [sharedTo, setSharedTo] = useState(null);

  const handleShare = (target) => {
    if (target.id === "copy_link") {
      const url = postUrl || window.location.href;
      navigator.clipboard?.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
      return;
    }
    setSharedTo(target.id);
    setTimeout(() => {
      setSharedTo(null);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-0 inset-x-0 z-[100] bg-card rounded-t-[28px] elevated-shadow border-t border-border/30 p-5 pb-8"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[16px] text-foreground">Share to</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SHARE_TARGETS.map((target) => (
                <motion.button
                  key={target.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleShare(target)}
                  className="flex flex-col items-center gap-2 p-3 rounded-[16px] hover:bg-muted/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-[16px] bg-primary/10 flex items-center justify-center">
                    {sharedTo === target.id ? (
                      <Check className="w-5 h-5 text-success" strokeWidth={2.5} />
                    ) : target.id === "copy_link" && copied ? (
                      <Check className="w-5 h-5 text-success" strokeWidth={2.5} />
                    ) : (
                      <target.icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-foreground text-center">
                    {target.id === "copy_link" && copied ? "Copied!" : sharedTo === target.id ? "Shared!" : target.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}