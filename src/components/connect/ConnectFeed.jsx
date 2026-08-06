import React from "react";
import { useNavigate } from "react-router-dom";
import { Pin, BookOpen, PartyPopper, Users, Handshake, Sparkles, Link2 } from "lucide-react";
import ConnectCard from "@/components/connect/ConnectCard";
import ConversationItem from "@/components/connect/ConversationItem";

const PINNED = [
  { initial: "D", gradient: "purple", name: "Dr. Bello", badge: "✓ Lecturer", lastMessage: "📢 Assignment 2 deadline extended", time: "2 min", unread: 3, online: true },
  { initial: "Z", gradient: "pink", name: "Zara Okonkwo", badge: "🤖 AI Club", lastMessage: "Let's finalize the workshop slides", time: "15 min" },
];

const ACADEMIC = [
  { initial: "S", gradient: "green", name: "Software Engineering SUG", lastMessage: "📢 Town hall meeting tomorrow", time: "1h", unread: 12 },
  { initial: "C", gradient: "blue", name: "CSC401 - AI", lastMessage: "New lecture materials posted", time: "3h" },
  { initial: "R", gradient: "violet", name: "Research Lab: NLP", badge: "🔬", lastMessage: "Paper draft feedback needed", time: "5h" },
];

const SOCIAL = [
  { initial: "K", gradient: "amber", name: "Kunle Adeyemi", lastMessage: "Are you coming to the hackathon?", time: "2h" },
  { initial: "T", gradient: "pink", name: "Timi George", lastMessage: "Check out this new podcast episode", time: "4h", unread: 1 },
];

const COLLAB = [
  { emoji: "📝", label: "Shared Notes", to: "/notes" },
  { emoji: "📎", label: "Files", to: "/knowledge" },
  { emoji: "📋", label: "Assignments", to: "/assignments" },
  { emoji: "📊", label: "Project Boards", to: "/collaboration" },
  { emoji: "📅", label: "Meeting Notes", to: "/notes" },
  { emoji: "📝", label: "Polls", to: "/communities" },
];

const AI_BADGES = ["Summarize", "Translate", "Schedule", "Suggest Reply", "Meeting Notes", "Action Items", "Search"];

const SERVICES = ["Google Meet", "Zoom", "Teams", "Google Drive", "OneDrive", "GitHub", "Calendar", "Dropbox"];

/**
 * ConnectFeed — the prototype's conversation hub cards: pinned, academic,
 * social, groups (wired to real StudyGroup data), collaboration, Bud AI,
 * and connected services.
 */
export default function ConnectFeed({ groups = [] }) {
  const navigate = useNavigate();
  const goMsg = () => navigate("/messages");

  return (
    <div className="flex flex-col gap-3.5">
      {/* Pinned */}
      <ConnectCard icon={<Pin className="w-4 h-4 text-primary" />} title="Pinned" action="Edit" onAction={goMsg}>
        {PINNED.map((c) => <ConversationItem key={c.name} {...c} onClick={goMsg} />)}
      </ConnectCard>

      {/* Academic */}
      <ConnectCard icon={<BookOpen className="w-4 h-4 text-primary" />} title="Academic" action="See all" onAction={goMsg}>
        {ACADEMIC.map((c) => <ConversationItem key={c.name} {...c} onClick={goMsg} />)}
      </ConnectCard>

      {/* Social */}
      <ConnectCard icon={<PartyPopper className="w-4 h-4 text-primary" />} title="Social" action="See all" onAction={goMsg}>
        {SOCIAL.map((c) => <ConversationItem key={c.name} {...c} onClick={goMsg} />)}
      </ConnectCard>

      {/* Groups */}
      <ConnectCard icon={<Users className="w-4 h-4 text-primary" />} title="Groups" action="Create" onAction={() => navigate("/study-groups")}>
        {groups.map((g, i) => (
          <button
            key={g.id || i}
            onClick={() => navigate(`/study-groups/${g.id || ""}`)}
            className="flex items-center gap-3 py-2 border-b border-border/20 last:border-0 w-full text-left spring-tap"
          >
            <div className="w-10 h-10 rounded-xl bg-muted/40 grid place-items-center text-[18px] flex-shrink-0">
              {g.emoji || "👥"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-foreground truncate">{g.name}</p>
              <p className="text-[11px] text-muted-foreground">{g.members_count || 0} members{g.online ? ` · ${g.online} online` : ""}</p>
            </div>
            {g.meta && <span className="text-[11px] text-muted-foreground/60 flex-shrink-0">{g.meta}</span>}
          </button>
        ))}
      </ConnectCard>

      {/* Collaboration */}
      <ConnectCard icon={<Handshake className="w-4 h-4 text-primary" />} title="Collaboration" action="More" onAction={() => navigate("/collaboration")}>
        <div className="grid grid-cols-3 gap-2">
          {COLLAB.map((c) => (
            <button
              key={c.label}
              onClick={() => navigate(c.to)}
              className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-muted/30 border border-border/30 spring-tap"
            >
              <span className="text-[22px] leading-none">{c.emoji}</span>
              <span className="text-[9px] font-medium text-muted-foreground text-center leading-tight">{c.label}</span>
            </button>
          ))}
        </div>
      </ConnectCard>

      {/* Bud AI Assistance */}
      <ConnectCard icon={<Sparkles className="w-4 h-4 text-primary" />} title="Bud AI Assistance" action="Chat" onAction={() => navigate("/bud")}>
        <div className="flex flex-wrap gap-1.5">
          {AI_BADGES.map((b) => (
            <button
              key={b}
              onClick={() => navigate("/bud")}
              className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-semibold text-primary spring-tap"
            >
              {b}
            </button>
          ))}
        </div>
      </ConnectCard>

      {/* Connected Services */}
      <ConnectCard icon={<Link2 className="w-4 h-4 text-primary" />} title="Connected Services" action="Manage" onAction={() => navigate("/me")}>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <span key={s} className="px-3.5 py-1 rounded-full bg-muted/30 border border-border/30 text-[11px] font-medium text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      </ConnectCard>
    </div>
  );
}