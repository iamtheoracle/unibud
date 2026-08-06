import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { X, UploadCloud, Link2 } from "lucide-react";

const FILE_TYPES = [
  "lecture_slides", "pdf", "past_questions", "notes", "study_guide",
  "assignment", "project", "template", "research_paper", "handout",
  "document", "presentation", "spreadsheet", "image", "video",
  "audio_recording", "archive", "code", "link",
];

const LABELS = {
  lecture_slides: "Lecture Slides", pdf: "PDF", past_questions: "Past Questions",
  notes: "Notes", study_guide: "Study Guide", assignment: "Assignment",
  project: "Project", template: "Template", research_paper: "Research Paper",
  handout: "Handout", document: "Document", presentation: "Presentation",
  spreadsheet: "Spreadsheet", image: "Image", video: "Video",
  audio_recording: "Audio Recording", archive: "ZIP Archive", code: "Code File",
  link: "External Link",
};

export default function AddResourceSheet({ onClose, onAdd, onUpload, uploading }) {
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("pdf");
  const [folder, setFolder] = useState("");
  const [description, setDescription] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [subject, setSubject] = useState("");
  const [semester, setSemester] = useState("");
  const [tags, setTags] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    let file_url = null;
    let mime_type = null;
    let file_size = 0;
    if (file) {
      file_url = await onUpload(file);
      if (!file_url) return;
      mime_type = file.type;
      file_size = file.size;
    }
    onAdd({
      title: title.trim(),
      file_type: fileType,
      folder: folder.trim() || undefined,
      description: description.trim() || undefined,
      course_code: courseCode.trim() || undefined,
      subject: subject.trim() || undefined,
      semester: semester.trim() || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      file_url: file_url || undefined,
      external_url: fileType === "link" ? externalUrl.trim() || undefined : undefined,
      mime_type,
      file_size_bytes: file_size,
      access_level: "read_only",
      last_modified: new Date().toISOString(),
    });
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 400, damping: 35 }}
        className="fixed bottom-0 inset-x-0 z-[100] glass-strong rounded-t-[28px] max-h-[88vh] overflow-y-auto no-scrollbar adaptive-safe-bottom"
        role="dialog" aria-modal="true"
      >
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3 mb-4" />
        <div className="flex items-center justify-between px-5 mb-4">
          <h3 className="font-heading font-bold text-[16px] text-foreground">Share Resource</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/40 flex items-center justify-center"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>

        <div className="px-5 pb-6 space-y-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title (e.g. Week 5 Lecture Slides)" className="w-full px-3.5 py-2.5 rounded-[14px] bg-muted/40 text-[13px] text-foreground outline-none" />

          {/* File type selector */}
          <div className="flex flex-wrap gap-1.5">
            {FILE_TYPES.map((t) => (
              <button key={t} onClick={() => setFileType(t)} className={`px-2.5 py-1 rounded-full text-[10px] font-medium spring-tap ${fileType === t ? "bg-foreground text-background" : "bg-muted/30 text-muted-foreground"}`}>{LABELS[t]}</button>
            ))}
          </div>

          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)..." rows={2} className="w-full px-3.5 py-2.5 rounded-[14px] bg-muted/40 text-[13px] text-foreground outline-none resize-none" />

          <div className="grid grid-cols-2 gap-2">
            <input value={courseCode} onChange={(e) => setCourseCode(e.target.value)} placeholder="Course code" className="px-3 py-2 rounded-[12px] bg-muted/40 text-[12px] text-foreground outline-none" />
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" className="px-3 py-2 rounded-[12px] bg-muted/40 text-[12px] text-foreground outline-none" />
            <input value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Folder name" className="px-3 py-2 rounded-[12px] bg-muted/40 text-[12px] text-foreground outline-none" />
            <input value={semester} onChange={(e) => setSemester(e.target.value)} placeholder="Semester" className="px-3 py-2 rounded-[12px] bg-muted/40 text-[12px] text-foreground outline-none" />
          </div>

          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)..." className="w-full px-3.5 py-2.5 rounded-[14px] bg-muted/40 text-[13px] text-foreground outline-none" />

          {fileType === "link" ? (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-[14px] bg-muted/40">
              <Link2 className="w-4 h-4 text-muted-foreground" />
              <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://..." className="flex-1 bg-transparent text-[12px] text-foreground outline-none" />
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center gap-1.5 w-full py-6 rounded-[14px] border border-dashed cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/20"}`}
            >
              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <UploadCloud className={`w-6 h-6 ${dragOver ? "text-primary" : "text-muted-foreground"}`} strokeWidth={1.5} />
              {file ? (
                <span className="text-[12px] font-medium text-foreground">{file.name}</span>
              ) : (
                <>
                  <span className="text-[12px] text-muted-foreground">Drop a file or tap to browse</span>
                  <span className="text-[10px] text-muted-foreground/60">PDF, DOCX, PPTX, XLSX, images, audio, video, ZIP, code</span>
                </>
              )}
            </div>
          )}

          <button onClick={handleSubmit} disabled={!title.trim() || uploading} className="w-full py-3 rounded-[14px] bg-foreground text-background text-[13px] font-bold active:scale-[0.98] transition-transform disabled:opacity-50">
            {uploading ? "Uploading..." : "Share with group"}
          </button>
        </div>
      </motion.div>
    </>
  );
}