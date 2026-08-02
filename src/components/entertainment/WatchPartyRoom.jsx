import React from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, Radio, Lock, Mic, Video } from "lucide-react";
import { Image } from "@/components/ui/image";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * WatchPartyRoom — card for a synchronized watch party room.
 *
 * Props:
 *  - party: { title, media: { title, thumbnail_url }, host: { name, image }, attendees: [{ name, image }], attendees_count, is_private, has_voice, has_video, is_live }
 *  - onJoin: () => void
 *  - variant: "card" | "row"
 */
export default function WatchPartyRoom({ party, onJoin, variant = "card" }) {
  if (!party) return null;

  const attendees = party.attendees || [];

  if (variant === "row") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.97 }}
        onClick={onJoin}
        className="flex items-center gap-2.5 p-2 rounded-[12px] crystal-card cursor-pointer spring-tap"
      >
        <div className="relative w-16 h-10 rounded-[8px] overflow-hidden flex-shrink-0">
          {party.media?.thumbnail_url && (
            <Image src={party.media.thumbnail_url} alt="" fittingType="fill" className="w-full h-full" />
          )}
          {party.is_live && (
            <div className="absolute top-0.5 left-0.5 flex items-center gap-0.5 px-1 py-0.5 rounded bg-destructive text-white text-[7px] font-bold">
              <Radio className="w-2 h-2" strokeWidth={2.5} />
              LIVE
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-foreground truncate">{party.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
              <Users className="w-2.5 h-2.5" strokeWidth={2.2} />
              {party.attendees_count || 0}
            </span>
            {party.has_voice && <Mic className="w-2.5 h-2.5 text-success" strokeWidth={2.2} />}
            {party.has_video && <Video className="w-2.5 h-2.5 text-information" strokeWidth={2.2} />}
            {party.is_private && <Lock className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />}
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onJoin?.(); }}
          className="px-3 h-7 rounded-full bg-primary text-[10px] font-bold text-primary-foreground spring-tap flex-shrink-0"
        >
          Join
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      whileTap={{ scale: 0.98 }}
      onClick={onJoin}
      className="crystal-card rounded-[16px] overflow-hidden cursor-pointer hover-elevate"
    >
      {/* Media thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        {party.media?.thumbnail_url && (
          <Image src={party.media.thumbnail_url} alt={party.media.title} fittingType="fill" className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Live badge */}
        {party.is_live && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive text-white text-[8px] font-bold">
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-white" />
            WATCHING
          </div>
        )}

        {/* Privacy badge */}
        {party.is_private && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
            <Lock className="w-2.5 h-2.5 text-white" strokeWidth={2.2} />
          </div>
        )}

        {/* Feature indicators */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          {party.has_voice && (
            <div className="w-5 h-5 rounded-full bg-success/80 backdrop-blur-md flex items-center justify-center">
              <Mic className="w-2.5 h-2.5 text-white" strokeWidth={2.2} />
            </div>
          )}
          {party.has_video && (
            <div className="w-5 h-5 rounded-full bg-information/80 backdrop-blur-md flex items-center justify-center">
              <Video className="w-2.5 h-2.5 text-white" strokeWidth={2.2} />
            </div>
          )}
        </div>

        {/* Attendee avatars */}
        {attendees.length > 0 && (
          <div className="absolute bottom-2 right-2 flex -space-x-1.5">
            {attendees.slice(0, 3).map((a, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-black/50 overflow-hidden">
                <PremiumAvatar src={a.image} alt={a.name} size="xs" />
              </div>
            ))}
            {party.attendees_count > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-black/50 bg-foreground flex items-center justify-center">
                <span className="text-[8px] font-bold text-background">+{party.attendees_count - 3}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5">
        <h4 className="text-[12px] font-bold text-foreground line-clamp-1">{party.title}</h4>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] text-muted-foreground truncate flex-1">{party.media?.title}</span>
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground flex-shrink-0">
            <MessageCircle className="w-2.5 h-2.5" strokeWidth={2.2} />
            {party.attendees_count || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
}