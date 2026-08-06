import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Video, Mic } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Field, inputClass, SubmitBar, SuccessState } from "@/components/portal/quick-actions/NewAssignmentForm";

const GROUP_TYPES = [
  { value: "course", label: "Course Group" },
  { value: "exam_revision", label: "Exam Revision" },
  { value: "project_team", label: "Project Team" },
  { value: "department", label: "Department Group" },
  { value: "faculty", label: "Faculty Group" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
];

export default function CreateStudyGroupForm({ user, onClose }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "course",
    course_code: "",
    room_type: "video",
    max_members: 50,
    tags: "",
    meeting_date: "",
    meeting_time: "",
  });

  const { data: courses } = useQuery({
    queryKey: ["portalCourses"],
    queryFn: () => base44.entities.Course.list(),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.StudyGroup.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalStudyGroups"] });
      setSuccess(true);
      setTimeout(onClose, 1500);
    },
  });

  const handleSubmit = () => {
    if (!form.name) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setJoinCode(code);
    const tagList = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    mutation.mutate({
      name: form.name,
      description: form.description,
      type: form.type,
      course_code: form.course_code || undefined,
      room_type: form.room_type,
      host_name: user?.full_name || "Staff",
      max_members: form.max_members,
      status: "active",
      tags: tagList,
      meeting_url: `https://unibud.app/group/${code.toLowerCase()}`,
      share_link: `https://unibud.app/join/${code}`,
    });
  };

  if (success) return <SuccessState message={`Study group created! Join code: ${joinCode}`} />;

  return (
    <div className="p-5 space-y-4">
      <Field label="Group Name" required>
        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. CSC 301 — Algorithms Study Group" className={inputClass} />
      </Field>

      <Field label="Description">
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="What is this study group for?" rows={2} className={`${inputClass} resize-none`} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Group Type">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
            {GROUP_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Course">
          <select value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className={inputClass}>
            <option value="">None</option>
            {(courses || []).map((c) => <option key={c.id} value={c.code}>{c.code} — {c.title}</option>)}
          </select>
        </Field>
      </div>

      {/* Room type */}
      <Field label="Room Type">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setForm({ ...form, room_type: "video" })}
            className={`flex items-center justify-center gap-2 h-10 rounded-[12px] text-[13px] font-semibold spring-tap ${form.room_type === "video" ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"}`}>
            <Video className="w-4 h-4" /> Video
          </button>
          <button type="button" onClick={() => setForm({ ...form, room_type: "voice" })}
            className={`flex items-center justify-center gap-2 h-10 rounded-[12px] text-[13px] font-semibold spring-tap ${form.room_type === "voice" ? "bg-primary text-primary-foreground" : "bg-muted/40 text-muted-foreground"}`}>
            <Mic className="w-4 h-4" /> Voice
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Max Members">
          <input type="number" value={form.max_members} onChange={(e) => setForm({ ...form, max_members: parseInt(e.target.value) || 50 })}
            min={2} max={500} className={inputClass} />
        </Field>
        <Field label="Meeting Date">
          <input type="date" value={form.meeting_date} onChange={(e) => setForm({ ...form, meeting_date: e.target.value })} className={inputClass} />
        </Field>
      </div>

      <Field label="Tags" hint="Comma-separated">
        <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="revision, algorithms, weekly" className={inputClass} />
      </Field>

      <SubmitBar onSubmit={handleSubmit} disabled={!form.name || mutation.isPending} loading={mutation.isPending} label="Create Study Group" />
    </div>
  );
}