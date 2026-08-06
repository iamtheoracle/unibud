import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Eye, EyeOff, Check } from "lucide-react";
import { NEWS_SUBCATEGORIES } from "./newsConstants";

const EASE = [0.16, 1, 0.3, 1];

export default function NewsManageSheet({ open, onClose, preferences }) {
  const { followed, pinned, hidden, toggleFollow, togglePin, toggleHidden } = preferences;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[140] bg-black/60"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 right-0 z-[141] bg-card rounded-t-[28px] elevated-shadow border-t border-border/30 max-h-[70vh] overflow-y-auto no-scrollbar safe-area-pb"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3" />
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <h2 className="text-[16px] font-bold text-foreground">Manage News Topics</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full glass grid place-items-center spring-tap">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="px-4 text-[11px] text-muted-foreground mb-3">Follow topics you care about, pin favourites to the front, or hide topics you don't want to see.</p>

            <div className="px-4 pb-6 space-y-1">
              {NEWS_SUBCATEGORIES.map((sub) => {
                const isFollowed = followed.includes(sub.id);
                const isPinned = pinned.includes(sub.id);
                const isHidden = hidden.includes(sub.id);

                return (
                  <div key={sub.id} className={"flex items-center gap-3 p-2.5 rounded-2xl transition-colors " + (isHidden ? "opacity-40" : "")}>
                    <span className="flex-1 text-[13px] font-medium text-foreground">{sub.label}</span>
                    <button onClick={() => togglePin(sub.id)} className={"w-8 h-8 rounded-full grid place-items-center spring-tap " + (isPinned ? "bg-primary/15 text-primary" : "glass text-muted-foreground")}>
                      <Star className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleFollow(sub.id)} className={"w-8 h-8 rounded-full grid place-items-center spring-tap " + (isFollowed ? "bg-foreground text-background" : "glass text-muted-foreground")}>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toggleHidden(sub.id)} className={"w-8 h-8 rounded-full grid place-items-center spring-tap " + (isHidden ? "bg-destructive/15 text-destructive" : "glass text-muted-foreground")}>
                      {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}