import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Video, Clock, Users, Play } from "lucide-react";

export default function LiveClassCard({ liveClass }) {
  const navigate = useNavigate();
  const isLive = liveClass.status === "live";
  const accent = liveClass.accent_color || "#6D28D9";

  return (
    <motion.div whileTap={{ scale: 0.98 }} onClick={() => navigate(`/live/class/${liveClass.id}`)} className="flex-shrink-0 w-[240px] bg-card rounded-[20px] p-4 premium-shadow border border-border/30 cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ backgroundColor: `${accent}15`, color: accent }}>
          {liveClass.course_code}
        </span>
        {isLive ? (
          <span className="flex items-center gap-1 text-[10px] font-bold text-destructive">
            <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" /> LIVE
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <Clock className="w-3 h-3" /> {liveClass.start_time}
          </span>
        )}
      </div>
      <h3 className="font-heading font-bold text-[14px] text-foreground leading-snug mb-1">{liveClass.title}</h3>
      <p className="text-[11px] text-muted-foreground mb-3">{liveClass.lecturer_name}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground font-medium">{liveClass.participants_count || 0}</span>
        </div>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent }}>
          {isLive ? <Play className="w-3.5 h-3.5 text-white" fill="white" /> : <Video className="w-3.5 h-3.5 text-white" />}
        </div>
      </div>
    </motion.div>
  );
}