import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Plus, Trash2, BookOpen, ArrowLeft, Save } from "lucide-react";
import { EXAM_TYPES, examTypeLabel } from "@/lib/exam/examTypes";
import QuestionEditor from "@/components/exam/QuestionEditor";

export default function ExamAuthor() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // paper object or 'new'
  const [form, setForm] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = async () => { setLoading(true); try { setPapers(await base44.entities.ExamPaper.list("-updated_date", 50)); } catch {} finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const newForm = () => ({ title: "", exam_type: "practice", subject: "", duration_minutes: 60, pass_mark: 50, instructions: "", randomize: true, is_proctored: false, status: "draft", tags: [] });

  const open = (p) => {
    setEditing(p);
    setForm(p ? { ...p } : newForm());
    setQuestions([]);
    if (p) (async () => { try { setQuestions(await base44.entities.ExamQuestion.filter({ paper_id: p.id })); } catch {} })();
  };

  const savePaper = async () => {
    if (!form.title.trim()) { toast({ title: "Title required" }); return; }
    setSaving(true);
    try {
      if (editing === "new") {
        const created = await base44.entities.ExamPaper.create({ ...form, questions_count: questions.length });
        setEditing(created); setForm({ ...created });
        toast({ title: "Exam created" });
      } else {
        await base44.entities.ExamPaper.update(form.id, { ...form, questions_count: questions.length });
        toast({ title: "Exam saved" });
      }
      load();
    } catch { toast({ title: "Save failed" }); }
    finally { setSaving(false); }
  };

  const publish = async () => {
    if (questions.length === 0) { toast({ title: "Add at least one question first" }); return; }
    await base44.entities.ExamPaper.update(form.id, { status: "published", questions_count: questions.length });
    setForm({ ...form, status: "published" });
    load();
    toast({ title: "Exam published" });
  };

  const remove = async (id) => { if (!confirm("Delete this exam and its questions?")) return; try { await base44.entities.ExamPaper.delete(id); await base44.entities.ExamQuestion.deleteMany({ paper_id: id }); setEditing(null); load(); } catch {} };
  const delQ = async (id) => { try { await base44.entities.ExamQuestion.delete(id); setQuestions((qs) => qs.filter((q) => q.id !== id)); if (form?.id) { await base44.entities.ExamPaper.update(form.id, { questions_count: Math.max(0, questions.length - 1) }); } load(); } catch {} };
  const reloadQ = async () => { if (form?.id) setQuestions(await base44.entities.ExamQuestion.filter({ paper_id: form.id })); load(); };

  return (
    <div className="w-full max-w-[720px] mx-auto px-5 pt-6 pb-28 safe-area-pt space-y-5">
      <Link to="/exam" className="text-[13px] text-muted-foreground flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Back to exams</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-[22px] font-heading font-bold">Author Exams</h1>
        <Button onClick={() => open("new")}><Plus className="w-4 h-4 mr-1" />New</Button>
      </div>

      {!form && (
        <div className="space-y-2">
          {loading ? <p className="text-muted-foreground text-[13px]">Loading…</p> : papers.length === 0 ? <p className="text-muted-foreground text-[13px]">No exams yet. Create one.</p> :
            papers.map((p) => (
              <button key={p.id} onClick={() => open(p)} className="w-full glass-card radius-lg p-3 flex items-center gap-3 text-left card-hover">
                <BookOpen className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0"><p className="font-semibold text-[14px] truncate">{p.title}</p><p className="text-[12px] text-muted-foreground">{examTypeLabel(p.exam_type)} · {p.questions_count || 0} Qs · {p.status}</p></div>
              </button>
            ))}
        </div>
      )}

      {form && (
        <div className="space-y-4">
          <div className="glass-card radius-lg p-4 space-y-3">
            <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Type</Label>
                <Select value={form.exam_type} onValueChange={(v) => setForm({ ...form, exam_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EXAM_TYPES.map((t) => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}</SelectContent></Select>
              </div>
              <div><Label>Subject</Label><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} /></div>
              <div><Label>Pass mark (%)</Label><Input type="number" value={form.pass_mark} onChange={(e) => setForm({ ...form, pass_mark: Number(e.target.value) })} /></div>
            </div>
            <div><Label>Instructions</Label><Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={2} /></div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-[13px]"><Switch checked={form.randomize} onCheckedChange={(v) => setForm({ ...form, randomize: v })} />Randomize questions</label>
              <label className="flex items-center gap-2 text-[13px]"><Switch checked={form.is_proctored} onCheckedChange={(v) => setForm({ ...form, is_proctored: v })} />AI Proctoring</label>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button onClick={savePaper} disabled={saving}><Save className="w-4 h-4 mr-1" />{saving ? "Saving…" : "Save"}</Button>
              {form.id && <Button variant="secondary" onClick={publish}>Publish</Button>}
              {form.id && <Button variant="ghost" onClick={() => remove(form.id)} className="text-destructive"><Trash2 className="w-4 h-4 mr-1" />Delete</Button>}
              <span className={`text-[11px] font-semibold px-2 py-1 rounded-full self-center ${form.status === "published" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>{form.status}</span>
            </div>
          </div>

          {form.id && (
            <div className="space-y-3">
              <div className="flex items-center justify-between"><h3 className="font-heading font-semibold text-[15px]">Questions ({questions.length})</h3></div>
              <QuestionEditor paperId={form.id} onSaved={reloadQ} />
              {questions.map((q, i) => (
                <div key={q.id} className="glass-card radius-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">Q{i + 1}</span>
                    <div className="flex-1 min-w-0"><p className="text-[13px] font-medium">{q.question}</p><p className="text-[11px] text-muted-foreground capitalize">{q.type} · {q.topic || "—"} · {q.marks} mark(s)</p></div>
                    <button onClick={() => delQ(q.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}