import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, Pause, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

function fmt(s) {
  s = Math.max(0, Math.floor(s || 0));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r < 10 ? "0" : ""}${r}`;
}

/**
 * PodcastPlayer — inline audio player with resume, seek, playback speed,
 * and silent progress persistence to PodcastListen (drives Continue Listening).
 */
export default function PodcastPlayer({ episode, listen, user }) {
  const qc = useQueryClient();
  const audioRef = useRef(null);
  const listenId = useRef(listen?.id || null);
  const lastSave = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(!!listen?.completed);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (listen?.position_seconds && !listen.completed) {
      try { a.currentTime = listen.position_seconds; setCur(listen.position_seconds); } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }

  function seek(e) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = Number(e.target.value);
    setCur(a.currentTime);
  }

  function speed(v) {
    setRate(v);
    const a = audioRef.current;
    if (a) a.playbackRate = v;
  }

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
            <input type="range" min={0} max={dur || 0} value={cur} onChange={seek} className="flex-1 h-1 accent-primary" />
            <span className="text-[10px] text-muted-foreground tabular-nums w-10 text-right">{fmt(dur)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2.5">
        {[0.75, 1, 1.25, 1.5, 2].map((r) => (
          <button key={r} onClick={() => speed(r)} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold spring-tap ${rate === r ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>{r}×</button>
        ))}
      </div>
    </div>
  );
}