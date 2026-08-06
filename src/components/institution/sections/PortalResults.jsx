import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ClipboardCheck, CheckCircle2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

export default function PortalResults({ institution }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const load = async () => { setLoading(true); try { setGrades(await base44.entities.StudentGrade.list("-created_date", 100)); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const shown = grades.filter((g) => filter === "all" || g.status === filter);
  const pending = grades.filter((g) => g.status === "draft").length;

  const publish = async (g) => { try { await base44.entities.StudentGrade.update(g.id, { status: "published" }); load(); toast({ title: "Result published" }); } catch { toast({ title: "Publish failed" }); } };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary" /><h1 className="text-[20px] font-heading font-bold">Result Management</h1></div>
      <p className="text-[13px] text-muted-foreground">Moderate, approve, and publish assessment results. {pending} awaiting approval.</p>

      <div className="flex gap-2">{["all", "draft", "published"].map((s) => (
        <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-[12px] font-semibold capitalize ${filter === s ? "bg-foreground text-background" : "bg-card border border-border text-muted-foreground"}`}>{s}</button>
      ))}</div>

      {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : shown.length === 0 ? <p className="text-muted-foreground text-[13px]">No results.</p> :
        <div className="space-y-2">{shown.map((g) => (
          <div key={g.id} className="glass-card radius-lg p-3 flex items-center gap-3">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0"><p className="font-semibold text-[14px] truncate">{g.student_name} — {g.course_title || g.course_code}</p><p className="text-[12px] text-muted-foreground capitalize">{g.assessment_type} · {g.score}/{g.max_score} · weight {g.weight}% · {g.semester || ""}</p></div>
            <Badge variant={g.status === "published" ? "secondary" : "outline"} className="capitalize">{g.status}</Badge>
            {g.status === "draft" && <button onClick={() => publish(g)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[12px] font-semibold"><CheckCircle2 className="w-3.5 h-3.5" />Publish</button>}
          </div>
        ))}</div>}
    </div>
  );
}