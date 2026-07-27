import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Award, TrendingUp, Clock, Target } from "lucide-react";


export default function ExamAnalytics() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => { try { setAttempts(await base44.entities.ExamAttempt.filter({ status: "completed" })); } catch {} finally { setLoading(false); } })(); }, []);

  const total = attempts.length;
  const passed = attempts.filter((a) => a.score_percent >= 50).length;
  const avg = total ? Math.round(attempts.reduce((s, a) => s + (a.score_percent || 0), 0) / total) : 0;
  const totalTime = attempts.reduce((s, a) => s + (a.duration_seconds || 0), 0);

  const byType = {};
  attempts.forEach((a) => { const k = a.paper_id; (byType[k] = byType[k] || { count: 0, sum: 0, max: 0 }); byType[k].count++; byType[k].sum += a.score_percent || 0; byType[k].max = Math.max(byType[k].max, a.score_percent || 0); });
  const chartData = Object.entries(byType).map(([k, v]) => ({ name: k.slice(-4), avg: Math.round(v.sum / v.count), max: v.max })).slice(-8);

  return (
    <div className="w-full max-w-[640px] mx-auto px-5 pt-6 pb-28 safe-area-pt space-y-5">
      <Link to="/exam" className="text-[13px] text-muted-foreground">← Back to exams</Link>
      <h1 className="text-[22px] font-heading font-bold">Your Performance</h1>

      <div className="grid grid-cols-2 gap-3">
        <Stat icon={Award} label="Exams taken" value={total} />
        <Stat icon={Target} label="Pass rate" value={total ? `${Math.round((passed / total) * 100)}%` : "—"} />
        <Stat icon={TrendingUp} label="Avg score" value={avg ? `${avg}%` : "—"} />
        <Stat icon={Clock} label="Total time" value={`${Math.round(totalTime / 60)}m`} />
      </div>

      {chartData.length > 0 && (
        <div className="glass-card radius-lg p-4">
          <p className="text-[13px] font-heading font-semibold mb-2">Average score by exam (recent)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData}><XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><YAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><Tooltip cursor={{ fill: "hsl(var(--muted)/0.3)" }} /><Bar dataKey="avg" radius={[6, 6, 0, 0]}><Cell fill="#7FD8FF" /></Bar></BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div>
        <h3 className="font-heading font-semibold text-[15px] mb-2">Recent attempts</h3>
        {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : attempts.length === 0 ? <p className="text-muted-foreground text-[13px]">No completed exams yet.</p> :
          <div className="space-y-2">{attempts.slice(0, 20).map((a) => (
            <div key={a.id} className="glass-card radius-lg p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0"><p className="font-semibold text-[14px] truncate">{a.paper_id}</p><p className="text-[12px] text-muted-foreground">{new Date(a.completed_at || a.started_at).toLocaleDateString()} · {Math.round((a.duration_seconds || 0) / 60)}m</p></div>
              <span className={`text-[14px] font-heading font-bold ${a.score_percent >= 50 ? "text-success" : "text-destructive"}`}>{a.score_percent}%</span>
            </div>
          ))}</div>}
      </div>
    </div>
  );
}

const Stat = ({ icon: Icon, label, value }) => (
  <div className="glass-card radius-lg p-4"><div className="flex items-center gap-2"><Icon className="w-4 h-4 text-primary" /><span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span></div><p className="text-[24px] font-heading font-bold mt-1">{value}</p></div>
);