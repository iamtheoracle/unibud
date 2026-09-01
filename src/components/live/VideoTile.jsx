import React from "react";
import { motion } from "framer-motion";
import { MicOff, Hand } from "lucide-react";

export default function VideoTile({ participant, size = "gallery" }) {
  const isMain = size === "main";
  const isThumb = size === "thumb";

  return (
    <motion.div
      layout
      className={`relative rounded-2xl overflow-hidden ${
        isMain ? "w-full h-full" : isThumb ? "w-20 h-14 flex-shrink-0" : "aspect-video"
      } ${participant.speaking ? "ring-2 ring-primary" : ""} ${
        participant.cameraOn ? `bg-gradient-to-br ${participant.color}` : "bg-card border border-border/30"
      }`}
    >
      {participant.cameraOn ? (
        <div className="w-full h-full flex items-center justify-center">
          <span className={`font-heading font-bold text-white/90 ${isMain ? "text-[48px]" : isThumb ? "text-[12px]" : "text-[18px]"}`}>
            {participant.initials}
          </span>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className={`rounded-full bg-gradient-to-br ${participant.color} flex items-center justify-center ${isMain ? "w-20 h-20" : isThumb ? "w-8 h-8" : "w-12 h-12"}`}>
            <span className={`font-heading font-bold text-white ${isMain ? "text-[24px]" : isThumb ? "text-[10px]" : "text-[14px]"}`}>
              {participant.initials}
            </span>
          </div>
        </div>
      )}

      <div className="absolute bottom-1 left-1 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
        {!participant.micOn && <MicOff className="w-3 h-3 text-white" />}
        <span className={`text-white font-medium ${isMain ? "text-[12px]" : "text-[9px]"}`}>{participant.name}</span>
      </div>

      {participant.handRaised && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Hand className="w-3.5 h-3.5 text-primary-foreground" />
        </motion.div>
      )}

      {isMain && (
        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/40 backdrop-blur-sm">
          <span className="text-[9px] text-white font-semibold">Pinned Speaker</span>
        </div>
      )}
    </motion.div>
  );
}