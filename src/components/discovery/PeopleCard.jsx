import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

/**
 * PeopleCard — discovery card for a student profile.
 * Shows avatar, name, university/faculty, and verification badge.
 */
export default function PeopleCard({ person, index = 0 }) {
  const name = person.preferred_name || person.full_name || person.username || "Student";
  const subtitle = [person.university, person.faculty].filter(Boolean).join(" · ") || person.department || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: EASE }}
      className="flex-shrink-0 w-[160px]"
    >
      <Link to={`/profile/${person.id}`} className="block crystal-card hover-lift p-3.5 spring-tap edge-light overflow-hidden text-center">
        <div className="w-14 h-14 rounded-full overflow-hidden mb-2.5 bg-secondary/30 mx-auto">
          {person.avatar_url ? (
            <Image src={person.avatar_url} fittingType="fill" className="w-full h-full" />
          ) : (
            <div className="w-full h-full grid place-items-center text-[18px] font-bold text-muted-foreground/40">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-1">
          {person.is_verified && <BadgeCheck className="w-3 h-3 text-primary shrink-0" />}
          <p className="text-[12px] font-semibold text-foreground line-clamp-1">{name}</p>
        </div>
        {subtitle && <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{subtitle}</p>}
      </Link>
    </motion.div>
  );
}