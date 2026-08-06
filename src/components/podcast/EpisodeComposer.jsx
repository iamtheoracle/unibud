import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Loader2, Upload, FileAudio, Mic, Square, Plus, Trash2,
  Sparkles, Tag, Calendar,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

/**
 * EpisodeComposer — creator uploads or records an audio episode.
 * Supports: audio recording (MediaRecorder), file upload, chapters,
 * tags, scheduling, and Bud assistance (transcription, summary,
 * show notes, chapter generation) — all on-demand only.
 */
export default function EpisodeComposer({ open, onClose, podcast, user }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showNotes, setShowNotes] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [audioUrl, setAudioUrl] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [chapters, setChapters] = useState([]);
  const [status, setStatus] = useState("published");
  const [scheduledAt, setScheduledAt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [budLoading, setBudLoading] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  const reset = () => {
    setTitle(""); setDescription(""); setShowNotes(""); setEpisodeNumber(1);
    setSeasonNumber(1); setAudioUrl(""); setTags([]); setTagInput("");
    setChapters([]); setStatus("published"); setScheduledAt("");
  };

  // ── Audio recording via MediaRecorder ──
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        setUploading(true);
        try {
          const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" });
          const r = await base44.integrations.Core.UploadFile({ file });
          setAudioUrl(r.file_url);
          toast({ title: "Recording uploaded" });
        } catch {
          toast({ title: "Upload failed", variant: "destructive" });
        } finally {
          setUploading(false);
        }
      };
      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
      setRecordTime(0);
      recordTimerRef.current = setInterval(() => {
        setRecordTime((t) => t + 1);
      }, 1000);
    } catch {
      toast({ title: "Microphone unavailable", variant: "destructive" });
    }
  }, [toast]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecording(false);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
  }, []);

  const handleAudioUpload = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploading(true);
    try {
      const r = await base44.integrations.Core.UploadFile({ file: f });
      setAudioUrl(r.file_url);
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const addChapter = () => {
    setChapters([...chapters, { title: "", start_seconds: 0, end_seconds: 0 }]);
  };

  const updateChapter = (i, field, value) => {
    const next = [...chapters];
    next[i] = { ...next[i], [field]: field === "title" ? value : Number(value) };
    setChapters(next);
  };

  const removeChapter = (i) => {
    setChapters(chapters.filter((_, idx) => idx !== i));
  };

  // ── Bud assistance — on-demand only ──
  const budAssist = async (task) => {
    if (!audioUrl && task !== "generate_title") {
      return toast({ title: "Upload or record audio first", variant: "destructive" });
    }
    setBudLoading(task);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: buildBudPrompt(task, { title, description, audioUrl, chapters, showNotes }),
        response_json_schema: task === "generate_chapters"
          ? { type: "object", properties: { chapters: { type: "array", items: { type: "object", properties: { title: { type: "string" }, start_seconds: { type: "number" } } } } } }
          : task === "generate_title"
          ? { type: "object", properties: { title: { type: "string" }, description: { type: "string" } } }
          : { type: "object", properties: { content: { type: "string" } } },
      });
      const data = res;

      if (task === "generate_title" && data?.title) {
        setTitle(data.title);
        if (data.description) setDescription(data.description);
      } else if (task === "generate_show_notes" && data?.content) {
        setShowNotes(data.content);
      } else if (task === "generate_chapters" && data?.chapters) {
        setChapters(data.chapters.map((c) => ({ title: c.title, start_seconds: c.start_seconds, end_seconds: 0 })));
      }
      toast({ title: "Bud finished", description: `Updated ${task.replace("generate_", "").replace(/_/g, " ")}` });
    } catch {
      toast({ title: "Bud couldn't help right now", variant: "destructive" });
    } finally {
      setBudLoading(null);
    }
  };

  async function save() {
    if (!title.trim() || !audioUrl) return toast({ title: "Title and audio required", variant: "destructive" });
    setSaving(true);
    try {
      const payload = {
        podcast_id: podcast.id,
        podcast_title: podcast.title,
        cover_url: podcast.cover_url || "",
        title: title.trim(),
        description: description.trim(),
        show_notes: showNotes.trim(),
        audio_url: audioUrl,
        episode_number: Number(episodeNumber) || 1,
        season_number: Number(seasonNumber) || 1,
        host_id: user?.id || "",
        tags,
        chapters: chapters.filter((c) => c.title.trim()),
        status,
        published_at: status === "published" ? new Date().toISOString() : null,
        scheduled_at: status === "scheduled" && scheduledAt ? new Date(scheduledAt).toISOString() : null,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        downloads_count: 0,
        liked_by: [],
      };
      await base44.entities.PodcastEpisode.create(payload);
      await queryClientInstance.invalidateQueries({ queryKey: ["episodes", podcast.id] });
      toast({ title: status === "scheduled" ? "Episode scheduled" : "Episode published" });
      onClose();
      reset();
    } catch (err) {
      toast({ title: "Could not save", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && podcast && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[28px] bg-card soft-shadow border border-border/40 p-5 max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[16px] text-foreground">New episode · {podcast.title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 grid place-items-center spring-tap">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Audio: record or upload */}
            <label className="text-[12px] font-semibold text-foreground">Audio</label>
            {audioUrl ? (
              <div className="flex items-center gap-2 mt-1.5 p-3 rounded-[14px] bg-success/8 border border-success/15">
                <FileAudio className="w-4 h-4 text-success" />
                <span className="text-[12px] text-foreground truncate flex-1">{audioUrl.split("/").pop()}</span>
                <button onClick={() => setAudioUrl("")} className="text-[11px] text-error font-semibold">Remove</button>
              </div>
            ) : recording ? (
              <div className="flex items-center gap-3 mt-1.5 p-3 rounded-[14px] bg-error/8 border border-error/15">
                <div className="w-3 h-3 rounded-full bg-error gentle-pulse" />
                <span className="text-[12px] font-semibold text-foreground flex-1 tabular-nums">
                  {Math.floor(recordTime / 60)}:{(recordTime % 60).toString().padStart(2, "0")}
                </span>
                <button onClick={stopRecording} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error text-white text-[11px] font-semibold spring-tap">
                  <Square className="w-3 h-3" fill="currentColor" /> Stop
                </button>
              </div>
            ) : (
              <div className="flex gap-2 mt-1.5">
                <button
                  onClick={startRecording}
                  disabled={uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] border-2 border-dashed border-border/50 text-[12px] text-muted-foreground spring-tap disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
                  {uploading ? "Uploading…" : "Record"}
                </button>
                <label className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] border-2 border-dashed border-border/50 text-[12px] text-muted-foreground spring-tap cursor-pointer">
                  <Upload className="w-4 h-4" /> Upload
                  <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
                </label>
              </div>
            )}

            {/* Title */}
            <div className="flex items-center justify-between mt-3">
              <label className="text-[12px] font-semibold text-foreground">Episode title</label>
              <button onClick={() => budAssist("generate_title")} disabled={!!budLoading} className="flex items-center gap-1 text-[10px] font-semibold text-primary spring-tap disabled:opacity-50">
                {budLoading === "generate_title" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Bud
              </button>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Episode 1 — Welcome"
              className="w-full h-12 mt-1.5 px-4 rounded-[16px] bg-muted/30 border border-border/40 text-[14px] text-foreground focus:outline-none focus:border-primary/50"
            />

            {/* Description */}
            <label className="text-[12px] font-semibold text-foreground mt-3 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="What's this episode about?"
              className="w-full mt-1.5 p-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50 resize-y"
            />

            {/* Show notes with Bud assistance */}
            <div className="flex items-center justify-between mt-3">
              <label className="text-[12px] font-semibold text-foreground">Show notes</label>
              <button onClick={() => budAssist("generate_show_notes")} disabled={!!budLoading || !audioUrl} className="flex items-center gap-1 text-[10px] font-semibold text-primary spring-tap disabled:opacity-50">
                {budLoading === "generate_show_notes" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Generate
              </button>
            </div>
            <textarea
              value={showNotes}
              onChange={(e) => setShowNotes(e.target.value)}
              rows={3}
              placeholder="Detailed show notes, links, references…"
              className="w-full mt-1.5 p-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50 resize-y"
            />

            {/* Episode & season numbers */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[12px] font-semibold text-foreground">Episode #</label>
                <input type="number" value={episodeNumber} onChange={(e) => setEpisodeNumber(e.target.value)}
                  className="w-full h-11 mt-1.5 px-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground">Season</label>
                <input type="number" value={seasonNumber} onChange={(e) => setSeasonNumber(e.target.value)}
                  className="w-full h-11 mt-1.5 px-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none" />
              </div>
            </div>

            {/* Tags */}
            <label className="text-[12px] font-semibold text-foreground mt-3 block flex items-center gap-1"><Tag className="w-3 h-3" /> Tags</label>
            <div className="flex gap-2 mt-1.5">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tag…"
                className="flex-1 h-10 px-3 rounded-[12px] bg-muted/30 border border-border/40 text-[12px] text-foreground focus:outline-none focus:border-primary/50"
              />
              <button onClick={addTag} className="px-3 rounded-[12px] bg-muted/50 text-foreground spring-tap"><Plus className="w-4 h-4" /></button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                    #{t}
                    <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="w-2.5 h-2.5" /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Chapters with Bud assistance */}
            <div className="flex items-center justify-between mt-3">
              <label className="text-[12px] font-semibold text-foreground">Chapters</label>
              <div className="flex items-center gap-2">
                <button onClick={() => budAssist("generate_chapters")} disabled={!!budLoading || !audioUrl} className="flex items-center gap-1 text-[10px] font-semibold text-primary spring-tap disabled:opacity-50">
                  {budLoading === "generate_chapters" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Auto-generate
                </button>
                <button onClick={addChapter} className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground spring-tap">
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            </div>
            {chapters.length > 0 && (
              <div className="space-y-2 mt-1.5">
                {chapters.map((ch, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={ch.title}
                      onChange={(e) => updateChapter(i, "title", e.target.value)}
                      placeholder={`Chapter ${i + 1} title`}
                      className="flex-1 h-9 px-3 rounded-[10px] bg-muted/30 border border-border/40 text-[12px] text-foreground focus:outline-none focus:border-primary/50"
                    />
                    <input
                      type="number"
                      value={ch.start_seconds}
                      onChange={(e) => updateChapter(i, "start_seconds", e.target.value)}
                      placeholder="sec"
                      className="w-16 h-9 px-2 rounded-[10px] bg-muted/30 border border-border/40 text-[12px] text-foreground focus:outline-none"
                    />
                    <button onClick={() => removeChapter(i)} className="w-7 h-7 rounded-full bg-error/10 grid place-items-center spring-tap">
                      <Trash2 className="w-3 h-3 text-error" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Status & scheduling */}
            <label className="text-[12px] font-semibold text-foreground mt-3 block flex items-center gap-1"><Calendar className="w-3 h-3" /> Publish settings</label>
            <div className="flex gap-2 mt-1.5">
              {[
                { val: "published", label: "Publish now" },
                { val: "scheduled", label: "Schedule" },
                { val: "draft", label: "Save as draft" },
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setStatus(s.val)}
                  className={`flex-1 py-2 rounded-[12px] text-[11px] font-semibold spring-tap ${status === s.val ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {status === "scheduled" && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="w-full h-11 mt-2 px-3 rounded-[12px] bg-muted/30 border border-border/40 text-[12px] text-foreground focus:outline-none focus:border-primary/50"
              />
            )}

            {/* Bud transcription note */}
            {audioUrl && (
              <div className="mt-3 p-2.5 rounded-[12px] bg-primary/6 border border-primary/15 flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  After publishing, you can ask Bud to transcribe and summarize this episode from the episode list.
                </p>
              </div>
            )}

            {/* Save */}
            <button
              onClick={save}
              disabled={saving || uploading || !audioUrl || !title.trim()}
              className="w-full mt-5 py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Saving…" : status === "scheduled" ? "Schedule episode" : status === "draft" ? "Save draft" : "Publish episode"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function buildBudPrompt(task, ctx) {
  const base = "You are Bud, a helpful companion for a university student podcaster. ";
  switch (task) {
    case "generate_title":
      return base + "Suggest a compelling episode title and short description for a podcast episode. Podcast: " + (ctx.title || "Untitled") + ". Current description: " + (ctx.description || "None") + ". Return JSON with 'title' and 'description'.";
    case "generate_show_notes":
      return base + "Write detailed show notes for this podcast episode. Title: " + ctx.title + ". Description: " + (ctx.description || "None") + ". Include key topics, timestamps if known, and any references. Return JSON with 'content' field containing the show notes as markdown text.";
    case "generate_chapters":
      return base + "Based on the episode title and description, suggest 3-5 chapter segments with approximate start times (in seconds from 0). Title: " + ctx.title + ". Description: " + (ctx.description || "None") + ". Return JSON with 'chapters' array, each with 'title' and 'start_seconds'.";
    default:
      return base + "Help with: " + task;
  }
}