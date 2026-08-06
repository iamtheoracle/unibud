import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/me/SectionHeader";

const EASE = [0.16, 1, 0.3, 1];

/**
 * AcademicHistory — searchable timeline of completed courses, grades,
 * assignments, and exams.
 */
export default function AcademicHistory({ courses, grades, assignments, exams }) {
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const out = [];
    (courses || []).filter((c) => c.status === "completed").forEach((c) =>
      out.push({ id: "c" + c.id, type: "Course", title: c.title, detail: c.code + (c.grade ? ` · ${c.grade}` : ""), date: "" })
    );
    (grades || []).forEach((g) =>
      out.push({ id: "g" + g.id, type: g.assessment_type || "Grade", title: g.course_title || g.course_code, detail: `${g.score}/${g.max_score}`, date: g.date || "" })
    );
    (assignments || []).filter((a) => a.status === "graded" || a.status === "submitted").forEach((a) =>
      out.push({ id: "a" + a.id, type: "Assignment", title: a.title, detail: a.course_code + (a.grade ? ` · ${a.grade}` : ""), date: (a.due_date || "").split("T")[0] })
    );
    (exams || []).filter((e) => e.status === "completed").forEach((e) =>
      out.push({ id: "e" + e.id, type: "Exam", title: e.title, detail: e.course_code, date: e.date || "" })
    );
    return out.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [courses, grades, assignments, exams]);

  const filtered = q
    ? items.filter((i) => (i.title + i.type + i.detail).toLowerCase().includes(q.toLowerCase()))
    : items;

  return (
    <div>
      <SectionHeader title="Academic History" />
      <div className="glass-card p-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search your history…"
          className="w-full h-[44px] px-4 rounded-2xl bg-muted/50 border border-border text-[14px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 mb-4"
        />
        {filtered.length === 0 ? (
          <p className="text-[13px] text-muted-foreground text-center py-6">
            {q ? "No matches." : "No history yet. Completed courses and graded work will appear here."}
          </p>
        ) : (
          <div>
            {filtered.slice(0, 30).map((it, i) => (
              <motion.div key={it.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.3 }} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  {i < filtered.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-3.5 flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">{it.title}</p>
                  <p className="text-[11px] text-muted-foreground capitalize">{it.type}{it.detail ? ` · ${it.detail}` : ""}{it.date ? ` · ${it.date}` : ""}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}