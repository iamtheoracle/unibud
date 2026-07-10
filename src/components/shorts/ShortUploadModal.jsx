import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Loader2, Send, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { SHORT_CATEGORIES } from "./shortConstants";
import { extractHashtags, extractMentions } from "@/components/quad/quadConstants";

export default function ShortUploadModal({ open, onClose, onPublish, user }) {
  const [step, setStep] = useState("select");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("tutorial");
  const [hashtags, setHashtags] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const { uploadMedia, generateVideoThumbnail, isUploading } = useMediaUpload();

  const reset = () => {
    setStep("select");
    setVideoFile(null);
    setVideoPreview(null);
    setThumbnailUrl(null);
    setDuration(0);
    setTitle("");
    setDescription("");
    setCategory("tutorial");
    setHashtags("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));

    // Generate thumbnail
    const result = await generateVideoThumbnail(file);
    if (result.thumbnailBlob) {
      try {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: result.thumbnailBlob });
        setThumbnailUrl(uploadResult.file_url);
      } catch {}
    }
    setDuration(result.duration || 0);
    setStep("edit");
  };

  const handlePublish = async () => {
    if (!videoFile || !title.trim()) return;
    setPublishing(true);
    setError(null);
    try {
      const result = await uploadMedia(videoFile, { compress: false, generateThumb: false });
      const videoUrl = result.mediaUrl;

      const tags = extractHashtags(hashtags);
      const mentions = extractMentions(description);

      await base44.entities.ShortVideo.create({
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration_seconds: Math.round(duration),
        category,
        author_name: user?.full_name || "Student",
        author_image: user?.avatar_url || "",
        author_role: "student",
        author_handle: user?.department ? `${user.department} · ${user.level || ""}` : "",
        is_verified: false,
        university: user?.university || "",
        faculty: user?.faculty || "",
        department: user?.department || "",
        course_code: user?.course_code || "",
        hashtags: tags,
        mentions,
        tags: [],
        captions: [],
        reactions: {},
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        bookmarks_count: 0,
        views_count: 0,
        is_bookmarked: false,
        is_following_creator: false,
        status: "active",
        uploaded_at: new Date().toISOString(),
      });

      setPublishing(false);
      onPublish();
      reset();
    } catch {
      setPublishing(false);
      setError("Failed to upload video. Please try again.");
    }
  };

  const canPublish = videoFile && title.trim().length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-card rounded-[28px] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-[16px] text-foreground">Share a Short</h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center spring-tap" aria-label="Close">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {step === "select" ? (
              <div className="flex flex-col items-center justify-center py-12">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 p-8 rounded-3xl border-2 border-dashed border-border hover:border-primary transition-colors spring-tap"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-medium text-foreground">Select a video</span>
                  <span className="text-[11px] text-muted-foreground">MP4, WebM up to 100MB</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Video preview */}
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] max-h-[240px] mx-auto">
                  <video src={videoPreview} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                  {thumbnailUrl && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-success/90 text-success-foreground text-[10px] font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Thumbnail ready
                    </div>
                  )}
                </div>

                {/* Title */}
                <div>
                  <label className="text-[12px] font-semibold text-foreground mb-1 block">Title *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., 5 Study Tips for Finals"
                    maxLength={100}
                    className="w-full bg-muted/40 border border-border/40 rounded-xl px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[12px] font-semibold text-foreground mb-1 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this video about?"
                    rows={2}
                    maxLength={500}
                    className="w-full bg-muted/40 border border-border/40 rounded-xl px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Category</label>
                  <div className="flex gap-1.5 flex-wrap">
                    {SHORT_CATEGORIES.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setCategory(cat.id)}
                          className={"flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium spring-tap " + (category === cat.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground")}
                        >
                          <Icon className="w-3 h-3" />
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="text-[12px] font-semibold text-foreground mb-1 block">Hashtags</label>
                  <input
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="#studytips #examprep"
                    className="w-full bg-muted/40 border border-border/40 rounded-xl px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
                  />
                </div>

                {error && <p className="text-[12px] text-destructive">{error}</p>}

                {/* Publish */}
                <button
                  onClick={handlePublish}
                  disabled={!canPublish || publishing || isUploading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-40"
                >
                  {publishing || isUploading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Publish Short</>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}