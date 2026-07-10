import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Mic, Paperclip, Image as ImageIcon, FileText, MapPin,
  X, Loader2, Trash2, Sparkles,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { formatDuration } from "./messagingConstants";

export default function MessageComposer({
  onSend, replyTo, onCancelReply, editingMessage, editValue, onEditChange, onEditSubmit, onEditCancel,
  onOracleOpen, disabled, onTyping,
}) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [showAttachments, setShowAttachments] = useState(false);

  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const recordTimeRef = useRef(0);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [text]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleSend = () => {
    const content = text.trim();
    if (!content || disabled) return;
    onSend(content, "text");
    setText("");
    if (onTyping) onTyping(false);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (onTyping) onTyping(!!e.target.value.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setShowAttachments(false);
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await onSend(file.name, "image", {
        media_url: file_url,
        file_name: file.name,
        file_size: file.size,
        media_type: file.type,
      });
    } catch {
      // Silent fail
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setShowAttachments(false);
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const type = file.type.startsWith("video/") ? "video"
        : file.type.startsWith("audio/") ? "audio"
        : "document";
      await onSend(file.name, type, {
        media_url: file_url,
        file_name: file.name,
        file_size: file.size,
        media_type: file.type,
      });
    } catch {
      // Silent fail
    } finally {
      setUploading(false);
    }
  };

  const handleLocation = () => {
    setShowAttachments(false);
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSend("", "location", {
          location_data: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: "Shared location",
          },
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          await onSend("", "voice_note", {
            media_url: file_url,
            duration_seconds: recordTimeRef.current,
            media_type: "audio/webm",
          });
        } catch {
          // Silent fail
        }
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setRecording(true);
      setRecordTime(0);
      recordTimeRef.current = 0;
      timerRef.current = setInterval(() => {
        setRecordTime((t) => {
          const n = t + 1;
          recordTimeRef.current = n;
          return n;
        });
      }, 1000);
    } catch {
      // Permission denied
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recording) {
      recorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.onstop = null;
      try { recorderRef.current.stop(); } catch {}
    }
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  };

  // Edit mode
  if (editingMessage) {
    return (
      <div className="px-4 py-3 glass border-t border-border/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-primary">Editing message</span>
          <button onClick={onEditCancel} className="text-[11px] text-muted-foreground">Cancel</button>
        </div>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEditSubmit(); }
              if (e.key === "Escape") onEditCancel();
            }}
            placeholder="Edit message..."
            className="flex-1 bg-card border border-border/40 rounded-2xl px-4 py-2.5 text-[13px] outline-none focus:border-primary/40 resize-none max-h-24"
            rows={1}
            autoFocus
          />
          <button
            onClick={onEditSubmit}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center spring-tap shrink-0"
          >
            <Send className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 glass border-t border-border/20">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl bg-card border border-border/30 border-l-2 border-l-primary">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-primary">{replyTo.author_name}</p>
            <p className="text-[11px] text-muted-foreground truncate">{replyTo.content?.slice(0, 80)}</p>
          </div>
          <button onClick={onCancelReply} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-muted">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Recording UI */}
      {recording ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-destructive/5 border border-destructive/20">
          <div className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
          <span className="text-[13px] font-mono text-destructive">{formatDuration(recordTime)}</span>
          <div className="flex-1 flex items-center gap-[2px] h-6">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-destructive/40"
                style={{ height: (30 + Math.sin(i * 2 + recordTime) * 40) + "%" }}
              />
            ))}
          </div>
          <button onClick={cancelRecording} className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center spring-tap">
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
          <button onClick={stopRecording} className="w-9 h-9 rounded-full bg-primary flex items-center justify-center spring-tap">
            <Send className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div className="flex items-end gap-2">
          {/* Attachments */}
          <div className="relative">
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              disabled={uploading}
              className="w-10 h-10 rounded-full bg-card border border-border/40 flex items-center justify-center spring-tap shrink-0 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" /> : <Paperclip className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2} />}
            </button>

            <AnimatePresence>
              {showAttachments && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute bottom-12 left-0 z-30 w-40 glass-strong rounded-2xl py-2 elevated-shadow"
                >
                  <AttachmentOption icon={ImageIcon} label="Photo" onClick={() => imageInputRef.current?.click()} />
                  <AttachmentOption icon={FileText} label="Document" onClick={() => fileInputRef.current?.click()} />
                  <AttachmentOption icon={MapPin} label="Location" onClick={handleLocation} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Oracle */}
          <button
            onClick={onOracleOpen}
            className="w-10 h-10 rounded-full bg-card border border-border/40 flex items-center justify-center spring-tap shrink-0"
          >
            <Sparkles className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
          </button>

          {/* Text input */}
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows={1}
            className="flex-1 bg-card border border-border/40 rounded-2xl px-4 py-2.5 text-[13px] outline-none focus:border-primary/40 resize-none max-h-24"
          />

          {/* Send / Mic */}
          {text.trim() ? (
            <button
              onClick={handleSend}
              disabled={disabled}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center spring-tap shrink-0 gold-glow disabled:opacity-50"
            >
              <Send className="w-4 h-4 text-primary-foreground" strokeWidth={2} />
            </button>
          ) : (
            <button
              onClick={startRecording}
              disabled={disabled || uploading}
              className="w-10 h-10 rounded-full bg-card border border-border/40 flex items-center justify-center spring-tap shrink-0 disabled:opacity-50"
            >
              <Mic className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2} />
            </button>
          )}
        </div>
      )}

      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleImageSelect} />
      <input ref={fileInputRef} type="file" hidden onChange={handleFileSelect} />
    </div>
  );
}

function AttachmentOption({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-muted transition-colors"
    >
      <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
      <span className="text-[12px] font-medium text-foreground">{label}</span>
    </button>
  );
}