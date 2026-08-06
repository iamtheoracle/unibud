import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, Bookmark, BookmarkCheck, Share2, UserPlus, Check } from "lucide-react";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

function getCardData(item, type) {
  switch (type) {
    case "community":
      return {
        title: item.name,
        subtitle: item.description || item.type,
        image: item.banner_url,
        to: `/community/${item.id}`,
        meta: item.members_count > 0 ? `${item.members_count} members` : "Be the first",
        badge: item.is_verified ? <BadgeCheck className="w-3 h-3 text-primary shrink-0" /> : null,
      };
    case "event":
      return {
        title: item.title,
        subtitle: item.location || item.organizer_name || "",
        image: item.banner_url,
        to: "/events",
        meta: item.date ? new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
        badge: null,
      };
    case "club":
      return {
        title: item.name,
        subtitle: item.category || "",
        image: item.banner_url,
        to: "/clubs",
        meta: item.members_count > 0 ? `${item.members_count} members` : "",
        badge: item.is_verified ? <BadgeCheck className="w-3 h-3 text-primary shrink-0" /> : null,
      };
    case "opportunity":
      return {
        title: item.title || item.name || "Opportunity",
        subtitle: item.company || item.organization || item.type || "",
        image: null,
        to: "/opportunities",
        meta: item.deadline ? `Due ${new Date(item.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "",
        badge: null,
      };
    case "scholarship":
      return {
        title: item.title || item.name || "Scholarship",
        subtitle: item.provider || item.organization || "",
        image: null,
        to: "/scholarships",
        meta: item.deadline ? `Due ${new Date(item.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "",
        badge: null,
      };
    case "listing":
      return {
        title: item.title || item.name || "Listing",
        subtitle: item.category || "",
        image: item.image_url,
        to: "/marketplace",
        meta: item.price !== undefined ? `₦${Number(item.price).toLocaleString()}` : "",
        badge: null,
      };
    default:
      return { title: "Untitled", subtitle: "", image: null, to: "/discover", meta: "", badge: null };
  }
}

export default function DiscoveryCard({ item, type, index = 0 }) {
  const data = getCardData(item, type);
  const [joined, setJoined] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handleJoin = (e) => {
    e.preventDefault();
    e.stopPropagation();
    hapticTap();
    setJoined(!joined);
    toast({ title: joined ? `Left ${item.name}` : `Joined ${item.name}` });
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    hapticTap();
    setSaved(!saved);
    toast({ title: saved ? "Removed from saved" : "Saved", description: data.title });
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    hapticTap();
    const url = window.location.origin + data.to;
    if (navigator.share) {
      navigator.share({ title: data.title, text: data.subtitle, url });
    } else {
      navigator.clipboard?.writeText(url);
      toast({ title: "Link copied" });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: EASE }}
      className="flex-shrink-0 w-[200px]"
    >
      <div className="crystal-card hover-lift edge-light overflow-hidden">
        <Link to={data.to} className="block p-3.5 spring-tap">
          {data.image && (
            <div className="w-full h-24 rounded-[12px] overflow-hidden mb-2.5 bg-secondary/30">
              <Image src={data.image} fittingType="fill" className="w-full h-full" />
            </div>
          )}
          <div className="flex items-start gap-1.5">
            {data.badge}
            <p className="text-[13px] font-semibold text-foreground leading-tight line-clamp-2">{data.title}</p>
          </div>
          {data.subtitle && <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{data.subtitle}</p>}
          {data.meta && <p className="text-[10px] text-muted-foreground/70 mt-1.5">{data.meta}</p>}
        </Link>

        {type === "community" && (
          <div className="px-3.5 pb-3 pt-1">
            <button
              onClick={handleJoin}
              className={`w-full py-1.5 rounded-full text-[11px] font-semibold spring-tap flex items-center justify-center gap-1 ${
                joined ? "bg-secondary text-secondary-foreground border border-border/40" : "bg-foreground text-background"
              }`}
            >
              {joined ? <><Check className="w-3 h-3" /> Joined</> : <><UserPlus className="w-3 h-3" /> Join</>}
            </button>
          </div>
        )}

        {type === "event" && (
          <div className="px-3.5 pb-3 pt-1 flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-1.5 rounded-full text-[11px] font-semibold spring-tap flex items-center justify-center gap-1 glass"
            >
              {saved ? <BookmarkCheck className="w-3 h-3 text-primary" /> : <Bookmark className="w-3 h-3" />}
              {saved ? "Saved" : "Save"}
            </button>
            <button
              onClick={handleShare}
              className="w-8 h-8 rounded-full grid place-items-center glass spring-tap"
              aria-label="Share"
            >
              <Share2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}