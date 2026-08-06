import React from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, MessageCircle, Mic } from "lucide-react";

const ACTIONS = [
  { icon: FileText, label: "Upload Assignment", to: "/assignments" },
  { icon: MessageCircle, label: "Ask Bud", to: "/bud" },
  { icon: Plus, label: "Create Notes", to: "/notes" },
  { icon: Mic, label: "Join Lecture", to: "/timetable" },
];

export default function QuickActionsCard() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.label}
            to={a.to}
            className="flex items-center gap-2.5 p-3 rounded-xl glass spring-tap hover:bg-white/[0.06]"
          >
            <div className="w-7 h-7 rounded-lg bg-foreground/[0.08] grid place-items-center shrink-0">
              <Icon className="w-3.5 h-3.5 text-foreground" />
            </div>
            <span className="text-[12px] font-medium text-foreground">{a.label}</span>
          </Link>
        );
      })}
    </div>
  );
}