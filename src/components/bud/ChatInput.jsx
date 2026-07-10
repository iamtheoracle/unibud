import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Send, Mic, Paperclip, X, FileText } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

export default function ChatInput({ value, onChange, onSend, attachments, onFileUpload, onRemoveAttachment, disabled, compact = false }) {
  const fileInputRef = useRef(null);
  const { isListening, isSupported, toggleListening } = useVoiceInput();

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) onFileUpload(file);
    e.target.value = "";
  };

  const handleVoice = () => {
    if (!isSupported) return;
    toggleListening((transcript) => onChange(transcript));
  };

  return (
    <div className={compact ? "p-3" : "p-4 pb-24"}>
      {attachments && attachments.length > 0 && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[12px] bg-card border border-border/40 soft-shadow">
              <FileText className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] text-foreground max-w-[100px] truncate">{att.name || "File"}</span>
              <button onClick={() => onRemoveAttachment(i)} className="spring-tap">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2.5">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="w-10 h-10 rounded-[16px] bg-card border border-border/40 flex items-center justify-center spring-tap soft-shadow flex-shrink-0"
        >
          <Paperclip className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2} />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} className="hidden" />

        <div className="flex-1 relative">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend(value)}
            placeholder={isListening ? "Listening..." : "Ask Bud anything..."}
            disabled={disabled}
            className="w-full px-4 py-3 pr-11 rounded-[20px] bg-card border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 soft-shadow"
          />
          <button
            onClick={handleVoice}
            className={"absolute right-3 top-1/2 -translate-y-1/2 spring-tap " + (isListening ? "text-error" : "text-muted-foreground hover:text-foreground")}
          >
            <Mic className="w-[18px] h-[18px]" strokeWidth={2} />
            {isListening && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error animate-pulse" />}
          </button>
        </div>

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onSend(value)}
          disabled={!value.trim() || disabled}
          className="w-11 h-11 rounded-[20px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground elevated-shadow disabled:opacity-50 disabled:shadow-none transition-all flex-shrink-0"
        >
          <Send className="w-[18px] h-[18px]" />
        </motion.button>
      </div>
    </div>
  );
}