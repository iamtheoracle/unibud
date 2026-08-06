import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Paperclip, BookOpen, ClipboardList, Calendar, CheckCircle, Users, Video } from "lucide-react";

const TOOLS = [
  { icon: FileText, label: "Shared Notes", to: "/notes" },
  { icon: Paperclip, label: "Files", to: "/knowledge" },
  { icon: BookOpen, label: "Assignments", to: "/assignments" },
  { icon: ClipboardList, label: "Project Boards", to: "/collaboration" },
  { icon: Calendar, label: "Meeting Notes", to: "/collaboration" },
  { icon: CheckCircle, label: "Polls", to: null },
  { icon: Users, label: "Tasks", to: "/tasks" },
  { icon: Video, label: "Whiteboard", to: null },
];

const SHARED_FILES = [
  { name: "Lecture_5_Slides.pdf", meta: "CSC401" },
  { name: "Assignment_2_Instructions.docx", meta: "Dr. Bello" },
];

const avatarBg = () => ({ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" });

export default function ConnectCollaboration() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5">
        {TOOLS.map((t) => (
          <button key={t.label} onClick={() => t.to && navigate(t.to)} disabled={!t.to} className="flex flex-col items-center gap-1.5 py-4 rounded-2xl glass border border-border/40 spring-tap disabled:opacity-50">
            <t.icon className="w-5 h-5 text-foreground" />
            <span className="text-[11px] text-muted-foreground">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="glass-card p-3.5">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Recent Shared Files</span>
          <button onClick={() => navigate("/knowledge")} className="text-[11px] text-muted-foreground/70 spring-tap">See all</button>
        </div>
        <div className="flex flex-col gap-2">
          {SHARED_FILES.map((f) => (
            <button key={f.name} onClick={() => navigate("/knowledge")} className="flex items-center gap-2 text-[12px] spring-tap">
              <FileText className="w-4 h-4 text-muted-foreground/70 flex-shrink-0" />
              <span className="truncate text-foreground">{f.name}</span>
              <span className="ml-auto text-[11px] text-muted-foreground/70">{f.meta}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-3.5 flex items-center gap-3 glass border border-primary/20">
        <div className="w-8 h-8 rounded-full grid place-items-center text-[14px] text-primary-foreground flex-shrink-0" style={avatarBg()}>✦</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">Bud can help</div>
          <div className="text-[12px] text-foreground">Summarize this meeting →</div>
        </div>
        <button className="text-[11px] font-semibold text-primary spring-tap">Try it</button>
      </div>
    </div>
  );
}