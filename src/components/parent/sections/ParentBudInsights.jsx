import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "@/components/ui/use-toast";
import UDSButton from "@/components/uds/UDSButton";

export default function ParentBudInsights({ data }) {
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true); setOut("");
    const present = (data.attendance || []).filter((a) => a.status === "present").length;
    const attRate = data.attendance.length ? Math.round((present / data.attendance.length) * 100) : 0;
    const avg = data.grades.length ? Math.round(data.grades.reduce((s, g) => s + (g.score / g.max_score) * 100, 0) / data.grades.length) : 0;
    const prompt = `You are Bud, a supportive academic mentor. A parent is monitoring their child's progress. Summarise the child's academic standing and give 3 encouraging, actionable suggestions for the parent to support them. Data: courses=${(data.courses || []).length}, upcoming assignments=${(data.assignments || []).length}, upcoming exams=${(data.exams || []).length}, attendance=${attRate}%, study hours=${Math.round((data.studyMinutes || 0) / 60)}, average grade=${avg}%. Keep it warm, concise, and non-alarming.`;
    try { const res = await base44.integrations.Core.InvokeLLM({ prompt }); setOut(typeof res === "string" ? res : JSON.stringify(res)); }
    catch { toast({ title: "Bud is unavailable" }); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 max-w-[760px]">
      <div className="glass-card radius-lg p-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 grid place-items-center"><Sparkles className="w-5 h-5 text-primary" /></div>
        <div><p className="font-heading font-semibold text-[15px]">Bud Insights</p><p className="text-[12px] text-muted-foreground">A supportive summary of your child's progress.</p></div>
      </div>
      <UDSButton onClick={run} disabled={loading}>{loading ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Thinking…</> : "Get insights"}</UDSButton>
      {out && <div className="glass-card radius-lg p-4"><pre className="whitespace-pre-wrap text-[13px] font-body leading-relaxed">{out}</pre></div>}
    </div>
  );
}