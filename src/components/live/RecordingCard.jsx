import React from "react";
import { motion } from "framer-motion";
import { Play, Clock, Eye } from "lucide-react";

export default function RecordingCard({ recording }) {
  return (
    <motion.div whileTap={{ scale: 0.98 }} className="flex-shrink-0 w-[280px] bg-card rounded-[20px] overflow-hidden premium-shadow border border-border/30 cursor-pointer">
      <div className="relative h-[140px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center premium-shadow">
          <Play className="w-5 h-5 text-primary-foreground" fill="currentColor" />
        </div>
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold">{recording.duration_minutes} min</span>
        {recording.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div className="h-full bg-primary" style={{ width: `${recording.progress}%` }} />
          </div>
        )}
      </div>
      <div className="p-3.5">
        <span className="text-[10px] font-bold text-primary">{recording.course_code}</span>
        <h3 className="font-heading font-bold text-[13px] text-foreground leading-snug mt-0.5 mb-1">{recording.title}</h3>
        <p className="text-[11px] text-muted-foreground">{recording.lecturer_name}</p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Eye className="w-3 h-3" /> {recording.views || 0}</span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" /> {recording.recorded_date}</span>
        </div>
      </div>
    </motion.div>
  );
}