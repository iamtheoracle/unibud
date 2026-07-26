import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Award, BookOpen, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

/** Nigerian 5.0 GPA scale. */
function pctToPoints(p) {
  if (p >= 70) return 5;
  if (p >= 60) return 4;
  if (p >= 50) return 3;
  if (p >= 45) return 2;
  if (p >= 40) return 1;
  return 0;
}
function letter(p) {
  if (p >= 70) return "A";
  if (p >= 60) return "B";
  if (p >= 50) return "C";
  if (p >= 45) return "D";
  if (p >= 40) return "E";
  return "F";
}
function gpaOf(list) {
  let w = 0, pts = 0;
  list.forEach((g) => {
    const unit = g.weight || 10;
    const p = (g.score / g.max_score) * 100;
    w += unit;
    pts += pctToPoints(p) * unit;
  });
  return w ? pts / w : 0;
}

export default function Results() {
  const navigate = useNavigate();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: grades, isLoading } = useQuery({
    queryKey: ["StudentGrade"],
    queryFn: () => base44.entities.StudentGrade.list(),
    enabled: !!user,
  });

  const list = grades || [];

  const semesters = useMemo(() => {
    const map = {};
    list.forEach((g) => {
      const s = g.semester || "Unassigned";
      (map[s] ||= []).push(g);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [list]);

  const cgpa = useMemo(() => gpaOf(list), [list]);
  const bestSem = useMemo(() => {
    let best = null;
    semesters.forEach(([name, items]) => {
      const g = gpaOf(items);
      if (!best || g > best.g) best = { name, g };
    });
    return best;
  }, [semesters]);

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div>
          <h1 className="font-heading font-extrabold text-[22px] text-foreground tracking-tight">Results & GPA</h1>
          <p className="text-[12px] text-muted-foreground">Your academic performance at a glance</p>
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-[24px] p-8 glass-card text-center">
          <div className="w-14 h-14 rounded-[18px] bg-primary/8 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-7 h-7 text-primary" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">No results yet</p>
          <p className="text-[12px] text-muted-foreground mt-1">Published grades will appear here once your lecturers release them.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <SummaryCard label="CGPA" value={cgpa.toFixed(2)} icon={TrendingUp} accent="262 83% 58%" big />
            <SummaryCard label="Best Term" value={bestSem ? bestSem.g.toFixed(2) : "—"} icon={Award} accent="38 92% 50%" />
            <SummaryCard label="Courses" value={String(new Set(list.map((g) => g.course_code)).size)} icon={BookOpen} accent="142 71% 45%" />
          </div>

          {semesters.map(([name, items]) => {
            const gpa = gpaOf(items);
            return (
              <motion.section
                key={name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="mb-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[13px] font-semibold text-foreground">{name}</h2>
                  <span className="text-[12px] font-bold text-primary">GPA {gpa.toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  {items.map((g) => {
                    const p = (g.score / g.max_score) * 100;
                    const L = letter(p);
                    return (
                      <div key={g.id} className="flex items-center gap-3 p-3 rounded-[18px] glass-card">
                        <div className="w-9 h-9 rounded-[12px] bg-primary/8 flex items-center justify-center flex-shrink-0">
                          <span className="text-[14px] font-extrabold text-primary">{L}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground truncate">{g.course_title || g.course_code}</p>
                          <p className="text-[11px] text-muted-foreground capitalize">{g.assessment_type} · {g.course_code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-bold text-foreground">{Math.round(p)}%</p>
                          <p className="text-[11px] text-muted-foreground">{g.score}/{g.max_score}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon, accent, big }) {
  return (
    <div className="rounded-[20px] p-3.5 glass-card">
      <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-2" style={{ background: `hsl(${accent} / 0.14)` }}>
        <Icon className="w-4 h-4" style={{ color: `hsl(${accent})` }} />
      </div>
      <p className={`font-heading font-extrabold text-foreground tracking-tight ${big ? "text-[24px]" : "text-[18px]"}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}