import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Smile, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmojiPicker from "@/components/quad/EmojiPicker";
import { DISCUSSION_TYPES } from "./discussionConstants";

/**
 * DiscussionComposer — rich input for collection discussions.
 * Supports text, emoji, @mentions (collaborator dropdown), and
 * image attachments. Reuses EmojiPicker and UploadFile.
 */
export default function DiscussionComposer({ onSubmit, collaborators = [], placeholder, disabled, onTyping }) {
  const [content, setContent] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [selectedType, setSelectedType] = useState("none");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [content]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setContent(val);
    onTyping?.();
    const pos = e.target.selectionStart;
    const before = val.slice(0, pos);
    const match = before.match(/@(\w*)$/);
    if (match) {
      setShowMentions(true);
      setMentionQuery(match[1]);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (c) => {
    const pos = textareaRef.current?.selectionStart || content.length;
    const before = content.slice(0, pos);
    const after = content.slice(pos);
    const match = before.match(/@(\w*)$/);
    if (match) {
      const name = (c.name || "").replace(/\s+/g, "");
      const newText = before.slice(0, -match[0].length) + `@${name} ` + after;
      setContent(newText);
    }
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files.slice(0, 3)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setMediaUrls((prev) => [...prev, file_url]);
      }
    } catch {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = () => {
    if ((!content.trim() && mediaUrls.length === 0) || disabled) return;
    onSubmit(content.trim(), null, mediaUrls, selectedType);
    setContent("");
    setMediaUrls([]);
    setSelectedType("none");
    setShowEmoji(false);
    setShowMentions(false);
  };

  const filteredCollaborators = collaborators
    .filter((c) => {
      if (!mentionQuery) return true;
      return (c.name || "").toLowerCase().includes(mentionQuery.toLowerCase());
    })
    .slice(0, 5);

  return (
    <div className="relative">
      <AnimatePresence>
        {showMentions && filteredCollaborators.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full left-0 right-0 mb-2 glass-strong rounded-2xl overflow-hidden z-20"
          >
            {filteredCollaborators.map((c) => (
              <button
                key={c.user_id}
                onClick={() => insertMention(c)}
                className="w-full flex items-center gap-2 p-2 hover:bg-muted/30 spring-tap text-left"
              >
                <div className="w-6 h-6 rounded-full bg-card grid place-items-center text-[9px] font-bold shrink-0">
                  {c.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="text-[12px] font-medium truncate">{c.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-1 overflow-x-auto no-scrollbar mb-2">
        {DISCUSSION_TYPES.filter((t) => t.id !== "none").map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedType(selectedType === t.id ? "none" : t.id)}
            className={"flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap spring-tap " + (selectedType === t.id ? "bg-foreground text-background" : "glass text-muted-foreground")}
          >
            <span>{t.emoji}</span> {t.label}
          </button>
        ))}
      </div>

      {mediaUrls.length > 0 && (
        <div className="flex gap-2 mb-2">
          {mediaUrls.map((url) => (
            <div key={url} className="relative w-14 h-14 rounded-xl overflow-hidden">
              <img src={url} className="w-full h-full object-cover" alt="" loading="lazy" />
              <button
                onClick={() => setMediaUrls((prev) => prev.filter((u) => u !== url))}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 grid place-items-center"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mb-2"
          >
            <EmojiPicker
              onSelect={(emoji) => setContent((prev) => prev + emoji)}
              onClose={() => setShowEmoji(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-1.5">
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-9 h-9 rounded-full glass-card grid place-items-center spring-tap shrink-0"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <ImageIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className={"w-9 h-9 rounded-full grid place-items-center spring-tap shrink-0 " + (showEmoji ? "bg-foreground text-background" : "glass-card text-muted-foreground")}
        >
          <Smile className="w-4 h-4" />
        </button>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder || "Ask a question..."}
          rows={1}
          className="flex-1 px-3 py-2 rounded-2xl bg-muted/40 border border-border/30 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/30 resize-none min-h-[36px] max-h-[120px]"
        />
        <button
          onClick={handleSubmit}
          disabled={(!content.trim() && mediaUrls.length === 0) || disabled}
          className="w-9 h-9 rounded-full bg-foreground text-background grid place-items-center spring-tap disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}