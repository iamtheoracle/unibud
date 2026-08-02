import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart, MessageCircle, BarChart3, HelpCircle, Paperclip,
  Share2, Bookmark, PictureInPicture2, Minimize2, Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const CONTROLS = [
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "reactions", icon: Heart, label: "React" },
  { id: "polls", icon: BarChart3, label: "Polls" },
  { id: "questions", icon: HelpCircle, label: "Q&A" },
  { id: "resources", icon: Paperclip, label: "Files" },
  { id: "share", icon: Share2, label: "Share" },
  { id: "save", icon: Bookmark, label: "Save" },
];

/**
 * LiveSessionControls — floating glass control bar for the live session viewer.
 *
 * Features:
 *  - Toggleable control buttons (chat, reactions, polls, Q&A, resources, share, save)
 *  - PiP toggle
 *  - Minimize/maximize stream
 *  - Floating heart reaction burst on tap
 *
 * Props:
 *  - onControl: (controlId) => void
 *  - onTogglePip: () => void
 *  - onMinimize: () => void
 *  - isPipActive: boolean
 *  - isMinimized: boolean
 *  - chatEnabled: boolean
 *  - questionsEnabled: boolean
 */
export default function LiveSessionControls({
  onControl,
  onTogglePip,
  onMinimize,
  isPipActive = false,
  isMinimized = false,
  chatEnabled = true,
  questionsEnabled = true,
}) {
  const [burstHearts, setBurstHearts] = useState([]);

  const handleReact = () => {
    const id = Date.now();
    setBurstHearts((prev) => [...prev, id]);
    setTimeout(() => setBurstHearts((prev) => prev.filter((h) => h !== id)), 800);
  };

  const visibleControls = CONTROLS.filter((c) => {
    if (c.id === "chat" && !chatEnabled) return false;
    if (c.id === "questions" && !questionsEnabled) return false;
    return true;
  });

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
      {/* Floating heart bursts */}
      <div className="absolute bottom-20 right-4 pointer-events-none">
        <AnimatePresence>
          {burstHearts.map((id) => (
            <motion.div
              key={id}
              initial={{ y: 0, opacity: 0.8, scale: 0.5 }}
              animate={{ y: -120, opacity: 0, scale: 1.5, rotate: Math.random() * 40 - 20 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute right-0 bottom-0"
            >
              <Heart className="w-6 h-6 text-destructive fill-destructive" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Control bar */}
      <div className="pointer-events-auto p-3 safe-area-pb">
        <div className="flex items-center gap-1 p-1.5 rounded-[22px] crystal-dock">
          {visibleControls.map((ctrl) => {
            const Icon = ctrl.icon;
            return (
              <motion.button
                key={ctrl.id}
                whileTap={{ scale: 0.85 }}
                onClick={() => ctrl.id === "reactions" ? handleReact() : onControl?.(ctrl.id)}
                className="relative w-10 h-10 rounded-full luxury-capsule flex items-center justify-center spring-tap flex-shrink-0"
              >
                <Icon
                  className={cn("text-foreground", ctrl.id === "reactions" && "text-destructive")}
                  strokeWidth={2.2}
                  style={{ width: 17, height: 17 }}
                />
              </motion.button>
            );
          })}

          {/* Spacer */}
          <div className="flex-1" />

          {/* PiP */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onTogglePip}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center spring-tap flex-shrink-0",
              isPipActive ? "bg-primary" : "luxury-capsule"
            )}
          >
            <PictureInPicture2
              className={isPipActive ? "w-4 h-4 text-primary-foreground" : "text-foreground"}
              strokeWidth={2.2}
              style={{ width: 17, height: 17 }}
            />
          </motion.button>

          {/* Minimize/Maximize */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onMinimize}
            className="w-10 h-10 rounded-full luxury-capsule flex items-center justify-center spring-tap flex-shrink-0"
          >
            {isMinimized ? (
              <Maximize2 className="text-foreground" strokeWidth={2.2} style={{ width: 17, height: 17 }} />
            ) : (
              <Minimize2 className="text-foreground" strokeWidth={2.2} style={{ width: 17, height: 17 }} />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}