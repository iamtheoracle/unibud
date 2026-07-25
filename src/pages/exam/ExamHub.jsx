import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Clock, ListChecks, Award, BookOpen, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EXAM_TYPES, examTypeLabel, examTypeAccent, CATEGORIES } from "@/lib/exam/examTypes";

export default function ExamHub() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const { data: papers = [] } = useQuery({ queryKey: ["examPapers"], queryFn: () => base44.entities.ExamPaper.filter({ status: "published" }) });

  const filtered = papers.filter((p) => {
    const okType = type === "all" || p.exam_type === type;
    const okQ = !q || (p.title || "").toLowerCase().includes(q.toLowerCase()) || (p.subject || "").toLowerCase().includes(q.toLowerCase());
    return okType && okQ;
  });

  return (
    <div className="w-full max-w-[640px] mx-auto px-5 pt-6 pb-28 safe-area-pt space-y-6">
      <div>
        <h1 className="text-[22px] font-heading font-bold">Examinations</h1>
        <p className="text-[13px] text-muted-foreground">Question banks, practice tests, and certification prep — with Bud as your coach.</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search exams & subjects" className="pl-9" />
        </div>
        <Button asChild variant="secondary"><Link to="/exam/coach"><BookOpen className="w-4 h-4 mr-1" />Coach</Link></Button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        <Chip active={type === "all"} onClick={() => setType("all")}>All</Chip>
        {EXAM_TYPES.map((t) => (
          <Chip key={t.key} active={type === t.key} accent={t.accent} onClick={() => setType(t.key)}>{t.label}</Chip>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-muted-foreground text-[13px]">No exams published yet.</p>}
        {filtered.map((p) => (
          <div key={p.id} className="glass-card radius-lg p-4 card-hover">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{ background: `${examTypeAccent(p.exam_type)}22` }}>
                <ListChecks className="w-5 h-5" style={{ color: examTypeAccent(p.exam_type) }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${examTypeAccent(p.exam_type)}22`, color: examTypeAccent(p.exam_type) }}>{examTypeLabel(p.exam_type)}</span>
                  {p.is_proctored && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">Proctored</span>}
                </div>
                <h3 className="font-heading font-semibold text-[15px] mt-1 truncate">{p.title}</h3>
                <p className="text-[12px] text-muted-foreground">{p.subject || "General"} · {p.questions_count || 0} questions · {p.duration_minutes || 0} min · pass {p.pass_mark || 50}%</p>
              </div>
              <Button asChild size="sm"><Link to={`/exam/start/${p.id}`}>Start<ChevronRight className="w-4 h-4" /></Link></Button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="secondary" className="justify-start"><Link to="/exam/analytics"><Award className="w-4 h-4 mr-2" />My Analytics</Link></Button>
        <Button asChild variant="secondary" className="justify-start"><Link to="/exam/author"><BookOpen className="w-4 h-4 mr-2" />Author Exams</Link></Button>
      </div>
    </div>
  );
}

function Chip({ active, onClick, accent, children }) {
  return (
    <button onClick={onClick} className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium spring-tap border ${active ? "text-primary-foreground border-transparent" : "border-border text-muted-foreground"}`} style={active ? { background: accent || "hsl(var(--primary))", borderColor: "transparent" } : {}}>
      {children}
    </button>
  );
}