import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { Image } from "@/components/ui/image";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: EASE }}
      className="flex-shrink-0 w-[200px]"
    >
      <Link to={data.to} className="block crystal-card hover-lift p-3.5 spring-tap edge-light overflow-hidden">
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
    </motion.div>
  );
}