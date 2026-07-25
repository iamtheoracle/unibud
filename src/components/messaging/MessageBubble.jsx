import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Download, MapPin, Link as LinkIcon,
  Check, CheckCheck, Clock, AlertCircle, Pin,
} from "lucide-react";
import {
  formatMessageTime, formatDuration, formatFileSize,
  getFileIcon, getFileTypeLabel,
} from "./messagingConstants";

export default function MessageBubble({
  message, isOwn, showAvatar, showName, user, onLongPress,
  isEditing, editValue, onEditChange, onEditSubmit, onEditCancel,
}) {
  const [imageOpen, setImageOpen] = useState(false);

  if (message.type === "system") {
    return (
      <div className="flex justify-center py-2">
        <span className="text-[10px] text-muted-foreground bg-muted/60 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const isPending = message.status === "pending";
  const isFailed = message.status === "failed";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 6, x: isOwn ? 14 : -14 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={"flex items-end gap-2 px-3 " + (isOwn ? "flex-row-reverse" : "flex-row") + " " + (showAvatar ? "mt-3" : "mt-0.5")}
        onContextMenu={(e) => { e.preventDefault(); onLongPress(); }}
      >
        {/* Avatar */}
        {showAvatar && !isOwn && (
          message.author_image ? (
            <img src={message.author_image} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
              {(message.author_name || "?").charAt(0)}
            </div>
          )
        )}
        {showAvatar && isOwn && <div className="w-7 shrink-0" />}

        {/* Message content */}
        <div className={"max-w-[75%] " + (isOwn ? "items-end" : "items-start")}>
          {showName && !isOwn && (
            <span className="text-[10px] font-semibold text-muted-foreground ml-1 mb-0.5 block">
              {message.author_name}
            </span>
          )}

          <div
            className={
              "relative rounded-2xl px-3 py-2 transition-all " +
              (isOwn
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-card text-card-foreground border border-border/30 rounded-bl-md") +
              (isPending ? " opacity-60" : "") +
              (isFailed ? " !bg-destructive/10 !border-destructive/30" : "") +
              (message.is_pinned ? " ring-1 ring-primary/30" : "")
            }
            onTouchStart={(e) => {
              const timer = setTimeout(() => onLongPress(), 500);
              const cancel = () => clearTimeout(timer);
              e.target.addEventListener("touchend", cancel, { once: true });
              e.target.addEventListener("touchmove", cancel, { once: true });
            }}
          >
            {/* Reply preview */}
            {message.reply_to_content && (
              <div className={"mb-1.5 px-2 py-1.5 rounded-lg text-[11px] border-l-2 " + (isOwn ? "bg-primary-foreground/10 border-primary-foreground/30" : "bg-muted/50 border-primary")}>
                <span className="font-semibold opacity-80">{message.reply_to_author || "Unknown"}: </span>
                <span className="opacity-70">{message.reply_to_content?.slice(0, 60)}</span>
              </div>
            )}

            {/* Content by type */}
            {isEditing ? (
              <EditInput
                value={editValue}
                onChange={onEditChange}
                onSubmit={onEditSubmit}
                onCancel={onEditCancel}
              />
            ) : (
              <MessageContent message={message} isOwn={isOwn} onImageClick={() => setImageOpen(true)} />
            )}

            {/* Timestamp & status */}
            {!isEditing && (
              <div className={"flex items-center gap-1 mt-0.5 " + (isOwn ? "justify-end" : "justify-start")}>
                {message.is_edited && <span className="text-[9px] opacity-50">edited</span>}
                {message.is_pinned && <Pin className="w-2.5 h-2.5 opacity-50" />}
                <span className="text-[9px] opacity-50">{formatMessageTime(message.created_date)}</span>
                {isOwn && !isEditing && (
                  isFailed ? <AlertCircle className="w-3 h-3 text-destructive" /> :
                  isPending ? <Clock className="w-3 h-3 opacity-50" /> :
                  message.read_by && message.read_by.length > 1 ? <CheckCheck className="w-3 h-3 opacity-60" /> :
                  <Check className="w-3 h-3 opacity-50" />
                )}
              </div>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <div className={"flex flex-wrap gap-1 mt-1 " + (isOwn ? "justify-end" : "justify-start")}>
              {Object.entries(message.reactions).map(([emoji, voters]) => (
                voters.length > 0 && (
                  <span
                    key={emoji}
                    className={"inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border " +
                      (voters.includes(user?.id)
                        ? "bg-primary/15 border-primary/30"
                        : "bg-card border-border/30")}
                  >
                    {emoji}
                    <span className="text-[9px] font-semibold text-muted-foreground">{voters.length}</span>
                  </span>
                )
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Image lightbox */}
      <AnimatePresence>
        {imageOpen && message.type === "image" && message.media_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setImageOpen(false)}
          >
            <img src={message.media_url} alt="" className="max-w-full max-h-full object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MessageContent({ message, isOwn, onImageClick }) {
  switch (message.type) {
    case "image":
      return (
        <div>
          {message.media_url && (
            <img
              src={message.media_url}
              alt={message.content || "image"}
              className="rounded-xl max-w-full max-h-[280px] object-cover cursor-pointer"
              onClick={onImageClick}
            />
          )}
          {message.content && <p className="text-[13px] mt-1.5">{message.content}</p>}
        </div>
      );

    case "video":
      return (
        <div>
          {message.media_url && (
            <video src={message.media_url} controls className="rounded-xl max-w-full max-h-[280px]" />
          )}
          {message.content && <p className="text-[13px] mt-1.5">{message.content}</p>}
        </div>
      );

    case "voice_note":
    case "audio":
      return <VoiceNotePlayer url={message.media_url} duration={message.duration_seconds} isOwn={isOwn} />;

    case "document":
    case "file":
      return <FileAttachment message={message} />;

    case "link":
      return (
        <a
          href={message.link_preview?.url || message.content}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <LinkIcon className="w-4 h-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-medium truncate">{message.link_preview?.title || message.content}</p>
            {message.link_preview?.description && (
              <p className="text-[11px] opacity-70 truncate">{message.link_preview.description}</p>
            )}
          </div>
        </a>
      );

    case "location":
      return (
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-medium">{message.location_data?.label || "Shared location"}</p>
            <p className="text-[11px] opacity-60">{message.location_data?.lat?.toFixed(4)}, {message.location_data?.lng?.toFixed(4)}</p>
          </div>
        </div>
      );

    default:
      return <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>;
  }
}

function VoiceNotePlayer({ url, duration, isOwn }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.ontimeupdate = () => {
        setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
      };
      audioRef.current.onended = () => {
        setPlaying(false);
        setProgress(0);
      };
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const heights = [40, 65, 85, 50, 75, 95, 60, 45, 80, 55, 70, 35, 60, 85, 50, 45, 75, 65, 55, 90, 40, 70];

  return (
    <div className="flex items-center gap-2 min-w-[160px] py-0.5">
      <button
        onClick={toggle}
        className={"w-8 h-8 rounded-full flex items-center justify-center shrink-0 " + (isOwn ? "bg-primary-foreground/20" : "bg-primary/15")}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 flex items-center gap-[2px] h-6">
        {heights.map((h, i) => {
          const active = i / heights.length <= progress;
          return (
            <div
              key={i}
              className={"flex-1 rounded-full transition-colors " + (active ? (isOwn ? "bg-primary-foreground" : "bg-primary") : (isOwn ? "bg-primary-foreground/25" : "bg-muted-foreground/30"))}
              style={{ height: h + "%" }}
            />
          );
        })}
      </div>
      <span className="text-[10px] opacity-60 shrink-0">{formatDuration(duration)}</span>
    </div>
  );
}

function FileAttachment({ message }) {
  const Icon = getFileIcon(message.file_name);
  const fileSize = formatFileSize(message.file_size);
  const typeLabel = getFileTypeLabel(message.file_name);

  return (
    <a
      href={message.media_url}
      target="_blank"
      rel="noopener noreferrer"
      download={message.file_name}
      className="flex items-center gap-2.5 min-w-[200px]"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold truncate">{message.file_name || "Attachment"}</p>
        <p className="text-[10px] opacity-60">{typeLabel}{fileSize && " · " + fileSize}</p>
      </div>
      <Download className="w-4 h-4 opacity-50 shrink-0" />
    </a>
  );
}

function EditInput({ value, onChange, onSubmit, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, []);

  return (
    <div className="flex flex-col gap-1.5 min-w-[200px]">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }
          if (e.key === "Escape") onCancel();
        }}
        className="w-full bg-transparent text-[13px] outline-none resize-none max-h-24"
        rows={1}
      />
      <div className="flex gap-2">
        <button onClick={onSubmit} className="text-[11px] font-semibold text-primary">Save</button>
        <button onClick={onCancel} className="text-[11px] font-semibold text-muted-foreground">Cancel</button>
      </div>
    </div>
  );
}