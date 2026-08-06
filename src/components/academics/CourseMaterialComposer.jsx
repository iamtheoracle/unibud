import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Upload, FileText, Link as LinkIcon, Eye } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

const TYPES = [
  { key: "lesson", label: "Lesson", hint: "Markdown text lesson" },
  { key: "reading", label: "Reading", hint: "Markdown article / notes" },
  { key: "video", label: "Video", hint: "Upload or link a video" },
  { key: "document", label: "Document", hint: "PDF / DOC upload" },
  { key: "slides", label: "Slides", hint: "Slide deck upload" },
  { key: "external", label: "External Link", hint: "Any URL" },
];

/**
 * CourseMaterialComposer — lecturer authors a lesson/reading/document for a course.
 * Supports markdown body, file upload (via UploadFile), or an external link.
 */
export default function CourseMaterialComposer({ open, onClose, course, material }) {
  const { toast } = useToast();
  const editing = !!material;
  const [title, setTitle] = useState(material?.title || "");
  const [type, setType] = useState(material?.type || "lesson");
  const [module, setModule] = useState(material?.module || "");
  const [content, setContent] = useState(material?.content || "");
  const [externalUrl, setExternalUrl] = useState(material?.external_url || "");
  const [fileUrl, setFileUrl] = useState(material?.file_url || "");
  const [duration, setDuration] = useState(material?.duration_minutes || 0);
  const [order, setOrder] = useState(material?.order || 0);
  const [status, setStatus] = useState(material?.status || "published");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const needsFile = type === "video" || type === "document" || type === "slides";

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await base44.integrations.Core.UploadFile({ file });
      setFileUrl(res.file_url);
      toast({ title: "File uploaded" });
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) return toast({ title: "Add a title", variant: "destructive" });
    setSaving(true);
    try {
      const payload = {
        course_id: course.id,
        course_code: course.code,
        title: title.trim(),
        type,
        module: module.trim(),
        content: needsFile || type === "external" ? "" : content,
        file_url: needsFile ? fileUrl : "",
        external_url: type === "external" ? externalUrl : "",
        duration_minutes: Number(duration) || 0,
        order: Number(order) || 0,
        status,
        institution_id: course.institution_id || "",
      };
      if (editing) {
        await base44.entities.CourseMaterial.update(material.id, payload);
        toast({ title: "Material updated" });
      } else {
        await base44.entities.CourseMaterial.create(payload);
        toast({ title: "Material published" });
      }
      await queryClientInstance.invalidateQueries({ queryKey: ["courseMaterials", course.id] });
      onClose();
    } catch (err) {
      toast({ title: "Could not save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[28px] bg-card soft-shadow border border-border/40 p-5 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[16px] text-foreground">{editing ? "Edit material" : "Add course content"}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <label className="text-[12px] font-semibold text-foreground">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Introduction to Data Structures"
              className="w-full h-12 mt-1.5 px-4 rounded-[16px] bg-muted/30 border border-border/40 text-[14px] text-foreground focus:outline-none focus:border-primary/50" />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[12px] font-semibold text-foreground">Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}
                  className="w-full h-11 mt-1.5 px-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none">
                  {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">{TYPES.find((t) => t.key === type)?.hint}</p>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground">Module / Week</label>
                <input value={module} onChange={(e) => setModule(e.target.value)} placeholder="Week 1"
                  className="w-full h-11 mt-1.5 px-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />
              </div>
            </div>

            {(needsFile) && (
              <div className="mt-3">
                <label className="text-[12px] font-semibold text-foreground">File</label>
                {fileUrl ? (
                  <div className="flex items-center gap-2 mt-1.5 p-3 rounded-[14px] bg-success/8 border border-success/15">
                    <FileText className="w-4 h-4 text-success" />
                    <span className="text-[12px] text-foreground truncate flex-1">{fileUrl.split("/").pop()}</span>
                    <button onClick={() => setFileUrl("")} className="text-[11px] text-error font-semibold">Remove</button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 mt-1.5 py-3 rounded-[14px] border-2 border-dashed border-border/50 text-[12px] text-muted-foreground spring-tap cursor-pointer">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? "Uploading…" : "Upload file"}
                    <input type="file" className="hidden" onChange={handleFile} />
                  </label>
                )}
              </div>
            )}

            {type === "external" && (
              <div className="mt-3">
                <label className="text-[12px] font-semibold text-foreground flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5" /> External URL</label>
                <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://…"
                  className="w-full h-11 mt-1.5 px-4 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50" />
              </div>
            )}

            {(type === "lesson" || type === "reading") && (
              <div className="mt-3">
                <label className="text-[12px] font-semibold text-foreground flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> Content (Markdown)</label>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={7} placeholder="# Introduction&#10;Write your lesson in markdown…"
                  className="w-full mt-1.5 p-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground font-mono focus:outline-none focus:border-primary/50 resize-y" />
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <label className="text-[12px] font-semibold text-foreground">Duration (min)</label>
                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-11 mt-1.5 px-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground">Order</label>
                <input type="number" value={order} onChange={(e) => setOrder(e.target.value)}
                  className="w-full h-11 mt-1.5 px-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-11 mt-1.5 px-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving || uploading || (needsFile && !fileUrl)}
              className="w-full mt-5 py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Saving…" : editing ? "Update material" : "Publish material"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}