import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Star, BadgeCheck, Video, Phone, Calendar,
  BookOpen, Users, GraduationCap, Briefcase, Brain, Globe, Clock,
  Send, Loader2, CheckCircle2, AlertCircle, Heart, Award, Building,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const roleLabels = {
  senior_student: "Senior Student", alumni: "Alumni", lecturer: "Lecturer",
  researcher: "Researcher", industry_professional: "Industry Professional",
};

const roleColors = {
  senior_student: "hsl(var(--unibud-blue))", alumni: "hsl(var(--unibud-purple))",
  lecturer: "hsl(var(--unibud-gold))", researcher: "hsl(var(--unibud-green))",
  industry_professional: "hsl(var(--unibud-orange))",
};

const roleIcons = {
  senior_student: GraduationCap, alumni: Users, lecturer: BookOpen,
  researcher: Brain, industry_professional: Briefcase,
};

const REQUEST_TYPES = [
  { k: "mentorship", l: "Mentorship", icon: Heart },
  { k: "study_session", l: "Study Session", icon: BookOpen },
  { k: "career_guidance", l: "Career Advice", icon: Briefcase },
  { k: "project_meeting", l: "Project Meeting", icon: Briefcase },
  { k: "video_call", l: "Video Call", icon: Video },
  { k: "voice_call", l: "Voice Call", icon: Phone },
];

const withAlpha = (hsl, a = 0.08) => hsl.replace("))", ") / " + a + ")");

export default function MentorProfile() {
  const { mentorId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({
    request_type: "mentorship", message: "", scheduled_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [booked, setBooked] = useState(false);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: mentor } = useQuery({
    queryKey: ["mentor", mentorId],
    queryFn: () => base44.entities.Mentor.get(mentorId),
  });

  const { data: reviews } = useQuery({
    queryKey: ["mentorReviews", mentorId],
    queryFn: () => base44.entities.MentorReview.filter({ mentor_id: mentorId }, "-created_date", 10),
  });

  const { data: sessions } = useQuery({
    queryKey: ["mentorSessions", mentorId],
    queryFn: () => base44.entities.MentorshipRequest.filter({ mentor_id: mentorId }, "-created_date", 10),
  });

  // Check for timetable conflicts when date is selected
  const { data: exams } = useQuery({
    queryKey: ["userExams"],
    queryFn: () => base44.entities.Exam.filter({ status: "upcoming" }),
  });

  const checkConflicts = (selectedDate) => {
    if (!selectedDate) { setConflicts([]); return; }
    const found = [];
    const sel = new Date(selectedDate);
    (exams || []).forEach(exam => {
      if (exam.date) {
        const examDate = new Date(exam.date);
        if (examDate.toDateString() === sel.toDateString()) {
          found.push({ type: "exam", title: `${exam.course_code} - ${exam.title}`, time: exam.start_time });
        }
      }
    });
    setConflicts(found);
  };

  const handleBook = async () => {
    if (!booking.message.trim() || !booking.scheduled_date) return;
    setSubmitting(true);
    try {
      await base44.entities.MentorshipRequest.create({
        mentor_id: mentorId,
        mentor_name: mentor?.name,
        student_name: user?.preferred_name || user?.full_name || "Student",
        student_university: user?.university || "",
        student_department: user?.department || "",
        request_type: booking.request_type,
        message: booking.message.trim(),
        status: "pending",
        scheduled_date: new Date(booking.scheduled_date).toISOString(),
      });
      await base44.entities.Notification.create({
        title: `Session requested with ${mentor?.name}`,
        message: `You requested a ${booking.request_type.replace("_", " ")} for ${new Date(booking.scheduled_date).toLocaleDateString()}. We'll notify you when they confirm.`,
        type: "system",
        icon: "Calendar",
        link: "/mentorship",
      }).catch(() => {});
      setBooked(true);
      qc.invalidateQueries({ queryKey: ["mentorSessions", mentorId] });
    } catch (err) {}
    setSubmitting(false);
  };

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const RoleIcon = roleIcons[mentor.role] || Users;
  const color = roleColors[mentor.role] || "hsl(var(--unibud-gold))";

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <h1 className="font-heading font-bold text-[18px] text-foreground flex-1">Mentor Profile</h1>
      </div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 mb-4"
      >
        <div className="bg-card rounded-[20px] p-5 soft-shadow border border-border/40 text-center">
          {mentor.avatar_url ? (
            <img src={mentor.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3" loading="lazy" />
          ) : (
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: withAlpha(color) }}>
              <span className="font-heading font-bold text-[28px]" style={{ color }}>{mentor.name?.charAt(0) || "M"}</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-1 mb-1">
            <h2 className="font-heading font-bold text-[18px] text-foreground">{mentor.name}</h2>
            {mentor.is_verified && <BadgeCheck className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <RoleIcon className="w-3.5 h-3.5" style={{ color }} />
            <span className="text-[12px] text-muted-foreground">{roleLabels[mentor.role]}</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-primary fill-primary" />
              <span className="font-heading font-bold text-[14px] text-foreground">{mentor.rating?.toFixed(1) || "0.0"}</span>
              <span className="text-[10px] text-muted-foreground">({reviews?.length || 0})</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">{mentor.mentorship_count || 0} mentored</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bio */}
      {mentor.bio && (
        <div className="px-4 mb-4">
          <GlassCard variant="solid" className="p-4">
            <h3 className="font-heading font-semibold text-[13px] text-foreground mb-1.5">About</h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed">{mentor.bio}</p>
          </GlassCard>
        </div>
      )}

      {/* Details */}
      <div className="px-4 mb-4">
        <GlassCard variant="solid" className="p-4">
          <h3 className="font-heading font-semibold text-[13px] text-foreground mb-3">Details</h3>
          <div className="space-y-2.5">
            {mentor.current_position && (
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[12px] text-muted-foreground">Position:</span>
                <span className="text-[12px] font-medium text-foreground ml-auto">{mentor.current_position}</span>
              </div>
            )}
            {mentor.company && (
              <div className="flex items-center gap-2.5">
                <Building className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[12px] text-muted-foreground">Company:</span>
                <span className="text-[12px] font-medium text-foreground ml-auto">{mentor.company}</span>
              </div>
            )}
            {mentor.university && (
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[12px] text-muted-foreground">University:</span>
                <span className="text-[12px] font-medium text-foreground ml-auto truncate">{mentor.university}</span>
              </div>
            )}
            {mentor.department && (
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[12px] text-muted-foreground">Department:</span>
                <span className="text-[12px] font-medium text-foreground ml-auto">{mentor.department}</span>
              </div>
            )}
            {mentor.graduation_year && (
              <div className="flex items-center gap-2.5">
                <Award className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[12px] text-muted-foreground">Graduated:</span>
                <span className="text-[12px] font-medium text-foreground ml-auto">{mentor.graduation_year}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">Response:</span>
              <span className="text-[12px] font-medium text-foreground ml-auto">~{mentor.response_time_hours || 24}h</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[12px] text-muted-foreground">Availability:</span>
              <span className={`text-[12px] font-semibold ml-auto ${mentor.availability === "available" ? "text-success" : mentor.availability === "limited" ? "text-warning" : "text-muted-foreground"}`}>
                {mentor.availability === "available" ? "Available" : mentor.availability === "limited" ? "Limited" : "Unavailable"}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Expertise */}
      {mentor.expertise && mentor.expertise.length > 0 && (
        <div className="px-4 mb-4">
          <GlassCard variant="solid" className="p-4">
            <h3 className="font-heading font-semibold text-[13px] text-foreground mb-2">Expertise</h3>
            <div className="flex flex-wrap gap-1.5">
              {mentor.expertise.map(e => (
                <span key={e} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">{e}</span>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Languages */}
      {mentor.languages && mentor.languages.length > 0 && (
        <div className="px-4 mb-4">
          <GlassCard variant="solid" className="p-4">
            <h3 className="font-heading font-semibold text-[13px] text-foreground mb-2">Languages</h3>
            <div className="flex flex-wrap gap-1.5">
              {mentor.languages.map(l => (
                <span key={l} className="px-2.5 py-1 rounded-full bg-info/10 text-info text-[11px] font-semibold">{l}</span>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2">
          {REQUEST_TYPES.slice(0, 3).map(rt => (
            <button key={rt.k} onClick={() => { setBooking(b => ({ ...b, request_type: rt.k })); setShowBooking(true); }}
              className="flex flex-col items-center gap-1 p-3 rounded-[14px] bg-card border border-border/40 spring-tap card-hover">
              <rt.icon className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-semibold text-foreground">{rt.l}</span>
            </button>
          ))}
        </div>
        <button onClick={() => setShowBooking(true)}
          className="w-full mt-2 h-11 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 spring-tap">
          <Calendar className="w-4 h-4" /> Book a Session
        </button>
      </div>

      {/* Reviews */}
      {reviews && reviews.length > 0 && (
        <div className="px-4 mb-4">
          <h3 className="font-heading font-semibold text-[13px] text-foreground mb-2 px-1">Reviews</h3>
          <div className="space-y-2">
            {reviews.map((rev, i) => (
              <GlassCard key={rev.id} variant="solid" className="p-3.5" delay={i * 0.03}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-foreground">{rev.student_name}</span>
                </div>
                {rev.review_text && <p className="text-[11px] text-muted-foreground leading-relaxed">{rev.review_text}</p>}
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Session History */}
      {sessions && sessions.length > 0 && (
        <div className="px-4">
          <h3 className="font-heading font-semibold text-[13px] text-foreground mb-2 px-1">Recent Sessions</h3>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s, i) => (
              <GlassCard key={s.id} variant="solid" className="p-3 flex items-center gap-2" delay={i * 0.03}>
                <div className="w-8 h-8 rounded-[10px] bg-muted flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">{s.request_type.replace(/_/g, " ")}</p>
                  <p className="text-[9px] text-muted-foreground">{s.scheduled_date ? new Date(s.scheduled_date).toLocaleDateString() : "Pending"}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${s.status === "accepted" ? "bg-success/10 text-success" : s.status === "pending" ? "bg-warning/10 text-warning" : s.status === "completed" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  {s.status}
                </span>
              </GlassCard>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => { setShowBooking(false); setBooked(false); }}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-[24px] w-full max-w-md p-5 premium-shadow border border-border/40 max-h-[85vh] overflow-y-auto no-scrollbar"
          >
            {booked ? (
              <div className="text-center py-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                </motion.div>
                <h3 className="font-heading font-bold text-[16px] text-foreground mb-1">Request Sent!</h3>
                <p className="text-[12px] text-muted-foreground mb-4">{mentor.name} will be notified. You'll get a reminder before your session.</p>
                <button onClick={() => { setShowBooking(false); setBooked(false); }}
                  className="w-full h-11 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-heading font-bold text-[16px] text-foreground mb-4">Book with {mentor.name}</h3>

                {/* Request type */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {REQUEST_TYPES.map(rt => (
                    <button key={rt.k} onClick={() => setBooking(b => ({ ...b, request_type: rt.k }))}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-semibold spring-tap ${booking.request_type === rt.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      <rt.icon className="w-3 h-3" /> {rt.l}
                    </button>
                  ))}
                </div>

                {/* Date picker */}
                <div className="mb-3">
                  <label className="text-[11px] font-semibold text-foreground mb-1 block">Preferred Date & Time</label>
                  <input type="datetime-local" value={booking.scheduled_date}
                    onChange={e => { setBooking(b => ({ ...b, scheduled_date: e.target.value })); checkConflicts(e.target.value); }}
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-muted/50 border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>

                {/* Conflict check */}
                {conflicts.length > 0 && (
                  <div className="flex items-start gap-2.5 p-3 rounded-[12px] bg-error/5 border border-error/15 mb-3">
                    <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-semibold text-error mb-0.5">Scheduling Conflict</p>
                      {conflicts.map((c, i) => (
                        <p key={i} className="text-[10px] text-muted-foreground">{c.type === "exam" ? "Exam" : "Class"}: {c.title} at {c.time}</p>
                      ))}
                    </div>
                  </div>
                )}
                {booking.scheduled_date && conflicts.length === 0 && (
                  <div className="flex items-center gap-2 p-2.5 rounded-[12px] bg-success/5 border border-success/15 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <p className="text-[11px] text-success font-medium">No conflicts — you're clear!</p>
                  </div>
                )}

                {/* Message */}
                <textarea value={booking.message} onChange={e => setBooking(b => ({ ...b, message: e.target.value }))}
                  placeholder="What would you like help with?" rows={3}
                  className="w-full px-3.5 py-2.5 rounded-[12px] bg-muted/50 border border-border/40 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none mb-3" />

                <button onClick={handleBook} disabled={!booking.message.trim() || !booking.scheduled_date || submitting}
                  className="w-full h-11 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 spring-tap disabled:opacity-50">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Request</>}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}