import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ClipboardList, FlaskConical, HelpCircle, Presentation,
  GraduationCap, Beaker, Microscope, FolderKanban, BookMarked,
  Users, FolderOpen, X, Check, Loader2, ChevronRight,
} from "lucide-react";
import { RESOURCE_TEMPLATES } from "@/data/resourceTemplates";

const EASE = [0.16, 1, 0.3, 1];
const ICON_MAP = {
  FileText, ClipboardList, FlaskConical, HelpCircle, Presentation,
  GraduationCap, Beaker, Microscope, FolderKanban, BookMarked,
  Users, FolderOpen,
};

export default function ResourceTemplateSheet({ onClose, onApply, groupName }) {
  const [selected, setSelected] = useState(null);
  const [applying, setApplying] = useState(false);

  const handleApply = async () => {
    if (!selected) return;
    setApplying(true);
    await onApply(selected);
    setApplying(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="relative w-full max-w-[640px] max-h-[85vh] bg-background rounded-t-[28px] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="w-10 h-1 rounded-full bg-muted mx-auto mt-3 shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3 pb-2 shrink-0">
            <div>
              <h2 className="text-[17px] font-heading font-bold text-foreground tracking-tight">Library Templates</h2>
              <p className="text-[11px] text-muted-foreground">Create an organized resource library in one tap</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center spring-tap">
              <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
            </button>
          </div>

          {/* Template grid */}
          <div className="flex-1 overflow-y-auto px-5 pb-3 no-scrollbar">
            <div className="grid grid-cols-2 gap-2.5">
              {RESOURCE_TEMPLATES.map((tpl, i) => {
                const Icon = ICON_MAP[tpl.icon] || FolderOpen;
                const isSelected = selected?.id === tpl.id;
                return (
                  <motion.button
                    key={tpl.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
                    onClick={() => setSelected(tpl)}
                    className={`relative text-left p-3.5 rounded-[18px] border transition-all spring-tap ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/40 bg-card"
                    }`}
                    style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.03)" }}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                      </div>
                    )}
                    <div className={`w-9 h-9 rounded-[12px] ${tpl.color} flex items-center justify-center mb-2`}>
                      <Icon className={`w-4.5 h-4.5 ${tpl.iconColor}`} strokeWidth={2} style={{ width: 18, height: 18 }} />
                    </div>
                    <p className="text-[12px] font-bold text-foreground leading-tight">{tpl.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{tpl.description}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <FolderOpen className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
                      <span className="text-[9px] font-semibold text-muted-foreground">{tpl.folders.length} folders</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Preview + Apply */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="shrink-0 border-t border-border/30 overflow-hidden"
              >
                <div className="px-5 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Creates {selected.folders.length} organized folders</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {selected.folders.slice(0, 5).map((f, i) => (
                      <span key={i} className="text-[10px] px-2 py-1 rounded-full bg-muted/40 text-muted-foreground truncate max-w-[140px]">
                        {f.title}
                      </span>
                    ))}
                    {selected.folders.length > 5 && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-muted/40 text-muted-foreground">+{selected.folders.length - 5} more</span>
                    )}
                  </div>
                  <button
                    onClick={handleApply}
                    disabled={applying}
                    className="w-full h-11 rounded-full bg-primary text-primary-foreground text-[14px] font-bold flex items-center justify-center gap-2 spring-tap disabled:opacity-50"
                  >
                    {applying ? (
                      <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.2} /> Creating library…</>
                    ) : (
                      <>Apply Template <ChevronRight className="w-4 h-4" strokeWidth={2.2} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-3 shrink-0 safe-area-pb" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}