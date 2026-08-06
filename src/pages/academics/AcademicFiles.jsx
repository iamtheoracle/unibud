import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Upload, Search, Star, FileText, File, Image, Music,
  Video, Link2, Sheet, Presentation, FileQuestion, BookOpen,
  MoreVertical, Download, Trash2, Sparkles, Folder, Loader2, X,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { toast } from "@/components/ui/use-toast";

const FILE_TYPE_CONFIG = {
  lecture_slides: { icon: Presentation, label: "Slides", color: "bg-primary/10 text-primary" },
  pdf: { icon: FileText, label: "PDF", color: "bg-destructive/10 text-destructive" },
  past_questions: { icon: FileQuestion, label: "Past Q", color: "bg-chocolate/10 text-chocolate" },
  notes: { icon: BookOpen, label: "Notes", color: "bg-success/10 text-success" },
  assignments: { icon: FileText, label: "Assignment", color: "bg-warning/10 text-warning-foreground" },
  research_paper: { icon: File, label: "Paper", color: "bg-information/10 text-information" },
  image: { icon: Image, label: "Image", color: "bg-primary/10 text-primary" },
  audio_recording: { icon: Music, label: "Audio", color: "bg-chocolate/10 text-chocolate" },
  video: { icon: Video, label: "Video", color: "bg-destructive/10 text-destructive" },
  spreadsheet: { icon: Sheet, label: "Sheet", color: "bg-success/10 text-success" },
  presentation: { icon: Presentation, label: "Slides", color: "bg-primary/10 text-primary" },
  external_link: { icon: Link2, label: "Link", color: "bg-information/10 text-information" },
};

const SORT_OPTIONS = [
  { id: "recent", label: "Recent" },
  { id: "name", label: "Name" },
  { id: "course", label: "Course" },
  { id: "favorites", label: "Favorites" },
];

export default function AcademicFiles() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [search, setSearch] = useState("");
  const [activeSort, setActiveSort] = useState("recent");
  const [activeCourse, setActiveCourse] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [aiLoading, setAiLoading] = useState(null);

  const { data: files, isLoading } = useQuery({
    queryKey: ["academic_files"],
    queryFn: () => base44.entities.AcademicFile.list("-created_date", 100),
    enabled: isOnline,
  });

  const { data: courses } = useQuery({
    queryKey: ["academic_files", "courses"],
    queryFn: () => base44.entities.Course.list("-created_date", 20),
    enabled: isOnline,
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["academic_files"] });
  }, [queryClient]);

  const toggleFavorite = useCallback(async (file) => {
    try {
      await base44.entities.AcademicFile.update(file.id, { is_favorite: !file.is_favorite });
      await queryClient.invalidateQueries({ queryKey: ["academic_files"] });
    } catch {
      toast({ title: "Couldn't update", description: "Please try again" });
    }
  }, [queryClient]);

  const deleteFile = useCallback(async (file) => {
    try {
      await base44.entities.AcademicFile.delete(file.id);
      await queryClient.invalidateQueries({ queryKey: ["academic_files"] });
      toast({ title: "Deleted", description: file.title });
    } catch {
      toast({ title: "Couldn't delete", description: "Please try again" });
    }
  }, [queryClient]);

  const generateAiSummary = useCallback(async (file) => {
    if (!file.file_url) {
      toast({ title: "No file to analyze", description: "This item has no uploaded content" });
      return;
    }
    setAiLoading(file.id);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Summarize this academic document titled "${file.title}". Extract key topics, main concepts, and a brief study guide. Keep it concise and actionable for a student.`,
        file_urls: [file.file_url],
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_topics: { type: "array", items: { type: "string" } },
            study_tips: { type: "string" },
          },
        },
      });
      await base44.entities.AcademicFile.update(file.id, { ai_summary: JSON.stringify(res) });
      await queryClient.invalidateQueries({ queryKey: ["academic_files"] });
      toast({ title: "Summary ready", description: "Bud has analyzed your document" });
    } catch {
      toast({ title: "Couldn't analyze", description: "Please try again later" });
    } finally {
      setAiLoading(null);
    }
  }, [queryClient]);

  // Filter + sort
  const visibleFiles = useMemo(() => {
    if (!files) return [];
    let list = files;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((f) =>
        f.title?.toLowerCase().includes(q) ||
        f.description?.toLowerCase().includes(q) ||
        f.course_code?.toLowerCase().includes(q) ||
        f.subject?.toLowerCase().includes(q) ||
        f.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (activeCourse !== "all") {
      list = list.filter((f) => f.course_code === activeCourse);
    }
    switch (activeSort) {
      case "name":
        list = [...list].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "course":
        list = [...list].sort((a, b) => (a.course_code || "").localeCompare(b.course_code || ""));
        break;
      case "favorites":
        list = [...list].sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0));
        break;
      default:
        list = [...list].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    }
    return list;
  }, [files, search, activeCourse, activeSort]);

  const courseCodes = useMemo(() => {
    const set = new Set();
    (files || []).forEach((f) => f.course_code && set.add(f.course_code));
    return Array.from(set);
  }, [files]);

  const favoritesCount = (files || []).filter((f) => f.is_favorite).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-4 pt-5 pb-2">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-card flex items-center justify-center shadow-sm active:scale-95 transition-transform">
            <ArrowLeft className="w-4.5 h-4.5 text-foreground" strokeWidth={2.2} />
          </button>
          <div className="flex-1">
            <h1 className="text-[20px] font-bold text-foreground tracking-tight">Files</h1>
            <p className="text-[11px] text-muted-foreground">{files?.length || 0} items · {favoritesCount} favorites</p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center active:scale-95 transition-transform"
            style={{ boxShadow: "0 4px 16px rgba(255,122,0,0.25)" }}
          >
            <Upload className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={2} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files, courses, tags..."
            className="w-full h-10 pl-10 pr-4 rounded-[16px] bg-card text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
            style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
          />
        </div>

        {/* Sort + course filter */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSort(s.id)}
              className={`px-3 h-7 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeSort === s.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground shadow-sm"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-3 pb-24">
        <ProductionState
          state={!isOnline ? "offline" : isLoading ? "loading" : "ready"}
          onRefresh={handleRefresh}
          skeleton={<FileSkeleton />}
        >
          {visibleFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center">
                <Folder className="w-7 h-7 text-muted-foreground" strokeWidth={1.6} />
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-foreground mb-1">No files yet</p>
                <p className="text-[12px] text-muted-foreground max-w-[240px]">
                  Upload lecture slides, PDFs, past questions and more to keep them organized by course
                </p>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="mt-2 px-5 h-10 rounded-full bg-primary text-[13px] font-bold text-primary-foreground active:scale-95 transition-transform"
              >
                Upload File
              </button>
            </div>
          ) : (
            <>
              {/* Course filter pills */}
              {courseCodes.length > 0 && (
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3">
                  <button
                    onClick={() => setActiveCourse("all")}
                    className={`px-3 h-7 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                      activeCourse === "all"
                        ? "bg-chocolate text-white"
                        : "bg-card text-muted-foreground shadow-sm"
                    }`}
                  >
                    All Courses
                  </button>
                  {courseCodes.map((code) => (
                    <button
                      key={code}
                      onClick={() => setActiveCourse(code)}
                      className={`px-3 h-7 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                        activeCourse === code
                          ? "bg-chocolate text-white"
                          : "bg-card text-muted-foreground shadow-sm"
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              )}

              {/* File list */}
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {visibleFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onToggleFav={() => toggleFavorite(file)}
                      onDelete={() => deleteFile(file)}
                      onAiSummary={() => generateAiSummary(file)}
                      aiLoading={aiLoading === file.id}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </ProductionState>
      </div>

      {/* Upload sheet */}
      <AnimatePresence>
        {showUpload && (
          <UploadSheet
            courses={courses || []}
            onClose={() => setShowUpload(false)}
            onUploaded={async () => {
              await queryClient.invalidateQueries({ queryKey: ["academic_files"] });
              setShowUpload(false);
              toast({ title: "File uploaded", description: "Your material is now organized" });
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function FileCard({ file, onToggleFav, onDelete, onAiSummary, aiLoading }) {
  const [showMenu, setShowMenu] = useState(false);
  const config = FILE_TYPE_CONFIG[file.file_type] || FILE_TYPE_CONFIG.pdf;
  const Icon = config.icon;
  const hasAiSummary = !!file.ai_summary;
  const aiData = hasAiSummary ? (() => { try { return JSON.parse(file.ai_summary); } catch { return null; } })() : null;

  const openFile = () => {
    const url = file.file_url || file.external_url;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[16px] bg-card p-3"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start gap-2.5">
        {/* File icon */}
        <button onClick={openFile} className={`w-10 h-10 rounded-[12px] ${config.color} flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform`}>
          <Icon className="w-5 h-5" strokeWidth={2.2} />
        </button>

        {/* Info */}
        <button onClick={openFile} className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-bold text-foreground truncate">{file.title}</p>
            {file.is_favorite && <Star className="w-3 h-3 text-warning fill-warning flex-shrink-0" strokeWidth={2} />}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {file.course_code || file.subject || "General"} · {config.label}
          </p>
          {file.tags && file.tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {file.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </button>

        {/* Favorite + menu */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onToggleFav} className="w-7 h-7 rounded-[8px] flex items-center justify-center active:scale-90 transition-transform">
            <Star className={`w-4 h-4 ${file.is_favorite ? "text-warning fill-warning" : "text-muted-foreground"}`} strokeWidth={2} />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="w-7 h-7 rounded-[8px] flex items-center justify-center active:scale-90 transition-transform">
            <MoreVertical className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Menu actions */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 pt-2.5 mt-2.5 border-t border-border/40">
              <button
                onClick={onAiSummary}
                disabled={aiLoading}
                className="flex-1 flex items-center justify-center gap-1.5 h-8 rounded-[10px] bg-primary/10 text-primary text-[11px] font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.2} /> : <Sparkles className="w-3.5 h-3.5" strokeWidth={2.2} />}
                {aiLoading ? "Analyzing..." : "Summarize"}
              </button>
              <button
                onClick={openFile}
                className="flex items-center justify-center gap-1.5 h-8 px-3 rounded-[10px] bg-muted text-muted-foreground text-[11px] font-bold active:scale-95 transition-transform"
              >
                <Download className="w-3.5 h-3.5" strokeWidth={2.2} />
                Open
              </button>
              <button
                onClick={onDelete}
                className="flex items-center justify-center w-8 h-8 rounded-[10px] bg-destructive/10 text-destructive active:scale-95 transition-transform"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2.2} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Summary */}
      {aiData && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2.5 p-2.5 rounded-[12px] bg-gradient-to-br from-primary/5 to-chocolate/5 border border-primary/10"
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-primary" strokeWidth={2.2} />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wide">Bud Summary</span>
          </div>
          <p className="text-[11px] text-foreground leading-relaxed mb-1.5">{aiData.summary}</p>
          {aiData.key_topics && aiData.key_topics.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {aiData.key_topics.slice(0, 4).map((t, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {t}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

function UploadSheet({ courses, onClose, onUploaded }) {
  const [title, setTitle] = useState("");
  const [fileType, setFileType] = useState("pdf");
  const [courseCode, setCourseCode] = useState("");
  const [tags, setTags] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", description: "Give your file a name" });
      return;
    }
    setUploading(true);
    try {
      let fileUrl = null;
      let fileSize = 0;
      let mimeType = "";

      if (selectedFile) {
        const res = await base44.integrations.Core.UploadFile({ file: selectedFile });
        fileUrl = res.file_url;
        fileSize = selectedFile.size;
        mimeType = selectedFile.type;
      } else if (externalUrl.trim()) {
        fileUrl = externalUrl.trim();
      } else {
        toast({ title: "No file selected", description: "Upload a file or paste a link" });
        setUploading(false);
        return;
      }

      await base44.entities.AcademicFile.create({
        title: title.trim(),
        file_type: fileType,
        file_url: fileUrl,
        external_url: externalUrl.trim() || null,
        file_size_bytes: fileSize,
        mime_type: mimeType,
        course_code: courseCode || null,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        source_name: selectedFile ? "Upload" : "External Link",
      });
      await onUploaded();
    } catch (err) {
      toast({ title: "Upload failed", description: "Please try again" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[600px] bg-background rounded-t-[28px] p-5 pb-8 max-h-[85vh] overflow-y-auto"
        style={{ boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-foreground">Upload Material</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
            <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
          </button>
        </div>

        <div className="space-y-3">
          {/* Title */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. MTH201 Past Questions 2023"
              className="w-full h-11 px-3 rounded-[14px] bg-card text-[13px] text-foreground outline-none"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
            />
          </div>

          {/* File type */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Type</label>
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(FILE_TYPE_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setFileType(key)}
                  className={`px-2.5 h-8 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                    fileType === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground shadow-sm"
                  }`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Course */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Course (optional)</label>
            <select
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full h-11 px-3 rounded-[14px] bg-card text-[13px] text-foreground outline-none"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
            >
              <option value="">General / No specific course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.code || c.name}>{c.code || c.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tags (comma separated)</label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. midterm, important, chapter1"
              className="w-full h-11 px-3 rounded-[14px] bg-card text-[13px] text-foreground outline-none"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
            />
          </div>

          {/* File upload or external link */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">File or Link</label>
            <div className="space-y-2">
              <label className="flex items-center justify-center gap-2 h-14 rounded-[14px] border-2 border-dashed border-border cursor-pointer active:scale-[0.98] transition-transform">
                <Upload className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
                <span className="text-[12px] text-muted-foreground">
                  {selectedFile ? selectedFile.name : "Choose a file to upload"}
                </span>
                <input type="file" onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp3,.wav,.mp4,.webm" />
              </label>
              <div className="text-center text-[10px] text-muted-foreground">or paste an external link</div>
              <input
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full h-11 px-3 rounded-[14px] bg-card text-[13px] text-foreground outline-none"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full h-12 rounded-[16px] bg-primary text-[14px] font-bold text-primary-foreground active:scale-[0.98] transition-transform disabled:opacity-50"
            style={{ boxShadow: "0 4px 16px rgba(255,122,0,0.25)" }}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.2} />
                Uploading...
              </span>
            ) : "Save File"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function FileSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 rounded-[16px] bg-card shadow-sm animate-pulse" />
      ))}
    </div>
  );
}