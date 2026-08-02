import React from "react";
import { motion } from "framer-motion";
import { MapPin, BookOpen, Award, ChevronRight } from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { InfoChips } from "@/components/shared/CompactInfoGrid";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * ConnectProfileCard — premium discoverable student profile card.
 *
 * Shows: avatar with verification, name, faculty/department/level,
 * skills/interests chips, shared attributes, and a connect button.
 *
 * Props:
 *  - student: { name, image, faculty, department, level, is_verified, skills, interests, university }
 *  - sharedAttributes: string[] (e.g. "Same Faculty", "Shared Course: CSC 201")
 *  - onConnect: () => void
 *  - onOpen: () => void
 *  - delay: stagger
 *  - variant: "default" | "compact"
 */
export default function ConnectProfileCard({
  student,
  sharedAttributes = [],
  onConnect,
  onOpen,
  delay = 0,
  variant = "default",
}) {
  if (!student) return null;
  const chips = (student.interests || student.skills || []).slice(0, variant === "compact" ? 2 : 4);

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.4, ease: EASE }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpen}
        className="flex-shrink-0 w-44 crystal-card rounded-[18px] p-3.5 cursor-pointer hover-lift"
      >
        <div className="flex flex-col items-center text-center">
          <PremiumAvatar src={student.image} alt={student.name} size="lg" verified={student.is_verified} />
          <h4 className="font-bold text-[12px] text-foreground mt-2 truncate w-full">{student.name}</h4>
          <p className="text-[9px] text-muted-foreground truncate w-full">{student.department || student.faculty}</p>
          {sharedAttributes.length > 0 && (
            <span className="mt-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-[8px] font-bold text-primary">
              {sharedAttributes[0]}
            </span>
          )}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); onConnect?.(); }}
            className="mt-2 w-full h-7 rounded-full bg-primary text-[10px] font-bold text-primary-foreground spring-tap"
          >
            Connect
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      whileTap={{ scale: 0.99 }}
      onClick={onOpen}
      className="crystal-card rounded-[20px] p-4 cursor-pointer hover-lift"
    >
      <div className="flex items-start gap-3">
        <PremiumAvatar src={student.image} alt={student.name} size="md" verified={student.is_verified} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-heading font-bold text-[14px] text-foreground truncate">{student.name}</h3>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {[student.faculty, student.department, student.level].filter(Boolean).join(" · ")}
          </p>
          {student.university && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
              <span className="text-[10px] text-muted-foreground truncate">{student.university}</span>
            </div>
          )}
        </div>
      </div>

      {/* Shared attributes */}
      {sharedAttributes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {sharedAttributes.map((attr, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-[9px] font-bold text-primary">
              {attr}
            </span>
          ))}
        </div>
      )}

      {/* Interests/skills */}
      {chips.length > 0 && (
        <div className="mt-2.5">
          <InfoChips chips={chips} />
        </div>
      )}

      {/* Connect button */}
      <div className="flex items-center gap-2 mt-3 pt-3 card-separator">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); onConnect?.(); }}
          className="flex-1 h-9 rounded-full bg-primary text-[12px] font-bold text-primary-foreground spring-tap"
        >
          Connect
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); onOpen?.(); }}
          className="h-9 px-4 rounded-full glass text-[12px] font-bold text-foreground spring-tap"
        >
          View
        </motion.button>
      </div>
    </motion.div>
  );
}