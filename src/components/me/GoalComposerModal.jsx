import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import GlassInput from "@/components/foundation/GlassInput";
import { toast } from "@/components/ui/use-toast";

const CATEGORIES = [
  { value: "cgpa", label: "Increase CGPA" },
  { value: "study_hours", label: "Study Hours" },
  { value: "assignments", label: "Assignments" },
  { value: "revision", label: "Revision" },
  { value: "custom", label: "Custom" },
];

export default function GoalComposerModal({ open, onClose }) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("study_hours");
  const [target, setTarget] = useState(20);
  const [unit, setUnit] = useState("hours");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!title.trim()) {
      toast({ title: "Add a goal title" });
      return;
    }
    setLoading(true);
    try {
      await base44.entities.StudentGoal.create({
        title: title.trim(),
        category,
        target_value: Number(target) || 1,
        unit,
        target_date: date || undefined,
      });
      qc.invalidateQueries({ queryKey: ["meGoals"] });
      toast({ title: "Goal created" });
      setTitle("");
      setTarget(20);
      setUnit("hours");
      setDate("");
      onClose();
    } catch (e) {
      toast({ title: "Failed to create", description: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="relative w-full max-w-[520px] glass-strong rounded-t-[28px] p-5 pb-8 safe-area-pb max-h-[88vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-[18px] text-foreground">New Goal</h2>
              <button onClick={onClose} className="text-[13px] font-semibold text-muted-foreground">Close</button>
            </div>
            <div className="space-y-3.5">
              <GlassInput label="Goal Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Study 3 hours daily" />
              <div>
                <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <GlassInput label="Target" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
                <GlassInput label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="hours / tasks" />
              </div>
              <GlassInput label="Target Date (optional)" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <button
              onClick={create}
              disabled={loading}
              className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50 ice-glow"
            >
              {loading ? <span className="w-5 h-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> : "Create Goal"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}