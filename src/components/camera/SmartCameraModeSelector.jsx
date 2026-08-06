import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ClipboardList, PenTool, BookOpen, QrCode, ScanLine,
  Languages, Brain, Video, Camera, X, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const CAMERA_MODES = [
  { id: "document", label: "Document", icon: FileText, color: "hsl(217 91% 60%)", desc: "Scan documents to PDF" },
  { id: "assignment", label: "Assignment", icon: ClipboardList, color: "hsl(142 71% 45%)", desc: "Capture assignments" },
  { id: "whiteboard", label: "Whiteboard", icon: PenTool, color: "hsl(280 65% 60%)", desc: "Capture whiteboard notes" },
  { id: "lecture", label: "Lecture", icon: BookOpen, color: "hsl(200 80% 55%)", desc: "Record lecture slides" },
  { id: "qr", label: "QR Scanner", icon: QrCode, color: "hsl(46 74% 55%)", desc: "Scan QR codes & check in" },
  { id: "ar", label: "Campus AR", icon: ScanLine, color: "hsl(251 90% 67%)", desc: "Explore campus in AR" },
  { id: "translate", label: "Translate", icon: Languages, color: "hsl(24 90% 55%)", desc: "Translate text instantly" },
  { id: "ocr", label: "AI OCR", icon: Brain, color: "hsl(160 70% 45%)", desc: "Extract text from images" },
  { id: "recording", label: "Record", icon: Video, color: "hsl(0 84% 60%)", desc: "Record lecture video" },
];

/**
 * SmartCameraModeSelector — mode selector for the campus smart camera.
 * Supports document scanning, assignment capture, whiteboard capture,
 * lecture scanning, QR codes, campus AR, translation, AI OCR, and recording.
 *
 * Props:
 *  - open: boolean
 *  - onSelect: (modeId) => void
 *  - onClose: () => void
 */
export default function SmartCameraModeSelector({ open, onSelect, onClose }) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (modeId) => {
    setSelected(modeId);
    onSelect?.(modeId);
    setTimeout(() => {
      setSelected(null);
      onClose?.();
    }, 600);
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
            className="fixed inset-0 z-[7000] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-0 left-0 right-0 z-[7001] rounded-t-[24px] overflow-hidden safe-area-pb"
          >
            <div className="crystal-card rounded-t-[24px] pb-6">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3" />

              <div className="flex items-center justify-between px-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Camera className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Smart Camera</p>
                    <h3 className="font-heading font-bold text-[16px] text-foreground">Scan Mode</h3>
                  </div>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                </button>
              </div>

              {/* Mode grid */}
              <div className="grid grid-cols-3 gap-2 px-4 mt-4">
                {CAMERA_MODES.map((mode, i) => {
                  const Icon = mode.icon;
                  const isSelected = selected === mode.id;

                  return (
                    <motion.button
                      key={mode.id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleSelect(mode.id)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-[14px] spring-tap relative overflow-hidden",
                        isSelected ? "glass-strong" : "glass"
                      )}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 3 }}
                          transition={{ duration: 0.5 }}
                          className="absolute inset-0 rounded-full"
                          style={{ background: `${mode.color}30` }}
                        />
                      )}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center relative z-10"
                        style={{ background: `${mode.color}20` }}
                      >
                        {isSelected ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -90 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          >
                            <Sparkles className="w-4 h-4" strokeWidth={2.2} style={{ color: mode.color }} />
                          </motion.div>
                        ) : (
                          <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: mode.color }} />
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-foreground text-center leading-tight relative z-10">{mode.label}</span>
                      <span className="text-[7px] text-muted-foreground text-center leading-tight relative z-10 line-clamp-2">{mode.desc}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Bud hint */}
              <div className="mx-4 mt-4 px-3 py-2 rounded-[12px] glass">
                <div className="flex items-start gap-1.5">
                  <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" strokeWidth={2.2} />
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Bud automatically detects homework, enhances whiteboard captures, and extracts text from lecture slides.
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

export { CAMERA_MODES };