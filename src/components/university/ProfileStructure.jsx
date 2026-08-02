import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Building2, ChevronDown, ChevronRight, MapPin, Mail, Globe, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";

const EASE = [0.16, 1, 0.3, 1];

export default function ProfileStructure({ institutionId, search }) {
  const [expandedFaculty, setExpandedFaculty] = useState(null);

  const { data: faculties, isLoading: facLoading } = useQuery({
    queryKey: ["uni-faculties", institutionId],
    queryFn: () => base44.entities.Faculty.filter({ institution_id: institutionId, is_active: true }, "sort_order", 100),
    staleTime: 120000,
  });

  const { data: departments } = useQuery({
    queryKey: ["uni-departments", institutionId],
    queryFn: () => base44.entities.Department.filter({ institution_id: institutionId, is_active: true }, "sort_order", 200),
    staleTime: 120000,
  });

  const filteredFaculties = (faculties || []).filter((f) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (f.name || "").toLowerCase().includes(q) || (f.code || "").toLowerCase().includes(q) || (f.description || "").toLowerCase().includes(q);
  });

  const getDepartmentsForFaculty = (facultyId, facultyName) => {
    return (departments || []).filter((d) => d.faculty_id === facultyId || d.faculty_name === facultyName);
  };

  if (facLoading) {
    return <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-[80px] rounded-[18px] shimmer" />)}</div>;
  }

  if (filteredFaculties.length === 0) {
    return (
      <div className="crystal-card">
        <EmptyState
          icon={GraduationCap}
          title={search ? "No results" : "No faculties published"}
          description={search ? "Try a different search term." : "Your institution's faculty structure will appear here."}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {filteredFaculties.map((faculty, i) => {
        const isExpanded = expandedFaculty === faculty.id;
        const deptList = getDepartmentsForFaculty(faculty.id, faculty.name);
        const matchesDeptSearch = search.trim() && deptList.some((d) =>
          (d.name || "").toLowerCase().includes(search.toLowerCase()) || (d.code || "").toLowerCase().includes(search.toLowerCase())
        );
        const showExpanded = isExpanded || matchesDeptSearch;

        return (
          <motion.div
            key={faculty.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }}
            className="crystal-card overflow-hidden"
          >
            <button
              onClick={() => setExpandedFaculty(showExpanded ? null : faculty.id)}
              className="w-full p-3.5 flex items-center gap-3 text-left spring-tap"
            >
              <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ background: `hsl(${faculty.color || "26 100% 50%"} / 0.10)` }}>
                <GraduationCap className="w-5 h-5" style={{ color: `hsl(${faculty.color || "26 100% 50%"})` }} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-[14px] text-foreground line-clamp-1">{faculty.name}</h3>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {faculty.code && <span className="text-[9px] font-bold text-muted-foreground">{faculty.code}</span>}
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Building2 className="w-2.5 h-2.5" /> {deptList.length} dept{deptList.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              {showExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </button>

            <AnimatePresence>
              {showExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 pb-3.5 space-y-2 border-t border-border/30 pt-3">
                    {faculty.dean_name && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dean:</span>
                        <span className="text-[11px] text-foreground font-medium">{faculty.dean_name}</span>
                      </div>
                    )}
                    {deptList.length === 0 ? (
                      <p className="text-[11px] text-muted-foreground italic py-2">No departments published yet.</p>
                    ) : (
                      deptList.map((dept) => (
                        <div key={dept.id} className="p-3 rounded-[14px] bg-muted/20">
                          <div className="flex items-start gap-2">
                            <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-bold text-foreground">{dept.name}</p>
                              {dept.code && <span className="text-[9px] font-bold text-muted-foreground">{dept.code}</span>}
                              {dept.hod_name && <p className="text-[10px] text-muted-foreground mt-1">HOD: {dept.hod_name}</p>}
                              {dept.programs_offered && dept.programs_offered.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  {dept.programs_offered.slice(0, 4).map((prog, j) => (
                                    <span key={j} className="px-1.5 py-0.5 rounded-full bg-muted/40 text-[8px] text-muted-foreground font-medium">{prog}</span>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {dept.location && <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground"><MapPin className="w-2.5 h-2.5" /> {dept.location}</span>}
                                {dept.contact_email && <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground"><Mail className="w-2.5 h-2.5" /> {dept.contact_email}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}