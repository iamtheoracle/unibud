import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, User, FileText, Layers } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";

const EASE = [0.16, 1, 0.3, 1];

export default function ProfileCatalog({ institutionId, search }) {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["uni-catalog", institutionId],
    queryFn: () => base44.entities.CourseCatalogEntry.filter({ institution_id: institutionId, is_active: true }, "-created_date", 100),
    staleTime: 120000,
  });

  const filtered = (courses || []).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (c.title || "").toLowerCase().includes(q) || (c.code || "").toLowerCase().includes(q) ||
      (c.department_name || "").toLowerCase().includes(q) || (c.faculty_name || "").toLowerCase().includes(q);
  });

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-[80px] rounded-[18px] shimmer" />)}</div>;
  }

  if (filtered.length === 0) {
    return (
      <div className="crystal-card">
        <EmptyState
          icon={BookOpen}
          title={search ? "No results" : "No courses in catalog"}
          description={search ? "Try a different search term." : "Your institution's official course catalog will appear here."}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filtered.map((course, i) => (
        <motion.button
          key={course.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03, duration: 0.35, ease: EASE }}
          onClick={() => setSelectedCourse(selectedCourse === course.id ? null : course.id)}
          className="w-full text-left crystal-card p-3.5 spring-tap"
        >
          <div className="flex items-start gap-2.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-[8px] font-bold text-primary">{course.code}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-muted/30 text-[8px] font-medium text-muted-foreground">{course.level || "100"} Level</span>
                {course.is_elective && <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-[8px] font-medium text-accent">Elective</span>}
              </div>
              <h3 className="font-heading font-bold text-[13px] text-foreground line-clamp-1">{course.title}</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{course.credits} {course.credit_system === "ECTS" ? "ECTS" : "Credits"}</p>
              {course.department_name && <p className="text-[9px] text-muted-foreground mt-0.5">{course.department_name}</p>}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
          </div>

          {selectedCourse === course.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-3 pt-3 border-t border-border/30 space-y-2"
            >
              {course.description && <p className="text-[11px] text-muted-foreground leading-relaxed">{course.description}</p>}
              {course.lecturer_name && (
                <div className="flex items-center gap-1.5">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-foreground font-medium">{course.lecturer_name}</span>
                </div>
              )}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] font-bold text-muted-foreground">Prerequisites:</span>
                  {course.prerequisites.map((p, j) => (
                    <span key={j} className="px-1.5 py-0.5 rounded-full bg-muted/30 text-[8px] text-muted-foreground">{p}</span>
                  ))}
                </div>
              )}
              {course.topics && course.topics.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Layers className="w-3 h-3 text-muted-foreground" />
                  {course.topics.slice(0, 5).map((t, j) => (
                    <span key={j} className="px-1.5 py-0.5 rounded-full bg-muted/20 text-[8px] text-muted-foreground">{t}</span>
                  ))}
                </div>
              )}
              {course.assessment_breakdown && (
                <div className="p-2 rounded-[10px] bg-muted/20">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">Assessment</p>
                  <p className="text-[10px] text-foreground">{course.assessment_breakdown}</p>
                </div>
              )}
              {course.syllabus_url && (
                <a href={course.syllabus_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-primary spring-tap font-medium">
                  <FileText className="w-3 h-3" /> View Syllabus
                </a>
              )}
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  );
}