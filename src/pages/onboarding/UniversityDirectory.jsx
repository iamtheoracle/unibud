import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Building2, GraduationCap, ChevronRight, Check, ArrowRight, Loader2, Sparkles } from "lucide-react";
import UniversitySelector from "@/components/onboarding/UniversitySelector";
import CourseSelector from "@/components/onboarding/CourseSelector";
import { INSTITUTION_TYPES, INSTITUTION_TYPE_COLORS } from "@/data/nigerianInstitutions";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "@/components/ui/use-toast";

export default function UniversityDirectory() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [course, setCourse] = useState(null);
  const [uniOpen, setUniOpen] = useState(true);
  const [courseOpen, setCourseOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!institution || !course) return;
    setSaving(true);
    try {
      await base44.auth.updateMe({
        university: institution.name,
        institution_type: institution.type,
        institution_state: institution.state,
        course: course.name,
        department: course.department || course.name,
        faculty: course.faculty || "",
        course_original_input: course.original || course.name,
        onboarding_step: "university_directory",
      });
      await refreshUser();
      toast({ title: "Institution saved" });
      navigate("/home");
    } catch {
      toast({ title: "Couldn't save — try again" });
    }
    setSaving(false);
  };

  const typeLabel = (t) => INSTITUTION_TYPES.find((x) => x.key === t)?.label || t;

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-[12px] font-semibold text-primary">Your institution belongs here</span>
        </div>
        <h1 className="font-heading font-extrabold text-[26px] text-foreground tracking-tight leading-tight">
          Tell us where you study
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1.5">
          Search any Nigerian institution — universities, polytechnics, colleges of education and more. We'll connect your academic tools automatically.
        </p>
      </motion.div>

      {/* Institution card */}
      <button
        onClick={() => setUniOpen(true)}
        className="w-full glass-card rounded-[22px] p-4 mb-4 text-left spring-tap card-hover"
      >
        {institution ? (
          <SelectedInstitution inst={institution} typeLabel={typeLabel(institution.type)} />
        ) : (
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-[14px] bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-foreground">Select your institution</p>
              <p className="text-[12px] text-muted-foreground">Universities, polytechnics, colleges of education…</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </button>

      {/* Course card */}
      <button
        onClick={() => institution && setCourseOpen(true)}
        disabled={!institution}
        className={`w-full glass-card rounded-[22px] p-4 mb-6 text-left spring-tap card-hover ${!institution ? "opacity-40" : ""}`}
      >
        {course ? (
          <SelectedCourse course={course} />
        ) : (
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-[14px] bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary" />
            </span>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-foreground">{institution ? "Select your course" : "Select an institution first"}</p>
              <p className="text-[12px] text-muted-foreground">{institution ? "Browse by faculty or type it manually" : "Course selection unlocks after your institution"}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
      </button>

      <button
        onClick={save}
        disabled={!institution || !course || saving}
        className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap disabled:opacity-40"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Continue <ArrowRight className="w-4 h-4" /></>}
      </button>

      <UniversitySelector
        open={uniOpen}
        onClose={() => setUniOpen(false)}
        onSelect={(inst) => { setInstitution(inst); setUniOpen(false); setCourse(null); }}
      />
      <CourseSelector
        open={courseOpen}
        institutionName={institution?.name}
        onClose={() => setCourseOpen(false)}
        onSelect={(c) => { setCourse(c); setCourseOpen(false); }}
      />
    </div>
  );
}

function SelectedInstitution({ inst, typeLabel }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-11 h-11 rounded-[14px] flex items-center justify-center font-heading font-bold text-[12px] text-white" style={{ background: INSTITUTION_TYPE_COLORS[inst.type] }}>
        {inst.short.slice(0, 3)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-foreground truncate">{inst.name}</p>
        <p className="text-[12px] text-muted-foreground">{inst.state} · {typeLabel}</p>
      </div>
      <span className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center">
        <Check className="w-3.5 h-3.5 text-success" />
      </span>
    </div>
  );
}

function SelectedCourse({ course }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-11 h-11 rounded-[14px] bg-primary/10 flex items-center justify-center">
        <GraduationCap className="w-5 h-5 text-primary" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-foreground truncate">{course.name}</p>
        <p className="text-[12px] text-muted-foreground truncate">
          {course.faculty || (course.manual ? "Custom course" : "")}{course.manual && course.original && course.original.toLowerCase() !== course.name.toLowerCase() ? ` · from "${course.original}"` : ""}
        </p>
      </div>
      <span className="w-6 h-6 rounded-full bg-success/15 flex items-center justify-center">
        <Check className="w-3.5 h-3.5 text-success" />
      </span>
    </div>
  );
}