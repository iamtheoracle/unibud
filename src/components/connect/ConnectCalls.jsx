import React from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Video, Users, Calendar } from "lucide-react";

const MOCK_CALLS = [
  { type: "voice", name: "Dr. Bello", avatar: "D", time: "2:30 PM", missed: false },
  { type: "video", name: "Zara Okonkwo", avatar: "Z", time: "11:45 AM", missed: false },
  { type: "group", name: "SUG Meeting", avatar: "SUG", time: "Yesterday", missed: true },
  { type: "voice", name: "Kunle Adeyemi", avatar: "K", time: "Yesterday", missed: false },
];

const QUICK = [
  { icon: Phone, label: "Start Call", to: "/messages" },
  { icon: Video, label: "Video Call", to: "/messages" },
  { icon: Users, label: "Group Call", to: "/study-groups" },
];

const avatarBg = () => ({ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" });

export default function ConnectCalls() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2.5">
        {QUICK.map((q) => (
          <button key={q.label} onClick={() => navigate(q.to)} className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl glass border border-border/40 spring-tap">
            <q.icon className="w-5 h-5 text-foreground" />
            <span className="text-[10px] text-muted-foreground">{q.label}</span>
          </button>
        ))}
      </div>

      <div className="glass-card p-1">
        {MOCK_CALLS.map((call, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 px-2 border-b border-border/20 last:border-0">
            <div className="w-10 h-10 rounded-full grid place-items-center text-[12px] font-bold text-primary-foreground flex-shrink-0" style={avatarBg()}>{call.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[13px] text-foreground truncate">{call.name}</div>
              <div className="text-[11px] text-muted-foreground/70">{call.time} · {call.type}</div>
            </div>
            {call.missed && <span className="text-[10px] font-semibold text-destructive">Missed</span>}
            <button onClick={() => navigate("/messages")} className="w-9 h-9 rounded-full glass grid place-items-center spring-tap">
              {call.type === "video" ? <Video className="w-4 h-4 text-foreground" /> : <Phone className="w-4 h-4 text-foreground" />}
            </button>
          </div>
        ))}
      </div>

      <div className="glass-card p-3.5">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-[12px] font-semibold text-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Scheduled Meetings</span>
          <button onClick={() => navigate("/calendar")} className="text-[11px] text-muted-foreground/70 spring-tap">View all</button>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => navigate("/office-hours")} className="flex justify-between items-center text-[12px] text-muted-foreground spring-tap">
            <span className="text-left">Office Hours — Dr. Bello</span>
            <span className="text-muted-foreground/70">Tomorrow 10:00 AM</span>
          </button>
          <button onClick={() => navigate("/study-groups")} className="flex justify-between items-center text-[12px] text-muted-foreground spring-tap">
            <span className="text-left">Study Group — CSC401</span>
            <span className="text-muted-foreground/70">Fri 4:00 PM</span>
          </button>
        </div>
      </div>
    </div>
  );
}