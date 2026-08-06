import React from "react";
import {
  BookOpen, Flame, Trophy, Clock, TrendingUp,
  FileCheck, CheckCircle2, Timer, Crown,
  ClipboardCheck, Star, Award,
  StickyNote, Notebook, Layers, FileQuestion, Microscope,
  Users, HeartHandshake, FolderCheck, HandHeart,
  Calendar, CalendarCheck, Briefcase,
  Flag, GraduationCap,
} from "lucide-react";

const ICON_MAP = {
  BookOpen, Flame, Trophy, Clock, TrendingUp,
  FileCheck, CheckCircle2, Timer, Crown,
  ClipboardCheck, Star, Award,
  StickyNote, Notebook, Layers, FileQuestion, Microscope,
  Users, HeartHandshake, FolderCheck, HandHeart,
  Calendar, CalendarCheck, Briefcase,
  Flag, GraduationCap,
};

const VISIBILITY_LABELS = {
  private: "Private",
  friends: "Friends",
  university: "University",
  public: "Public",
};

export default function AchievementBadge({ achievement, size = "md", onClick }) {
  const Icon = ICON_MAP[achievement.icon] || Award;
  const color = achievement.accent_color || "142 71% 45%";

  const sizes = {
    sm: { box: "w-8 h-8 rounded-lg", icon: "w-4 h-4", text: "text-[11px]" },
    md: { box: "w-10 h-10 rounded-xl", icon: "w-5 h-5", text: "text-[12px]" },
    lg: { box: "w-14 h-14 rounded-2xl", icon: "w-7 h-7", text: "text-[13px]" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      onClick={onClick}
      className={"flex items-center gap-2.5 " + (onClick ? "cursor-pointer spring-tap" : "")}
    >
      <div
        className={s.box + " grid place-items-center shrink-0"}
        style={{ background: "hsl(" + color + " / 0.14)", color: "hsl(" + color + ")" }}
      >
        <Icon className={s.icon} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={s.text + " font-semibold text-foreground leading-tight truncate"}>{achievement.title}</p>
        <p className="text-[10px] text-muted-foreground truncate">{achievement.description}</p>
      </div>
    </div>
  );
}

export { VISIBILITY_LABELS, ICON_MAP };