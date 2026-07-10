import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileText, Loader2, File, X } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Field, inputClass, SubmitBar, SuccessState } from "@/components/portal/quick-actions/NewAssignmentForm";

const RESOURCE_TYPES = [
  { value: "lecture_note", label: "Lecture Note" },
  { value: "book", label: "Book / Textbook" },
  { value: "paper", label: "Research Paper" },
  { value: "journal", label: "Journal Article" },
  { value: "past_question", label: "Past Question" },
  { value: "thesis", label: "Thesis / Dissertation" },
];

export default function UploadMaterialsForm({ user, onClose }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [tags, setTags] = useState("");
  const [form, setForm] = useState({
    title: "",
    type: "lecture_note",
    course_code: "",
    subject: "",
    description: "",
    author: "",
  });

  const { data: courses } = useQuery({
    queryKey: ["portalCourses"],
    queryFn: () => base44.entities.Course.list(),
    retry: false,
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.LibraryResource.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalLibraryResources"] });
      setSuccess(true);
      setTimeout(onClose, 1500);
    },
  });

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setFileName(file.name);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(res.file_url);
      if (!form.title) setForm({ ...form, title: file.name.replace(/\.[^.]+$/, "") });
    } catch (e) { /* error is non-blocking */ }
    setUploading(false);
  };

  const handleSubmit = () => {
    if (!form.title || !form.type) return;
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    mutation.mutate({
      ...form,
      file_url: fileUrl || undefined,
      tags: tagList,
      author: form.author || user?.full_name || "Staff",
      year: new Date().getFullYear(),
    });
  };

  if (success) return <SuccessState message="Lecture materials uploaded to the Library." />;

  return (
    <div className="p-5 space-y-4">
      {/* File drop zone */}
      <div className="relative">
        <input type="file" id="materialFile" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov,.txt,.epub" />
        <label htmlFor="materialFile"
          className="flex flex-col items-center justify-center gap-2 py-8 rounded-[20px] border-2 border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-colors">
          {uploading ? (
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          ) : fileUrl ? (
            <FileText className="w-7 h-7 text-success" />
          ) : (
            <Upload className="w-7 h-7 text-muted-foreground" />
          )}
          {fileUrl ? (
            <div className="text-center">
              <p className="text-[13px] font-semibold text-foreground">{fileName}</p>
              <p className="text-[11px] text-success mt-0.5">Uploaded ✓</p>
            </div>
          ) : uploading ? (
            <p className="text-[13px] text-muted-foreground">Uploading...</p>
          ) : (
            <div className="text-center">
              <p className="text-[13px] font-semibold text-foreground">Click to upload</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">PDF, DOCX, PPTX, MP4, TXT</p>
            </div>
          )}
        </label>
        {fileUrl && (
          <button onClick={() => { setFileUrl(""); setFileName(""); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-error spring-tap">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <Field label="Title" required>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Introduction to Data Structures — Week 5" className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Resource Type">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
            {RESOURCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Course">
          <select value={form.course_code} onChange={(e) => setForm({ ...form, course_code: e.target.value })} className={inputClass}>
            <option value="">None</option>
            {(courses || []).map((c) => <option key={c.id} value={c.code}>{c.code} — {c.title}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Subject">
          <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="e.g. Algorithms" className={inputClass} />
        </Field>
        <Field label="Author / Source">
          <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
            placeholder="e.g. Dr. Smith" className={inputClass} />
        </Field>
      </div>

      <Field label="Description">
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description of the material..." rows={3} className={`${inputClass} resize-none`} />
      </Field>

      <Field label="Tags" hint="Comma-separated">
        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
          placeholder="algorithms, sorting, week5" className={inputClass} />
      </Field>

      <SubmitBar onSubmit={handleSubmit} disabled={!form.title || mutation.isPending} loading={mutation.isPending || uploading} label="Upload to Library" />
    </div>
  );
}