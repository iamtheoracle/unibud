import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3, FileText, Video, Mic, ShoppingBag, Heart, Eye, MessageCircle,
  Share2, Trash2, Plus, CalendarClock, Sparkles, Loader2, TrendingUp, Bookmark, Radio, Users,
  BookMarked, Zap,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/use-toast";
import CreatorAnalytics from "@/components/creator/CreatorAnalytics";
import CreatorTemplates from "@/components/creator/CreatorTemplates";
import CreatorScheduler from "@/components/creator/CreatorScheduler";

const EASE = [0.16, 1, 0.3, 1];
const ENTITY = { posts: "QuadPost", shorts: "ShortVideo", stories: "Story", podcasts: "PodcastEpisode", listings: "MarketplaceListing" };

/**
 * CreatorStudio — the unified dashboard for everything a UNIBUD creator makes.
 * Aggregates posts, shorts, podcast episodes and marketplace listings with
 * engagement analytics, drafts/scheduled content, and per-item management.
 */
export default function CreatorStudio() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const enabled = !!user?.id;

  const { data: posts, isLoading: postsLoading } = useQuery({ queryKey: ["myPosts"], queryFn: () => base44.entities.QuadPost.filter({ created_by_id: user.id }, "-created_date", 100), enabled });
  const { data: shorts } = useQuery({ queryKey: ["myShorts"], queryFn: () => base44.entities.ShortVideo.filter({ created_by_id: user.id }, "-created_date", 100), enabled });
  const { data: stories } = useQuery({ queryKey: ["myStories"], queryFn: () => base44.entities.Story.filter({ created_by_id: user.id }, "-created_date", 100), enabled });
  const { data: episodes } = useQuery({ queryKey: ["myEpisodes"], queryFn: () => base44.entities.PodcastEpisode.filter({ created_by_id: user.id }, "-created_date", 100), enabled });
  const { data: listings } = useQuery({ queryKey: ["myListings"], queryFn: () => base44.entities.MarketplaceListing.filter({ created_by_id: user.id }, "-created_date", 100), enabled });
  const { data: myPodcasts } = useQuery({ queryKey: ["myPodcasts"], queryFn: () => base44.entities.Podcast.filter({ created_by_id: user.id }, "-created_date", 50), enabled });

  const p = posts || [], s = shorts || [], st = stories || [], e = episodes || [], l = listings || [];
  const pods = myPodcasts || [];
  const reactions = useMemo(() => [...p, ...s, ...st].reduce((a, x) => a + (x.likes_count || 0), 0), [p, s, st]);
  const comments = useMemo(() => [...p, ...s].reduce((a, x) => a + (x.comments_count || 0), 0), [p, s]);
  const shares = useMemo(() => [...p, ...s].reduce((a, x) => a + (x.shares_count || 0), 0), [p, s]);
  const views = useMemo(() => [...s, ...st].reduce((a, x) => a + (x.views_count || 0), 0), [s, st]);
  const listens = useMemo(() => e.reduce((a, x) => a + (x.downloads_count || 0), 0), [e]);
  const bookmarks = useMemo(() => [...p, ...s].reduce((a, x) => a + (x.bookmarks_count || 0), 0), [p, s]);
  const drafts = useMemo(() => p.filter((x) => x.draft_status === "draft" || x.draft_status === "scheduled"), [p]);

  async function del(type, id, key) {
    if (!confirm("Delete this content? This can't be undone.")) return;
    try {
      await base44.entities[ENTITY[type]].delete(id);
      qc.invalidateQueries({ queryKey: [key] });
      toast({ title: "Deleted" });
    } catch (err) {
      toast({ title: "Could not delete", description: err.message, variant: "destructive" });
    }
  }

  const loading = postsLoading && enabled;
  const TABS = [
    { key: "overview", label: "Overview" },
    { key: "analytics", label: "Analytics" },
    { key: "templates", label: "Templates" },
    { key: "schedule", label: "Schedule" },
    { key: "posts", label: `Posts · ${p.length}` },
    { key: "stories", label: `Stories · ${st.length}` },
    { key: "shorts", label: `Shorts · ${s.length}` },
    { key: "podcasts", label: `Episodes · ${e.length}` },
    { key: "listings", label: `Listings · ${l.length}` },
    { key: "highlights", label: "Highlights" },
  ];

  const creates = [
    { to: "/quad", icon: FileText, label: "Post", color: "bg-primary/10", ic: "text-primary" },
    { to: "/shorts", icon: Video, label: "Short", color: "bg-accent/10", ic: "text-accent" },
    { to: "/podcasts", icon: Mic, label: "Podcast", color: "bg-success/10", ic: "text-success" },
    { to: "/marketplace", icon: ShoppingBag, label: "Listing", color: "bg-warning/10", ic: "text-warning" },
    { to: "/quad?type=article", icon: BookMarked, label: "Article", color: "bg-blue-500/10", ic: "text-blue-400" },
    { to: "/live", icon: Zap, label: "Go Live", color: "bg-red-500/10", ic: "text-red-400" },
  ];

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <header className="mb-4">
        <h1 className="font-heading font-extrabold text-[24px] text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Creator Studio
        </h1>
        <p className="text-[12px] text-muted-foreground mt-1">Your content, reach, and engagement — all in one place.</p>
      </header>

      {loading ? (
        <div className="h-40 rounded-[24px] glass-card shimmer" />
      ) : (
        <>
          {/* Quick create */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 mb-5">
            {creates.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}>
                <Link to={c.to} className="flex flex-col items-center gap-1.5 p-3 rounded-[18px] glass-card spring-tap">
                  <div className={`w-10 h-10 rounded-[14px] ${c.color} flex items-center justify-center`}>
                    <c.icon className={`w-5 h-5 ${c.ic}`} />
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">{c.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-4 gap-2.5 mb-3">
            <Stat icon={Heart} value={reactions} label="Reactions" color="text-error" />
            <Stat icon={Eye} value={views} label="Views" color="text-primary" />
            <Stat icon={MessageCircle} value={comments} label="Comments" color="text-accent" />
            <Stat icon={Share2} value={shares} label="Shares" color="text-success" />
          </div>
          <div className="grid grid-cols-4 gap-2.5 mb-5">
            <Stat icon={Mic} value={listens} label="Listens" color="text-primary" />
            <Stat icon={Bookmark} value={bookmarks} label="Saves" color="text-accent" />
            <Stat icon={Users} value={p.length + s.length + st.length + e.length} label="Total" color="text-success" />
            <Stat icon={TrendingUp} value={drafts.length} label="Drafts" color="text-warning" />
          </div>

          {/* Drafts & scheduled */}
          {drafts.length > 0 && (
            <div className="glass-card p-4 mb-5 border border-warning/15">
              <p className="text-[12px] font-semibold text-foreground flex items-center gap-1.5 mb-2"><CalendarClock className="w-4 h-4 text-warning" /> Drafts & scheduled</p>
              <div className="space-y-1.5">
                {drafts.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 text-[12px]">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/15 text-warning capitalize">{d.draft_status}</span>
                    <span className="truncate flex-1 text-foreground/80">{(d.content || "").slice(0, 60) || "Untitled"}</span>
                    {d.scheduled_at && <span className="text-[10px] text-muted-foreground">{new Date(d.scheduled_at).toLocaleDateString()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-4 p-1 rounded-[16px] bg-muted/40 overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`px-3.5 py-2 rounded-[12px] text-[12px] font-semibold whitespace-nowrap transition-colors spring-tap ${tab === t.key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "analytics" && (
            <CreatorAnalytics posts={p} shorts={s} stories={st} episodes={e} podcasts={pods} />
          )}

          {tab === "templates" && (
            <CreatorTemplates user={user} />
          )}

          {tab === "schedule" && (
            <CreatorScheduler user={user} posts={p} shorts={s} stories={st} episodes={e} listings={l} />
          )}

          {tab === "overview" && (
            <div className="space-y-3">
              <OverviewRow icon={FileText} title="Posts" count={p.length} to="/quad" hint="Text, photos, polls" />
              <OverviewRow icon={Radio} title="Stories" count={st.length} to="/quad" hint="24-hour stories & highlights" />
              <OverviewRow icon={Video} title="Shorts" count={s.length} to="/shorts" hint="Short videos & reels" />
              <OverviewRow icon={Mic} title="Podcast episodes" count={e.length} to="/podcasts" hint="Audio shows" />
              <OverviewRow icon={ShoppingBag} title="Marketplace listings" count={l.length} to="/marketplace" hint="Items you're selling" />
              <div className="glass-card p-4 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[12px] text-foreground/80 leading-relaxed">Bud tip: posts with a photo or poll get roughly 3× more reactions. Try attaching an image to your next post.</p>
              </div>
            </div>
          )}

          {tab === "posts" && <ContentList items={p} type="posts" qk="myPosts" del={del} render={(x) => x.content?.slice(0, 80) || "Untitled"} metrics={(x) => <Metrics likes={x.likes_count} comments={x.comments_count} shares={x.shares_count} />} empty="You haven't posted yet. Head to the Quad to share something." />}
          {tab === "stories" && <ContentList items={st} type="stories" qk="myStories" del={del} render={(x) => x.content?.slice(0, 60) || (x.type === "video" ? "Video story" : "Photo story")} metrics={(x) => <Metrics likes={x.likes_count || 0} views={x.views_count} />} empty="No stories yet. Share a moment from the camera." />}
          {tab === "shorts" && <ContentList items={s} type="shorts" qk="myShorts" del={del} render={(x) => x.title} metrics={(x) => <Metrics likes={x.likes_count} comments={x.comments_count} shares={x.shares_count} views={x.views_count} />} empty="No shorts uploaded yet." />}
          {tab === "podcasts" && <ContentList items={e} type="podcasts" qk="myEpisodes" del={del} render={(x) => x.title} metrics={(x) => <Metrics likes={x.likes_count || 0} comments={x.comments_count || 0} shares={x.shares_count || 0} />} empty="No podcast episodes published yet." />}
          {tab === "listings" && <ContentList items={l} type="listings" qk="myListings" del={del} render={(x) => x.title} metrics={(x) => <span className="text-[10px] font-semibold text-primary">{x.is_free ? "Free" : `₦${x.price}`}</span>} empty="No marketplace listings yet." />}

          {tab === "highlights" && (
            <div className="space-y-4">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bookmark className="w-4 h-4 text-primary" />
                  <p className="text-[13px] font-semibold text-foreground">Story Highlights</p>
                </div>
                <p className="text-[12px] text-muted-foreground leading-relaxed">
                  Highlights are permanent collections of stories saved to your profile.
                  Manage them directly from your profile page.
                </p>
                <Link
                  to="/profile"
                  className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-primary spring-tap"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Manage highlights on profile
                </Link>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-[12px] font-semibold text-foreground">Bud tip</p>
                </div>
                <p className="text-[12px] text-foreground/80 leading-relaxed">Pinned highlights with custom covers get up to 2× more profile visits. Use academic highlights to showcase your best work.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, value, label, color }) {
  return (
    <div className="glass-card p-3 text-center">
      <Icon className={`w-4 h-4 ${color} mx-auto`} />
      <p className="font-heading font-extrabold text-[18px] text-foreground mt-1 tabular-nums">{value.toLocaleString()}</p>
      <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
    </div>
  );
}

function OverviewRow({ icon: Icon, title, count, to, hint }) {
  return (
    <Link to={to} className="block glass-card p-3.5 flex items-center gap-3 spring-tap">
      <div className="w-10 h-10 rounded-[14px] bg-muted/50 flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-foreground" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground">{title}</p>
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      </div>
      <span className="font-heading font-bold text-[16px] text-primary tabular-nums">{count}</span>
    </Link>
  );
}

function Metrics({ likes, comments, shares, views }) {
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      {likes != null && <span className="flex items-center gap-0.5"><Heart className="w-2.5 h-2.5" /> {likes || 0}</span>}
      {views != null && <span className="flex items-center gap-0.5"><Eye className="w-2.5 h-2.5" /> {views || 0}</span>}
      {comments != null && <span className="flex items-center gap-0.5"><MessageCircle className="w-2.5 h-2.5" /> {comments || 0}</span>}
      {shares != null && <span className="flex items-center gap-0.5"><Share2 className="w-2.5 h-2.5" /> {shares || 0}</span>}
    </div>
  );
}

function ContentList({ items, type, qk, del, render, metrics, empty }) {
  if (items.length === 0) return <EmptyState icon={BarChart3} title="Nothing here yet" description={empty} />;
  return (
    <div className="space-y-2.5">
      {items.map((x, i) => (
        <motion.div key={x.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }} className="glass-card p-3.5">
          <div className="flex items-start gap-2">
            <p className="text-[13px] font-semibold text-foreground flex-1 min-w-0 line-clamp-2">{render(x)}</p>
            <button onClick={() => del(type, x.id, qk)} className="w-7 h-7 rounded-full bg-error/10 flex items-center justify-center spring-tap shrink-0"><Trash2 className="w-3.5 h-3.5 text-error" /></button>
          </div>
          <div className="flex items-center justify-between mt-2">
            {metrics(x)}
            <span className="text-[10px] text-muted-foreground">{x.created_date ? new Date(x.created_date).toLocaleDateString() : ""}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}