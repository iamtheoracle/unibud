import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, GraduationCap, Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useAcademicTimeline } from "@/lib/identity/useAcademicTimeline";
import AcademicTimelineList from "@/components/identity/AcademicTimelineList";
import TimelineMilestoneComposer from "@/components/identity/TimelineMilestoneComposer";

export default function AcademicTimeline() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { entries, loading, add, remove, setHidden, saving } = useAcademicTimeline(user?.id);
  const [composerOpen, setComposerOpen] = useState(false);

  const handleAdd = async (data) => {
    try {
      await add(data);
      setComposerOpen(false);
      toast({ title: "Milestone added to your timeline" });
    } catch {
      toast({ title: "Could not add milestone", variant: "destructive" });
    }
  };

  const handleToggleHidden = async (entry) => {
    try {
      await setHidden({ id: entry.id, hidden: !entry.is_hidden });
    } catch {
      toast({ title: "Could not update milestone", variant: "destructive" });
    }
  };

  const handleRemove = async (entry) => {
    try {
      await remove(entry.id);
      toast({ title: "Milestone removed" });
    } catch {
      toast({ title: "Could not remove milestone", variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <header className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full glass-card flex items-center justify-center spring-tap shrink-0">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] text-foreground tracking-tight">Academic Timeline</h1>
          <p className="text-[12px] text-muted-foreground">Your journey — admission through alumni.</p>
        </div>
        <button
          onClick={() => setComposerOpen(true)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center spring-tap shrink-0 ice-glow"
        >
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState onAdd={() => setComposerOpen(true)} />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <AcademicTimelineList
            entries={entries}
            ownerView
            onToggleHidden={handleToggleHidden}
            onRemove={handleRemove}
          />
        </motion.div>
      )}

      <TimelineMilestoneComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSubmit={handleAdd}
        saving={saving}
      />
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="rounded-[24px] p-8 glass-card text-center">
      <div className="w-16 h-16 rounded-[20px] bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <GraduationCap className="w-8 h-8 text-primary" />
      </div>
      <p className="text-[15px] font-semibold text-foreground">Your story starts here</p>
      <p className="text-[12px] text-muted-foreground mt-1 max-w-[280px] mx-auto leading-relaxed">
        Add your admission, semesters, awards, research and leadership roles to build a trusted record of your university journey — one that grows with you into alumni life.
      </p>
      <button onClick={onAdd} className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">
        <Sparkles className="w-4 h-4" /> Add your first milestone
      </button>
    </div>
  );
}