import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import { Search, Check, Pin } from "lucide-react";

const DEMO_CONVERSATIONS = [
  { id: "c1", type: "direct", name: "Dr. Bello", avatar: "D", last_message: "Assignment 2 deadline extended to next Friday.", time: "2 min", unread: 3, online: true, verified: true },
  { id: "c2", type: "group", name: "Software Engineering SUG", avatar: "SE", last_message: "Town hall meeting tomorrow at 2 PM.", time: "1h", unread: 12, online: false, members: 48 },
  { id: "c3", type: "direct", name: "Zara Okonkwo", avatar: "Z", last_message: "Let's finalize the workshop slides.", time: "15 min", unread: 0, online: true, verified: false },
  { id: "c4", type: "group", name: "CSC401 — AI", avatar: "AI", last_message: "New lecture materials posted.", time: "3h", unread: 0, online: false, members: 124 },
  { id: "c5", type: "direct", name: "Kunle Adeyemi", avatar: "K", last_message: "Are you coming to the hackathon?", time: "2h", unread: 0, online: false },
  { id: "c6", type: "group", name: "Research Lab: NLP", avatar: "R", last_message: "Paper draft feedback needed.", time: "5h", unread: 0, online: false, members: 12 },
];

const DEMO_GROUPS = [
  { id: "g1", name: "Data Science Study Group", members_count: 24, online: 8 },
  { id: "g2", name: "AI Club Committee", members_count: 12, online: 5 },
  { id: "g3", name: "Hostel 5 Residents", members_count: 18, online: 0 },
  { id: "g4", name: "Hackathon Team Alpha", members_count: 6, online: 4 },
];

const avatarBg = () => ({ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" });

function ConversationRow({ conv, onClick }) {
  const isDirect = conv.type === "direct";
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-2.5 px-2 hover:bg-muted/30 rounded-xl transition spring-tap text-left">
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-full grid place-items-center text-[13px] font-bold text-primary-foreground" style={avatarBg()}>{conv.avatar}</div>
        {conv.online && <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-background" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-[13px] text-foreground truncate">{conv.name}</span>
          {conv.verified && <Check className="w-3 h-3 text-primary flex-shrink-0" />}
          {!isDirect && conv.members && <span className="text-[11px] text-muted-foreground/70">· {conv.members}</span>}
        </div>
        <div className="text-[12px] text-muted-foreground truncate">{conv.last_message}</div>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-[10px] text-muted-foreground/70">{conv.time}</span>
        {conv.unread > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">{conv.unread}</span>
        )}
      </div>
    </button>
  );
}

export default function ConnectMessages() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const [search, setSearch] = useState("");

  const { data: groups } = useQuery({
    queryKey: ["connectGroups"],
    queryFn: () => base44.entities.StudyGroup.filter({ status: "active" }, "-members_count", 10),
    enabled: !isDemoMode,
  });
  const groupList = isDemoMode ? DEMO_GROUPS : (groups || []);

  const filtered = DEMO_CONVERSATIONS.filter((c) =>
    !search.trim() || c.name.toLowerCase().includes(search.toLowerCase()) || c.last_message.toLowerCase().includes(search.toLowerCase())
  );
  const pinned = filtered.slice(0, 2);
  const recent = filtered.slice(2);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full glass border border-border/40">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search messages..." className="flex-1 bg-transparent border-none outline-none text-[13px] text-foreground placeholder:text-muted-foreground/50" />
      </div>

      {pinned.length > 0 && (
        <div>
          <div className="flex justify-between items-center px-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 flex items-center gap-1"><Pin className="w-3 h-3" /> Pinned</span>
            <button className="text-[11px] text-muted-foreground/70 spring-tap">See all</button>
          </div>
          <div className="glass-card p-1">{pinned.map((c) => <ConversationRow key={c.id} conv={c} onClick={() => navigate("/messages")} />)}</div>
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <div className="flex justify-between items-center px-1 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">Recent</span>
            <button className="text-[11px] text-muted-foreground/70 spring-tap">Mark all read</button>
          </div>
          <div className="glass-card p-1">{recent.map((c) => <ConversationRow key={c.id} conv={c} onClick={() => navigate("/messages")} />)}</div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center px-1 mb-2">
          <span className="text-[12px] font-semibold text-foreground">Groups</span>
          <button onClick={() => navigate("/study-groups")} className="text-[11px] text-muted-foreground/70 spring-tap">Create</button>
        </div>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {groupList.map((g) => (
            <button key={g.id} onClick={() => navigate("/study-groups")} className="flex-shrink-0 w-40 p-3 rounded-2xl glass border border-border/40 text-left spring-tap">
              <div className="font-medium text-[12px] text-foreground truncate">{g.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{g.members_count || 0} members · {g.online || 0} online</div>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-3.5 flex items-center gap-3 glass border border-primary/20">
        <div className="w-8 h-8 rounded-full grid place-items-center text-[14px] text-primary-foreground flex-shrink-0" style={avatarBg()}>✦</div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">Bud suggests</div>
          <div className="text-[12px] text-foreground leading-snug">Reply to Dr. Bello about the assignment deadline.</div>
        </div>
        <button onClick={() => navigate("/messages")} className="px-3 py-1.5 rounded-full glass text-[11px] font-semibold text-foreground spring-tap whitespace-nowrap">Reply</button>
      </div>
    </div>
  );
}