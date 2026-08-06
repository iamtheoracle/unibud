import React from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, Briefcase, Users, FlaskConical, Rocket, Mail,
  Star, MapPin, ChevronRight,
} from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { EASE } from "@/lib/motion/motionPresets";

const DIRECTORY_TYPES = {
  alumni: { icon: GraduationCap, label: "Alumni", color: "hsl(217 91% 60%)" },
  mentor: { icon: Star, label: "Mentor", color: "hsl(46 74% 55%)" },
  lecturer: { icon: GraduationCap, label: "Lecturer", color: "hsl(142 71% 45%)" },
  ta: { icon: Users, label: "Teaching Assistant", color: "hsl(200 80% 55%)" },
  researcher: { icon: FlaskConical, label: "Researcher", color: "hsl(280 65% 60%)" },
  founder: { icon: Rocket, label: "Founder", color: "hsl(24 90% 55%)" },
  recruiter: { icon: Briefcase, label: "Recruiter", color: "hsl(251 90% 67%)" },
};

/**
 * NetworkingDirectoryCard — professional networking directory card.
 * Used for finding alumni, mentors, lecturers, TAs, researchers, founders, recruiters.
 *
 * Props:
 *  - person: { name, image, type, title, company, university, faculty, department, bio, expertise: [], is_available, mutual_connections }
 *  - onConnect: () => void
 *  - onMessage: () => void
 *  - variant: "card" | "row"
 */
export default function NetworkingDirectoryCard({ person, onConnect, onMessage, variant = "card" }) {
  if (!person) return null;
  const config = DIRECTORY_TYPES[person.type] || DIRECTORY_TYPES.alumni;
  const Icon = config.icon;

  if (variant === "row") {
    return (
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={onConnect}
        className="flex items-center gap-2.5 p-2 rounded-[12px] crystal-card cursor-pointer spring-tap"
      >
        <PremiumAvatar src={person.image} alt={person.name} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[12px] font-bold text-foreground truncate">{person.name}</p>
            <Icon className="w-3 h-3 flex-shrink-0" strokeWidth={2.2} style={{ color: config.color }} />
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {person.title}{person.company ? ` · ${person.company}` : person.department ? ` · ${person.department}` : ""}
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="crystal-card rounded-[16px] overflow-hidden hover-elevate group"
    >
      {/* Type banner */}
      <div className="relative h-1.5" style={{ background: `linear-gradient(90deg, ${config.color}, transparent)` }} />

      <div className="p-3">
        {/* Avatar + type */}
        <div className="flex items-start gap-2.5">
          <div className="relative">
            <PremiumAvatar src={person.image} alt={person.name} size="md" />
            {person.is_available && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success border-2 border-background" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-[13px] font-bold text-foreground truncate">{person.name}</h4>
              <div
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: `${config.color}15` }}
              >
                <Icon className="w-2.5 h-2.5" strokeWidth={2.2} style={{ color: config.color }} />
                <span className="text-[8px] font-bold" style={{ color: config.color }}>{config.label}</span>
              </div>
            </div>

            {/* Title */}
            {person.title && (
              <p className="text-[11px] text-foreground font-medium mt-0.5">{person.title}</p>
            )}
            {(person.company || person.department) && (
              <p className="text-[10px] text-muted-foreground">
                {person.company || person.department}
              </p>
            )}

            {/* Campus */}
            {person.university && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
                <span className="text-[9px] text-muted-foreground truncate">
                  {person.university}{person.faculty ? ` · ${person.faculty}` : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {person.bio && (
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed line-clamp-2">{person.bio}</p>
        )}

        {/* Expertise */}
        {person.expertise?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {person.expertise.slice(0, 4).map((exp, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded-full glass text-[9px] text-muted-foreground">
                {typeof exp === "string" ? exp : exp.name || exp.title}
              </span>
            ))}
          </div>
        )}

        {/* Mutual connections */}
        {person.mutual_connections > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <Users className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
            <span className="text-[9px] text-muted-foreground">{person.mutual_connections} mutual connection{person.mutual_connections > 1 ? "s" : ""}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-2.5">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={onConnect}
            className="flex-1 h-8 rounded-full bg-primary text-[11px] font-bold text-primary-foreground spring-tap"
          >
            Connect
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMessage}
            className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap"
          >
            <Mail className="w-3.5 h-3.5 text-foreground" strokeWidth={2.2} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export { DIRECTORY_TYPES };