import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Pause, Play, Trash2, Download, Clock } from "lucide-react";

const TYPE_LABEL = {
  preference: "Preference",
  learning_style: "Learning",
  favorite_subject: "Subject",
  goal: "Goal",
  conversation: "Conversation",
  fact: "Note",
};

/**
 * BudMemoryTimeline — Bud's long-term memory, with full privacy controls:
 * review, pause, delete, export, clear. Memory is transparent and user-owned.
 */
export default function BudMemoryTimeline({ memories, paused, onTogglePause, onRemove, onExport, onClear, loading }) {
  return (
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-primary" strokeWidth={2} />
        <p className="font-heading font-semibold text-[13px] text-foreground flex-1">What Bud remembers</p>
        <button
          onClick={onTogglePause}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-full glass text-[11px] font-semibold text-foreground spring-tap"
        >
          {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          {paused ? "Resume" : "Pause"}
        </button>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <button onClick={onExport} disabled={!memories.length} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full glass text-[11px] font-medium text-foreground spring-tap disabled:opacity-40">
          <Download className="w-3 h-3" /> Export
        </button>
        <button onClick={onClear} disabled={!memories.length} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full glass text-[11px] font-medium text-destructive spring-tap disabled:opacity-40">
          <Trash2 className="w-3 h-3" /> Clear all
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="h-10 rounded-[16px] shimmer" />)}
        </div>
      ) : memories.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <Clock className="w-7 h-7 text-muted-foreground/50 mb-2" strokeWidth={1.5} />
          <p className="text-[12px] text-muted-foreground">Bud hasn't learned anything yet. As you use UNIBUD, I'll quietly remember what works for you.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
          <AnimatePresence initial={false}>
            {memories.map((m) => (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="flex items-start gap-2 p-2.5 rounded-[16px] glass"
              >
                <span className="mt-0.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold flex-shrink-0">
                  {TYPE_LABEL[m.memory_type] || "Note"}
                </span>
                <p className="flex-1 text-[12px] text-foreground leading-snug">{m.content}</p>
                <button onClick={() => onRemove(m.id)} className="text-muted-foreground hover:text-destructive spring-tap flex-shrink-0" aria-label="Forget this">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}