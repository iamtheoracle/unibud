import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Headphones, Plus, PlayCircle, Mic, Search, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";
import PodcastComposer from "@/components/podcast/PodcastComposer";
import ScreenShell from "@/components/layout/ScreenShell";

const EASE = [0.16, 1, 0.3, 1];

/**
 * Podcasts — the podcast hub. Browse shows, resume listening, search
 * across shows and episodes, and (for creators) manage your own shows.
 */
export default function Podcasts() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("browse");
  const [composer, setComposer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: podcasts } = useQuery({ queryKey: ["podcasts"], queryFn: () => base44.entities.Podcast.list("-created_date", 200) });
  const { data: episodes } = useQuery({ queryKey: ["allEpisodes"], queryFn: () => base44.entities.PodcastEpisode.list("-created_date", 500) });
  const { data: listens } = useQuery({
    queryKey: ["podcastListens", user?.id],
    queryFn: () => base44.entities.PodcastListen.filter({ user_id: user.id }, "-last_played_at", 500),
    enabled: !!user?.id,
  });

  const episodeById = useMemo(() => {
    const m = {}; (episodes || []).forEach((e) => { m[e.id] = e; }); return m;
  }, [episodes]);

  const countsByShow = useMemo(() => {
    const m = {}; (episodes || []).forEach((e) => { if (e.status === "published") m[e.podcast_id] = (m[e.podcast_id] || 0) + 1; }); return m;
  }, [episodes]);

  const browse = useMemo(() => (podcasts || []).filter((p) => p.status === "published"), [podcasts]);
  const myShows = useMemo(() => (podcasts || []).filter((p) => p.created_by_id === user?.id), [podcasts, user]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { shows: [], episodes: [] };
    const q = searchQuery.toLowerCase();
    const shows = browse.filter((p) =>
      p.title?.toLowerCase().includes(q) ||
      p.host_name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
    const eps = (episodes || []).filter((e) =>
      e.status === "published" &&
      (e.title?.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q))
    );
    return { shows, episodes: eps };
  }, [searchQuery, browse, episodes]);

  const continueList = useMemo(() => {
    return (listens || [])
      .filter((l) => l.position_seconds > 0 && !l.completed && episodeById[l.episode_id])
      .map((l) => ({ listen: l, episode: episodeById[l.episode_id] }))
      .sort((a, b) => (b.listen.last_played_at || "").localeCompare(a.listen.last_played_at || ""));
  }, [listens, episodeById]);

  const isSearching = searchQuery.trim() !== "";

  return (
    <ScreenShell
      title="Podcasts"
      subtitle="Campus voices, lectures, and stories — listen anywhere."
    >
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search podcasts, episodes, hosts…"
          className="w-full h-11 pl-10 pr-10 rounded-[16px] bg-muted/40 border border-border/30 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Search results */}
      {isSearching && (
        <div className="space-y-4 mb-6">
          {searchResults.shows.length === 0 && searchResults.episodes.length === 0 ? (
            <EmptyState icon={Search} title="No results" description={`No podcasts found for "${searchQuery}"`} />
          ) : (
            <>
              {searchResults.shows.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Shows</p>
                  <div className="grid grid-cols-2 gap-3">
                    {searchResults.shows.map((p) => (
                      <button key={p.id} onClick={() => { navigate(`/podcasts/${p.id}`); setSearchQuery(""); }}
                        className="text-left glass-card p-3 spring-tap">
                        <div className="aspect-square rounded-[14px] bg-muted/40 overflow-hidden mb-2 flex items-center justify-center">
                          {p.cover_url ? <img src={p.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" /> : <Mic className="w-8 h-8 text-muted-foreground" />}
                        </div>
                        <p className="text-[13px] font-semibold text-foreground leading-tight line-clamp-2">{p.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{p.host_name || "Unknown host"}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {searchResults.episodes.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">Episodes</p>
                  <div className="space-y-2">
                    {searchResults.episodes.map((ep) => (
                      <button key={ep.id} onClick={() => { navigate(`/podcasts/${ep.podcast_id}`); setSearchQuery(""); }}
                        className="w-full text-left glass-card p-3 flex items-center gap-3 spring-tap">
                        <div className="w-10 h-10 rounded-[12px] bg-primary/10 grid place-items-center shrink-0">
                          <PlayCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-foreground truncate">{ep.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{ep.podcast_title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tabs — hidden when searching */}
      {!isSearching && (
        <>
          <div className="flex gap-2 mb-5 p-1 rounded-[16px] bg-muted/40">
            {[
              { key: "browse", label: "Browse" },
              { key: "continue", label: "Continue" },
              { key: "mine", label: "My Shows" },
            ].map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex-1 py-2 rounded-[12px] text-[12px] font-semibold transition-colors spring-tap ${tab === t.key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "browse" && (
            browse.length === 0 ? (
              <EmptyState icon={Headphones} title="No podcasts yet" description="Be the first to launch a campus podcast." budGuidance="Tap My Shows to start your own — Bud can help you plan your first episode." />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {browse.map((p, i) => (
                  <motion.button key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.4, ease: EASE }}
                    onClick={() => navigate(`/podcasts/${p.id}`)} className="text-left glass-card p-3 spring-tap">
                    <div className="aspect-square rounded-[14px] bg-muted/40 overflow-hidden mb-2 flex items-center justify-center">
                      {p.cover_url ? <img src={p.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" /> : <Mic className="w-8 h-8 text-muted-foreground" />}
                    </div>
                    <p className="text-[13px] font-semibold text-foreground leading-tight line-clamp-2">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{p.host_name || "Unknown host"}</p>
                    <p className="text-[10px] text-primary mt-1">{countsByShow[p.id] || 0} episode{(countsByShow[p.id] || 0) === 1 ? "" : "s"}</p>
                  </motion.button>
                ))}
              </div>
            )
          )}

          {tab === "continue" && (
            continueList.length === 0 ? (
              <EmptyState icon={PlayCircle} title="Nothing to resume" description="Start an episode and your progress will be saved here." />
            ) : (
              <div className="space-y-3">
                {continueList.map(({ listen, episode }) => (
                  <button key={listen.id} onClick={() => navigate(`/podcasts/${episode.podcast_id}`)}
                    className="w-full text-left glass-card p-3.5 flex items-center gap-3 spring-tap">
                    <div className="w-12 h-12 rounded-[12px] bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                      {episode.cover_url ? <img src={episode.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" /> : <Mic className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-foreground truncate">{episode.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{episode.podcast_title}</p>
                      <div className="w-full h-1 rounded-full bg-muted/60 mt-1.5 overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${episode.duration_seconds ? Math.min(100, Math.round((listen.position_seconds / episode.duration_seconds) * 100)) : 5}%` }} />
                      </div>
                    </div>
                    <PlayCircle className="w-6 h-6 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            )
          )}

          {tab === "mine" && (
            <div>
              <div className="flex justify-end mb-3">
                <button onClick={() => setComposer(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
                  <Plus className="w-3.5 h-3.5" /> New show
                </button>
              </div>
              {myShows.length === 0 ? (
                <EmptyState icon={Mic} title="You haven't started a show" description="Launch your own podcast — lectures, interviews, or campus stories." />
              ) : (
                <div className="space-y-3">
                  {myShows.map((p) => (
                    <button key={p.id} onClick={() => navigate(`/podcasts/${p.id}`)} className="w-full text-left glass-card p-3.5 flex items-center gap-3 spring-tap">
                      <div className="w-12 h-12 rounded-[12px] bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                        {p.cover_url ? <img src={p.cover_url} alt="" className="w-full h-full object-cover" loading="lazy" /> : <Mic className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold text-foreground truncate">{p.title}</p>
                        <p className="text-[11px] text-muted-foreground">{countsByShow[p.id] || 0} episode{(countsByShow[p.id] || 0) === 1 ? "" : "s"} · {p.status === "draft" ? "Draft" : "Published"}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <PodcastComposer open={composer} onClose={() => setComposer(false)} user={user} />
    </ScreenShell>
  );
}