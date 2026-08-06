import React from "react";
import { motion } from "framer-motion";
import { Star, Shield, GraduationCap, BookOpen } from "lucide-react";

const ROLE_LABELS = { student: "Student", lecturer: "Lecturer", ta: "Teaching Assistant" };

export default function TutorCard({ tutor, index = 0, onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpen?.(tutor)}
      className="bg-card rounded-[18px] soft-shadow border border-border/40 overflow-hidden card-hover cursor-pointer"
    >
      <div className="p-3.5">
        <div className="flex items-start gap-2.5 mb-2.5">
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
            {tutor.tutor_image ? (
              <img src={tutor.tutor_image} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <span className="text-[14px] font-bold text-primary">{(tutor.tutor_name || "?").charAt(0)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-[13px] font-bold text-foreground truncate">{tutor.tutor_name}</p>
              {tutor.is_verified && <Shield className="w-3 h-3 text-success shrink-0" />}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="px-1.5 py-0.5 rounded-full bg-muted/40 text-[8px] font-medium text-muted-foreground flex items-center gap-0.5">
                <GraduationCap className="w-2 h-2" /> {ROLE_LABELS[tutor.role] || tutor.role}
              </span>
              {tutor.rating > 0 && (
                <span className="flex items-center gap-0.5 text-[9px] font-semibold text-foreground">
                  <Star className="w-2.5 h-2.5 fill-warning text-warning" /> {tutor.rating}
                </span>
              )}
            </div>
          </div>
        </div>

        {tutor.bio && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-2">{tutor.bio}</p>
        )}

        {tutor.subjects?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tutor.subjects.slice(0, 2).map((s) => (
              <span key={s} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-medium flex items-center gap-0.5">
                <BookOpen className="w-2 h-2" /> {s}
              </span>
            ))}
            {tutor.subjects.length > 2 && (
              <span className="px-1.5 py-0.5 rounded-full bg-muted/30 text-muted-foreground text-[8px] font-medium">+{tutor.subjects.length - 2}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-1.5 border-t border-border/20">
          <span className="text-[12px] font-bold text-primary">
            {tutor.is_free ? "Free" : `₦${(tutor.hourly_rate || 0).toLocaleString()}/hr`}
          </span>
          <span className="text-[9px] text-muted-foreground">{tutor.sessions_completed || 0} sessions</span>
        </div>
      </div>
    </motion.div>
  );
}