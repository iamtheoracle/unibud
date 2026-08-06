import React from "react";
import { motion } from "framer-motion";
import { Radio, Volume2, Play, Pause } from "lucide-react";
import { Image } from "@/components/ui/image";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * CampusRadioCard — card for a campus radio station or live DJ show.
 *
 * Props:
 *  - station: { name, description, image_url, is_live, now_playing: { title, artist, artwork_url }, host: { name, image, verified }, listeners_count, schedule }
 *  - onPlay: () => void
 *  - isPlaying: boolean
 *  - variant: "card" | "mini" | "row"
 */
export default function CampusRadioCard({ station, onPlay, isPlaying = false, variant = "card" }) {
  if (!station) return null;

  if (variant === "mini") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 p-2 rounded-[12px] crystal-card"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {station.now_playing?.artwork_url ? (
            <Image src={station.now_playing.artwork_url} alt="" fittingType="fill" className="w-full h-full" />
          ) : station.image_url ? (
            <Image src={station.image_url} alt="" fittingType="fill" className="w-full h-full" />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Radio className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
            </div>
          )}
          {station.is_live && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-destructive border-2 border-background"
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground truncate">{station.name}</p>
          <p className="text-[9px] text-muted-foreground truncate">
            {station.is_live ? station.now_playing?.title || "Live Now" : "Offline"}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onPlay}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center spring-tap flex-shrink-0",
            isPlaying ? "bg-primary" : "glass"
          )}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} fill="currentColor" />
          ) : (
            <Play className="w-3.5 h-3.5 text-foreground ml-0.5" strokeWidth={2.5} fill="currentColor" />
          )}
        </motion.button>
      </motion.div>
    );
  }

  if (variant === "row") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.97 }}
        onClick={onPlay}
        className="flex items-center gap-2.5 p-2 rounded-[12px] crystal-card cursor-pointer spring-tap"
      >
        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          {station.image_url && <Image src={station.image_url} alt="" fittingType="fill" className="w-full h-full" />}
          {station.is_live && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-destructive border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground truncate">{station.name}</p>
          <p className="text-[9px] text-muted-foreground truncate">
            {station.is_live ? `${station.listeners_count || 0} listening` : station.schedule || "Offline"}
          </p>
        </div>
        {station.is_live && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center spring-tap flex-shrink-0",
              isPlaying ? "bg-primary" : "glass"
            )}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 text-primary-foreground" strokeWidth={2.5} fill="currentColor" />
            ) : (
              <Play className="w-3 h-3 text-foreground ml-0.5" strokeWidth={2.5} fill="currentColor" />
            )}
          </motion.button>
        )}
      </motion.div>
    );
  }

  // Default card variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      className="crystal-card rounded-[16px] overflow-hidden cursor-pointer hover-elevate"
    >
      {/* Station artwork */}
      <div className="relative aspect-square overflow-hidden">
        {station.now_playing?.artwork_url || station.image_url ? (
          <Image src={station.now_playing?.artwork_url || station.image_url} alt={station.name} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
            <Radio className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Live indicator */}
        {station.is_live && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive text-white text-[8px] font-bold">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-white" />
            ON AIR
          </div>
        )}

        {/* Listeners */}
        {station.is_live && station.listeners_count != null && (
          <div className="absolute top-2 right-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full text-white text-[9px] font-bold glass">
            <Volume2 className="w-2.5 h-2.5" strokeWidth={2.2} />
            {station.listeners_count}
          </div>
        )}

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.button
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.1 }}
            onClick={(e) => { e.stopPropagation(); onPlay?.(); }}
            className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-black fill-black" strokeWidth={2.5} />
            ) : (
              <Play className="w-5 h-5 text-black fill-black ml-0.5" strokeWidth={2.5} />
            )}
          </motion.button>
        </div>

        {/* Equalizer bars when playing */}
        {isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-end gap-0.5 h-3">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ scaleY: [0.3, 1, 0.3] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                className="w-0.5 bg-white rounded-full origin-bottom"
                style={{ height: "100%" }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5">
        <h4 className="text-[12px] font-bold text-foreground truncate">{station.name}</h4>

        {/* Now playing */}
        {station.is_live && station.now_playing && (
          <p className="text-[10px] text-primary font-medium truncate mt-0.5">
            {station.now_playing.title}
            {station.now_playing.artist && ` · ${station.now_playing.artist}`}
          </p>
        )}

        {/* Host */}
        {station.host && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <PremiumAvatar src={station.host.image} alt={station.host.name} size="xs" verified={station.host.verified} />
            <span className="text-[9px] text-muted-foreground truncate">{station.host.name}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}