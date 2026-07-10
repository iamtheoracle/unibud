import React from "react";
import { motion } from "framer-motion";
import { Users, Mic, Video as VideoIcon, Lock, Globe } from "lucide-react";

const TYPE_ICONS = { private: Lock, public: Globe, department: Users, faculty: Users, course: Users, exam_revision: Users, project_team: Users };

export default function StudyGroupCard({ group }) {
  const TypeIcon = TYPE_ICONS[group.type] || Globe;
  const RoomIcon = group.room_type === "voice" ? Mic : VideoIcon;
  const accent = group.accent_color || "#7C3AED";

  return (
    <motion.div whileTap={{ scale: 0.98 }} className="flex-shrink-0 w-[200px] bg-card rounded-[20px] p-4 premium-shadow border border-border/30 cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
          <RoomIcon className="w-5 h-5" style={{ color: accent }} />
        </div>
        <span className="flex items-center gap-1 text-[9px] font-semibold text-muted-foreground capitalize"><TypeIcon className="w-3 h-3" /> {group.type.replace("_", " ")}</span>
      </div>
      <h3 className="font-heading font-bold text-[13px] text-foreground leading-snug mb-1">{group.name}</h3>
      <p className="text-[11px] text-muted-foreground mb-3">{group.subject}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground font-medium">{group.members_count}/{group.max_members}</span>
        </div>
        {group.status === "active" && <span className="flex items-center gap-1 text-[10px] font-bold text-success"><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Active</span>}
      </div>
    </motion.div>
  );
}