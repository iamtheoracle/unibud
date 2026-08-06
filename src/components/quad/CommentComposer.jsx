import React, { useState, useRef, useEffect } from "react";
import { Send, Smile, ImagePlus, Mic, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import EmojiPicker from "./EmojiPicker";
import { extractMentions } from "./quadConstants";

/**
 * Comment input with emoji, images, and voice reply support.
 */
export default function CommentComposer({ postId, user, parentComment, onSubmitted, onCancelReply }) {
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState([]);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const qc = useQueryClient();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [text]);

  const authorName = user?.full_name || user?.email?.split("@")[0] || "Student";
  const authorImage = user?.avatar_url || user?.image || "";

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files.slice(0, 4)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push(file_url);
      }
      setMediaUrls((prev) => [...prev, ...uploaded]);
    } catch {}
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() && mediaUrls.length === 0 && !audioBlob) return;
    setSubmitting(true);

    let voiceUrl = null;
    if (audioBlob) {
      try {
        const voiceFile = new File([audioBlob], "voice.webm", { type: "audio/webm" });
        const { file_url } = await base44.integrations.Core.UploadFile({ file: voiceFile });
        voiceUrl = file_url;
      } catch {}
    }

    try {
      await base44.entities.QuadComment.create({
        post_id: postId,
        content: text.trim(),
        author_name: authorName,
        author_image: authorImage,
        parent_id: parentComment?.id || "",
        media_urls: mediaUrls,
        voice_url: voiceUrl,
        mentions: extractMentions(text),
        reactions: {},
        likes_count: 0,
        replies_count: 0,
        is_edited: false,
        is_pinned: false,
      });

      // Clear input immediately — don't wait for secondary updates
      setText("");
      setMediaUrls([]);
      setAudioBlob(null);
      setShowEmoji(false);
      if (onCancelReply) onCancelReply();
      qc.invalidateQueries({ queryKey: ["quadComments", postId] });
      qc.invalidateQueries({ queryKey: ["quadFeed"] });
      if (onSubmitted) onSubmitted();

      // Secondary updates in background (non-blocking)
      base44.entities.QuadPost.get(postId).then((post) => {
        if (post) {
          base44.entities.QuadPost.update(postId, {
            comments_count: (post.comments_count || 0) + 1,
          });
          // Notify the post author (skip if commenting on your own post)
          const postAuthorId = post.created_by_id;
          if (postAuthorId && postAuthorId !== user?.id) {
            base44.entities.Notification.create({
              title: `${authorName} commented on your post`,
              message: text.trim().slice(0, 100) || "Left a comment",
              type: "comment",
              category: "social",
              priority: "normal",
              user_id: postAuthorId,
              link: `/quad`,
              icon: "MessageCircle",
            }).catch(() => {});
          }
        }
      }).catch(() => {});

      if (parentComment) {
        base44.entities.QuadComment.update(parentComment.id, {
          replies_count: (parentComment.replies_count || 0) + 1,
        }).catch(() => {});
      }
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="bg-card rounded-[16px] border border-border/30 p-2.5">
      {parentComment && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[10px] text-muted-foreground">
            Replying to <span className="font-semibold text-foreground">{parentComment.author_name}</span>
          </span>
          <button onClick={onCancelReply} className="ml-auto w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        </div>
      )}

      {showEmoji && (
        <div className="mb-2">
          <EmojiPicker
            onSelect={(emoji) => setText((prev) => prev + emoji)}
            onClose={() => setShowEmoji(false)}
          />
        </div>
      )}

      {/* Media preview */}
      {(mediaUrls.length > 0 || audioBlob) && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {mediaUrls.map((url, i) => (
            <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
              <button
                onClick={() => setMediaUrls((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          ))}
          {audioBlob && (
            <div className="relative w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
              <button
                onClick={() => setAudioBlob(null)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5 text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          rows={1}
          className="flex-1 bg-transparent text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none resize-none max-h-24 py-1.5"
        />
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center spring-tap"
          >
            <Smile className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center spring-tap"
          >
            {uploading ? <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" /> : <ImagePlus className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-7 h-7 rounded-lg flex items-center justify-center spring-tap ${recording ? "bg-error/10" : "hover:bg-muted"}`}
          >
            <Mic className={`w-4 h-4 ${recording ? "text-error animate-pulse" : "text-muted-foreground"}`} strokeWidth={1.8} />
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || (!text.trim() && mediaUrls.length === 0 && !audioBlob)}
            className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center spring-tap disabled:opacity-40"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" /> : <Send className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2} />}
          </button>
        </div>
      </div>
    </div>
  );
}