import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Calendar, Radio } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Field, inputClass, SubmitBar, SuccessState } from "@/components/portal/quick-actions/NewAssignmentForm";

const CLASS_TYPES = [
  { value: "lecture", label: "Lecture" },
  { value: "lab", label: "Lab Session" },
  { value: "tutorial", label: "Tutorial" },
  { value: "seminar", label: "Seminar" },
  { value: "office_hours", label: "Office Hours" },
];

export default function StartLiveClassForm({ user, onClose }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [mode, setMode] = useState("now");
  const [form, setForm] = useState({
    title: "",
    course_code: "",
    type: "lecture",
    scheduled_date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "10:00",
    description: "",
    recording_enabled: true,
  });

  const { data: courses } = useQuery({
    queryKey: ["portalCourses"],
    queryFn: () => base44.entities.Course.list(),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.LiveClass.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalLiveClasses"] });
      setSuccess(true);
      setTimeout(onClose, 1500);
    },
  });

  const handleSubmit = () => {
    if (!form.title || !form.course_code) return;
    const course = (courses || []).find((c) => c.code === form.course_code);
    mutation.mutate({
      title: form.title,
      course_code: form.course_code,
      course_title: course?.title || "",
      lecturer_name: user?.full_name || "Staff",
      type: form.type,
      status: mode === "now" ? "live" : "scheduled",
      scheduled_date: form.scheduled_date,
      start_time: form.start_time,
      end_time: form.end_time,
      description: form.description,
      recording_enabled: form.recording_enabled,
      class_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });
  };

  if (success) return <SuccessState message={mode === "now" ? "Live class launched — students can join now." : "Live class scheduled successfully."} />;

  return (
    <div className="p-5 space-y-4">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-[16px] bg-muted/40 border border-border/30">
        <button onClick={() => setMode("now")}
          className={`flex items-center justify-center gap-2 h-10 rounded-[12px] text-[13px] font-semibold spring-tap ${mode === "now" ? "bg-error text-error-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Radio className="w-4 h-4" /> Start Now
        </button>
        <button onClick={() => setMode("schedule")}
          className={`flex items-center justify-center gap-2 h-10 rounded-[12px] text-[13px] font-semibold spring-tap ${mode === "schedule" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          <Calendar className="w-4 h-4" /> Schedule
        </button>
      </div>

      <Field label="Class Title" required>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Data Structures — Week 5 Lecture" className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Course" required>
          <select value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className={inputClass}>
            <option value="">Select course...</option>
            {(courses || []).map((c) => <option key={c.id} value={c.code}>{c.code} — {c.title}</option>)}
          </select>
        </Field>
        <Field label="Type">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
            {CLASS_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
      </div>

      {mode === "schedule" && (
        <div className="grid grid-cols-3 gap-3">
          <Field label="Date">
            <input type="date" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className={inputClass} />
          </Field>
          <Field label="Start">
            <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className={inputClass} />
          </Field>
          <Field label="End">
            <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className={inputClass} />
          </Field>
        </div>
      )}

      <Field label="Description">
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What will be covered in this class?" rows={3} className={`${inputClass} resize-none`} />
      </Field>

      <button type="button" onClick={() => setForm({ ...form, recording_enabled: !form.recording_enabled })}
        className="flex items-center gap-2 text-[12px] font-medium text-foreground">
        <input type="checkbox" checked={form.recording_enabled} onChange={(e) => setForm({ ...form, recording_enabled: e.target.checked })}
          className="w-4 h-4 rounded accent-primary" />
        Enable auto-recording
      </button>

      <SubmitBar onSubmit={handleSubmit} disabled={!form.title || !form.course_code || mutation.isPending}
        loading={mutation.isPending} label={mode === "now" ? "Launch Live Class" : "Schedule Class"} />
    </div>
  );
}