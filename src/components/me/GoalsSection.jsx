import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SectionHeader from "@/components/me/SectionHeader";
import GoalComposerModal from "@/components/me/GoalComposerModal";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Goals — create and track personal academic goals with progress bars.
 */
export default function GoalsSection() {
  const qc = useQueryClient();
  const [composing, setComposing] = useState(false);
  const { data: goals } = useQuery({ queryKey: ["meGoals"], queryFn: () => base44.entities.StudentGoal.list() });

  const inc = useMutation({
    mutationFn: ({ id, current, target }) =>
      base44.entities.StudentGoal.update(id, { current_value: Math.min(current + 1, target), is_completed: current + 1 >= target }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meGoals"] }),
  });
  const del = useMutation({
    mutationFn: (id) => base44.entities.StudentGoal.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meGoals"] }),
  });

  return (
    <div>
      <SectionHeader
        title="Goals"
        action={
          <button onClick={() => setComposing(true)} className="text-[12px] font-semibold text-primary spring-tap">+ Add Goal</button>
        }
      />
      <div className="space-y-3">
        {!goals || goals.length === 0 ? (
          <div className="glass-card p-5 text-center">
            <p className="text-[13px] text-muted-foreground">No goals yet. Create one to start tracking your progress.</p>
          </div>
        ) : (
          goals.map((g, i) => {
            const pct = g.target_value > 0 ? Math.min((g.current_value || 0) / g.target_value, 1) : 0;
            return (
              <motion.div key={g.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4, ease: EASE }} className="glass-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-foreground">{g.title}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{g.category.replace("_", " ")}{g.target_date ? ` · by ${g.target_date}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => inc.mutate({ id: g.id, current: g.current_value || 0, target: g.target_value })}
                      disabled={g.is_completed}
                      className="px-2.5 h-7 rounded-full glass text-[12px] font-semibold text-foreground spring-tap disabled:opacity-40"
                    >
                      +1
                    </button>
                    <button onClick={() => del.mutate(g.id)} className="text-[11px] font-semibold text-muted-foreground spring-tap">Delete</button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {g.current_value || 0}/{g.target_value}{g.unit ? ` ${g.unit}` : ""}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
      <GoalComposerModal open={composing} onClose={() => setComposing(false)} />
    </div>
  );
}