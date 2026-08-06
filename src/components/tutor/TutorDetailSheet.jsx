import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  X, Star, Shield, GraduationCap, BookOpen, Clock, Globe, MessageCircle, Calendar, Loader2,
} from "lucide-react";

const ROLE_LABELS = { student: "Student", lecturer: "Lecturer", ta: "Teaching Assistant" };

export default function TutorDetailSheet({ tutor, user, onBook, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messaging, setMessaging] = useState(false);

  const { data: reviews } = useQuery({
    queryKey: ["tutorReviews", tutor.id],
    queryFn: () => base44.entities.MarketplaceReview.filter({ listing_id: tutor.id, seller_id: tutor.tutor_id }, "-created_date", 20),
    enabled: !!tutor.id,
  });

  const isOwnProfile = tutor.tutor_id === user?.id;

  const handleMessage = async () => {
    if (!user?.id || !tutor.tutor_id || isOwnProfile) return;
    setMessaging(true);
    try {
      const existing = await base44.entities.Conversation.filter({ type: "direct" }, "-created_date", 100);
      const found = existing.find((c) =>
        c.participants?.some((p) => p.user_id === tutor.tutor_id) &&
        c.participants?.some((p) => p.user_id === user.id)
      );
      if (found) { navigate(`/messages/${found.id}`); onClose(); return; }
      const conv = await base44.entities.Conversation.create({
        type: "direct",
        category: "academic",
        title: `Tutoring: ${tutor.tutor_name}`,
        participants: [
          { user_id: user.id, name: user.full_name, role: "student" },
          { user_id: tutor.tutor_id, name: tutor.tutor_name, role: tutor.role === "lecturer" ? "lecturer" : "student" },
        ],
      });
      navigate(`/messages/${conv.id}`);
      onClose();
    } catch {
      toast({ title: "Couldn't start conversation", variant: "destructive" });
    }
    setMessaging(false);
  };

  return (
    <motion.div className="fixed inset-0 z-[2000] flex items-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50" style={{ backdropFilter: "blur(6px)" }} onClick={onClose} />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 360, damping: 36 }}
        className="relative w-full max-w-[520px] mx-auto rounded-t-[28px] glass-strong no-scrollbar"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-2 bg-border" />
        <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur flex items-center justify-center spring-tap">
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="p-5 pb-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {tutor.tutor_image ? (
                <img src={tutor.tutor_image} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <span className="text-[18px] font-bold text-primary">{(tutor.tutor_name || "?").charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-[17px] font-bold text-foreground truncate">{tutor.tutor_name}</h2>
                {tutor.is_verified && <Shield className="w-4 h-4 text-success shrink-0" />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2 py-0.5 rounded-full bg-muted/40 text-[9px] font-medium text-muted-foreground flex items-center gap-1">
                  <GraduationCap className="w-2.5 h-2.5" /> {ROLE_LABELS[tutor.role] || tutor.role}
                </span>
                {tutor.rating > 0 && (
                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-foreground">
                    <Star className="w-3 h-3 fill-warning text-warning" /> {tutor.rating} ({tutor.reviews_count || 0})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {tutor.bio && (
            <p className="text-[13px] text-foreground/80 leading-relaxed mb-3">{tutor.bio}</p>
          )}

          {/* Price */}
          <div className="glass-card p-3 rounded-[14px] mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Session Rate</p>
            <p className="text-[18px] font-bold text-primary">
              {tutor.is_free ? "Free" : `₦${(tutor.hourly_rate || 0).toLocaleString()}/hr`}
            </p>
            <p className="text-[10px] text-muted-foreground">{tutor.sessions_completed || 0} sessions completed</p>
          </div>

          {/* Subjects */}
          {tutor.subjects?.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Subjects
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tutor.subjects.map((s) => (
                  <span key={s} className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Course codes */}
          {tutor.course_codes?.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Courses</p>
              <div className="flex flex-wrap gap-1.5">
                {tutor.course_codes.map((c) => (
                  <span key={c} className="px-2 py-1 rounded-full bg-muted/30 text-muted-foreground text-[10px] font-mono">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {tutor.availability?.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Availability
              </p>
              <div className="space-y-1">
                {tutor.availability.map((slot, i) => (
                  <div key={i} className="glass-card px-3 py-1.5 rounded-[10px] flex items-center justify-between">
                    <span className="text-[11px] font-medium text-foreground">{slot.day}</span>
                    <span className="text-[11px] text-muted-foreground">{slot.start} – {slot.end}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          <div className="flex flex-wrap gap-3 mb-4 text-[11px] text-muted-foreground">
            {tutor.department && <span>📍 {tutor.department}</span>}
            {tutor.teaching_style && <span>💬 {tutor.teaching_style}</span>}
            {tutor.languages?.length > 0 && <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {tutor.languages.join(", ")}</span>}
          </div>

          {/* Reviews */}
          {(reviews || []).length > 0 && (
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Reviews</p>
              <div className="space-y-2">
                {(reviews || []).slice(0, 5).map((rev) => (
                  <div key={rev.id} className="glass-card p-2.5 rounded-[12px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-foreground">{rev.reviewer_name || "Anonymous"}</span>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-foreground">
                        <Star className="w-2.5 h-2.5 fill-warning text-warning" /> {rev.rating}
                      </span>
                    </div>
                    {rev.comment && <p className="text-[11px] text-muted-foreground leading-relaxed">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {!isOwnProfile ? (
            <div className="flex gap-2">
              <button
                onClick={() => onBook(tutor)}
                className="flex-1 py-3 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[13px] spring-tap flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" /> Book Session
              </button>
              <button
                onClick={handleMessage}
                disabled={messaging}
                className="flex-1 py-3 rounded-[14px] glass-card text-foreground font-semibold text-[13px] spring-tap flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {messaging ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />} Message
              </button>
            </div>
          ) : (
            <div className="glass-card p-3 rounded-[14px] text-center">
              <p className="text-[12px] text-muted-foreground">This is your tutor profile.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}