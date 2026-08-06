import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Mic, Video, FileText, BookOpen, Heart, Eye, MessageCircle, TrendingUp } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function StudioOverview({ episodes, shorts, posts, guides }) {
  const stats = useMemo(() => {
    const likes = [...episodes, ...shorts, ...posts].reduce((s, c) => s + (c.likes_count || 0), 0);
    const comments = [...episodes, ...shorts, ...posts].reduce((s, c) => s + (c.comments_count || 0), 0);
    const shares = [...shorts, ...posts].reduce((s, c) => s + (c.shares_count || 0), 0);
    const views = shorts.reduce((s, c) => s + (c.views_count || 0), 0);
    const listens = episodes.reduce((s, c) => s + (c.downloads_count || 0), 0);
    return {
      totalContent: episodes.length + shorts.length + posts.length + guides.length,
      totalEngagement: likes + comments + shares,
      views: views + listens,
      comments,
      breakdown: [
        { label: "Podcasts", count: episodes.length, engagement: episodes.reduce((s, e) => s + (e.downloads_count || 0) + (e.likes_count || 0), 0), icon: Mic },
        { label: "Shorts", count: shorts.length, engagement: shorts.reduce((s, v) => s + (v.views_count || 0) + (v.likes_count || 0), 0), icon: Video },
        { label: "Articles", count: posts.length, engagement: posts.reduce((s, p) => s + (p.likes_count || 0) + (p.comments_count || 0), 0), icon: FileText },
        { label: "Guides", count: guides.length, engagement: 0, icon: BookOpen },
      ],
    };
  }, [episodes, shorts, posts, guides]);

  const topContent = useMemo(() => [
    ...episodes.map((e) => ({ title: e.title, type: "Podcast", engagement: (e.downloads_count || 0) + (e.likes_count || 0), icon: Mic })),
    ...shorts.map((s) => ({ title: s.title, type: "Short", engagement: (s.views_count || 0) + (s.likes_count || 0), icon: Video })),
    ...posts.map((p) => ({ title: (p.content || "").slice(0, 40), type: "Article", engagement: (p.likes_count || 0) + (p.comments_count || 0), icon: FileText })),
  ].sort((a, b) => b.engagement - a.engagement).slice(0, 3), [episodes, shorts, posts]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard icon={TrendingUp} value={stats.totalContent} label="Total Content" color="text-primary" />
        <StatCard icon={Heart} value={stats.totalEngagement} label="Engagement" color="text-error" />
        <StatCard icon={Eye} value={stats.views} label="Views & Listens" color="text-information" />
        <StatCard icon={MessageCircle} value={stats.comments} label="Comments" color="text-accent" />
      </div>

      <div className="glass-card p-4">
        <p className="text-[12px] font-semibold text-foreground mb-3">Content Breakdown</p>
        <div className="space-y-2.5">
          {stats.breakdown.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-muted/50 flex items-center justify-center shrink-0">
                <b.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-[13px] text-foreground flex-1">{b.label}</span>
              <span className="text-[12px] font-semibold text-foreground tabular-nums">{b.count}</span>
              {b.engagement > 0 && <span className="text-[10px] text-muted-foreground tabular-nums w-16 text-right">{b.engagement} eng.</span>}
            </div>
          ))}
        </div>
      </div>

      {topContent.length > 0 && (
        <div className="glass-card p-4">
          <p className="text-[12px] font-semibold text-foreground mb-3">Top Performing</p>
          <div className="space-y-2">
            {topContent.map((item, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-[14px] font-bold text-muted-foreground/40 w-5">{i + 1}</span>
                <item.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-[12px] text-foreground flex-1 truncate">{item.title || "Untitled"}</span>
                <span className="text-[11px] font-semibold text-primary tabular-nums">{item.engagement}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="glass-card p-3.5">
      <Icon className={`w-4 h-4 ${color}`} />
      <p className="font-heading font-extrabold text-[20px] text-foreground mt-1 tabular-nums">{value.toLocaleString()}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
    </motion.div>
  );
}