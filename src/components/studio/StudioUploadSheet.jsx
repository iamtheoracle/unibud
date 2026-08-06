import React, { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Video, BookOpen, Upload, Loader2, Check, ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const MEDIA_TYPES = [
  { key: "podcast", label: "Podcast Episode", icon: Mic, accept: "audio/*", hint: "Upload audio", color: "text-primary", bg: "bg-primary/10" },
  { key: "short", label: "Short Video", icon: Video, accept: "video/*", hint: "Upload video", color: "text-accent", bg: "bg-accent/10" },
  { key: "guide", label: "Study Guide", icon: BookOpen, accept: ".pdf,.doc,.docx,.ppt,.pptx,.txt,.md", hint: "Upload document", color: "text-success", bg: "bg-success/10" },
];

const SHORT_CATEGORIES = ["study_tips", "lecture_summary", "tutorial", "campus_news", "research", "coding", "career_advice", "student_project"];

function inferFileType(file) {
  const type = file.type;
  if (type.startsWith("audio/")) return "audio_recording";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("image/")) return "image";
  if (type.includes("pdf")) return "pdf";
  if (type.includes("presentation") || type.includes("powerpoint")) return "presentation";
  if (type.includes("sheet") || type.includes("excel")) return "spreadsheet";
  return "pdf";
}

export default function StudioUploadSheet({ open, onClose, user }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [mediaType, setMediaType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("tutorial");
  const [subject, setSubject] = useState("");
  const [podcastId, setPodcastId] = useState("");
  const [uploading, setUploading] = useState(false);

  const { data: podcasts } = useQuery({
    queryKey: ["studioMyPodcasts"],
    queryFn: () => base44.entities.Podcast.filter({ created_by_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id && mediaType === "podcast",
  });

  const reset = () => { setMediaType(null); setSelectedFile(null); setTitle(""); setCategory("tutorial"); setSubject(""); setPodcastId(""); setUploading(false); };
  const handleClose = () => { reset(); onClose(); };
  const handleFileChange = (e) => { const file = e.target.files?.[0]; if (file) setSelectedFile(file); };

  const handleSubmit = async () => {
    if (!selectedFile || !title.trim()) { toast({ title: "Please add a file and title", variant: "destructive" }); return; }
    if (mediaType === "podcast" && !podcastId) { toast({ title: "Please select a podcast show", variant: "destructive" }); return; }
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: selectedFile });
      if (mediaType === "podcast") {
        const pod = (podcasts || []).find((p) => p.id === podcastId);
        await base44.entities.PodcastEpisode.create({
          podcast_id: podcastId, podcast_title: pod?.title || "", cover_url: pod?.cover_url || "",
          title: title.trim(), audio_url: file_url, status: "draft", host_id: user.id,
          institution_id: user.data?.institution_id,
        });
        qc.invalidateQueries({ queryKey: ["studioEpisodes"] });
      } else if (mediaType === "short") {
        await base44.entities.ShortVideo.create({
          title: title.trim(), video_url: file_url, category,
          author_name: user.full_name || user.email || "Student", author_role: "student",
          status: "active", uploaded_at: new Date().toISOString(),
        });
        qc.invalidateQueries({ queryKey: ["studioShorts"] });
      } else if (mediaType === "guide") {
        await base44.entities.AcademicFile.create({
          title: title.trim(), subject: subject.trim(), file_url, file_type: inferFileType(selectedFile), source_name: "Media Studio",
        });
        qc.invalidateQueries({ queryKey: ["studioGuides"] });
      }
      toast({ title: "Uploaded successfully" });
      handleClose();
    } catch (err) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const selectedType = MEDIA_TYPES.find((t) => t.key === mediaType);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} />
          <motion.div
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] z-50 glass-strong rounded-t-[28px] p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto no-scrollbar"
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {mediaType && (
                  <button onClick={() => { setMediaType(null); setSelectedFile(null); }} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                    <ChevronLeft className="w-4 h-4 text-foreground" />
                  </button>
                )}
                <h2 className="font-heading font-bold text-[18px] text-foreground">{mediaType ? selectedType?.label : "New Content"}</h2>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>

            {!mediaType ? (
              <div className="space-y-2.5">
                {MEDIA_TYPES.map((t) => (
                  <button key={t.key} onClick={() => setMediaType(t.key)} className="w-full flex items-center gap-3 p-4 rounded-[18px] glass-card spring-tap text-left">
                    <div className={`w-11 h-11 rounded-[14px] ${t.bg} flex items-center justify-center`}>
                      <t.icon className={`w-5 h-5 ${t.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-foreground">{t.label}</p>
                      <p className="text-[11px] text-muted-foreground">{t.hint}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <input ref={fileRef} type="file" accept={selectedType?.accept} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="w-full p-6 rounded-[18px] glass-card border-2 border-dashed border-border/40 flex flex-col items-center gap-2 spring-tap">
                  {selectedFile ? (
                    <>
                      <Check className="w-6 h-6 text-success" />
                      <p className="text-[13px] font-semibold text-foreground">{selectedFile.name}</p>
                      <p className="text-[11px] text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <p className="text-[13px] font-medium text-muted-foreground">Tap to select a file</p>
                    </>
                  )}
                </button>

                <div>
                  <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title…" className="w-full px-3.5 py-2.5 rounded-[14px] bg-muted/40 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/40" />
                </div>

                {mediaType === "podcast" && (
                  <div>
                    <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block">Podcast Show</label>
                    {(podcasts || []).length === 0 ? (
                      <p className="text-[12px] text-warning">Create a podcast show first at the Podcasts page.</p>
                    ) : (
                      <select value={podcastId} onChange={(e) => setPodcastId(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[14px] bg-muted/40 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/40">
                        <option value="">Select a show…</option>
                        {(podcasts || []).map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                    )}
                  </div>
                )}

                {mediaType === "short" && (
                  <div>
                    <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3.5 py-2.5 rounded-[14px] bg-muted/40 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/40">
                      {SHORT_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>
                )}

                {mediaType === "guide" && (
                  <div>
                    <label className="text-[12px] font-semibold text-muted-foreground mb-1.5 block">Subject (optional)</label>
                    <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Mathematics, Organic Chemistry" className="w-full px-3.5 py-2.5 rounded-[14px] bg-muted/40 border border-border text-[14px] text-foreground focus:outline-none focus:border-primary/40" />
                  </div>
                )}

                <button onClick={handleSubmit} disabled={uploading || !selectedFile || !title.trim()} className="w-full py-3 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[14px] flex items-center justify-center gap-2 spring-tap disabled:opacity-50">
                  {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : "Upload & Publish"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}