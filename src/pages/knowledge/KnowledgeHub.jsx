import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Folder, NotebookPen, FileText, Library } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useKnowledge } from "@/lib/knowledge/useKnowledge";
import KnowledgeSearchBar from "@/components/knowledge/KnowledgeSearchBar";
import KnowledgeItemCard from "@/components/knowledge/KnowledgeItemCard";
import UploadAndExtract from "@/components/knowledge/UploadAndExtract";
import CollectionComposer from "@/components/knowledge/CollectionComposer";

const EASE = [0.16, 1, 0.3, 1];

export default function KnowledgeHub() {
  const navigate = useNavigate();
  const kb = useKnowledge();

  const stats = [
    { label: "Files", value: kb.counts.file, icon: FileText },
    { label: "Notes", value: kb.counts.note, icon: NotebookPen },
    { label: "Library", value: kb.counts.library, icon: Library },
    { label: "Collections", value: kb.counts.collection, icon: Folder },
  ];

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3 spring-tap">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-accent" />
          <h1 className="text-display text-foreground">Knowledge</h1>
        </div>
        <p className="text-sm text-muted-foreground">Your single source of truth — files, notes & library, organized by Spark.</p>
      </motion.div>

      <motion.div className="grid grid-cols-4 gap-2 mt-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.4, ease: EASE }}>
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card p-2.5 flex flex-col items-center gap-1">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-lg font-bold text-foreground leading-none">{s.value}</span>
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </div>
          );
        })}
      </motion.div>

      <div className="mt-4 space-y-3">
        <KnowledgeSearchBar kb={kb} />
        <UploadAndExtract kb={kb} />
        <CollectionComposer kb={kb} />
      </div>

      <div className="mt-5">
        {kb.isSmart && (
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-accent flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Spark semantic results
            </p>
            <button onClick={kb.clearSmart} className="text-[11px] text-muted-foreground">Clear</button>
          </div>
        )}

        {kb.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl shimmer" />)}
          </div>
        ) : kb.filtered.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Sparkles className="w-8 h-8 text-accent mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-foreground">Nothing here yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload a file or add a note — Spark will organize it for you.</p>
          </div>
        ) : (
          <motion.div layout className="space-y-3">
            {kb.filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE, delay: Math.min(i * 0.03, 0.3) }}
              >
                <KnowledgeItemCard item={item} onExtract={kb.extract} onBookmark={kb.addBookmark} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}