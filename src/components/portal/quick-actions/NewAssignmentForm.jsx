import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const ASSIGNMENT_TYPES = ["assignment", "quiz", "exam", "lab", "project"];
const PRIORITIES = ["low", "medium", "high"];
const GRADING_METHODS = [
  { value: 100, label: "Out of 100" },
  { value: 50, label: "Out of 50" },
  { value: 20, label: "Out of 20" },
  { value: 10, label: "Out of 10" },
];

export default function NewAssignmentForm({ user, onClose }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: "",
    course_code: "",
    type: "assignment",
    priority: "medium",
    due_date: "",
    max_grade: 100,
    description: "",
    visibility: "students",
  });

  const { data: courses } = useQuery({
    queryKey: ["portalCourses"],
    queryFn: () => base44.entities.Course.list(),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.Assignment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["portalCalendarEvents"] });
      setSuccess(true);
      setTimeout(onClose, 1500);
    },
  });

  const handleSubmit = () => {
    if (!form.title || !form.course_code) return;
    const course = (courses || []).find((c) => c.code === form.course_code);
    mutation.mutate({
      ...form,
      course_title: course?.title || "",
      due_date: form.due_date ? new Date(form.due_date).toISOString() : undefined,
      status: "pending",
      attachments: [],
    });
  };

  if (success) return <SuccessState message="Assignment created and published successfully." />;

  return (
    <div className="p-5 space-y-4">
      <Field label="Assignment Title" required>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Mid-Semester Problem Set 3"
          className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Course" required>
          <select value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className={inputClass}>
            <option value="">Select course...</option>
            {(courses || []).map((c) => (
              <option key={c.id} value={c.code}>{c.code} — {c.title}</option>
            ))}
          </select>
        </Field>
        <Field label="Type">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
            {ASSIGNMENT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Due Date">
          <input type="datetime-local" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Priority">
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Grading Method">
        <select value={form.max_grade} onChange={(e) => setForm({ ...form, max_grade: parseInt(e.target.value) })} className={inputClass}>
          {GRADING_METHODS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
      </Field>

      <Field label="Instructions">
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Detailed instructions for students..."
          rows={4} className={`${inputClass} resize-none`} />
      </Field>

      <Field label="Visibility">
        <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className={inputClass}>
          <option value="students">All enrolled students</option>
          <option value="specific">Specific groups</option>
        </select>
      </Field>

      <SubmitBar onSubmit={handleSubmit} disabled={!form.title || !form.course_code || mutation.isPending} loading={mutation.isPending} />
    </div>
  );
}

export function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-foreground mb-1.5 block">{label}{required && <span className="text-error"> *</span>}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

export const inputClass = "w-full h-10 px-3.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all";

export function SubmitBar({ onSubmit, disabled, loading, label = "Create" }) {
  return (
    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/20">
      <button onClick={onSubmit} disabled={disabled}
        className="flex items-center gap-2 h-10 px-5 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 spring-tap disabled:opacity-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Saving..." : label}
      </button>
    </div>
  );
}

export function SuccessState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="w-16 h-16 rounded-[20px] bg-success/10 flex items-center justify-center mb-4">
        <CheckCircle2 className="w-8 h-8 text-success" strokeWidth={2.2} />
      </motion.div>
      <h3 className="font-heading font-bold text-[16px] text-foreground mb-1">Success!</h3>
      <p className="text-[13px] text-muted-foreground max-w-xs">{message}</p>
    </div>
  );
}