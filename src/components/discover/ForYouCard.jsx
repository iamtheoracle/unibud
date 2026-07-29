import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ForYouCard — vertical profile discovery card.
 * Photo with gradient overlay, name/age, location tag,
 * Follow + Message buttons. Matches the social discovery reference.
 */
export default function ForYouCard({ profile, onFollow, onMessage, index = 0 }) {
  const [following, setFollowing] = React.useState(false);

  const handleFollow = () => {
    setFollowing(!following);
    onFollow?.(profile);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.1 }}
      className="crystal-card overflow-hidden flex-shrink-0"
    >
      {/* Photo */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[18px]">
        <Image
          src={profile.image_url}
          alt={profile.name}
          fittingType="fill"
          className="w-full h-full"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)" }}
        />

        {/* Location tag */}
        {profile.location && (
          <div className="absolute top-3 left-3 glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-white" />
            <span className="text-[11px] font-medium text-white">{profile.location}</span>
          </div>
        )}

        {/* Name + age */}
        <div className="absolute bottom-3 left-4 right-4">
          <div className="flex items-baseline gap-1.5">
            <h3 className="font-heading font-bold text-[18px] text-white">{profile.name}</h3>
            {profile.age && (
              <span className="text-[15px] text-white/80 font-medium">{profile.age}</span>
            )}
          </div>
          {profile.bio && (
            <p className="text-[12px] text-white/60 mt-0.5 line-clamp-1">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-3">
        <button
          onClick={handleFollow}
          className={`flex-1 h-[40px] rounded-xl font-heading font-semibold text-[14px] spring-tap ${
            following
              ? "glass text-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {following ? "Following" : "Follow"}
        </button>
        <button
          onClick={() => onMessage?.(profile)}
          className="flex-1 h-[40px] rounded-xl font-heading font-semibold text-[14px] spring-tap glass text-foreground"
        >
          Message
        </button>
      </div>
    </motion.div>
  );
}