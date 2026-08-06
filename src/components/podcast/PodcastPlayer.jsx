import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, Pause, Loader2, CheckCircle2, Download, Heart, Share2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SleepTimerControl from "./SleepTimerControl";
import PodcastChapters from "./PodcastChapters";

function fmt(s) {
  s = Math.max(0, Math.floor(s || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${m < 10 ? "0" : ""}${m}:${r < 10 ? "0" : ""}${r}`;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

/**
 * PodcastPlayer — inline audio player with resume, seek, playback speed,
 * sleep timer, chapter navigation, like, share, and download.
 * Progress persists to PodcastListen (drives Continue Listening).
 */
export default function PodcastPlayer({ episode, listen, user, podcast }) {
  const qc = useQueryClient();
  const audioRef = useRef(null);
  const listenId = useRef(listen?.id || null);
  const lastSave = useRef(0);
  const sleepTimerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(!!listen?.completed);
  const [liked, setLiked] = useState(episode.liked_by?.includes(user?.id));
  const [likeCount, setLikeCount] = useState(episode.likes_count || 0);
  const [showChapters, setShowChapters] = useState(false);
  const [sleepRemaining, setSleepRemaining] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (listen?.position_seconds && !listen.completed) {
      try { a.currentTime = listen.position_seconds; setCur(listen.position_seconds); } catch {}
    }
  }, []);

  // Cleanup sleep timer on unmount
  useEffect(() => {
    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, []);

  async function save(position, duration, completed) {
    if (!user) return;
    const payload = {
      episode_id: episode.id,
      user_id: user.id,
      podcast_id: episode.podcast_id,
      position_seconds: Math.floor(position || 0),
      duration_seconds: Math.floor(duration || 0),
      completed,
      last_played_at: new Date().toISOString(),
    };
    try {
      if (listenId.current) {
        await base44.entities.PodcastListen.update(listenId.current, payload);
      } else {
        const r = await base44.entities.PodcastListen.create(payload);
        listenId.current = r.id;
      }
      qc.invalidateQueries({ queryKey: ["podcastListens", user.id] });
      if (completed) setDone(true);
    } catch {}
  }

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
      save(a.currentTime, a.duration, false);
    } else {
      a.play();
      setPlaying(true);
    }
  }

  function onTime() {
    const a = audioRef.current;
    if (!a) return;
    setCur(a.currentTime);
    if (Date.now() - lastSave.current > 5000) {
      lastSave.current = Date.now();
      save(a.currentTime, a.duration, false);
    }
  }

  function onLoaded() {
    const a = audioRef.current;
    if (!a) return;
    setDur(a.duration || episode.duration_seconds || 0);
    setLoading(false);
  }

  function onEnded() {
    setPlaying(false);
    const a = audioRef.current;
    save(a?.duration || dur, a?.duration || dur, true);
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
      setSleepRemaining(0);
    }
  }

  function seek(seconds) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Number(seconds);
    setCur(a.currentTime);
  }

  function speed(v) {
    setRate(v);
    const a = audioRef.current;
    if (a) a.playbackRate = v;
  }

  function setSleepTimer(seconds) {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    if (seconds === -1) {
      // End of episode — no timer needed, just let it finish
      return;
    }
    setSleepRemaining(seconds);
    sleepTimerRef.current = setInterval(() => {
      setSleepRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(sleepTimerRef.current);
          sleepTimerRef.current = null;
          const a = audioRef.current;
          if (a) { a.pause(); setPlaying(false); save(a.currentTime, a.duration, false); }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function cancelSleepTimer() {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    sleepTimerRef.current = null;
    setSleepRemaining(0);
  }

  async function toggleLike() {
    if (!user) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    try {
      const newLikedBy = wasLiked
        ? (episode.liked_by || []).filter((id) => id !== user.id)
        : [...(episode.liked_by || []), user.id];
      await base44.entities.PodcastEpisode.update(episode.id, {
        liked_by: newLikedBy,
        likes_count: newLikedBy.length,
      });
      qc.invalidateQueries({ queryKey: ["episodes", episode.podcast_id] });
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: episode.title, text: episode.podcast_title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  }

  const chapters = Array.isArray(episode.chapters) ? episode.chapters : [];
  const hasChapters = chapters.length > 0;

  return (
    <div className="rounded-[20px] glass-card p-4">
      <audio
        ref={audioRef}
        src={episode.audio_url}
        preload="metadata"
        onTimeUpdate={onTime}
        onLoadedMetadata={onLoaded}
        onEnded={onEnded}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center spring-tap shrink-0">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-foreground truncate flex items-center gap-1.5">
            {done && <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />}
            {episode.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground tabular-nums w-10">{fmt(cur)}</span>
            <input type="range" min={0} max={dur || 0} value={cur} onChange={(e) => seek(e.target.value)} className="flex-1 h-1 accent-primary" />
            <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">{fmt(dur)}</span>
          </div>
        </div>
      </div>

      {/* Controls row: speed, chapters, sleep timer, like, share, download */}
      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
        {[0.75, 1, 1.25, 1.5, 2].map((r) => (
          <button key={r} onClick={() => speed(r)} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold spring-tap ${rate === r ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>{r}×</button>
        ))}
        {hasChapters && (
          <button onClick={() => setShowChapters(!showChapters)} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold spring-tap ${showChapters ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
            Chapters
          </button>
        )}
        <SleepTimerControl
          active={sleepRemaining > 0}
          remaining={sleepRemaining}
          onSet={setSleepTimer}
          onCancel={cancelSleepTimer}
        />
        <button onClick={toggleLike} className="w-8 h-8 rounded-full grid place-items-center spring-tap bg-muted/50">
          <Heart className={`w-4 h-4 ${liked ? "text-error fill-error" : "text-muted-foreground"}`} />
        </button>
        <button onClick={share} className="w-8 h-8 rounded-full grid place-items-center spring-tap bg-muted/50">
          <Share2 className="w-4 h-4 text-muted-foreground" />
        </button>
        <a href={episode.audio_url} download className="w-8 h-8 rounded-full grid place-items-center spring-tap bg-muted/50">
          <Download className="w-4 h-4 text-muted-foreground" />
        </a>
      </div>

      {/* Like count */}
      {likeCount > 0 && (
        <p className="text-[10px] text-muted-foreground mt-2">{likeCount} like{likeCount === 1 ? "" : "s"}</p>
      )}

      {/* Chapter list */}
      {showChapters && hasChapters && (
        <PodcastChapters
          chapters={chapters}
          currentPosition={cur}
          onSeek={seek}
        />
      )}
    </div>
  );
}