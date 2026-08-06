import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import PageHeader from "@/components/academics/PageHeader";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { queryClientInstance } from "@/lib/query-client";
import { base44 } from "@/api/base44Client";
import { Sparkles, Library, ChevronRight } from "lucide-react";
import StudyBuddyCard from "@/components/study/StudyBuddyCard";
import StudyTodayLearning from "@/components/study/StudyTodayLearning";
import StudyContinue from "@/components/study/StudyContinue";
import StudyFocusTimer from "@/components/study/StudyFocusTimer";
import StudyModules from "@/components/study/StudyModules";

const EASE = [0.16, 1, 0.3, 1];

function RecommendedResources() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["studyRecommendedResources"], queryFn: () => base44.entities.LibraryResource.list("-created_date", 6) });
  const items = (data || []).slice(0, 3);
  if (isLoading) return <div className="h-16 rounded-2xl shimmer" />;
  if (!items.length) return null;
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Library className="w-4 h-4 text-primary" /><h2 className="font-heading font-bold text-[15px] text-foreground">Recommended Resources</h2></div>
        <button onClick={() => navigate("/library")} className="text-[11px] font-semibold text-primary flex items-center spring-tap">Library <ChevronRight className="w-3 h-3" /></button>
      </div>
      <div className="space-y-2">
        {items.map((r) => (
          <button key={r.id} onClick={() => navigate("/library")} className="w-full flex items-center gap-3 p-2 rounded-xl bg-muted/30 spring-tap text-left">
            <Library className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-foreground truncate">{r.title || r.name || "Resource"}</p><p className="text-[10px] text-muted-foreground truncate">{r.author || r.category || ""}</p></div>
          </button>
        ))}
      </div>
    </motion.section>
  );
}

export default function StudyHome() {
  const { openWithPrompt } = useBudLauncher();
  const refresh = async () => { await queryClientInstance.invalidateQueries(); };

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
        <PageHeader title="Study" />

        {/* Study Buddy (powered by Bud — not a separate AI) */}
        <StudyBuddyCard message="Your personal tutor, researcher & study coach — powered by Bud." />

        {/* Today's Learning */}
        <div className="mt-4"><StudyTodayLearning /></div>

        {/* Stats + Continue Studying + Weekly Goals */}
        <div className="mt-4 space-y-4"><StudyContinue /></div>

        {/* Recommended Study Session (AI) */}
        <motion.button
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
          onClick={() => openWithPrompt("Based on my upcoming deadlines, classes, and weak topics, recommend the best study session for me right now — what to study, for how long, and how.")}
          className="w-full mt-4 p-4 rounded-2xl crystal-card flex items-center gap-3 spring-tap card-hover text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"><Sparkles className="w-5 h-5 text-primary" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-foreground">Recommended Study Session</p>
            <p className="text-[11px] text-muted-foreground">Let Bud suggest what to study now</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.button>

        {/* Focus Mode */}
        <div className="mt-4"><StudyFocusTimer /></div>

        {/* Recommended Resources */}
        <div className="mt-4"><RecommendedResources /></div>

        {/* All Study Tools */}
        <div className="mt-4"><StudyModules /></div>
      </div>
    </PullToRefresh>
  );
}