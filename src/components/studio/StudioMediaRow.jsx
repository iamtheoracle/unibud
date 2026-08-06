import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Heart, Eye, MessageCircle, Share2, Download, Trash2, Loader2, Check,
  AlertTriangle, Clock, Sparkles, Mic, Video, FileText, BookOpen,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";

const STATUS_BADGE = {
  published: { label: "Published", cls: "bg-success/15 text-success" },
  active: { label: "Published", cls: "bg-success/15 text-success" },
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
  scheduled: { label: "Scheduled", cls: "bg-information/15 text-information" },
  under_review: { label: "Under Review", cls: "bg-warning/15 text-warning" },
  removed: { label: "Removed", cls: "bg-error/15 text-error" },
};

const TYPE_CONFIG = {
  podcast: {
    entity: "PodcastEpisode", queryKey: "studioEpisodes", icon: Mic,
    title: (r) => r.title || "Untitled Episode",
    subtitle: (r) => r.podcast_title || "",
    thumb: (r) => r.cover_url,
    route: (r) => (r.podcast_id ? `/podcasts/${r.podcast_id}` : "/podcasts"),
    metrics: (r) => [
      { icon: Download, value: r.downloads_count || 0 },
      { icon: Heart, value: r.likes_count || 0 },
      { icon: MessageCircle, value: r.comments_count || 0 },
    ],
    status: (r) => r.status,
    hasTranscript: (r) => !!r.transcript,
    canTranscribe: (r) => !!r.audio_url,
    transcribe: async (r) => {
      const transcript = await base44.integrations.Core.TranscribeAudio({ audio_url: r.audio_url });
      await base44.entities.PodcastEpisode.update(r.id, { transcript });
    },
    transcriptLabel: "Transcript",
  },
  short: {
    entity: "ShortVideo", queryKey: "studioShorts", icon: Video,
    title: (r) => r.title || "Untitled Short",
    subtitle: (r) => r.category ? r.category.replace(/_/g, " ") : "",
    thumb: (r) => r.thumbnail_url,
    route: () => "/shorts",
    metrics: (r) => [
      { icon: Eye, value: r.views_count || 0 },
      { icon: Heart, value: r.likes_count || 0 },
      { icon: MessageCircle, value: r.comments_count || 0 },
    ],
    status: (r) => r.status,
    hasTranscript: (r) => r.captions && r.captions.length > 0,
    canTranscribe: () => false,
    transcriptLabel: "Captions",
  },
  article: {
    entity: "QuadPost", queryKey: "studioPosts", icon: FileText,
    title: (r) => (r.content || "").slice(0, 60) || "Untitled Post",
    subtitle: (r) => r.author_name || "",
    thumb: (r) => (r.media_urls && r.media_urls[0]) || null,
    route: () => "/quad",
    metrics: (r) => [
      { icon: Heart, value: r.likes_count || 0 },
      { icon: MessageCircle, value: r.comments_count || 0 },
      { icon: Share2, value: r.shares_count || 0 },
    ],
    status: (r) => r.draft_status,
  },
  guide: {
    entity: "AcademicFile", queryKey: "studioGuides", icon: BookOpen,
    title: (r) => r.title || "Untitled File",
    subtitle: (r) => r.subject || r.course_code || r.file_type || "",
    thumb: (r) => r.thumbnail_url,
    route: () => "/academics/files",
    metrics: () => [],
    status: null,
    hasTranscript: (r) => !!r.ai_summary,
    canTranscribe: () => false,
    transcriptLabel: "AI Summary",
  },
};

export default function StudioMediaRow({ item, type }) {
  const config = TYPE_CONFIG[type];
  const qc = useQueryClient();
  const { toast } = useToast();
  const [transcribing, setTranscribing] = useState(false);

  if (!config) return null;

  const handleDelete = async () => {
    if (!confirm("Delete this content? This can't be undone.")) return;
    try {
      await base44.entities[config.entity].delete(item.id);
      qc.invalidateQueries({ queryKey: [config.queryKey] });
      toast({ title: "Deleted" });
    } catch (err) {
      toast({ title: "Could not delete", description: err.message, variant: "destructive" });
    }
  };

  const handleTranscribe = async () => {
    setTranscribing(true);
    try {
      await config.transcribe(item);
      qc.invalidateQueries({ queryKey: [config.queryKey] });
      toast({ title: `${config.transcriptLabel} ready` });
    } catch (err) {
      toast({ title: "Transcription failed", description: err.message, variant: "destructive" });
    } finally {
      setTranscribing(false);
    }
  };

  const status = config.status ? config.status(item) : null;
  const badge = status ? STATUS_BADGE[status] || null : null;
  const hasMedia = config.hasTranscript ? config.hasTranscript(item) : false;
  const showTranscribe = config.canTranscribe && config.canTranscribe(item) && !hasMedia;

  return (
    <div className="glass-card p-3.5 flex items-start gap-3">
      <Link to={config.route(item)} className="shrink-0">
        <Thumb config={config} item={item} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1.5">
          <Link to={config.route(item)} className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground line-clamp-2">{config.title(item)}</p>
          </Link>
          {badge && <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold whitespace-nowrap ${badge.cls}`}>{badge.label}</span>}
        </div>
        {config.subtitle(item) && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{config.subtitle(item)}</p>}

        <div className="flex items-center gap-3 mt-2">
          {config.metrics(item).map((m, i) => (
            <span key={i} className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <m.icon className="w-3 h-3" /> {m.value}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-2">
          {hasMedia && (
            <span className="flex items-center gap-1 text-[10px] text-success">
              <Check className="w-3 h-3" /> {config.transcriptLabel}
            </span>
          )}
          {showTranscribe && (
            <button onClick={handleTranscribe} disabled={transcribing} className="flex items-center gap-1 text-[10px] text-primary spring-tap">
              {transcribing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} Transcribe
            </button>
          )}
          {item.moderation_flags?.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-warning">
              <AlertTriangle className="w-3 h-3" /> {item.moderation_flags.length} flag{item.moderation_flags.length > 1 ? "s" : ""}
            </span>
          )}
          {item.scheduled_at && (
            <span className="flex items-center gap-1 text-[10px] text-information">
              <Clock className="w-3 h-3" /> {new Date(item.scheduled_at).toLocaleDateString()}
            </span>
          )}
          <button onClick={handleDelete} className="ml-auto w-7 h-7 rounded-full bg-error/10 flex items-center justify-center spring-tap">
            <Trash2 className="w-3.5 h-3.5 text-error" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Thumb({ config, item }) {
  const img = config.thumb(item);
  const Icon = config.icon;
  if (img) {
    return (
      <div className="w-12 h-12 rounded-[12px] overflow-hidden shrink-0">
        <Image src={img} alt="" className="w-full h-full" />
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-[12px] glass flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-muted-foreground" />
    </div>
  );
}