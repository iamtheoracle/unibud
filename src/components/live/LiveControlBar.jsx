import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, Share2, PenTool, Hand, Smile, MessageSquare, Users, Sparkles, LayoutGrid, MoreHorizontal, LogOut, FileText, Presentation, Crosshair, Image, Lock, Maximize2, Minimize2 } from "lucide-react";
import ControlButton from "./ControlButton";

const REACTIONS = ["👍", "❤️", "😂", "👏", "🎉", "🔥"];

const MORE_OPTIONS = [
  { icon: FileText, label: "Share PDF" },
  { icon: Presentation, label: "Share Slides" },
  { icon: PenTool, label: "Digital Pen" },
  { icon: Crosshair, label: "Laser Pointer" },
  { icon: Image, label: "Background" },
  { icon: Lock, label: "Waiting Room" },
  { icon: Maximize2, label: "Focus Mode" },
  { icon: Minimize2, label: "Picture-in-Pic" },
];

export default function LiveControlBar({ micOn, cameraOn, handRaised, view, activePanel, onToggleMic, onToggleCamera, onScreenShare, onWhiteboard, onRaiseHand, onReaction, onTogglePanel, onToggleView, onLeave }) {
  const [showReactions, setShowReactions] = useState(false);
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="relative px-4 pb-5 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent">
      <AnimatePresence>
        {showReactions && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 p-2 glass rounded-2xl elevated-shadow z-50">
            {REACTIONS.map(emoji => (
              <button key={emoji} onClick={() => { onReaction(emoji); setShowReactions(false); }} className="w-9 h-9 rounded-xl hover:bg-primary/10 flex items-center justify-center text-xl transition-transform hover:scale-125">{emoji}</button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMore && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end" onClick={() => setShowMore(false)}>
            <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} className="w-full max-w-lg mx-auto bg-card rounded-t-[28px] p-5 border-t border-border/30" onClick={e => e.stopPropagation()}>
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
              <h3 className="font-heading font-bold text-[15px] text-foreground mb-4 text-center">More Options</h3>
              <div className="grid grid-cols-4 gap-3">
                {MORE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button key={opt.label} onClick={() => setShowMore(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center"><Icon className="w-5 h-5 text-foreground" /></div>
                      <span className="text-[9px] text-muted-foreground font-medium text-center leading-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <ControlButton icon={cameraOn ? Video : VideoOff} active={cameraOn} onClick={onToggleCamera} />
        <ControlButton icon={micOn ? Mic : MicOff} active={micOn} onClick={onToggleMic} />
        <ControlButton icon={Share2} onClick={onScreenShare} />
        <ControlButton icon={PenTool} onClick={onWhiteboard} />
        <ControlButton icon={Hand} active={handRaised} onClick={onRaiseHand} />
        <ControlButton icon={Smile} active={showReactions} onClick={() => setShowReactions(!showReactions)} />
        <ControlButton icon={MessageSquare} active={activePanel === "chat"} onClick={() => onTogglePanel("chat")} badge={3} />
        <ControlButton icon={Users} active={activePanel === "participants"} onClick={() => onTogglePanel("participants")} badge={6} />
        <ControlButton icon={Sparkles} active={activePanel === "bud"} onClick={() => onTogglePanel("bud")} />
        <ControlButton icon={LayoutGrid} active={view === "gallery"} onClick={onToggleView} />
        <ControlButton icon={MoreHorizontal} active={showMore} onClick={() => setShowMore(!showMore)} />
        <div className="w-px h-8 bg-border/40 mx-1 flex-shrink-0" />
        <ControlButton icon={LogOut} danger onClick={onLeave} />
      </div>
    </div>
  );
}