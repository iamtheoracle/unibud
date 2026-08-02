import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Mic, Plus, PlayCircle, CheckCircle2, Clock, Trash2, Sparkles, Loader2, FileText, Bell, BellOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";
import PodcastPlayer from "@/components/podcast/PodcastPlayer";
import EpisodeComposer from "@/components/podcast/EpisodeComposer";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

const EASE = [0.16, 1, 0.3, 1];
function fmt(s) { s = Math.max(0, Math.floor(s || 0)); const m = Math.floor(s / 60); const r = s % 60; return `${m}:${r < 10 ? "0" : ""}${r}`; }
function timeAgo(iso) { if (!iso) return ""; const d = (Date.now() - new Date(iso).getTime()) / 1000; if (d < 60) return "just now"; if (d < 3600) return `${Math.floor(d / 60)}m ago`; if (d < 86400) return `${Math.floor(d / 3600)}h ago`; return `${Math.floor(d / 86400)}d ago`; }

/**
 * PodcastShow — a single podcast show: cover, description, and the episode
 * list with an inline player. The creator can add episodes and delete their own.
 */
export default function PodcastShow() {
  const { showId } = useParams();
  const { toast } = useToast();
  const [composer, setComposer] = useState(false);
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [transcribing, setTranscribing] = useState({});
  const [showTranscript, setShowTranscript] = useState({});
  const [following, setFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: podcast, isLoading } = useQuery({ queryKey: ["podcast", showId], queryFn: () => base44.entities.Podcast.get(showId), enabled: !!showId });
  const { data: episodes } = useQuery({ queryKey: ["episodes", showId], queryFn: () => base44.entities.PodcastEpisode.filter({ podcast_id: showId }, "-published_at", 200), enabled: !!showId });
  const { data: listens } = useQuery({
    queryKey: ["podcastListens", user?.id],
    queryFn: () => base44.entities.PodcastListen.filter({ user_id: user.id }, "-last_played_at", 500),
    enabled: !!user?.id,
  });

  const listenByEpisode = useMemo(() => {
    const m = {}; (listens || []).forEach((l) => { m[l.episode_id] = l; }); return m;
  }, [listens]);

  const owner = !!user && podcast?.created_by_id === user.id;
  const visible = useMemo(() => {
    let list = episodes || [];
    if (!owner) list = list.filter((e) => e.status === "published");
    return list.sort((a, b) => (b.published_at || "").localeCompare(a.published_at || ""));
  }, [episodes, owner]);

  async function deleteEpisode(ep) {
    if (!confirm(`Delete "${ep.title}"?`)) return;
    try {
      await base44.entities.PodcastEpisode.delete(ep.id);
      await queryClientInstance.invalidateQueries({ queryKey: ["episodes", showId] });
      toast({ title: "Episode deleted" });
    } catch (err) {
      toast({ title: "Could not delete", description: err.message, variant: "destructive" });
    }
  }

  async function transcribeEpisode(ep) {
    setTranscribing((s) => ({ ...s, [ep.id]: true }));
    try {
      await base44.functions.invoke("transcribeEpisode", { episode_id: ep.id });
      await queryClientInstance.invalidateQueries({ queryKey: ["episodes", showId] });
      toast({ title: "Transcription ready", description: "Bud summarized your episode." });
    } catch (err) {
      toast({ title: "Transcription failed", description: err?.response?.data?.error || err.message, variant: "destructive" });
    } finally {
      setTranscribing((s) => ({ ...s, [ep.id]: false }));
    }
  }

  if (isLoading) return <div className="w-full max-w-[600px] mx-auto px-5 pt-8 safe-area-pt"><div className="h-48 rounded-[24px] glass-card shimmer" /></div>;
  if (!podcast) return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 safe-area-pt">
      <Link to="/podcasts" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground mb-3 spring-tap"><ArrowLeft className="w-4 h-4" /> Podcasts</Link>
      <EmptyState icon={Mic} title="Show not found" description="This podcast may have been removed." />
    </div>
  );

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-6 pb-32 safe-area-pt">
      <Link to="/podcasts" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground mb-3 spring-tap"><ArrowLeft className="w-4 h-4" /> Podcasts</Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="glass-card p-5 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-20 h-20 rounded-[18px] bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
            {podcast.cover_url ? <img src={podcast.cover_url} alt="" className="w-full h-full object-cover" /> : <Mic className="w-8 h-8 text-muted-foreground" />}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-heading font-extrabold text-[20px] text-foreground leading-tight">{podcast.title}</h1>
            <p className="text-[12px] text-muted-foreground mt-0.5">{podcast.host_name || "Unknown host"}</p>
            {podcast.category && <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{podcast.category}</span>}
          </div>
        </div>
        {podcast.description && <p className="text-[13px] text-foreground/80 leading-relaxed mt-3">{podcast.description}</p>}
      </motion.div>

      {owner && (
        <div className="flex justify-end mb-3">
          <button onClick={() => setComposer(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
            <Plus className="w-3.5 h-3.5" /> Add episode
          </button>
        </div>
      )}

      {activeEpisode && (
        <div className="mb-4 sticky top-2 z-10">
          <PodcastPlayer episode={activeEpisode} listen={listenByEpisode[activeEpisode.id]} user={user} />
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState icon={PlayCircle} title={owner ? "No episodes yet" : "No episodes published"} description={owner ? "Upload your first audio episode to go live." : "Check back soon."} />
      ) : (
        <div className="space-y-2.5">
          {visible.map((ep, i) => {
            const listen = listenByEpisode[ep.id];
            const isActive = activeEpisode?.id === ep.id;
            const pct = ep.duration_seconds && listen ? Math.min(100, Math.round((listen.position_seconds / ep.duration_seconds) * 100)) : 0;
            return (
              <motion.div key={ep.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }} className="glass-card p-3.5">
                <button onClick={() => setActiveEpisode(isActive ? null : ep)} className="flex items-center gap-3 w-full text-left spring-tap">
                  <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0">
                    {listen?.completed ? <CheckCircle2 className="w-5 h-5 text-success" /> : <PlayCircle className="w-5 h-5 text-primary" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-foreground truncate">E{ep.episode_number} · {ep.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {ep.duration_seconds ? fmt(ep.duration_seconds) : timeAgo(ep.published_at)}</span>
                      {ep.status === "draft" && <span className="text-warning">· draft</span>}
                    </p>
                    {pct > 0 && !listen?.completed && (
                      <div className="w-full h-1 rounded-full bg-muted/60 mt-1.5 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                </button>
                {ep.description && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{ep.description}</p>}
                {ep.summary && (
                  <div className="mt-2 rounded-[12px] bg-primary/6 border border-primary/15 p-2.5">
                    <p className="text-[10px] font-semibold text-primary flex items-center gap-1 mb-1"><Sparkles className="w-3 h-3" /> Bud summary</p>
                    <p className="text-[11px] text-foreground/80 leading-relaxed">{ep.summary}</p>
                    {Array.isArray(ep.takeaways) && ep.takeaways.length > 0 && (
                      <ul className="mt-1.5 space-y-0.5">
                        {ep.takeaways.map((t, ti) => <li key={ti} className="text-[11px] text-muted-foreground flex gap-1"><span className="text-primary">•</span>{t}</li>)}
                      </ul>
                    )}
                  </div>
                )}
                {ep.transcript && (
                  <button onClick={() => setShowTranscript((s) => ({ ...s, [ep.id]: !s[ep.id] }))} className="mt-1.5 text-[11px] font-semibold text-primary inline-flex items-center gap-1 spring-tap"><FileText className="w-3 h-3" /> {showTranscript[ep.id] ? "Hide" : "Show"} transcript</button>
                )}
                {showTranscript[ep.id] && ep.transcript && <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed max-h-32 overflow-y-auto no-scrollbar whitespace-pre-wrap">{ep.transcript}</p>}
                {owner && (
                  <div className="flex justify-end items-center gap-3 mt-2">
                    {!ep.transcript && (
                      <button onClick={() => transcribeEpisode(ep)} disabled={transcribing[ep.id]} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary spring-tap disabled:opacity-50">
                        {transcribing[ep.id] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} {transcribing[ep.id] ? "Working…" : "Transcribe & summarize"}
                      </button>
                    )}
                    <button onClick={() => deleteEpisode(ep)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-error spring-tap"><Trash2 className="w-3 h-3" /> Delete</button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <EpisodeComposer open={composer} onClose={() => setComposer(false)} podcast={podcast} user={user} />
    </div>
  );
}