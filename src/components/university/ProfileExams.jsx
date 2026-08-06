import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, MapPin, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { EXAM_TYPE_META, timeUntil } from "@/components/university/universityConstants";
import EmptyState from "@/components/ui/EmptyState";

const EASE = [0.16, 1, 0.3, 1];

export default function ProfileExams({ institutionId, search }) {
  const { data: exams, isLoading } = useQuery({
    queryKey: ["uni-exams-schedule", institutionId],
    queryFn: () => base44.entities.ExamSchedule.filter({ institution_id: institutionId, status: "scheduled" }, "date", 100),
    staleTime: 60000,
  });

  const today = new Date().toISOString().split("T")[0];

  const filtered = (exams || []).filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (e.title || "").toLowerCase().includes(q) || (e.course_code || "").toLowerCase().includes(q) ||
      (e.course_title || "").toLowerCase().includes(q) || (e.venue || "").toLowerCase().includes(q) ||
      (e.department_name || "").toLowerCase().includes(q);
  });

  const upcoming = filtered.filter((e) => e.date >= today);

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-[90px] rounded-[18px] shimmer" />)}</div>;
  }

  if (upcoming.length === 0) {
    return (
      <div className="crystal-card">
        <EmptyState
          icon={ClipboardList}
          title={search ? "No results" : "No scheduled exams"}
          description={search ? "Try a different search term." : "Official exam schedules will appear here when published."}
          budGuidance="No upcoming exams published yet. Focus on your coursework — Bud will alert you when the schedule drops."
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {upcoming.map((exam, i) => {
        const typeMeta = EXAM_TYPE_META[exam.type] || EXAM_TYPE_META.final;
        return (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: EASE }}
            className="crystal-card p-3.5"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 flex flex-col items-center">
                <span className="text-[8px] font-bold uppercase text-muted-foreground">{new Date(exam.date).toLocaleDateString("en-US", { month: "short" })}</span>
                <span className="font-heading font-bold text-[20px] text-foreground display-number leading-none">{new Date(exam.date).getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold ${typeMeta.bg} ${typeMeta.color}`}>{typeMeta.label}</span>
                  {exam.course_code && <span className="px-1.5 py-0.5 rounded-full bg-muted/30 text-[8px] font-bold text-muted-foreground">{exam.course_code}</span>}
                </div>
                <h3 className="font-heading font-bold text-[13px] text-foreground line-clamp-1">{exam.title}</h3>
                {exam.course_title && <p className="text-[11px] text-muted-foreground line-clamp-1">{exam.course_title}</p>}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {exam.start_time && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <Clock className="w-2.5 h-2.5" /> {exam.start_time}{exam.end_time ? ` – ${exam.end_time}` : ""}
                    </span>
                  )}
                  {exam.venue && (
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                      <MapPin className="w-2.5 h-2.5" /> {exam.venue}
                    </span>
                  )}
                </div>
                {exam.department_name && <p className="text-[9px] text-muted-foreground mt-1">{exam.department_name}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-bold text-primary">{timeUntil(exam.date)}</span>
                  {exam.academic_session && <span className="text-[8px] text-muted-foreground">{exam.academic_session}</span>}
                </div>
                {exam.instructions && (
                  <div className="mt-2 p-2 rounded-[10px] bg-muted/20">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Instructions</p>
                    <p className="text-[10px] text-foreground">{exam.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}