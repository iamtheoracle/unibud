import React from "react";
import { Calendar, BookOpen, FileText, ClipboardList, NotebookPen, Library, ShoppingBag, LayoutGrid } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { icon: Calendar, label: "Timetable", path: "/academics", color: "text-[#28A745]" },
  { icon: BookOpen, label: "Courses", path: "/academics", color: "text-blue-500" },
  { icon: FileText, label: "Assignments", path: "/academics", color: "text-amber-500" },
  { icon: ClipboardList, label: "Exams", path: "/academics", color: "text-red-500" },
  { icon: NotebookPen, label: "Notes", path: "/academics", color: "text-purple-500" },
  { icon: Library, label: "Library", path: "/academics", color: "text-emerald-500" },
  { icon: ShoppingBag, label: "Market", path: "/marketplace", color: "text-orange-500" },
  { icon: LayoutGrid, label: "More", path: "/academics", color: "text-slate-500" },
];

export default function QuickActions() {
  return (
    <div>
      <h3 className="font-heading font-bold text-[16px] text-[#1A1A1A] mb-3 px-1">Quick Actions</h3>
      <div className="flex gap-3 overflow-x-auto no-scrollbar">
        {actions.map((action, i) => (
          <Link key={i} to={action.path} className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-black/[0.04] flex items-center justify-center">
              <action.icon className={`w-5 h-5 ${action.color}`} strokeWidth={2} />
            </div>
            <span className="text-[10px] font-medium text-[#1A1A1A]">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}