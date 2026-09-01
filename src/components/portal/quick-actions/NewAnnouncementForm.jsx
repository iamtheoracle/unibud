import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link as LinkIcon, Pin, Bell, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Field, inputClass, SubmitBar, SuccessState } from "@/components/portal/quick-actions/NewAssignmentForm";

const AUDIENCES = [
  { value: "entire_university", label: "Entire University" },
  { value: "faculty", label: "Faculty" },
  { value: "department", label: "Department" },
  { value: "course", label: "Course" },
  { value: "class", label: "Class / Level" },
  { value: "lecturers", label: "All Lecturers" },
  { value: "students", label: "All Students" },
];
const PRIORITIES = ["low", "normal", "high", "urgent"];

export default function NewAnnouncementForm({ user, onClose }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "entire_university",
    target_name: "",
    priority: "normal",
    pinned: false,
    send_push: true,
    schedule: false,
    publish_date: "",
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.StaffAnnouncement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalAnnouncements"] });
      setSuccess(true);
      setTimeout(onClose, 1500);
    },
  });

  const handleSubmit = () => {
    if (!form.title || !form.message) return;
    mutation.mutate({
      title: form.title,
      message: form.message,
      audience: form.audience,
      target_name: form.target_name || undefined,
      priority: form.priority,
      pinned: form.pinned,
      status: form.schedule ? "scheduled" : "published",
      publish_date: form.schedule && form.publish_date ? new Date(form.publish_date).toISOString() : undefined,
      author_name: user?.full_name || "Staff",
    });
  };

  if (success) return <SuccessState message="Announcement published successfully." />;

  return (
    <div className="p-5 space-y-4">
      <Field label="Title" required>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Mid-Semester Exam Schedule Released" className={inputClass} />
      </Field>

      <Field label="Message" required hint="Supports rich text formatting">
        <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Write your announcement..." rows={6} className={`${inputClass} resize-none`} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Target Audience">
          <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} className={inputClass}>
            {AUDIENCES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </Field>
        <Field label="Priority">
          <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputClass}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </Field>
      </div>

      {form.audience !== "entire_university" && form.audience !== "lecturers" && form.audience !== "students" && (
        <Field label={`Target ${form.audience} name`}>
          <input type="text" value={form.target_name} onChange={(e) => setForm({ ...form, target_name: e.target.value })}
            placeholder={`e.g. Faculty of Science`} className={inputClass} />
        </Field>
      )}

      <div className="space-y-2">
        <Toggle checked={form.pinned} onChange={(v) => setForm({ ...form, pinned: v })}
          icon={Pin} label="Pin this announcement" />
        <Toggle checked={form.send_push} onChange={(v) => setForm({ ...form, send_push: v })}
          icon={Bell} label="Send push notification" />
        <Toggle checked={form.schedule} onChange={(v) => setForm({ ...form, schedule: v })}
          icon={LinkIcon} label="Schedule for later" />
      </div>

      {form.schedule && (
        <Field label="Publish Date & Time">
          <input type="datetime-local" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} className={inputClass} />
        </Field>
      )}

      <SubmitBar onSubmit={handleSubmit} disabled={!form.title || !form.message || mutation.isPending} loading={mutation.isPending} label="Publish" />
    </div>
  );
}

function Toggle({ checked, onChange, icon: Icon, label }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full p-3 rounded-[14px] bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors">
      <Icon className={`w-4 h-4 ${checked ? "text-primary" : "text-muted-foreground"}`} />
      <span className="flex-1 text-left text-[13px] font-medium text-foreground">{label}</span>
      <div className={`w-9 h-5 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted-foreground/30"} relative`}>
        <motion.div animate={{ x: checked ? 18 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow" />
      </div>
    </button>
  );
}