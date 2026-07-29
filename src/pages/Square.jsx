import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { fallbackIfEmpty } from "@/lib/mock/useMockFallback";
import { DISCOVER_MOCK } from "@/lib/social/discoverMock";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useUnibudContext } from "@/lib/UnibudContext";
import OsTopBar from "@/components/layout/OsTopBar";
import { useSpark } from "@/hooks/useSpark";

const TABS = [
  { key: "square", label: "Square" },
  { key: "quad", label: "Quad" },
  { key: "connect", label: "Connect" },
];

const STORIES = [
  { label: "Add Story", add: true, initial: "+" },
  { label: "AI Club", initial: "A", grad: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" },
  { label: "Zara", initial: "Z", grad: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--muted-foreground)))" },
  { label: "Kunle", initial: "K", grad: "linear-gradient(135deg, hsl(var(--muted-foreground)), hsl(var(--accent)))" },
  { label: "Timi", initial: "T", grad: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))" },
  { label: "STEM Hub", initial: "S", grad: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--muted-foreground)))" },
];

const CREATORS = [
  { initial: "P", name: "Podcast Hub", desc: "1.2k listeners", to: "/podcasts" },
  { initial: "V", name: "Vibes Studio", desc: "846 followers", to: "/shorts" },
  { initial: "M", name: "Mind & Matter", desc: "2.1k subscribers", to: "/podcasts" },
  { initial: "G", name: "Gaming Society", desc: "3.4k members", to: "/communities" },
];

const TRENDING = [
  { tag: "#UNIBUD", count: "2.4k" },
  { tag: "#AIForGood", count: "1.8k" },
  { tag: "#ExamPrep", count: "1.2k" },
  { tag: "#StartupWeek", count: "980" },
  { tag: "#CampusLife", count: "760" },
  { tag: "#Research", count: "540" },
  { tag: "#Scholarships", count: "420" },
];

const ADAPTIVE = [
  { emoji: "📰", label: "News", to: "/notifications" },
  { emoji: "💼", label: "Jobs", to: "/opportunities" },
  { emoji: "🎓", label: "Scholarships", to: "/scholarships" },
  { emoji: "🏠", label: "Housing", to: "/marketplace" },
  { emoji: "🛒", label: "Marketplace", to: "/marketplace" },
  { emoji: "💳", label: "Wallet", to: "/wallet" },
  { emoji: "🚌", label: "Transport", to: "/campus" },
  { emoji: "❤️", label: "Health", to: "/student-support" },
];

const CLUB_TAGS = ["#MachineLearning", "#NLP", "#AIEthics"];

const MOCK_LIVE = [
  { title: "AI Club Talk", viewers: "245", host: "AI Club" },
  { title: "Study With Me", viewers: "89", host: "Timi" },
  { title: "Podcast: Tech", viewers: "134", host: "Podcast Hub" },
];

function miniGrad(n) {
  const grads = [
    "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
    "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--muted-foreground)))",
    "linear-gradient(135deg, hsl(var(--muted-foreground)), hsl(var(--accent)))",
    "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--primary)))",
  ];
  return grads[n % grads.length];
}

/**
 * Square — the social square. Greeting top bar, content nav
 * (Square / Quad / Connect), stories, a featured club card, feed posts,
 * campus creators, trending hashtags, a community card, and an adaptive bar.
 */
export default function Square() {
  const navigate = useNavigate();
  const { isDemoMode } = useDemoMode();
  const ctx = useUnibudContext();
  const [view, setView] = useState("square");

  const enabled = !isDemoMode;
  const useData = (key, fn, mock) =>
    fallbackIfEmpty(useQuery({ queryKey: [key], queryFn: fn, enabled }).data, mock);

  const quadPosts = useData("squareQuad", () => base44.entities.QuadPost.list("-created_date", 5), DISCOVER_MOCK.quadPosts);
  const communities = useData("squareCommunities", () => base44.entities.Community.list("-created_date", 6), DISCOVER_MOCK.communities);

  const featuredClub = communities[0] || { name: "Artificial Intelligence", id: null };
  const photographyClub = communities[1] || { name: "Photography Club", id: null };

  const liveSessions = useData("squareLive", () => base44.entities.LiveClass.filter({ status: "live" }, "-created_date", 5), MOCK_LIVE);

  const spark = useSpark();
  const topRecId = useMemo(() => {
    try {
      const recs = spark.recommendations.recommend({
        candidateItems: quadPosts.map((p) => ({ id: p.id || "p", tags: ["social", p.category].filter(Boolean) })),
        basedOnTags: ["social", "community"],
        limit: 1,
      });
      return recs[0]?.itemId;
    } catch { return null; }
  }, [spark, quadPosts]);

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
              <div className="w-[62px] h-[62px] rounded-full p-[2.5px]" style={{ background: s.add ? "transparent" : "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--muted-foreground)))" }}>
                <div
                  className={`w-full h-full rounded-full grid place-items-center ${s.add ? "" : "bg-background"}`}
                  style={s.add ? { background: "rgba(255,255,255,0.05)", border: "1.5px dashed rgba(255,255,255,0.15)" } : s.grad ? { background: s.grad } : {}}
                >
                  <span className={s.add ? "text-[20px] text-muted-foreground/50" : "text-[22px] font-semibold text-foreground"}>{s.initial}</span>
                </div>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground text-center truncate w-16">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Featured club card */}
        <div className="crystal-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-foreground">🤖 {featuredClub.name || "AI Club"}</h3>
            <button onClick={() => navigate(featuredClub.id ? `/community/${featuredClub.id}` : "/communities")} className="text-[12px] font-semibold text-foreground spring-tap">Join →</button>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex items-center">
              {["A", "Z", "K", "T"].map((m, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background -mr-2 last:mr-0 grid place-items-center text-[10px] font-semibold text-primary-foreground" style={{ background: miniGrad(i) }}>{m}</div>
              ))}
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-bold text-foreground">{featuredClub.name || "Artificial Intelligence"}</p>
              <p className="text-[12px] text-muted-foreground">{featuredClub.member_count ? `${featuredClub.member_count} members` : "1.2k members"} · 48 online</p>
              <div className="flex gap-3 mt-1 text-[11px] text-muted-foreground">
                <span>🔥 12 new posts</span>
                <span>💬 34 discussing</span>
              </div>
            </div>
            <button onClick={() => navigate(featuredClub.id ? `/community/${featuredClub.id}` : "/communities")} className="px-4 py-1.5 rounded-full text-[12px] font-bold text-primary-foreground spring-tap" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>Join</button>
          </div>
          <div className="flex gap-1.5 flex-wrap mt-3">
            {CLUB_TAGS.map((tag) => (
              <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-semibold text-foreground/70" style={{ background: "hsl(var(--primary) / 0.06)", border: "1px solid hsl(var(--primary) / 0.08)" }}>{tag}</span>
            ))}
          </div>
        </div>

        {/* Feed posts */}
        {quadPosts.slice(0, 2).map((post, i) => {
          const author = post.author_name || post.created_by_name || "Zara Okonkwo";
          const media = post.media_url || (Array.isArray(post.media_urls) ? post.media_urls[0] : null);
          const liked = i === 0;
          return (
            <div key={post.id || i} className="crystal-card p-4">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="w-9 h-9 rounded-full grid place-items-center font-semibold text-[13px] text-primary-foreground flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--muted-foreground)))" }}>
                  {author.charAt(0)}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-foreground">{author}</p>
                  <p className="text-[11px] text-muted-foreground">@{(post.author_handle || "square").toLowerCase()} · 2h ago</p>
                </div>
              </div>
              {post.id === topRecId && (
                <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full text-[10px] font-semibold text-foreground" style={{ background: "hsl(var(--primary) / 0.10)", border: "1px solid hsl(var(--primary) / 0.15)" }}>
                  <span>✦</span> Bud recommends
                </div>
              )}
              <p className="text-[14px] leading-[1.5] text-foreground/85 mb-2.5">{post.content || post.body || "📢 New update from the community."}</p>
              {media ? (
                <div className="rounded-2xl overflow-hidden mb-3 aspect-video bg-muted/20 border border-border/20">
                  <img src={media} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="rounded-2xl mb-3 aspect-video flex items-center justify-center border border-border/20 text-[12px] text-muted-foreground/30" style={{ background: "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--background)))" }}>Workshop photo · 16:9</div>
              )}
              <div className="flex gap-4 pt-2 border-t border-border/20 text-[12px] font-medium text-muted-foreground">
                <span className={liked ? "flex items-center gap-1 text-foreground" : "flex items-center gap-1"}>❤️ {post.like_count ?? 142}</span>
                <span className="flex items-center gap-1">💬 {post.comment_count ?? 28}</span>
                <span className="flex items-center gap-1">↗️ {post.share_count ?? 12}</span>
                <span className="flex items-center gap-1 ml-auto text-muted-foreground/40">📌</span>
              </div>
            </div>
          );
        })}

        {/* Campus creators */}
        <div className="crystal-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-foreground">🎙️ Campus Creators</h3>
            <button onClick={() => navigate("/podcasts")} className="text-[12px] font-semibold text-foreground hover:text-muted-foreground">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {CREATORS.map((c) => (
              <button key={c.name} onClick={() => navigate(c.to)} className="flex-shrink-0 w-[100px] text-center spring-tap">
                <div className="w-[72px] h-[72px] rounded-full mx-auto mb-1.5 grid place-items-center text-[24px] font-bold text-primary-foreground border-2 border-border/20" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>{c.initial}</div>
                <p className="text-[12px] font-semibold text-foreground">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live now */}
        <div className="crystal-card p-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[15px] font-bold text-foreground">🔴 Live Now</h3>
            <button onClick={() => navigate("/shorts")} className="text-[12px] font-semibold text-foreground hover:text-muted-foreground">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {liveSessions.slice(0, 4).map((live, i) => (
              <button key={i} onClick={() => navigate(live.id ? `/classroom/${live.id}` : "/shorts")} className="flex-shrink-0 w-[180px] crystal-card p-3 text-left spring-tap">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-destructive live-pulse" />
                  <span className="text-[13px] font-semibold text-foreground truncate">{live.title || live.name || live.course_code || "Live session"}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{live.viewers || live.participant_count || 0} watching · {live.host_name || live.host || "Campus"}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className="crystal-card p-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[15px] font-bold text-foreground">🔥 Trending on Campus</h3>
            <button onClick={() => navigate("/discover")} className="text-[12px] font-semibold text-foreground hover:text-muted-foreground">More</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING.map((t) => (
              <span key={t.tag} className="px-3.5 py-1.5 rounded-full text-[12px] font-semibold text-foreground/70" style={{ background: "hsl(var(--primary) / 0.08)", border: "1px solid hsl(var(--primary) / 0.12)" }}>
                {t.tag} <span className="text-muted-foreground/60 font-normal">{t.count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Extra community card */}
        <div className="crystal-card p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[15px] font-bold text-foreground">📸 {photographyClub.name || "Photography Club"}</h3>
            <button onClick={() => navigate(photographyClub.id ? `/community/${photographyClub.id}` : "/communities")} className="text-[12px] font-semibold text-foreground hover:text-muted-foreground">Explore</button>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <span className="text-[12px] text-muted-foreground">🎞️ 24 new photos</span>
            <span className="text-[12px] text-muted-foreground">📅 Exhibition this Fri</span>
            <span className="text-[12px] text-muted-foreground">👥 {photographyClub.member_count || 340} members</span>
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