import React, { useState } from "react";
import { Image as ImageIcon, Video } from "lucide-react";

const HIGHLIGHTS = [
  { label: "Projects", emoji: "🚀" },
  { label: "Campus", emoji: "🏛️" },
  { label: "Events", emoji: "🎪" },
  { label: "Hackathons", emoji: "💻" },
  { label: "Travel", emoji: "✈️" },
  { label: "Volunteer", emoji: "🤝" },
];
const PINNED = [
  { title: "Featured: AI Study Buddy", desc: "AI-powered study companion" },
  { title: "Hackathon Win: UNILAG Code Fest", desc: "First place, AI category" },
];
const POSTS = [
  { id: "p1", type: "image" },
  { id: "p2", type: "video" },
  { id: "p3", type: "image" },
  { id: "p4", type: "text", content: "Just finished my first research paper!" },
  { id: "p5", type: "image" },
  { id: "p6", type: "video" },
];
const TABS = ["Posts", "Media", "Videos"];

function SectionLabel({ children }) {
  return <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2">{children}</div>;
}

/** MeSocial — About, highlights, pinned, and a posts/media/videos grid. */
export default function MeSocial({ bio }) {
  const [tab, setTab] = useState("Posts");
  const filtered = POSTS.filter((p) => {
    if (tab === "Media") return p.type === "image";
    if (tab === "Videos") return p.type === "video";
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <SectionLabel>About</SectionLabel>
        <p className="text-[13px] text-muted-foreground whitespace-pre-line leading-relaxed">{bio}</p>
      </div>

      <div>
        <SectionLabel>Highlights</SectionLabel>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} className="flex-shrink-0 flex flex-col items-center gap-1 w-16">
              <div className="w-14 h-14 rounded-full grid place-items-center text-[22px] glass border border-border/40">{h.emoji}</div>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">{h.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Pinned</SectionLabel>
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {PINNED.map((p) => (
            <div key={p.title} className="flex-shrink-0 w-40 p-3 rounded-2xl glass border border-border/40">
              <div className="text-[12px] font-semibold text-foreground leading-tight">{p.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{p.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex gap-4 border-b border-border/20 pb-2 mb-3">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`text-[13px] font-semibold spring-tap ${tab === t ? "text-foreground" : "text-muted-foreground/50"}`}>{t}</button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {filtered.map((p) => (
            <div key={p.id} className="aspect-square rounded-xl glass border border-border/30 grid place-items-center p-2">
              {p.type === "image" && <ImageIcon className="w-5 h-5 text-muted-foreground/60" />}
              {p.type === "video" && <Video className="w-5 h-5 text-muted-foreground/60" />}
              {p.type === "text" && <p className="text-[10px] text-muted-foreground text-center leading-tight">{p.content}</p>}
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-3 text-[12px] text-muted-foreground/60 py-6 text-center">Nothing here yet.</p>}
        </div>
      </div>
    </div>
  );
}