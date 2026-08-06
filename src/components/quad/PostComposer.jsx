import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Image as ImageIcon, FileText, Smile, MapPin, Globe,
  Send, Loader2, Eye, EyeOff, Trash2, Save,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import EmojiPicker from "./EmojiPicker";
import {
  VISIBILITY_OPTIONS, MAX_POST_LENGTH,
  extractHashtags, extractMentions,
} from "./quadConstants";

const DRAFT_KEY = "quad_post_draft";

export default function PostComposer({ open, onClose, user }) {
  const qc = useQueryClient();
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState("text");
  const [visibility, setVisibility] = useState("campus");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showVisibility, setShowVisibility] = useState(false);
  const [media, setMedia] = useState([]); // [{ url, type }]
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveDraft, setSaveDraft] = useState(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Load draft from localStorage
  useEffect(() => {
    if (open) {
      try {
        const draft = localStorage.getItem(DRAFT_KEY);
        if (draft) {
          const parsed = JSON.parse(draft);
          setContent(parsed.content || "");
          setPostType(parsed.postType || "text");
          setVisibility(parsed.visibility || "campus");
          setIsAnonymous(parsed.isAnonymous || false);
          setMedia(parsed.media || []);
          setLocation(parsed.location || "");
        }
      } catch {}
    }
  }, [open]);

  // Auto-save draft
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      if (content.trim() || media.length > 0) {
        try {
          localStorage.setItem(DRAFT_KEY, JSON.stringify({
            content, postType, visibility, isAnonymous, media, location,
          }));
          setSaveDraft(new Date());
        } catch {}
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [content, postType, visibility, isAnonymous, media, location, open]);

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 300) + "px";
    }
  }, [content]);

  const authorName = user?.full_name || user?.email?.split("@")[0] || "Student";
  const authorImage = user?.avatar_url || user?.image || "";
  const university = user?.university || "";
  const charCount = content.length;
  const charLimit = MAX_POST_LENGTH;
  const canPost = content.trim().length > 0 || media.length > 0;

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (const file of files.slice(0, 4)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        let type = "image";
        if (file.type.startsWith("video/")) type = "video";
        else if (file.type.startsWith("application/") || file.type.startsWith("text/")) type = "document";
        setMedia((prev) => [...prev, { url: file_url, type }]);
      }
    } catch {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!canPost || submitting) return;
    setSubmitting(true);

    try {
      const newPost = {
        content: content.trim(),
        author_name: isAnonymous ? "Anonymous" : authorName,
        author_image: isAnonymous ? "" : authorImage,
        author_role: "student",
        author_handle: isAnonymous ? "" : (user?.department || university),
        is_verified: false,
        type: media.length > 0 ? media[0].type : postType,
        media_urls: media.map((m) => m.url),
        media_types: media.map((m) => m.type),
        hashtags: extractHashtags(content),
        mentions: extractMentions(content),
        location: location || "",
        university: university,
        visibility,
        reactions: {},
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        is_pinned: false,
        is_anonymous: isAnonymous,
        draft_status: "published",
      };

      // Optimistic: add to cache immediately
      const tempId = "temp_" + Date.now();
      const optimisticPost = { ...newPost, id: tempId, created_date: new Date().toISOString() };
      qc.setQueryData(["quadFeed"], (old) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: [{ items: [optimisticPost, ...(old.pages[0]?.items || [])], nextCursor: old.pages[0]?.nextCursor }, ...old.pages.slice(1)],
        };
      });

      const created = await base44.entities.QuadPost.create(newPost);

      // Replace temp post with real post
      qc.setQueryData(["quadFeed"], (old) => {
        if (!old || !old.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page, i) => ({
            ...page,
            items: i === 0 ? page.items.map((p) => (p.id === tempId ? created : p)) : page.items,
          })),
        };
      });

      // Clear draft
      localStorage.removeItem(DRAFT_KEY);
      setContent("");
      setMedia([]);
      setLocation("");
      setPostType("text");
      setVisibility("campus");
      setIsAnonymous(false);
      setShowEmoji(false);
      onClose();
    } catch {
      // Revert optimistic update on error
      qc.invalidateQueries({ queryKey: ["quadFeed"] });
    }
    setSubmitting(false);
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({
        content, postType, visibility, isAnonymous, media, location,
      }));
      setSaveDraft(new Date());
      onClose();
    } catch {}
  };

  const handleClearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setContent("");
    setMedia([]);
    setLocation("");
    setPostType("text");
    setVisibility("campus");
    setIsAnonymous(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-0 inset-x-0 z-[100] bg-card rounded-t-[28px] elevated-shadow border-t border-border/30 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-3 pb-2">
              <h3 className="font-heading font-bold text-[17px] text-foreground">Create Post</h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleSaveDraft}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center spring-tap"
                  title="Save draft"
                >
                  <Save className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center spring-tap"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="px-5 pb-6">
              {/* Author row */}
              <div className="flex items-center gap-3 mb-3">
                {isAnonymous ? (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  </div>
                ) : authorImage ? (
                  <img src={authorImage} alt="" className="w-10 h-10 rounded-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold">
                    {authorName.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <span className="font-heading font-semibold text-[13px] text-foreground">
                    {isAnonymous ? "Anonymous" : authorName}
                  </span>
                  {/* Visibility selector */}
                  <button
                    onClick={() => setShowVisibility(!showVisibility)}
                    className="flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-muted/50 text-[10px] font-medium text-muted-foreground"
                  >
                    <Globe className="w-3 h-3" />
                    {VISIBILITY_OPTIONS.find((v) => v.id === visibility)?.label || "Campus"}
                  </button>
                </div>
                <button
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${
                    isAnonymous ? "bg-primary/10 text-primary" : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {isAnonymous ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  Anonymous
                </button>
              </div>

              {/* Visibility dropdown */}
              <AnimatePresence>
                {showVisibility && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-3"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {VISIBILITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => { setVisibility(opt.id); setShowVisibility(false); }}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-semibold transition-colors ${
                            visibility === opt.id ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <opt.icon className="w-3 h-3" />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Text area */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= charLimit) setContent(e.target.value);
                }}
                placeholder="What's happening on campus?"
                rows={3}
                className="w-full bg-transparent text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[80px]"
              />

              {/* Emoji picker */}
              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-3"
                  >
                    <EmojiPicker onSelect={(emoji) => setContent((prev) => prev + emoji)} onClose={() => setShowEmoji(false)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Location input */}
              <AnimatePresence>
                {showLocation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-3"
                  >
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add location (e.g., Library, Engineering Block)"
                      className="w-full px-3 py-2 rounded-[12px] bg-muted/50 border border-border/30 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Media preview */}
              {media.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {media.map((m, i) => (
                    <div key={i} className="relative rounded-[12px] overflow-hidden h-32 bg-muted">
                      {m.type === "image" && <img src={m.url} alt="" className="w-full h-full object-cover" loading="lazy" />}
                      {m.type === "video" && (
                        <video src={m.url} className="w-full h-full object-cover" preload="metadata" />
                      )}
                      {m.type === "document" && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                          <FileText className="w-6 h-6 text-muted-foreground" />
                          <span className="text-[9px] text-muted-foreground truncate max-w-full">{m.url.split("/").pop()}</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Draft saved indicator */}
              {saveDraft && (
                <div className="flex items-center gap-1.5 mb-2 text-[10px] text-muted-foreground">
                  <Save className="w-3 h-3" />
                  Draft saved · {saveDraft.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}
                  <button onClick={handleClearDraft} className="ml-auto text-error flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
              )}

              {/* Toolbar */}
              <div className="flex items-center gap-1 pt-3 border-t border-border/30">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-9 h-9 rounded-[12px] hover:bg-muted flex items-center justify-center spring-tap"
                  title="Photos/Videos"
                >
                  {uploading ? <Loader2 className="w-[18px] h-[18px] text-muted-foreground animate-spin" /> : <ImageIcon className="w-[18px] h-[18px] text-success" strokeWidth={1.8} />}
                </button>
                <button
                  onClick={() => setShowEmoji(!showEmoji)}
                  className={`w-9 h-9 rounded-[12px] flex items-center justify-center spring-tap ${showEmoji ? "bg-primary/10" : "hover:bg-muted"}`}
                  title="Emoji"
                >
                  <Smile className="w-[18px] h-[18px] text-warning" strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => setShowLocation(!showLocation)}
                  className={`w-9 h-9 rounded-[12px] flex items-center justify-center spring-tap ${showLocation ? "bg-primary/10" : "hover:bg-muted"}`}
                  title="Location"
                >
                  <MapPin className="w-[18px] h-[18px] text-error" strokeWidth={1.8} />
                </button>

                {/* Character counter */}
                <div className="flex-1 flex items-center justify-end gap-2">
                  <span className={`text-[11px] font-medium ${charCount > charLimit * 0.9 ? "text-error" : "text-muted-foreground"}`}>
                    {charCount}/{charLimit}
                  </span>
                  <button
                    onClick={handlePost}
                    disabled={!canPost || submitting || uploading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[12px] disabled:opacity-40 spring-tap"
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" strokeWidth={2} />}
                    Post
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}