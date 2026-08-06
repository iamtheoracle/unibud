import React from "react";
import { motion } from "framer-motion";
import { Users, Clock, MapPin, ChevronRight } from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { InfoChips } from "@/components/shared/CompactInfoGrid";
import { EASE } from "@/lib/motion/motionPresets";
import { BUDDY_TYPE_LABELS } from "./SmartMatchCard";

/**
 * StudyBuddyRequestCard — premium card for a study buddy request.
 *
 * Shows: requester info, buddy type badge, title/description,
 * course/subject, schedule/location preferences, accepted count,
 * and an "Offer to Help" button.
 *
 * Props:
 *  - request: StudyBuddyRequest entity
 *  - onRespond: (request) => void
 *  - onOpen: (request) => void
 *  - delay: stagger
 */
export default function StudyBuddyRequestCard({ request, onRespond, onOpen, delay = 0 }) {
  if (!request) return null;
  const typeLabel = BUDDY_TYPE_LABELS[request.buddy_type] || "Study Buddy";
  const acceptedCount = request.accepted_by?.length || 0;
  const isFull = acceptedCount >= (request.max_participants || 1);
  const spotsLeft = (request.max_participants || 1) - acceptedCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onOpen?.(request)}
      className="crystal-card rounded-[20px] p-4 cursor-pointer hover-lift"
    >
      {/* Type badge + status */}
      <div className="flex items-center justify-between mb-3">
        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-[9px] font-bold uppercase tracking-wider text-primary">
          {typeLabel}
        </span>
        <span className={`text-[9px] font-bold uppercase tracking-wider ${isFull ? "text-muted-foreground" : "text-success"}`}>
          {isFull ? "Full" : request.status === "open" ? "Open" : "Matched"}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-heading font-bold text-[14px] text-foreground leading-tight mb-1 line-clamp-1">
        {request.title}
      </h3>

      {/* Description */}
      {request.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {request.description}
        </p>
      )}

      {/* Requester */}
      {request.requester && (
        <div className="flex items-center gap-2 mb-3">
          <PremiumAvatar src={request.requester.image} alt={request.requester.name} size="xs" />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-foreground truncate block">{request.requester.name}</span>
            <span className="text-[9px] text-muted-foreground">
              {[request.requester.department, request.requester.level].filter(Boolean).join(" · ")}
            </span>
          </div>
        </div>
      )}

      {/* Preferences */}
      <div className="space-y-1.5 mb-3">
        {request.course_code && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ChevronRight className="w-2.5 h-2.5" strokeWidth={2.5} />
            <span className="font-medium">{request.course_code}</span>
            {request.subject && <span>· {request.subject}</span>}
          </div>
        )}
        {request.schedule_preference && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Clock className="w-2.5 h-2.5" strokeWidth={2.2} />
            <span className="font-medium">{request.schedule_preference}</span>
          </div>
        )}
        {request.location_preference && (
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <MapPin className="w-2.5 h-2.5" strokeWidth={2.2} />
            <span className="font-medium">{request.location_preference}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {request.tags?.length > 0 && (
        <div className="mb-3">
          <InfoChips chips={request.tags.slice(0, 3)} />
        </div>
      )}

      {/* Footer: spots + respond */}
      <div className="flex items-center justify-between pt-2.5 card-separator">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
          <span className="text-[11px] font-semibold text-muted-foreground">
            {isFull ? `${acceptedCount} joined` : `${spotsLeft} spot${spotsLeft > 1 ? "s" : ""} left`}
          </span>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          disabled={isFull}
          onClick={(e) => { e.stopPropagation(); onRespond?.(request); }}
          className={`px-4 py-1.5 rounded-full text-[11px] font-bold spring-tap ${
            isFull ? "glass text-muted-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {isFull ? "Full" : "Offer to Help"}
        </motion.button>
      </div>
    </motion.div>
  );
}