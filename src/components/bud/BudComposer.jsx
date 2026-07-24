import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, FileText, Mic, Send, X } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";

const QUICK_SUGGESTIONS = [
  { label: "Explain", prompt: "Explain this concept simply so I can really understand it." },
  { label: "Summarize", prompt: "Summarize the key points for me." },
  { label: "Quiz Me", prompt: "Quiz me on this topic to check my understanding." },
  { label: "Study Plan", prompt: "Help me build a realistic study plan for this." },
  { label: "Assignment Help", prompt: "Help me with my assignment — guide me step by step." },
];

/**
 * Premium minimal composer for Bud.
 * Rich input bar: Camera, Gallery, Files, PDF, Mic, message, Send.
 * Quick suggestions appear above the input and vanish once the conversation starts.
 */
export default function BudComposer({
  value, onChange, onSend, onFileUpload, disabled, showSuggestions, onSuggestion,
}) {
  const camRef = useRef(null);
  const galleryRef = useRef(null);
  const fileRef = useRef(null);
  const pdfRef = useRef(null);
  const { isListening, isSupported, toggleListening } = useVoiceInput();

  const pick = (ref) => (e) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) onFileUpload(file);
    e.target.value = "";
  };

  const handleVoice = () => {
    if (!isSupported) return;
    toggleListening((t) => onChange(t));
  };

  const tools = [
    { icon: Camera, ref: camRef, accept: "image/*", capture: "environment", label: "Camera" },
    { icon: ImageIcon, ref: galleryRef, accept: "image/*", label: "Gallery" },
    { icon: FileText, ref: fileRef, accept: "*/*", label: "Files" },
    { icon: FileText, ref: pdfRef, accept: "application/pdf,.pdf", label: "PDF" },
  ];

  return (
    <div className="px-4 pb-5 pt-2">
      {/* Quick suggestions — disappear once conversation starts */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden mb-3"
          >
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {QUICK_SUGGESTIONS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => onSuggestion?.(s.prompt)}
                  disabled={disabled}
                  className="flex-shrink-0 px-3.5 py-2 rounded-full bg-card border border-border/40 text-[12px] font-medium text-foreground spring-tap disabled:opacity-50"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="flex items-end gap-2">
        {/* Tool group */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {tools.map((t, i) => (
            <React.Fragment key={t.label}>
              <button
                onClick={() => t.ref.current?.click()}
                disabled={disabled}
                aria-label={t.label}
                className="w-10 h-10 rounded-[14px] bg-card border border-border/40 flex items-center justify-center spring-tap soft-shadow disabled:opacity-50"
              >
                <t.icon className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2} />
              </button>
              <input
                ref={t.ref}
                type="file"
                accept={t.accept}
                capture={t.capture}
                onChange={pick(t.ref)}
                className="hidden"
              />
            </React.Fragment>
          ))}
        </div>

        {/* Message field */}
        <div className="flex-1 relative">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSend(value)}
            placeholder={isListening ? "Listening…" : "Message Bud…"}
            disabled={disabled}
            className="w-full px-4 py-3 rounded-[20px] bg-card border border-border/40 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 soft-shadow"
          />
          <button
            onClick={handleVoice}
            aria-label="Voice"
            className={"absolute right-3 top-1/2 -translate-y-1/2 spring-tap " + (isListening ? "text-error" : "text-muted-foreground hover:text-foreground")}
          >
            <Mic className="w-[18px] h-[18px]" strokeWidth={2} />
            {isListening && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-error animate-pulse" />}
          </button>
        </div>

        {/* Send */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onSend(value)}
          disabled={!value.trim() || disabled}
          aria-label="Send"
          className="w-11 h-11 rounded-[20px] bg-foreground text-background flex items-center justify-center elevated-shadow disabled:opacity-40 disabled:shadow-none transition-all flex-shrink-0"
        >
          <Send className="w-[18px] h-[18px]" strokeWidth={2.2} />
        </motion.button>
      </div>
    </div>
  );
}