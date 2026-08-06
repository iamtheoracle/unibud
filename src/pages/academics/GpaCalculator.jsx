import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";
const EASE = [0.16, 1, 0.3, 1];

// Nigerian university grade scales
const SCALES = {
  "5.0": [
    { grade: "A", min: 70, max: 100, point: 5.0 },
    { grade: "B", min: 60, max: 69, point: 4.0 },
    { grade: "C", min: 50, max: 59, point: 3.0 },
    { grade: "D", min: 45, max: 49, point: 2.0 },
    { grade: "E", min: 40, max: 44, point: 1.0 },
    { grade: "F", min: 0, max: 39, point: 0.0 },
  ],
  "4.0": [
    { grade: "A", min: 70, max: 100, point: 4.0 },
    { grade: "B", min: 60, max: 69, point: 3.0 },
    { grade: "C", min: 50, max: 59, point: 2.0 },
    { grade: "D", min: 45, max: 49, point: 1.0 },
    { grade: "F", min: 0, max: 44, point: 0.0 },
  ],
};

const STORAGE_KEY = "unibud_gpa_data";

function scoreToGrade(score, scale) {
  const s = SCALES[scale];
  return s.find((g) => score >= g.min && score <= g.max) || s[s.length - 1];
}

function calcGPA(courses, scale) {
  let totalPoints = 0, totalUnits = 0;
  courses.forEach((c) => {
    if (c.score !== "" && c.units > 0) {
      const g = scoreToGrade(Number(c.score), scale);
      totalPoints += g.point * Number(c.units);
      totalUnits += Number(c.units);
    }
  });
  return totalUnits > 0 ? (totalPoints / totalUnits) : 0;
}

export default function GpaCalculator() {
  const { toast } = useToast();
  const [scale, setScale] = React.useState("5.0");
  const [semesters, setSemesters] = React.useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [{ id: "s1", name: "Semester 1", courses: [{ id: "c1", title: "", code: "", units: 0, score: "" }] }];
  });
  const [activeSem, setActiveSem] = React.useState(0);

  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(semesters));
  }, [semesters]);

  const semester = semesters[activeSem];
  const gpa = calcGPA(semester.courses, scale);
  const allCourses = semesters.flatMap((s) => s.courses);
  const cgpa = calcGPA(allCourses, scale);
  const totalUnits = allCourses.reduce((sum, c) => sum + (Number(c.units) || 0), 0);

  const updateCourse = (cid, field, value) => {
    setSemesters((prev) => prev.map((s, i) => i === activeSem ? { ...s, courses: s.courses.map((c) => c.id === cid ? { ...c, [field]: value } : c) } : s));
  };
  const addCourse = () => {
    setSemesters((prev) => prev.map((s, i) => i === activeSem ? { ...s, courses: [...s.courses, { id: `c${Date.now()}`, title: "", code: "", units: 0, score: "" }] } : s));
  };
  const removeCourse = (cid) => {
    setSemesters((prev) => prev.map((s, i) => i === activeSem ? { ...s, courses: s.courses.filter((c) => c.id !== cid) } : s));
  };
  const addSemester = () => {
    setSemesters((prev) => [...prev, { id: `s${Date.now()}`, name: `Semester ${prev.length + 1}`, courses: [] }]);
    setActiveSem(semesters.length);
    toast({ title: "Semester added ✓" });
  };
  const removeSemester = (idx) => {
    if (semesters.length === 1) return;
    setSemesters((prev) => prev.filter((_, i) => i !== idx));
    setActiveSem(0);
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-40 safe-area-pt">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/academics" className="w-10 h-10 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM }} />
          </Link>
          <div>
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: CREAM }}>GPA Calculator</h1>
            <p className="text-[13px]" style={{ color: CREAM_MUTED }}>Track your academic performance</p>
          </div>
        </div>
      </div>

      {/* CGPA Summary */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="relative overflow-hidden rounded-[24px] p-6 mb-5" style={{ background: "linear-gradient(135deg, rgba(255,138,42,0.12), rgba(44,33,26,0.6))", border: "1px solid rgba(255,138,42,0.15)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[12px] uppercase tracking-wider mb-1" style={{ color: CREAM_MUTED }}>Cumulative GPA</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[42px] font-bold display-number" style={{ color: CREAM }}>{cgpa.toFixed(2)}</span>
              <span className="text-[16px] font-medium" style={{ color: CREAM_MUTED }}>/ {scale}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[12px] uppercase tracking-wider mb-1" style={{ color: CREAM_MUTED }}>Total Units</p>
            <span className="text-[28px] font-bold display-number" style={{ color: ORANGE }}>{totalUnits}</span>
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${ORANGE}, rgba(255,138,42,0.6))` }} initial={{ width: 0 }} animate={{ width: `${(cgpa / Number(scale)) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[11px]" style={{ color: CREAM_MUTED }}>{getClassification(cgpa, scale)}</span>
          <span className="text-[11px] font-semibold" style={{ color: ORANGE }}>{((cgpa / Number(scale)) * 100).toFixed(0)}%</span>
        </div>
      </motion.div>

      {/* Scale Toggle */}
      <div className="flex gap-2 mb-5">
        {Object.keys(SCALES).map((s) => (
          <button key={s} onClick={() => setScale(s)} className="flex-1 h-11 rounded-[14px] text-[13px] font-semibold spring-tap" style={scale === s ? { background: ORANGE, color: "#1a1208" } : { background: "rgba(44,33,26,0.5)", color: CREAM_MUTED, border: "1px solid rgba(255,255,255,0.05)" }}>{s} Scale</button>
        ))}
      </div>

      {/* Semester Tabs */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
        {semesters.map((s, i) => (
          <button key={s.id} onClick={() => setActiveSem(i)} className="px-4 h-9 rounded-full text-[12px] font-medium whitespace-nowrap spring-tap" style={i === activeSem ? { background: "rgba(255,138,42,0.15)", color: ORANGE, border: "1px solid rgba(255,138,42,0.3)" } : { background: "rgba(44,33,26,0.4)", color: CREAM_MUTED, border: "1px solid rgba(255,255,255,0.05)" }}>{s.name}</button>
        ))}
        <button onClick={addSemester} className="w-9 h-9 rounded-full grid place-items-center shrink-0 spring-tap" style={{ background: "rgba(44,33,26,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}><Plus className="w-4 h-4" style={{ color: CREAM_MUTED }} /></button>
      </div>

      {/* Semester GPA */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-[12px]" style={{ color: CREAM_MUTED }}>Semester GPA</span>
        <span className="text-[16px] font-bold" style={{ color: ORANGE }}>{gpa.toFixed(2)}</span>
      </div>

      {/* Course List */}
      <div className="flex flex-col gap-3 mb-4">
        <AnimatePresence>
          {semester.courses.map((c, i) => {
            const grade = c.score !== "" ? scoreToGrade(Number(c.score), scale) : null;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ delay: i * 0.03, ease: EASE }} className="glass-card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <input value={c.title} onChange={(e) => updateCourse(c.id, "title", e.target.value)} placeholder="Course title" className="flex-1 bg-transparent text-[14px] font-medium outline-none min-w-0" style={{ color: CREAM }} />
                  {grade && (
                    <span className="text-[20px] font-bold w-8 text-center" style={{ color: getGradeColor(grade.grade) }}>{grade.grade}</span>
                  )}
                  <button onClick={() => removeCourse(c.id)} className="w-7 h-7 rounded-full grid place-items-center shrink-0 spring-tap" style={{ background: "rgba(239,68,68,0.1)" }}><Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input value={c.code} onChange={(e) => updateCourse(c.id, "code", e.target.value)} placeholder="Code" className="h-10 px-3 rounded-[10px] text-[13px] outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
                  <input type="number" value={c.units || ""} onChange={(e) => updateCourse(c.id, "units", e.target.value)} placeholder="Units" className="h-10 px-3 rounded-[10px] text-[13px] outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
                  <input type="number" value={c.score} onChange={(e) => updateCourse(c.id, "score", e.target.value)} placeholder="Score %" className="h-10 px-3 rounded-[10px] text-[13px] outline-none" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <button onClick={addCourse} className="w-full h-12 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-[14px] mb-4 spring-tap" style={{ background: "rgba(44,33,26,0.5)", border: `1px dashed ${"rgba(255,138,42,0.3)"}`, color: ORANGE }}>
        <Plus className="w-4 h-4" /> Add Course
      </button>

      {semesters.length > 1 && (
        <button onClick={() => removeSemester(activeSem)} className="w-full h-10 rounded-[14px] flex items-center justify-center gap-2 text-[12px] spring-tap" style={{ color: "#EF4444" }}>
          <Trash2 className="w-3.5 h-3.5" /> Remove this semester
        </button>
      )}
    </div>
  );
}

function getClassification(cgpa, scale) {
  const pct = cgpa / Number(scale);
  if (pct >= 0.8) return "First Class";
  if (pct >= 0.6) return "Second Class Upper";
  if (pct >= 0.5) return "Second Class Lower";
  if (pct >= 0.4) return "Third Class";
  return "Below Pass";
}

function getGradeColor(grade) {
  const colors = { A: "#22C55E", B: "#3B82F6", C: "#A855F7", D: "#F59E0B", E: "#F97316", F: "#EF4444" };
  return colors[grade] || CREAM_MUTED;
}