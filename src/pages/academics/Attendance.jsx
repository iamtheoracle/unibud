import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import ScreenShell from "@/components/layout/ScreenShell";
import Sheet from "@/components/academics/Sheet";
import EmptyState from "@/components/academics/EmptyState";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];
const REQUIRED = 75;

export default function Attendance() {
  const qc = useQueryClient();
  const { data: courses } = useQuery({ queryKey: ["attCourses"], queryFn: () => base44.entities.Course.list() });
  const { data: records } = useQuery({ queryKey: ["attRecords"], queryFn: () => base44.entities.AttendanceRecord.list() });
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({});

  const add = useMutation({
    mutationFn: (v) => base44.entities.AttendanceRecord.create(v),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["attRecords"] }); toast({ title: "Attendance recorded" }); setAdding(false); },
  });

  const stats = useMemo(() => {
    const byCourse = {};
    (records || []).forEach((r) => {
      if (!byCourse[r.course_code]) byCourse[r.course_code] = { code: r.course_code, title: r.course_title || r.course_code, present: 0, absent: 0, excused: 0, total: 0 };
      byCourse[r.course_code].total++;
      if (r.status === "present") byCourse[r.course_code].present++;
      else if (r.status === "absent") byCourse[r.course_code].absent++;
      else byCourse[r.course_code].excused++;
    });
    (courses || []).forEach((c) => { if (!byCourse[c.code]) byCourse[c.code] = { code: c.code, title: c.title, present: 0, absent: 0, excused: 0, total: 0 }; });
    return Object.values(byCourse);
  }, [records, courses]);

  const openAdd = () => { setForm({ course_code: "", course_title: "", date: new Date().toISOString().split("T")[0], status: "present" }); setAdding(true); };
  const submit = () => {
    if (!form.course_code || !form.date) { toast({ title: "Course and date required" }); return; }
    const c = (courses || []).find((x) => x.code === form.course_code);
    add.mutate({ ...form, course_title: c?.title || form.course_title });
  };

  return (
    <ScreenShell title="Attendance" back actions={<button onClick={openAdd} className="text-[12px] font-semibold text-primary spring-tap">+ Record</button>}>
      {!stats.length ? <EmptyState message="No courses yet. Add courses to start tracking attendance." /> : (
        <div className="space-y-3">
          {stats.map((s, i) => {
            const pct = s.total ? Math.round(((s.present + s.excused) / s.total) * 100) : null;
            const below = pct != null && pct < REQUIRED;
            return (
              <motion.div key={s.code + i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }} className="glass-card p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-foreground truncate">{s.title}</p>
                  <span className={`text-[14px] font-heading font-bold ${below ? "text-destructive" : "text-primary"}`}>{pct != null ? `${pct}%` : "—"}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                  <Mini label="Attended" value={s.present + s.excused} />
                  <Mini label="Missed" value={s.absent} />
                  <Mini label="Required" value={`${REQUIRED}%`} />
                </div>
                {below && <p className="text-[11px] text-destructive mt-2">Below the {REQUIRED}% requirement — attend upcoming classes to recover.</p>}
              </motion.div>
            );
          })}
        </div>
      )}

      <Sheet open={adding} onClose={() => setAdding(false)} title="Record Attendance">
        <div className="space-y-3.5">
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Course</label>
            <select value={form.course_code || ""} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60">
              <option value="">Select course…</option>
              {(courses || []).map((c) => <option key={c.id} value={c.code}>{c.code} · {c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Date</label>
            <input type="date" value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60" />
          </div>
          <div>
            <label className="text-[12px] font-semibold text-muted-foreground/90 ml-1">Status</label>
            <select value={form.status || "present"} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1.5 w-full h-[52px] px-4 rounded-2xl bg-muted/50 border border-border text-[15px] text-foreground focus:outline-none focus:border-primary/60 capitalize">{["present", "absent", "excused"].map((s) => <option key={s} value={s}>{s}</option>)}</select>
          </div>
        </div>
        <button onClick={submit} disabled={add.isPending} className="w-full h-[52px] mt-5 rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center spring-tap disabled:opacity-50 ice-glow">{add.isPending ? "Saving…" : "Save"}</button>
      </Sheet>
    </ScreenShell>
  );
}

function Mini({ label, value }) {
  return (<div className="p-2 rounded-xl bg-muted/40"><p className="font-heading font-bold text-[14px] text-foreground">{value}</p><p className="text-[9px] text-muted-foreground">{label}</p></div>);
}