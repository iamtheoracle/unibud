import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fallbackIfEmpty } from "@/lib/mock/useMockFallback";
import { DISCOVER_MOCK } from "@/lib/social/discoverMock";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useUnibudContext } from "@/lib/UnibudContext";
import OsTopBar from "@/components/layout/OsTopBar";

const TABS = [
  { key: "campus", label: "Campus" },
  { key: "quad", label: "Quad" },
  { key: "connect", label: "Connect" },
];

const STORIES = [
  { label: "Add Story", add: true, initial: "+" },
  { label: "Dept. News", initial: "D" },
  { label: "Faculty", initial: "F" },
  { label: "SUG", initial: "S" },
  { label: "Lab Update", initial: "L" },
];

const QUICK_TOOLS = [
  { icon: "📅", label: "Timetable", to: "/timetable" },
  { icon: "📝", label: "Assignments", to: "/assignments" },
  { icon: "📚", label: "Courses", to: "/courses" },
  { icon: "📖", label: "Library", to: "/knowledge" },
  { icon: "🔬", label: "Research", to: "/research" },
  { icon: "📊", label: "Results", to: "/academics/results" },
  { icon: "🎯", label: "Past Qs", to: "/exams" },
  { icon: "📋", label: "Attendance", to: "/attendance" },
];

const TRENDING = [
  { tag: "#ExamPrep", count: "3.1k" },
  { tag: "#AIResearch", count: "2.4k" },
  { tag: "#Scholarships", count: "1.8k" },
  { tag: "#Hackathon", count: "1.2k" },
  { tag: "#NigerianEdu", count: "980" },
  { tag: "#STEM", count: "760" },
];

const NEWS = [
  { title: "Faculty Senate approves new AI curriculum", time: "2h ago", source: "Institution" },
  { title: "SUG announces student town hall", time: "5h ago", source: "SUG" },
  { title: "Nigerian government increases research grants", time: "1d ago", source: "National" },
];

const ADAPTIVE = [
  { emoji: "📅", label: "Timetable", to: "/timetable" },
  { emoji: "📝", label: "Assignments", to: "/assignments" },
  { emoji: "📊", label: "Exams", to: "/exams" },
  { emoji: "📈", label: "Results", to: "/academics/results" },
  { emoji: "🔬", label: "Research", to: "/research" },
  { emoji: "🎓", label: "Scholarships", to: "/scholarships" },
  { emoji: "📚", label: "Library", to: "/knowledge" },
];

/**
 * CampusHub — the campus social feed. Greeting top bar, content nav
 * (Campus / Quad / Connect), stories, SUG card, QuadPost feed, quick tools,
 * trending, university news, academic communities, and an adaptive bar.
 */
export default function CampusHub() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const ctx = useUnibudContext();
  const [view, setView] = useState("campus");

  const enabled = !isDemoMode;
  const useData = (key, fn, mock) =>
    fallbackIfEmpty(useQuery({ queryKey: [key], queryFn: fn, enabled }).data, mock);

  const quadPosts = useData("campusQuad", () => base44.entities.QuadPost.list("-created_date", 5), DISCOVER_MOCK.quadPosts);
  const communities = useData("campusCommunities", () => base44.entities.Community.list("-created_date", 4), DISCOVER_MOCK.communities);

  const onTab = (t) => {
    if (t.key === "quad") navigate("/quad");
    else if (t.key === "connect") navigate("/connect");
    else setView(t.key);
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-4 pt-3 pb-28 safe-area-pt">
      <OsTopBar user={ctx?.user} />

      {/* Content nav */}
      <div className="flex gap-5 px-1 pb-3 border-b border-border/20">
        {TABS.map((t) => {
          const on = view === t.key;
          return (
            <button key={t.key} onClick={() => onTab(t)} className={`relative text-[15px] font-semibold spring-tap pb-1 ${on ? "text-foreground" : "text-muted-foreground/50"}`}>
              {t.label}
              {on && <span className="absolute -bottom-[9px] left-0 w-full h-[2.5px] rounded-full" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }} />}
            </button>
          );
        })}
      </div>

      <div className="pt-4 flex flex-col gap-4">
        {/* Stories */}
        <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1">
          {STORIES.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-16">
              <div className="w-[62px] h-[62px] rounded-full p-[2.5px]" style={{ background: s.add ? "transparent" : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
                <div
                  className={`w-full h-full rounded-full grid place-items-center ${s.add ? "" : "bg-background"}`}
                  style={s.add ? { background: "rgba(255,255,255,0.05)", border: "1.5px dashed rgba(255,255,255,0.15)" } : {}}
                >
                  <span className={s.add ? "text-[20px] text-muted-foreground/50" : "text-[22px] font-semibold text-foreground"}>{s.initial}</span>
                </div>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground text-center truncate w-16">{s.label}</span>
            </div>
          ))}
        </div>

        {/* SUG / Department */}
        <div className="crystal-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-bold text-foreground">👥 Software Engineering · SUG</h3>
            <button onClick={() => navigate("/communities")} className="text-[12px] font-semibold text-muted-foreground hover:text-foreground">View</button>
          </div>
          <div className="flex gap-4 text-[12px] text-muted-foreground">
            <span>1.2k members</span>
            <span>📢 8 announcements</span>
            <span>💬 47 discussing</span>
          </div>
        </div>

        {/* Feed posts */}
        {quadPosts.slice(0, 2).map((post, i) => {
          const author = post.author_name || post.created_by_name || "Campus";
          const media = post.media_url || (Array.isArray(post.media_urls) ? post.media_urls[0] : null);
          return (
            <div key={post.id || i} className="crystal-card p-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-9 h-9 rounded-full grid place-items-center font-semibold text-[13px] text-primary-foreground flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
                  {author.charAt(0)}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground">{author}</p>
                  <p className="text-[11px] text-muted-foreground">@{post.author_handle || "campus"} · 3h ago</p>
                </div>
              </div>
              <p className="text-[14px] leading-[1.5] text-foreground/85 mb-2.5">{post.content || post.body || "📢 New update posted."}</p>
              {media && (
                <div className="rounded-2xl overflow-hidden mb-3 aspect-video bg-muted/20 border border-border/20">
                  <img src={media} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-4 pt-2 border-t border-border/20 text-[12px] font-medium text-muted-foreground">
                <span className="flex items-center gap-1">❤️ {post.like_count ?? 34}</span>
                <span className="flex items-center gap-1">💬 {post.comment_count ?? 12}</span>
                <span className="flex items-center gap-1">↗️ {post.share_count ?? 5}</span>
              </div>
            </div>
          );
        })}

        {/* Quick tools */}
        <div className="crystal-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-foreground">🛠 Quick Tools</h3>
            <button onClick={() => navigate("/academics")} className="text-[12px] font-semibold text-muted-foreground hover:text-foreground">All</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_TOOLS.map((t) => (
              <button key={t.label} onClick={() => navigate(t.to)} className="flex flex-col items-center gap-1 py-2 rounded-2xl bg-muted/20 border border-border/20 spring-tap">
                <span className="text-[20px]">{t.icon}</span>
                <span className="text-[9px] font-medium text-muted-foreground text-center">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className="crystal-card p-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[15px] font-bold text-foreground">🔥 Trending in Campus</h3>
            <button onClick={() => navigate("/discover")} className="text-[12px] font-semibold text-muted-foreground hover:text-foreground">More</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map((t) => (
              <span key={t.tag} className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-foreground/70" style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.12)" }}>
                {t.tag} <span className="text-muted-foreground/60 font-normal">{t.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* University news */}
        <div className="crystal-card p-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[15px] font-bold text-foreground">📰 University News</h3>
            <button onClick={() => navigate("/notifications")} className="text-[12px] font-semibold text-muted-foreground hover:text-foreground">See all</button>
          </div>
          <div className="flex flex-col gap-2.5">
            {NEWS.map((n, i) => (
              <div key={i}>
                <p className="font-semibold text-foreground text-[13px]">{n.title}</p>
                <p className="text-[11px] text-muted-foreground">{n.time} · {n.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Academic communities */}
        <div className="crystal-card p-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[15px] font-bold text-foreground">🧑‍🏫 Academic Communities</h3>
            <button onClick={() => navigate("/communities")} className="text-[12px] font-semibold text-muted-foreground hover:text-foreground">Explore</button>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
            {communities.slice(0, 3).map((c, i) => (
              <button key={c.id || i} onClick={() => navigate(c.id ? `/community/${c.id}` : "/communities")} className="flex-shrink-0 w-[140px] crystal-card p-3 text-left spring-tap">
                <p className="text-[14px] font-bold text-foreground">{c.name || c.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.category || "Community"} · {c.member_count || 0} members</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1.5">🔥 active</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Adaptive bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pt-4 pb-2">
        {ADAPTIVE.map((q, i) => (
          <button key={q.label} onClick={() => navigate(q.to)} className={`px-4 py-1.5 rounded-full glass border border-border/40 text-[12px] font-medium whitespace-nowrap spring-tap ${i === 0 ? "text-foreground bg-muted/40" : "text-muted-foreground"}`}>
            <span className="mr-1">{q.emoji}</span>{q.label}
          </button>
        ))}
      </div>
    </div>
  );
}