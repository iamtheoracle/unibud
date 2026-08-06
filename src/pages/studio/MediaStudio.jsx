import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Mic, Video, FileText, BookOpen, Calendar, Shield, BarChart3, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";
import StudioOverview from "@/components/studio/StudioOverview";
import StudioMediaRow from "@/components/studio/StudioMediaRow";
import StudioUploadSheet from "@/components/studio/StudioUploadSheet";

const EASE = [0.16, 1, 0.3, 1];

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "podcasts", label: "Podcasts", icon: Mic },
  { key: "shorts", label: "Shorts", icon: Video },
  { key: "articles", label: "Articles", icon: FileText },
  { key: "guides", label: "Guides", icon: BookOpen },
  { key: "schedule", label: "Schedule", icon: Calendar },
  { key: "moderation", label: "Moderation", icon: Shield },
];

export default function MediaStudio() {
  const [tab, setTab] = useState("overview");
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });
  const enabled = !!user?.id;

  const { data: episodes, isLoading: epLoading } = useQuery({
    queryKey: ["studioEpisodes"],
    queryFn: () => base44.entities.PodcastEpisode.filter({ created_by_id: user.id }, "-created_date", 100),
    enabled,
  });
  const { data: shorts, isLoading: shLoading } = useQuery({
    queryKey: ["studioShorts"],
    queryFn: () => base44.entities.ShortVideo.filter({ created_by_id: user.id }, "-created_date", 100),
    enabled,
  });
  const { data: posts, isLoading: pLoading } = useQuery({
    queryKey: ["studioPosts"],
    queryFn: () => base44.entities.QuadPost.filter({ created_by_id: user.id }, "-created_date", 100),
    enabled,
  });
  const { data: guides, isLoading: gLoading } = useQuery({
    queryKey: ["studioGuides"],
    queryFn: () => base44.entities.AcademicFile.filter({ created_by_id: user.id }, "-created_date", 100),
    enabled,
  });

  const eps = episodes || [], shs = shorts || [], pts = posts || [], gds = guides || [];

  const scheduled = useMemo(() => [
    ...eps.filter((e) => e.status === "scheduled" || e.scheduled_at).map((e) => ({ ...e, _type: "podcast" })),
    ...shs.filter((s) => s.status === "scheduled").map((s) => ({ ...s, _type: "short" })),
    ...pts.filter((p) => p.draft_status === "scheduled" && p.scheduled_at).map((p) => ({ ...p, _type: "article" })),
  ].sort((a, b) => new Date(a.scheduled_at || 0) - new Date(b.scheduled_at || 0)), [eps, shs, pts]);

  const moderated = useMemo(() => [
    ...shs.filter((s) => s.status === "under_review" || (s.moderation_flags?.length > 0)).map((s) => ({ ...s, _type: "short" })),
  ], [shs]);

  const loading = userLoading || (enabled && (epLoading || shLoading || pLoading || gLoading));
  const counts = { podcasts: eps.length, shorts: shs.length, articles: pts.length, guides: gds.length, schedule: scheduled.length, moderation: moderated.length };

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <header className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-[24px] text-foreground tracking-tight">Media Studio</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Create, manage, and analyze your content.</p>
        </div>
        <button onClick={() => setUploadOpen(true)} className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center spring-tap illuminated">
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {loading ? (
        <div className="h-40 rounded-[24px] glass-card shimmer" />
      ) : (
        <>
          <div className="flex gap-2 mb-5 p-1 rounded-[16px] bg-muted/40 overflow-x-auto no-scrollbar">
            {TABS.map((t) => {
              const count = counts[t.key] ?? null;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-3.5 py-2 rounded-[12px] text-[12px] font-semibold whitespace-nowrap transition-colors spring-tap flex items-center gap-1.5 ${tab === t.key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}>
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                  {count !== null && count > 0 && <span className="text-[10px] opacity-60">{count}</span>}
                </button>
              );
            })}
          </div>

          {tab === "overview" && <StudioOverview episodes={eps} shorts={shs} posts={pts} guides={gds} />}
          {tab === "podcasts" && <ContentList items={eps} type="podcast" />}
          {tab === "shorts" && <ContentList items={shs} type="short" />}
          {tab === "articles" && <ContentList items={pts} type="article" />}
          {tab === "guides" && <ContentList items={gds} type="guide" />}
          {tab === "schedule" && (
            scheduled.length === 0
              ? <EmptyState icon={Calendar} title="Nothing scheduled" description="Schedule content to see it here." />
              : <RowList items={scheduled} />
          )}
          {tab === "moderation" && (
            moderated.length === 0
              ? <EmptyState icon={Shield} title="All clear" description="No content is currently under review or flagged." />
              : <RowList items={moderated} />
          )}
        </>
      )}

      <StudioUploadSheet open={uploadOpen} onClose={() => setUploadOpen(false)} user={user} />
    </div>
  );
}

function ContentList({ items, type }) {
  if (items.length === 0) {
    const icon = type === "podcast" ? Mic : type === "short" ? Video : type === "article" ? FileText : BookOpen;
    const label = type === "podcast" ? "podcast episodes" : type === "short" ? "short videos" : type === "article" ? "articles" : "study guides";
    return <EmptyState icon={icon} title="Nothing here yet" description={`You haven't created any ${label} yet. Tap + to upload.`} />;
  }
  return <RowList items={items.map(i => ({ ...i, _type: type }))} />;
}

function RowList({ items }) {
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <motion.div key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}>
          <StudioMediaRow item={item} type={item._type} />
        </motion.div>
      ))}
    </div>
  );
}