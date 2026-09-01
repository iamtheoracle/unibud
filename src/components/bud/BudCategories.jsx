import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight } from "lucide-react";
import { ORACLE_CATEGORIES } from "@/lib/oracleCategories";

/**
 * Eight premium capability cards shown below the Bud conversation.
 * Selecting a category reveals suggested prompts — the user stays in the same Bud conversation.
 */
export default function BudCategories({ onPrompt }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="px-4 pb-2">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
        Bud can help with
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {ORACLE_CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const isSelected = selected === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={() => setSelected(isSelected ? null : cat.id)}
              className={
                "text-left p-3 rounded-[18px] border transition-all spring-tap " +
                (isSelected
                  ? "bg-card border-primary/30 premium-shadow"
                  : "bg-card border-border/30 soft-shadow card-hover")
              }
            >
              <div className={"w-9 h-9 rounded-[12px] " + cat.bg + " flex items-center justify-center mb-2"}>
                <Icon className={"w-[18px] h-[18px] " + cat.color} strokeWidth={2.2} />
              </div>
              <p className="font-heading font-semibold text-[12px] text-foreground">{cat.label}</p>
              <p className="text-[9px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">{cat.description}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Suggested prompts for selected category */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-card rounded-[18px] p-3.5 border border-border/30 soft-shadow">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[11px] font-semibold text-foreground">
                  Try asking Bud about {getLabel(selected)}
                </p>
                <button onClick={() => setSelected(null)} className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center">
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
              <div className="space-y-1.5">
                {getPrompts(selected).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onPrompt(prompt);
                      setSelected(null);
                    }}
                    className="w-full text-left flex items-center gap-2 p-2.5 rounded-[12px] bg-muted/40 hover:bg-muted/70 transition-colors spring-tap"
                  >
                    <span className="text-[11px] text-foreground flex-1 leading-snug">{prompt}</span>
                    <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getLabel(id) {
  const cat = ORACLE_CATEGORIES.find((c) => c.id === id);
  return cat ? cat.label.toLowerCase() : "";
}

function getPrompts(id) {
  const cat = ORACLE_CATEGORIES.find((c) => c.id === id);
  return cat ? cat.prompts : [];
}