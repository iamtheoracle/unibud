import React from "react";
import { useNavigate } from "react-router-dom";
import { Play, CalendarDays, ClipboardList, Target } from "lucide-react";

const ACTIONS = [
  { icon: Play, label: "Study", to: "/study-sessions" },
  { icon: CalendarDays, label: "Planner", to: "/study/planner" },
  { icon: ClipboardList, label: "Tasks", to: "/assignments" },
  { icon: Target, label: "Goals", to: "/study" },
];

export default function StudyQuickActions() {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-4 gap-2">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
            onClick={() => navigate(a.to)}
            className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl bg-muted/30 spring-tap hover:bg-muted/50 transition-colors"
          >
            <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
            <span className="text-[10px] font-medium text-muted-foreground">{a.label}</span>
          </button>
        );
      })}
    </div>
  );
}