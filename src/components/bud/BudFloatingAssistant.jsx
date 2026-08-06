import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Mic, Camera, Paperclip, Send, Sparkles, ArrowUp,
} from "lucide-react";
import BudStateOrb from "@/components/bud/BudStateOrb";
import BudContextChips from "@/components/bud/BudContextChips";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const INPUT_MODES = [
  { id: "text", icon: ArrowUp, label: "Text" },
  { id: "voice", icon: Mic, label: "Voice" },
  { id: "camera", icon: Camera, label: "Camera" },
  { id: "file", icon: Paperclip, label: "File" },
];

/**
 * BudFloatingAssistant — the global Bud panel invokable anywhere.
 * Features voice, text, camera, and file input with context chips.
 * Bud understands what the user is doing via live context.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onSend: (message, mode) => void
 *  - context: string — current screen context for Bud
 */
export default function BudFloatingAssistant({ open, onClose, onSend, context = "home" }) {
  const [mode, setMode] = useState("text");
  const [text, setText] = useState("");
  const [budState, setBudState] = useState("idle");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && mode === "text") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, mode]);

  const handleSend = () => {
    if (!text.trim() && mode === "text") return;
    onSend?.(text, mode);
    setText("");
    setBudState("thinking");
    setTimeout(() => setBudState("idle"), 2000);
  };

  const toggleVoice = () => {
    if (mode === "voice") {
      setIsListening(false);
      setBudState("idle");
      setMode("text");
    } else {
      setMode("voice");
      setIsListening(true);
      setBudState("listening");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[8000] bg-black/60 backdrop-blur-md"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed bottom-0 left-0 right-0 z-[8001] safe-area-pb"
          >
            <div className="crystal-card rounded-t-[28px] overflow-hidden pb-4">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3" />

              {/* Header with Bud orb */}
              <div className="flex items-center justify-between px-5 mt-4">
                <div className="flex items-center gap-3">
                  <BudStateOrb state={budState} size={40} showPulse={budState !== "idle"} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Bud</p>
                    <p className="text-[12px] text-muted-foreground">
                      {budState === "listening" ? "Listening..." :
                       budState === "thinking" ? "Thinking..." :
                       "How can I help?"}
                    </p>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                </button>
              </div>

              {/* Context chips */}
              <div className="mt-4">
                <BudContextChips
                  variant="rail"
                  onSelect={(chipId) => {
                    setText((prev) => prev + (prev ? " " : "") + `#${chipId} `);
                    inputRef.current?.focus();
                  }}
                />
              </div>

              {/* Voice mode overlay */}
              <AnimatePresence>
                {mode === "voice" && isListening && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 80 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-center gap-1.5 overflow-hidden"
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 rounded-full bg-primary"
                        animate={{ scaleY: [0.3, 1, 0.3] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut",
                        }}
                        style={{ height: 32, transformOrigin: "center" }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Text input area */}
              <div className="px-5 mt-3">
                <div className="flex items-end gap-2 p-2 rounded-[20px] glass-strong">
                  {/* Input mode switcher */}
                  <div className="flex items-center gap-1">
                    {INPUT_MODES.map((m) => {
                      const Icon = m.icon;
                      const active = mode === m.id;
                      return (
                        <motion.button
                          key={m.id}
                          whileTap={{ scale: 0.88 }}
                          onClick={() => m.id === "voice" ? toggleVoice() : (setMode(m.id), setIsListening(false), setBudState("idle"))}
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center spring-tap",
                            active ? "bg-primary/15" : "glass"
                          )}
                        >
                          <Icon className={cn("w-3.5 h-3.5", active ? "text-primary" : "text-muted-foreground")} strokeWidth={2.2} />
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Text input */}
                  {mode === "text" && (
                    <textarea
                      ref={inputRef}
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Ask Bud anything..."
                      rows={1}
                      className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none resize-none py-1.5 max-h-24"
                    />
                  )}

                  {/* Camera/File placeholder */}
                  {mode === "camera" && (
                    <div className="flex-1 py-1.5 text-[12px] text-muted-foreground">
                      Tap camera to capture...
                    </div>
                  )}
                  {mode === "file" && (
                    <div className="flex-1 py-1.5 text-[12px] text-muted-foreground">
                      Attach a file...
                    </div>
                  )}

                  {/* Send */}
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={handleSend}
                    disabled={!text.trim() && mode === "text"}
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center spring-tap flex-shrink-0",
                      text.trim() || mode !== "text" ? "bg-primary" : "bg-muted"
                    )}
                  >
                    <Send className="w-4 h-4 text-primary-foreground" strokeWidth={2.2} />
                  </motion.button>
                </div>
              </div>

              {/* Bud tip */}
              <div className="px-5 mt-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-2.5 h-2.5 text-primary flex-shrink-0" strokeWidth={2.2} />
                  <p className="text-[10px] text-muted-foreground italic">
                    Bud can see your screen, read documents, and take actions.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}