import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Camera, Video, Type, Send, Loader2, MapPin, Link as LinkIcon,
  BarChart3, HelpCircle, Calendar, Trash2, Plus,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { TEXT_BACKGROUNDS, computeExpiry } from "./storyConstants";
import { extractHashtags, extractMentions } from "@/components/quad/quadConstants";

const STICKER_TYPES = [
  { id: "poll", label: "Poll", icon: BarChart3 },
  { id: "question", label: "Question", icon: HelpCircle },
  { id: "countdown", label: "Countdown", icon: Calendar },
  { id: "location", label: "Location", icon: MapPin },
  { id: "link", label: "Link", icon: LinkIcon },
];

const DRAFT_KEY = "story_draft";

export default function StoryComposer({ open, onClose, onPublish, user }) {
  const [step, setStep] = useState("select");
  const [storyType, setStoryType] = useState("photo");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [bgColor, setBgColor] = useState(TEXT_BACKGROUNDS[0]);
  const [caption, setCaption] = useState("");
  const [stickers, setStickers] = useState([]);
  const [activeStickerEditor, setActiveStickerEditor] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const fileInputRef = useRef(null);
  const { uploadMedia, isUploading } = useMediaUpload();

  // Load draft on open
  React.useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.storyType === "text" && d.textContent) {
          setStoryType(d.storyType);
          setTextContent(d.textContent || "");
          setBgColor(d.bgColor || TEXT_BACKGROUNDS[0]);
          setCaption(d.caption || "");
          setStickers(d.stickers || []);
          setStep("edit");
          setHasDraft(true);
        }
      }
    } catch {}
  }, [open]);

  // Auto-save draft for text stories
  React.useEffect(() => {
    if (!open || step !== "edit" || storyType !== "text") return;
    if (!textContent.trim()) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ storyType, textContent, bgColor, caption, stickers }));
        setHasDraft(true);
      } catch {}
    }, 1000);
    return () => clearTimeout(t);
  }, [open, step, storyType, textContent, bgColor, caption, stickers]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  const reset = () => {
    setStep("select");
    setStoryType("photo");
    setMediaFile(null);
    setMediaPreview(null);
    setTextContent("");
    setBgColor(TEXT_BACKGROUNDS[0]);
    setCaption("");
    setStickers([]);
    setActiveStickerEditor(null);
    setError(null);
    clearDraft();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setStoryType(file.type.startsWith("video/") ? "video" : "photo");
    setMediaPreview(URL.createObjectURL(file));
    setStep("edit");
  };

  const handleTextMode = () => {
    setStoryType("text");
    setStep("edit");
  };

  const addSticker = (type) => {
    const newSticker = { type, data: getDefaultStickerData(type), id: Date.now() };
    setStickers([...stickers, newSticker]);
    setActiveStickerEditor(newSticker.id);
  };

  const updateSticker = (id, data) => {
    setStickers(stickers.map((s) => (s.id === id ? { ...s, data: { ...s.data, ...data } } : s)));
  };

  const removeSticker = (id) => {
    setStickers(stickers.filter((s) => s.id !== id));
    setActiveStickerEditor(null);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      let mediaUrl = null;
      let thumbnailUrl = null;
      let duration = 5;

      if (storyType !== "text" && mediaFile) {
        const result = await uploadMedia(mediaFile, {
          compress: storyType === "photo",
          generateThumb: storyType === "video",
        });
        mediaUrl = result.mediaUrl;
        thumbnailUrl = result.thumbnailUrl;
        duration = storyType === "video" ? Math.min(result.duration || 15, 15) : 5;
      }

      const content = storyType === "text" ? textContent : caption;
      const hashtags = extractHashtags(content);
      const mentions = extractMentions(content);

      const stickerData = stickers.map((s) => ({
        type: s.type,
        data: s.data,
      }));

      const pollData = stickerData.find((s) => s.type === "poll")?.data || null;
      const questionData = stickerData.find((s) => s.type === "question")?.data || null;
      const countdownData = stickerData.find((s) => s.type === "countdown")?.data || null;
      const locationSticker = stickerData.find((s) => s.type === "location")?.data;
      const linkSticker = stickerData.find((s) => s.type === "link")?.data;

      await base44.entities.Story.create({
        content,
        author_name: user?.full_name || "Student",
        author_image: user?.avatar_url || "",
        author_role: "student",
        author_handle: user?.department ? `${user.department} · ${user.level || ""}` : "",
        is_verified: false,
        type: storyType,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl,
        duration_seconds: duration,
        background_color: storyType === "text" ? bgColor : null,
        stickers: stickerData,
        poll_data: pollData,
        question_data: questionData,
        countdown_data: countdownData,
        location: locationSticker?.name || "",
        link_url: linkSticker?.url || "",
        hashtags,
        mentions,
        university: user?.university || "",
        faculty: user?.faculty || "",
        department: user?.department || "",
        course_code: user?.course_code || "",
        views_count: 0,
        replies_count: 0,
        reactions: {},
        expires_at: computeExpiry(),
        is_highlight: false,
        status: "active",
      });

      setPublishing(false);
      clearDraft();
      onPublish();
      reset();
    } catch {
      setPublishing(false);
      setError("Failed to publish story. Please try again.");
    }
  };

  const canPublish = storyType === "text" ? textContent.trim().length > 0 : !!mediaFile;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] bg-black/90 flex items-center justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-full sm:h-[90vh] sm:rounded-[28px] overflow-hidden bg-black sm:relative flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 z-20 relative">
              <button onClick={handleClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center spring-tap" aria-label="Close">
                <X className="w-5 h-5 text-white" />
              </button>
              <div className="flex flex-col items-center">
                <h2 className="text-white font-heading font-bold text-[15px]">
                  {step === "select" ? "New Story" : "Edit Story"}
                </h2>
                {hasDraft && step === "select" && (
                  <span className="text-[9px] text-white/50 mt-0.5">Draft saved</span>
                )}
              </div>
              <div className="w-9" />
            </div>

            {step === "select" ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
                <p className="text-white/70 text-[14px] text-center mb-2">Share a moment with your campus</p>
                <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-white/5 border border-white/10 spring-tap"
                  >
                    <Camera className="w-7 h-7 text-white" strokeWidth={1.5} />
                    <span className="text-[11px] text-white font-medium">Photo</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-white/5 border border-white/10 spring-tap"
                  >
                    <Video className="w-7 h-7 text-white" strokeWidth={1.5} />
                    <span className="text-[11px] text-white font-medium">Video</span>
                  </button>
                  <button
                    onClick={handleTextMode}
                    className="flex flex-col items-center gap-2 p-5 rounded-3xl bg-white/5 border border-white/10 spring-tap"
                  >
                    <Type className="w-7 h-7 text-white" strokeWidth={1.5} />
                    <span className="text-[11px] text-white font-medium">Text</span>
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              <>
                {/* Preview */}
                <div className="flex-1 relative overflow-hidden flex items-center justify-center">
                  {storyType === "text" ? (
                    <div
                      className="w-full h-full flex items-center justify-center p-8"
                      style={{ background: bgColor }}
                    >
                      <textarea
                        value={textContent}
                        onChange={(e) => setTextContent(e.target.value)}
                        placeholder="Type something..."
                        maxLength={200}
                        autoFocus
                        className="w-full bg-transparent text-white text-center text-[20px] font-heading font-medium placeholder:text-white/40 focus:outline-none resize-none"
                        style={{ minHeight: "120px" }}
                      />
                    </div>
                  ) : storyType === "video" ? (
                    <video src={mediaPreview} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  ) : (
                    <img src={mediaPreview} className="w-full h-full object-cover" alt="Story preview" />
                  )}

                  {/* Sticker overlays */}
                  <div className="absolute bottom-4 left-0 right-0 px-4 space-y-2">
                    {stickers.map((sticker) => (
                      <StickerCard
                        key={sticker.id}
                        sticker={sticker}
                        isActive={activeStickerEditor === sticker.id}
                        onActivate={() => setActiveStickerEditor(sticker.id)}
                        onUpdate={(data) => updateSticker(sticker.id, data)}
                        onRemove={() => removeSticker(sticker.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Caption for media stories */}
                {storyType !== "text" && (
                  <div className="p-3 bg-black/80">
                    <input
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a caption..."
                      maxLength={200}
                      className="w-full bg-white/10 border border-white/10 rounded-2xl px-4 py-2.5 text-white text-[13px] placeholder:text-white/40 focus:outline-none focus:border-primary"
                    />
                  </div>
                )}

                {/* Text background picker */}
                {storyType === "text" && (
                  <div className="p-3 bg-black/80">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {TEXT_BACKGROUNDS.map((bg, i) => (
                        <button
                          key={i}
                          onClick={() => setBgColor(bg)}
                          className={"w-8 h-8 rounded-full shrink-0 spring-tap " + (bgColor === bg ? "ring-2 ring-white ring-offset-2 ring-offset-black" : "")}
                          style={{ background: bg }}
                          aria-label={`Background ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sticker toolbar */}
                <div className="px-3 pb-2 bg-black/80">
                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                    {STICKER_TYPES.map((st) => {
                      const Icon = st.icon;
                      return (
                        <button
                          key={st.id}
                          onClick={() => addSticker(st.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/10 border border-white/10 text-white text-[11px] font-medium spring-tap shrink-0"
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Publish */}
                <div className="p-3 bg-black/80 flex items-center gap-3">
                  {error && <span className="text-[11px] text-destructive flex-1">{error}</span>}
                  <button
                    onClick={handlePublish}
                    disabled={!canPublish || publishing || isUploading}
                    className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-[13px] spring-tap disabled:opacity-40"
                  >
                    {publishing || isUploading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                    ) : (
                      <>Publish <Send className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getDefaultStickerData(type) {
  switch (type) {
    case "poll":
      return { question: "", options: [{ id: 1, text: "", votes: 0 }, { id: 2, text: "", votes: 0 }] };
    case "question":
      return { question: "" };
    case "countdown":
      return { label: "", target_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16) };
    case "location":
      return { name: "" };
    case "link":
      return { url: "", title: "" };
    default:
      return {};
  }
}

function StickerCard({ sticker, isActive, onActivate, onUpdate, onRemove }) {
  const { type, data } = sticker;

  return (
    <div
      onClick={onActivate}
      className={"rounded-2xl p-3 backdrop-blur-md transition-all " + (isActive ? "bg-white/20 border border-white/30" : "bg-black/40 border border-white/10")}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{type}</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center" aria-label="Remove sticker">
          <Trash2 className="w-3 h-3 text-white" />
        </button>
      </div>

      {type === "poll" && (
        <div className="space-y-1.5">
          <input
            value={data.question}
            onChange={(e) => onUpdate({ question: e.target.value })}
            placeholder="Poll question..."
            className="w-full bg-transparent text-white text-[12px] font-medium placeholder:text-white/40 focus:outline-none"
          />
          {data.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={opt.text}
                onChange={(e) => onUpdate({ options: data.options.map((o, j) => j === i ? { ...o, text: e.target.value } : o) })}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-white/10 rounded-lg px-2 py-1 text-white text-[11px] placeholder:text-white/40 focus:outline-none"
              />
              {data.options.length > 2 && (
                <button onClick={(e) => { e.stopPropagation(); onUpdate({ options: data.options.filter((_, j) => j !== i) }); }} className="text-white/40 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
          {data.options.length < 4 && (
            <button onClick={(e) => { e.stopPropagation(); onUpdate({ options: [...data.options, { id: Date.now(), text: "", votes: 0 }] }); }} className="text-[10px] text-primary flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add option
            </button>
          )}
        </div>
      )}

      {type === "question" && (
        <input
          value={data.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          placeholder="Ask a question..."
          className="w-full bg-transparent text-white text-[12px] placeholder:text-white/40 focus:outline-none"
        />
      )}

      {type === "countdown" && (
        <div className="flex flex-col gap-1">
          <input
            value={data.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="Countdown label..."
            className="w-full bg-transparent text-white text-[12px] placeholder:text-white/40 focus:outline-none"
          />
          <input
            type="datetime-local"
            value={data.target_date}
            onChange={(e) => onUpdate({ target_date: e.target.value })}
            className="w-full bg-white/10 rounded-lg px-2 py-1 text-white text-[11px] focus:outline-none [color-scheme:dark]"
          />
        </div>
      )}

      {type === "location" && (
        <input
          value={data.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder="Add location..."
          className="w-full bg-transparent text-white text-[12px] placeholder:text-white/40 focus:outline-none"
        />
      )}

      {type === "link" && (
        <div className="flex flex-col gap-1">
          <input
            value={data.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-white/10 rounded-lg px-2 py-1 text-white text-[11px] placeholder:text-white/40 focus:outline-none"
          />
          <input
            value={data.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Link title..."
            className="w-full bg-transparent text-white text-[12px] placeholder:text-white/40 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}