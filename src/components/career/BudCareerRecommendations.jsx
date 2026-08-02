import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Sparkles, Calendar, Building2, MapPin } from "lucide-react";
import { TYPE_META } from "./careerConstants";

export default function BudCareerRecommendations({ user, opportunities, onOpen }) {
  const { data: courses } = useQuery({
    queryKey: ["userCoursesForCareerRecs"],
    queryFn: () => base44.entities.Course.filter({ created_by_id: user?.id }, "-created_date", 20),
    enabled: !!user?.id,
  });

  const recommendations = useMemo(() => {
    if (!opportunities || !user) return [];
    const now = new Date();
    const userDept = user?.data?.department || user?.department;
    const userFaculty = user?.data?.faculty || user?.faculty;
    const userInterests = user?.data?.interests || [];
    const userCourseCodes = (courses || []).map((c) => c.course_code).filter(Boolean);
    const userCourseSubjects = (courses || []).map((c) => c.title || c.name).filter(Boolean);

    return opportunities
      .filter((o) => {
        if (!o.deadline) return true;
        return new Date(o.deadline) >= now;
      })
      .map((opp) => {
        let score = 0;
        const reasons = [];

        if (userDept && (opp.tags || []).some((t) => t.toLowerCase().includes(userDept.toLowerCase()))) {
          score += 10; reasons.push("Matches your field");
        }
        if (userFaculty && (opp.tags || []).some((t) => t.toLowerCase().includes(userFaculty.toLowerCase()))) {
          score += 5; reasons.push("Your faculty");
        }
        if (userInterests.length > 0) {
          const matchCount = (opp.tags || []).filter((t) => userInterests.some((ui) => t.toLowerCase().includes(ui.toLowerCase()))).length;
          if (matchCount > 0) { score += matchCount * 4; reasons.push("Matches interests"); }
        }
        if (userCourseSubjects.length > 0) {
          const courseMatch = (opp.tags || []).some((t) => userCourseSubjects.some((cs) => cs.toLowerCase().includes(t.toLowerCase())));
          if (courseMatch) { score += 6; reasons.push("Matches your courses"); }
        }
        if (opp.deadline) {
          const days = Math.ceil((new Date(opp.deadline) - now) / (1000 * 60 * 60 * 24));
          if (days <= 7 && days >= 0) { score += 4; reasons.push("Closing soon"); }
          else if (days <= 30) { score += 2; }
        }
        if (opp.amount && opp.amount !== "Volunteer" && !opp.amount.toLowerCase().includes("unpaid")) {
          score += 2;
        }
        if (["internship", "job", "graduate_job", "campus_job"].includes(opp.type)) {
          score += 1;
        }

        return { opp, score, reasons };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [opportunities, user, courses]);

  if (recommendations.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2.5 px-1">
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-chocolate flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <h3 className="text-[13px] font-bold text-foreground">Bud Recommends</h3>
      </div>
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        {recommendations.map((rec, i) => {
          const meta = TYPE_META[rec.opp.type] || TYPE_META.job;
          const Icon = meta.icon;
          return (
            <motion.button
              key={rec.opp.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => onOpen?.(rec.opp)}
              className="shrink-0 w-[185px] glass-card rounded-[16px] p-3 text-left spring-tap card-hover"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-7 h-7 rounded-[10px] flex items-center justify-center" style={{ background: `hsl(var(--${meta.color}) / 0.10)` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: `hsl(var(--${meta.color}))` }} />
                </div>
                <span className="text-[9px] font-bold uppercase text-muted-foreground">{meta.label}</span>
              </div>
              <p className="text-[11px] font-bold text-foreground line-clamp-2 leading-tight mb-1">{rec.opp.title}</p>
              <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 mb-1.5"><Building2 className="w-2.5 h-2.5" /> {rec.opp.organization}</p>
              {rec.opp.deadline && (
                <p className="text-[9px] text-muted-foreground flex items-center gap-0.5 mb-1.5"><Calendar className="w-2.5 h-2.5" /> {rec.opp.deadline}</p>
              )}
              <div className="flex flex-wrap gap-1">
                {rec.reasons.slice(0, 2).map((reason) => (
                  <span key={reason} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold">{reason}</span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}