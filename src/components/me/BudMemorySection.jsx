import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SectionHeader from "@/components/me/SectionHeader";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];
const TYPE_LABEL = {
  preference: "Preference",
  learning_style: "Learning Style",
  favorite_subject: "Favorite Subject",
  goal: "Goal",
  conversation: "Conversation",
  fact: "Note",
};

/**
 * BudMemorySection — view and remove what Bud remembers. Spark remains
 * responsible for memory management.
 */
export default function BudMemorySection() {
  const qc = useQueryClient();
  const { data: memories } = useQuery({ queryKey: ["meMemories"], queryFn: () => base44.entities.BudMemory.list("-created_date", 100) });
  const del = useMutation({
    mutationFn: (id) => base44.entities.BudMemory.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meMemories"] });
      toast({ title: "Memory removed" });
    },
  });

  return (
    <div>
      <SectionHeader title="Bud Memory" />
      <div className="glass-card p-5">
        <p className="text-[12px] text-muted-foreground mb-3">What Bud remembers about you. Tap remove to forget a detail.</p>
        {!memories || memories.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-6">
            Bud hasn't saved any memories yet. As you study and chat, Bud will remember your preferences and patterns.
          </p>
        ) : (
          <div className="space-y-2">
            {memories.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.3 }} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">{TYPE_LABEL[m.memory_type] || m.memory_type}</p>
                  <p className="text-[13px] text-foreground truncate">{m.content}</p>
                </div>
                <button onClick={() => del.mutate(m.id)} className="text-[11px] font-semibold text-muted-foreground spring-tap">Remove</button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}