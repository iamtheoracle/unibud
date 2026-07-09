import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { BookHeart, Plus, Loader2, Calendar } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const PROMPTS = [
  "What went well today?",
  "What's on your mind right now?",
  "One thing you're grateful for...",
  "What challenged you today?",
  "What are you looking forward to?",
];

export default function JournalSection() {
  const qc = useQueryClient();
  const [writing, setWriting] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: entries, isLoading } = useQuery({
    queryKey: ["wellnessJournals"],
    queryFn: () => base44.entities.WellnessEntry.filter({ entry_type: "journal" }, "-entry_date", 20),
  });

  const save = async () => {
    if (!content.trim()) return;
    setSaving(true);
    await base44.entities.WellnessEntry.create({
      entry_type: "journal",
      title: title || "Journal Entry",
      content,
      entry_date: new Date().toISOString().split("T")[0],
      is_private: true,
    });
    qc.invalidateQueries({ queryKey: ["wellnessJournals"] });
    setTitle("");
    setContent("");
    setWriting(false);
    setSaving(false);
  };

  if (writing) {
    return (
      <GlassCard variant="solid" className="p-5" delay={0.05}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-[14px] text-foreground">New Entry</h3>
          <button onClick={() => setWriting(false)} className="text-[12px] text-muted-foreground">Cancel</button>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full mb-2.5 px-4 py-2.5 rounded-[12px] bg-muted/50 border border-border/40 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={PROMPTS[Math.floor(Math.random() * PROMPTS.length)]}
          className="w-full h-40 px-4 py-3 rounded-[14px] bg-muted/50 border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <button
          onClick={save}
          disabled={saving || !content.trim()}
          className="w-full h-12 mt-3 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Entry"}
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setWriting(true)}
        className="w-full h-14 rounded-[16px] bg-primary text-primary-foreground font-heading font-semibold text-[14px] flex items-center justify-center gap-2 spring-tap gold-glow"
      >
        <Plus className="w-5 h-5" /> Write Journal Entry
      </button>

      {isLoading && <div className="h-20 rounded-[20px] shimmer" />}

      <AnimatePresence>
        {(entries || []).map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <GlassCard variant="solid" className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookHeart className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold text-[13px] text-foreground">{entry.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 mb-2">
                    <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{entry.entry_date}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-4">{entry.content}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </AnimatePresence>

      {entries && entries.length === 0 && (
        <div className="text-center py-10">
          <BookHeart className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-[12px] text-muted-foreground">No journal entries yet</p>
        </div>
      )}
    </div>
  );
}