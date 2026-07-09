import React from "react";
import { Calendar, BookOpen, FileText, ClipboardList, NotebookPen, Library, ShoppingBag, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { icon: Calendar, label: "Timetable", path: "/academics", color: "text-success" },
  { icon: BookOpen, label: "Courses", path: "/academics", color: "text-info" },
  { icon: FileText, label: "Assignments", path: "/academics", color: "text-warning" },
  { icon: ClipboardList, label: "Exams", path: "/academics", color: "text-destructive" },
  { icon: NotebookPen, label: "Notes", path: "/academics", color: "text-purple" },
  { icon: Library, label: "Library", path: "/academics", color: "text-success" },
  { icon: ShoppingBag, label: "Market", path: "/marketplace", color: "text-warning" },
  { icon: LayoutGrid, label: "More", path: "/academics", color: "text-muted-foreground" },
];

export default function QuickActions() {
  return (
    <div>
      <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">Quick Actions</h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {actions.map((action, i) => (
          <Link key={i} to={action.path} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-card shadow-sm border border-border/30 flex items-center justify-center">
              <action.icon className={`w-5 h-5 ${action.color}`} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}