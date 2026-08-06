import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Sparkles, Star, Shield } from "lucide-react";

export default function BudTutorRecommendations({ user, tutors, onOpen }) {
  const { data: courses } = useQuery({
    queryKey: ["userCoursesForTutorRecs"],
    queryFn: () => base44.entities.Course.filter({ created_by_id: user?.id }, "-created_date", 20),
    enabled: !!user?.id,
  });

  const recommendations = useMemo(() => {
    if (!tutors || !user) return [];
    const userCourseCodes = (courses || []).map((c) => c.course_code).filter(Boolean);
    const userDept = user?.data?.department || user?.department;
    const userFaculty = user?.data?.faculty || user?.faculty;

    return tutors
      .filter((t) => t.status === "active" && t.tutor_id !== user?.id)
      .map((tutor) => {
        let score = 0;
        const reasons = [];

        const courseMatch = (tutor.course_codes || []).filter((c) => userCourseCodes.includes(c));
        if (courseMatch.length > 0) { score += 15; reasons.push("Matches your courses"); }

        if (userDept && tutor.department === userDept) { score += 8; reasons.push("Your department"); }
        if (userFaculty && tutor.faculty === userFaculty) { score += 5; reasons.push("Your faculty"); }
        if (tutor.is_verified) { score += 4; reasons.push("Verified"); }
        if (tutor.rating >= 4.5) { score += 4; reasons.push("Top rated"); }
        if (tutor.is_free) { score += 2; reasons.push("Free sessions"); }
        if ((tutor.sessions_completed || 0) > 10) { score += 2; reasons.push("Experienced"); }

        return { tutor, score, reasons };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [tutors, user, courses]);

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
        {recommendations.map((rec, i) => (
          <motion.button
            key={rec.tutor.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
            onClick={() => onOpen?.(rec.tutor)}
            className="shrink-0 w-[170px] glass-card rounded-[16px] p-3 text-left spring-tap card-hover"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-primary">{(rec.tutor.tutor_name || "?").charAt(0)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-0.5">
                  <p className="text-[11px] font-bold text-foreground truncate">{rec.tutor.tutor_name}</p>
                  {rec.tutor.is_verified && <Shield className="w-2.5 h-2.5 text-success shrink-0" />}
                </div>
                {rec.tutor.rating > 0 && (
                  <span className="flex items-center gap-0.5 text-[9px] font-semibold text-foreground">
                    <Star className="w-2 h-2 fill-warning text-warning" /> {rec.tutor.rating}
                  </span>
                )}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground line-clamp-1 mb-1.5">
              {(rec.tutor.subjects || []).slice(0, 2).join(" · ") || rec.tutor.department || "Tutor"}
            </p>
            <div className="flex flex-wrap gap-1">
              {rec.reasons.slice(0, 2).map((reason) => (
                <span key={reason} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-bold">{reason}</span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}