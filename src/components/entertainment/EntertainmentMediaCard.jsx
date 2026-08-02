import React from "react";
import { motion } from "framer-motion";
import { Play, Clock, Eye, BadgeCheck, Bookmark, Share2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const MEDIA_TYPE_CONFIG = {
  movie: { label: "Movie", color: "hsl(0 84% 60%)" },
  series: { label: "Series", color: "hsl(280 65% 60%)" },
  documentary: { label: "Documentary", color: "hsl(200 80% 55%)" },
  anime: { label: "Anime", color: "hsl(330 75% 55%)" },
  podcast: { label: "Podcast", color: "hsl(160 70% 45%)" },
  music: { label: "Music", color: "hsl(142 71% 45%)" },
  video: { label: "Video", color: "hsl(217 91% 60%)" },
  live: { label: "Live", color: "hsl(0 84% 60%)" },
  campus_original: { label: "Campus Original", color: "hsl(46 74% 55%)" },
};

function formatDuration(seconds) {
  if (!seconds) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

/**
 * EntertainmentMediaCard — universal media card for movies, series, podcasts, videos, etc.
 *
 * Props:
 *  - media: { title, type, thumbnail_url, duration_seconds, views, creator: { name, image, verified }, is_live, live_viewers, accent_color }
 *  - onClick: () => void
 *  - onSave: () => void
 *  - onShare: () => void
 *  - isSaved: boolean
 *  - variant: "default" | "wide" | "compact"
 *  - showProgress: boolean — shows continue watching progress bar
 *  - progress: number (0-100)
 */
export default function EntertainmentMediaCard({
  media,
  onClick,
  onSave,
  onShare,
  isSaved = false,
  variant = "default",
  showProgress = false,
  progress = 0,
}) {
  if (!media) return null;
  const typeConfig = MEDIA_TYPE_CONFIG[media.type] || MEDIA_TYPE_CONFIG.video;
  const isLive = media.is_live;

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="flex items-center gap-2.5 cursor-pointer spring-tap"
      >
        <div className="relative w-24 h-14 rounded-[10px] overflow-hidden flex-shrink-0">
          {media.thumbnail_url && <Image src={media.thumbnail_url} alt={media.title} fittingType="fill" className="w-full h-full" />}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground line-clamp-2 leading-tight">{media.title}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{media.creator?.name}</p>
        </div>
      </motion.div>
    );
  }

  const isWide = variant === "wide";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="crystal-card rounded-[16px] overflow-hidden cursor-pointer hover-elevate group"
    >
      {/* Thumbnail */}
      <div className={cn("relative overflow-hidden", isWide ? "aspect-video" : "aspect-[4/5]")}>
        {media.thumbnail_url && (
          <Image src={media.thumbnail_url} alt={media.title} fittingType="fill" className="w-full h-full" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Type badge */}
        {!isLive && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-white backdrop-blur-md" style={{ background: `${typeConfig.color}cc` }}>
            {typeConfig.label}
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive text-white text-[8px] font-bold">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-white" />
            LIVE
          </div>
        )}

        {/* Duration / Live viewers */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-bold tabular-nums flex items-center gap-1">
          {isLive ? (
            <>
              <Eye className="w-2.5 h-2.5" strokeWidth={2.2} />
              {formatViews(media.live_viewers)}
            </>
          ) : (
            <>
              <Clock className="w-2.5 h-2.5" strokeWidth={2.2} />
              {formatDuration(media.duration_seconds)}
            </>
          )}
        </div>

        {/* Play button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
          >
            <Play className="w-4 h-4 text-black fill-black ml-0.5" />
          </motion.div>
        </div>

        {/* Quick actions */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {onSave && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => { e.stopPropagation(); onSave(); }}
              className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center spring-tap"
            >
              <Bookmark className={cn("w-3 h-3 text-white", isSaved && "fill-white")} strokeWidth={2.2} />
            </motion.button>
          )}
          {onShare && (
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={(e) => { e.stopPropagation(); onShare(); }}
              className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center spring-tap"
            >
              <Share2 className="w-3 h-3 text-white" strokeWidth={2.2} />
            </motion.button>
          )}
        </div>

        {/* Continue watching progress */}
        {showProgress && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5">
        <h4 className="text-[12px] font-bold text-foreground line-clamp-2 leading-tight">{media.title}</h4>

        {/* Creator */}
        {media.creator && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <PremiumAvatar src={media.creator.image} alt={media.creator.name} size="xs" verified={media.creator.verified} />
            <span className="text-[10px] text-muted-foreground truncate flex-1">{media.creator.name}</span>
          </div>
        )}

        {/* Views */}
        {!isLive && media.views != null && (
          <p className="text-[9px] text-muted-foreground mt-0.5">{formatViews(media.views)} views</p>
        )}
      </div>
    </motion.div>
  );
}

export { MEDIA_TYPE_CONFIG };