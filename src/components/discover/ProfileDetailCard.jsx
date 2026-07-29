import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MoreHorizontal, MapPin, MessageCircle } from "lucide-react";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

const INTEREST_ICONS = {
  Movies: "🎬",
  Cooking: "🍳",
  Reading: "📚",
  Fitness: "💪",
  Travel: "✈️",
  Music: "🎵",
  Gaming: "🎮",
  Art: "🎨",
  Tech: "💻",
  Sports: "⚽",
};

/**
 * ProfileDetailCard — full user profile view.
 * Large avatar, name, location, stats (Followers/Mutuals/Age),
 * interest pills, media grid, and "Send a message" CTA.
 * Matches the social discovery profile reference.
 */
export default function ProfileDetailCard({ profile, onBack, onMessage }) {
  const interests = profile.interests || ["Movies", "Cooking", "Reading", "Fitness", "Travel"];
  const media = profile.media_urls || [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&q=80",
    "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200&q=80",
    "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=200&q=80",
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=200&q=80",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-[3vh] pb-2 safe-area-pt">
        <button onClick={onBack} className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <button className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
          <MoreHorizontal className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Profile section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex flex-col items-center px-5 py-4"
      >
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-4 ring-offset-background mb-3">
          <Image
            src={profile.image_url || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80"}
            alt={profile.name}
            fittingType="fill"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="font-heading font-bold text-[22px] text-foreground">{profile.name}</h1>
        {profile.location && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[13px] text-muted-foreground">{profile.location}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-8 mt-5">
          <Stat label="Followers" value={profile.followers || "1,130"} />
          <Stat label="Mutuals" value={profile.mutuals || "6"} />
          {profile.age && <Stat label="Age" value={profile.age} />}
        </div>

        {/* Interests */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {interests.map((interest) => (
            <div
              key={interest}
              className="glass rounded-full px-3.5 py-1.5 flex items-center gap-1.5"
            >
              <span className="text-[13px]">{INTEREST_ICONS[interest] || "⭐"}</span>
              <span className="text-[12px] font-medium text-foreground">{interest}</span>
            </div>
          ))}
        </div>

        {/* Media grid */}
        <div className="grid grid-cols-2 gap-2 mt-5 w-full max-w-[280px]">
          {media.map((url, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden glass">
              <Image src={url} alt="" fittingType="fill" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <div className="px-5 py-4 pb-8 safe-area-pb mt-auto">
        <button
          onClick={() => onMessage?.(profile)}
          className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-bold text-[16px] spring-tap ice-glow flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          Send a message
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-heading font-bold text-[18px] text-foreground">{value}</span>
      <span className="text-[11px] text-muted-foreground mt-0.5">{label}</span>
    </div>
  );
}