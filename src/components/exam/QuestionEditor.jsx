import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Plus, Trash2, Check, ChevronDown, ChevronRight } from "lucide-react";
import { EXAM_TYPES } from "@/lib/exam/examTypes";

export default function QuestionEditor({ paperId, onSaved }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState({ type: "mcq", question: "", options: ["", "", "", ""], correct_answer: "", explanation: "", marks: 1, topic: "", difficulty: "medium" });
  const [saving, setSaving] = useState(false);

  const setOpt = (i, v) => { const o = [...q.options]; o[i] = v; setQ({ ...q, options: o }); };

  const save = async () => {
    if (!q.question.trim()) { toast({ title: "Question text required" }); return; }
    if (q.type === "mcq" && !q.correct_answer) { toast({ title: "Pick the correct option" }); return; }
    setSaving(true);
    try {
      await base44.entities.ExamQuestion.create({
        paper_id: paperId,
        type: q.type,
        question: q.question,
        options: q.type === "mcq" ? q.options.filter((o) => o.trim()) : [],
        correct_answer: q.type === "mcq" ? q.correct_answer : q.type === "true_false" ? (q.correct_answer || "true") : q.correct_answer,
        explanation: q.explanation,
        marks: Number(q.marks) || 1,
        topic: q.topic,
        difficulty: q.difficulty,
      });
      setQ({ type: "mcq", question: "", options: ["", "", "", ""], correct_answer: "", explanation: "", marks: 1, topic: "", difficulty: "medium" });
      setOpen(false);
      onSaved();
      toast({ title: "Question added" });
    } catch { toast({ title: "Failed to add question" }); }
    finally { setSaving(false); }
  };

  return (
    <div className="glass-card radius-lg p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between">
        <span className="font-heading font-semibold text-[14px] flex items-center gap-2"><Plus className="w-4 h-4 text-primary" />Add question</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <Select value={q.type} onValueChange={(v) => setQ({ ...q, type: v, correct_answer: v === "true_false" ? "true" : "" })}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="mcq">Multiple choice</SelectItem>
                <SelectItem value="true_false">True / False</SelectItem>
                <SelectItem value="short_answer">Short answer</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
              </SelectContent>
            </Select>
            <Select value={q.difficulty} onValueChange={(v) => setQ({ ...q, difficulty: v })}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
            </Select>
          </div>
          <Textarea value={q.question} onChange={(e) => setQ({ ...q, question: e.target.value })} rows={2} placeholder="Question text" />
          <Input value={q.topic} onChange={(e) => setQ({ ...q, topic: e.target.value })} placeholder="Topic (e.g. Algebra)" />
          {q.type === "mcq" && (
            <div className="space-y-2">
              {q.options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button onClick={() => setQ({ ...q, correct_answer: o })} className={`w-6 h-6 rounded-full grid place-items-center shrink-0 ${q.correct_answer === o ? "bg-success text-success-foreground" : "border border-border"}`}>{q.correct_answer === o && <Check className="w-3.5 h-3.5" />}</button>
                  <Input value={o} onChange={(e) => setOpt(i, e.target.value)} placeholder={`Option ${i + 1}`} />
                </div>
              ))}
              <p className="text-[11px] text-muted-foreground">Tap the circle to mark the correct answer.</p>
            </div>
          )}
          {q.type === "true_false" && (
            <Select value={q.correct_answer || "true"} onValueChange={(v) => setQ({ ...q, correct_answer: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="true">True</SelectItem><SelectItem value="false">False</SelectItem></SelectContent>
            </Select>
          )}
          {(q.type === "short_answer" || q.type === "essay") && (
            <Textarea value={q.correct_answer} onChange={(e) => setQ({ ...q, correct_answer: e.target.value })} rows={2} placeholder="Reference / model answer (not auto-graded)" />
          )}
          <Textarea value={q.explanation} onChange={(e) => setQ({ ...q, explanation: e.target.value })} rows={2} placeholder="Explanation (shown after submit)" />
          <div className="flex items-center gap-2">
            <Label className="text-[12px]">Marks</Label>
            <Input type="number" value={q.marks} onChange={(e) => setQ({ ...q, marks: e.target.value })} className="w-20" />
          </div>
          <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save question"}</Button>
        </div>
      )}
    </div>
  );
}