import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";

export default function NewPostsBanner({ count, onClick, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="sticky top-2 z-30 mx-auto w-fit"
        >
          <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground soft-shadow gold-glow spring-tap"
          >
            <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />
            <span className="text-[12px] font-heading font-bold">
              {count > 1 ? `${count} new posts` : "New post"}
            </span>
            <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.2} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}