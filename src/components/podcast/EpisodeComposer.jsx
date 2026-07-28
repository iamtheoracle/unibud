import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Upload, FileAudio } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { queryClientInstance } from "@/lib/query-client";

/**
 * EpisodeComposer — a creator uploads an audio file as a new episode.
 */
export default function EpisodeComposer({ open, onClose, podcast, user }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState(1);
  const [seasonNumber, setSeasonNumber] = useState(1);
  const [audioUrl, setAudioUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAudio(e) {
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
  }

  async function save() {
    if (!title.trim() || !audioUrl) return toast({ title: "Title and audio file required", variant: "destructive" });
    setSaving(true);
    try {
      await base44.entities.PodcastEpisode.create({
        podcast_id: podcast.id,
        podcast_title: podcast.title,
        cover_url: podcast.cover_url || "",
        title: title.trim(),
        description: description.trim(),
        audio_url: audioUrl,
        episode_number: Number(episodeNumber) || 1,
        season_number: Number(seasonNumber) || 1,
        host_id: user?.id || "",
        status: "published",
        published_at: new Date().toISOString(),
      });
      await queryClientInstance.invalidateQueries({ queryKey: ["episodes", podcast.id] });
      toast({ title: "Episode published" });
      onClose();
      setTitle(""); setDescription(""); setEpisodeNumber(1); setSeasonNumber(1); setAudioUrl("");
    } catch (err) {
      toast({ title: "Could not publish", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && podcast && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4" onClick={onClose}>
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[28px] bg-card soft-shadow border border-border/40 p-5 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[16px] text-foreground">New episode · {podcast.title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <label className="text-[12px] font-semibold text-foreground">Episode title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Episode 1 — Welcome"
              className="w-full h-12 mt-1.5 px-4 rounded-[16px] bg-muted/30 border border-border/40 text-[14px] text-foreground focus:outline-none focus:border-primary/50" />

            <label className="text-[12px] font-semibold text-foreground mt-3 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              className="w-full mt-1.5 p-3 rounded-[14px] bg-muted/30 border border-border/40 text-[13px] text-foreground focus:outline-none focus:border-primary/50 resize-y" />

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

            <label className="text-[12px] font-semibold text-foreground mt-3 block">Audio file (mp3, m4a, wav…)</label>
            {audioUrl ? (
              <div className="flex items-center gap-2 mt-1.5 p-3 rounded-[14px] bg-success/8 border border-success/15">
                <FileAudio className="w-4 h-4 text-success" />
                <span className="text-[12px] text-foreground truncate flex-1">{audioUrl.split("/").pop()}</span>
                <button onClick={() => setAudioUrl("")} className="text-[11px] text-error font-semibold">Remove</button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 mt-1.5 py-4 rounded-[14px] border-2 border-dashed border-border/50 text-[12px] text-muted-foreground spring-tap cursor-pointer">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading…" : "Upload audio"}
                <input type="file" accept="audio/*" className="hidden" onChange={handleAudio} />
              </label>
            )}

            <button onClick={save} disabled={saving || uploading || !audioUrl}
              className="w-full mt-5 py-3.5 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] spring-tap disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Publishing…" : "Publish episode"}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}