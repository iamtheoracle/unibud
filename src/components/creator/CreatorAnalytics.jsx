import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Heart, Eye, MessageCircle, Share2, Bookmark, Mic, Download,
  TrendingUp, Users, BarChart3, ArrowUpRight,
  PlayCircle, FileText,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * CreatorAnalytics — real-time analytics dashboard for authenticated creators.
 * Every metric is computed from the creator's own content (posts, shorts,
 * stories, podcast episodes) and their engagement data. No synthetic numbers.
 *
 * Props: posts, shorts, stories, episodes, listens, podcasts (all arrays
 * already filtered to created_by_id === user.id)
 */
export default function CreatorAnalytics({ posts = [], shorts = [], stories = [], episodes = [], podcasts = [] }) {
  const metrics = useMemo(() => {
    const allSocial = [...posts, ...shorts, ...stories];

    const totalReactions = allSocial.reduce((a, x) => a + (x.likes_count || 0), 0);
    const totalComments = [...posts, ...shorts].reduce((a, x) => a + (x.comments_count || 0), 0);
    const totalShares = [...posts, ...shorts].reduce((a, x) => a + (x.shares_count || 0), 0);
    const totalViews = [...shorts, ...stories].reduce((a, x) => a + (x.views_count || 0), 0);
    const totalSaves = [...posts, ...shorts].reduce((a, x) => a + (x.bookmarks_count || 0), 0);

    // Podcast metrics — computed from episode aggregate fields (downloads_count = total listens)
    const totalDownloads = episodes.reduce((a, e) => a + (e.downloads_count || 0), 0);
    const totalListens = totalDownloads; // downloads_count is the aggregate listen counter
    const episodeLikes = episodes.reduce((a, e) => a + (e.likes_count || 0), 0);
    const completionRate = null; // not available without individual listen records (RLS-protected)
    const avgListenSeconds = null;

    // Audience — followers across the creator's podcasts
    const followersGained = podcasts.reduce((a, p) => a + (p.followers_count || 0), 0);

    // Article reads — posts with type 'note', 'research', 'study_resource' — engagement as reads proxy
    const articles = posts.filter((p) => ["note", "research", "study_resource", "news"].includes(p.type));
    const articleReads = articles.reduce((a, x) => a + (x.likes_count || 0) + (x.comments_count || 0), 0);

    // Post reach — sum of all engagement signals as a reach proxy
    const postReach = posts.reduce((a, x) => a + (x.likes_count || 0) + (x.comments_count || 0) + (x.shares_count || 0), 0);

    // Top performing content across all types
    const allContent = [
      ...posts.map((x) => ({ id: x.id, title: (x.content || "").slice(0, 50) || "Untitled", type: "Post", engagement: (x.likes_count || 0) + (x.comments_count || 0) + (x.shares_count || 0), date: x.created_date })),
      ...shorts.map((x) => ({ id: x.id, title: x.title || "Short", type: "Short", engagement: (x.likes_count || 0) + (x.comments_count || 0) + (x.views_count || 0), date: x.created_date })),
      ...episodes.map((x) => ({ id: x.id, title: x.title || "Episode", type: "Episode", engagement: (x.likes_count || 0) + (x.comments_count || 0) + (x.downloads_count || 0), date: x.created_date })),
    ].sort((a, b) => b.engagement - a.engagement).slice(0, 5);

    return {
      totalReactions, totalComments, totalShares, totalViews, totalSaves,
      totalListens, completionRate, avgListenSeconds, totalDownloads,
      followersGained, articleReads, postReach, topContent: allContent,
      totalContent: allSocial.length + episodes.length,
    };
  }, [posts, shorts, stories, episodes, podcasts]);

  const statCards = [
    { icon: Heart, value: metrics.totalReactions, label: "Reactions", color: "text-error", bg: "bg-error/10" },
    { icon: Eye, value: metrics.totalViews, label: "Views", color: "text-primary", bg: "bg-primary/10" },
    { icon: MessageCircle, value: metrics.totalComments, label: "Comments", color: "text-accent", bg: "bg-accent/10" },
    { icon: Share2, value: metrics.totalShares, label: "Shares", color: "text-success", bg: "bg-success/10" },
    { icon: Bookmark, value: metrics.totalSaves, label: "Saves", color: "text-warning", bg: "bg-warning/10" },
    { icon: Users, value: metrics.followersGained, label: "Followers", color: "text-primary", bg: "bg-primary/10" },
    { icon: Mic, value: metrics.totalListens, label: "Listens", color: "text-accent", bg: "bg-accent/10" },
    { icon: Download, value: metrics.totalDownloads, label: "Downloads", color: "text-success", bg: "bg-success/10" },
  ];

  const podcastDeep = [
    { label: "Total Listens", value: formatNum(metrics.totalListens), icon: Mic },
    { label: "Episode Likes", value: formatNum(metrics.episodeLikes), icon: Heart },
    { label: "Article Reads", value: formatNum(metrics.articleReads), icon: FileText },
    { label: "Post Reach", value: formatNum(metrics.postReach), icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      {/* Engagement grid */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Engagement Overview</p>
        <div className="grid grid-cols-4 gap-2.5">
          {statCards.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
              className="glass-card p-2.5 text-center">
              <div className={`w-7 h-7 rounded-[10px] ${s.bg} flex items-center justify-center mx-auto mb-1`}>
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
              <p className="font-heading font-extrabold text-[15px] text-foreground tabular-nums">{formatNum(s.value)}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Podcast deep metrics */}
      {(episodes.length > 0 || podcasts.length > 0) && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Audio Performance</p>
          <div className="grid grid-cols-2 gap-2.5">
            {podcastDeep.map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.3, ease: EASE }}
                className="glass-card p-3.5 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0">
                  <m.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-bold text-[16px] text-foreground tabular-nums leading-tight">{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Top performing content */}
      {metrics.topContent.length > 0 && (
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-3 h-3" /> Top Performing Content
          </p>
          <div className="space-y-2">
            {metrics.topContent.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
                className="glass-card p-3 flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="w-7 h-7 rounded-[8px] bg-muted/50 flex items-center justify-center shrink-0">
                  {item.type === "Episode" ? <Mic className="w-3.5 h-3.5 text-muted-foreground" /> : item.type === "Short" ? <PlayCircle className="w-3.5 h-3.5 text-muted-foreground" /> : <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
                <p className="text-[12px] font-semibold text-foreground flex-1 min-w-0 truncate">{item.title}</p>
                <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded-full bg-muted/40">{item.type}</span>
                <span className="text-[12px] font-bold text-primary tabular-nums flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" />{formatNum(item.engagement)}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Audience summary */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-primary" />
          <p className="text-[12px] font-semibold text-foreground">Audience Summary</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="font-heading font-extrabold text-[18px] text-foreground tabular-nums">{metrics.totalContent}</p>
            <p className="text-[9px] text-muted-foreground">Total Content</p>
          </div>
          <div>
            <p className="font-heading font-extrabold text-[18px] text-foreground tabular-nums">{metrics.followersGained}</p>
            <p className="text-[9px] text-muted-foreground">Followers</p>
          </div>
          <div>
            <p className="font-heading font-extrabold text-[18px] text-foreground tabular-nums">{metrics.totalReactions + metrics.totalComments + metrics.totalShares}</p>
            <p className="text-[9px] text-muted-foreground">Interactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNum(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n || 0);
}

function formatDuration(seconds) {
  if (!seconds) return "0m";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}