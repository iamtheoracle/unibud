import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BarChart3, MessageSquare, Video, Mic, ShoppingBag, Heart, Eye,
  MessageCircle, Share2, Users, TrendingUp, Crown,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];
const num = (n) => (n || 0).toLocaleString();

/**
 * ContentIntelligence — Oracle's platform-wide content & engagement analytics.
 * Aggregates posts, shorts, podcast episodes and marketplace listings into
 * real engagement KPIs, content distribution, and top-performing items, so
 * platform admins can see what the community is making and how it performs.
 */
export default function ContentIntelligence({ module }) {
  const { data: posts } = useQuery({ queryKey: ["oraclePosts"], queryFn: () => base44.entities.QuadPost.list("-created_date", 200) });
  const { data: shorts } = useQuery({ queryKey: ["oracleShorts"], queryFn: () => base44.entities.ShortVideo.list("-created_date", 200) });
  const { data: episodes } = useQuery({ queryKey: ["oracleEpisodes"], queryFn: () => base44.entities.PodcastEpisode.list("-created_date", 200) });
  const { data: podcasts } = useQuery({ queryKey: ["oraclePodcasts"], queryFn: () => base44.entities.Podcast.list("-created_date", 200) });
  const { data: listings } = useQuery({ queryKey: ["oracleListings"], queryFn: () => base44.entities.MarketplaceListing.list("-created_date", 200) });

  const p = posts || [], s = shorts || [], e = episodes || [], pc = podcasts || [], l = listings || [];
  const loading = posts === undefined && shorts === undefined && episodes === undefined && listings === undefined && podcasts === undefined;

  const stats = useMemo(() => {
    const likes = [...p, ...s].reduce((a, x) => a + (x.likes_count || 0), 0);
    const comments = [...p, ...s].reduce((a, x) => a + (x.comments_count || 0), 0);
    const shares = [...p, ...s].reduce((a, x) => a + (x.shares_count || 0), 0);
    const views = s.reduce((a, x) => a + (x.views_count || 0), 0);
    const creators = new Set([...p, ...s, ...e].map((x) => x.created_by_id).filter(Boolean));
    return { likes, comments, shares, views, creators: creators.size, total: p.length + s.length + e.length + l.length };
  }, [p, s, e, l]);

  const dist = [
    { label: "Posts", value: p.length, color: "bg-primary", icon: MessageSquare },
    { label: "Shorts", value: s.length, color: "bg-accent", icon: Video },
    { label: "Episodes", value: e.length, color: "bg-success", icon: Mic },
    { label: "Listings", value: l.length, color: "bg-warning", icon: ShoppingBag },
  ];
  const maxDist = Math.max(1, ...dist.map((d) => d.value));

  const topPosts = useMemo(() => [...p].sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0)).slice(0, 5), [p]);
  const topShorts = useMemo(() => [...s].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5), [s]);

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-[20px] glass-card shimmer" />)}</div>;

  const empty = stats.total === 0;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading font-extrabold text-[20px] text-foreground flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> {module?.label || "Content Intelligence"}</h1>
        <p className="text-[12px] text-muted-foreground mt-1">{module?.desc || "Platform-wide content & engagement analytics."}</p>
      </header>

      {empty ? (
        <div className="glass-card p-8 text-center">
          <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-[13px] font-semibold text-foreground">No content yet</p>
          <p className="text-[12px] text-muted-foreground mt-1 max-w-[280px] mx-auto">Once students and creators start posting, shorts, and podcasting, live engagement metrics will appear here.</p>
        </div>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Kpi icon={BarChart3} value={num(stats.total)} label="Total content" color="text-primary" />
            <Kpi icon={Users} value={num(stats.creators)} label="Active creators" color="text-accent" />
            <Kpi icon={Eye} value={num(stats.views)} label="Shorts views" color="text-info" />
            <Kpi icon={Heart} value={num(stats.likes)} label="Reactions" color="text-error" />
          </div>

          {/* Content distribution */}
          <section className="glass-card p-4">
            <p className="text-[12px] font-semibold text-foreground mb-3">Content distribution</p>
            <div className="space-y-2.5">
              {dist.map((d, i) => (
                <div key={d.label} className="flex items-center gap-3">
                  <div className="w-20 flex items-center gap-1.5 shrink-0">
                    <d.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-medium text-muted-foreground">{d.label}</span>
                  </div>
                  <div className="flex-1 h-2.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(d.value / maxDist) * 100}%` }} transition={{ delay: i * 0.06, duration: 0.6, ease: EASE }} className={`h-full rounded-full ${d.color}`} />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground tabular-nums w-8 text-right">{d.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Engagement breakdown */}
          <section className="grid grid-cols-3 gap-2.5">
            <Kpi icon={MessageCircle} value={num(stats.comments)} label="Comments" color="text-accent" small />
            <Kpi icon={Share2} value={num(stats.shares)} label="Shares" color="text-success" small />
            <Kpi icon={Mic} value={num(pc.length)} label="Podcast shows" color="text-success" small />
          </section>

          {/* Top posts */}
          {topPosts.length > 0 && (
            <section className="glass-card p-4">
              <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5 mb-3"><Crown className="w-3.5 h-3.5 text-gold" /> Top posts by reactions</p>
              <div className="space-y-2">
                {topPosts.map((post, i) => (
                  <div key={post.id} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                    <p className="text-[12px] text-foreground flex-1 min-w-0 truncate">{(post.content || "").slice(0, 70) || "Untitled"}</p>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline truncate max-w-[100px]">{post.author_name}</span>
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-error shrink-0"><Heart className="w-2.5 h-2.5" /> {num(post.likes_count)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top shorts */}
          {topShorts.length > 0 && (
            <section className="glass-card p-4">
              <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5 mb-3"><TrendingUp className="w-3.5 h-3.5 text-primary" /> Top shorts by views</p>
              <div className="space-y-2">
                {topShorts.map((sv, i) => (
                  <div key={sv.id} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground w-4">{i + 1}</span>
                    <p className="text-[12px] text-foreground flex-1 min-w-0 truncate">{sv.title || "Untitled"}</p>
                    <span className="text-[10px] text-muted-foreground hidden sm:inline truncate max-w-[100px]">{sv.author_name}</span>
                    <span className="flex items-center gap-0.5 text-[11px] font-semibold text-info shrink-0"><Eye className="w-2.5 h-2.5" /> {num(sv.views_count)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Kpi({ icon: Icon, value, label, color, small }) {
  return (
    <div className="glass-card p-3 text-center">
      <Icon className={`w-4 h-4 ${color} mx-auto`} />
      <p className={`font-heading font-extrabold tabular-nums text-foreground mt-1 ${small ? "text-[15px]" : "text-[18px]"}`}>{value}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}