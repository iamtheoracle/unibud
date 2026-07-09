import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Search, Star, MessageCircle, Video, Phone, Calendar,
  BookOpen, Users, GraduationCap, Briefcase, BadgeCheck, Sparkles,
  ChevronRight, Clock, Globe, Heart, Send, Loader2, Brain,
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

const FILTERS = ["All", "Senior Students", "Alumni", "Lecturers", "Industry"];

const withAlpha = (hsl, a = 0.08) => hsl.replace("))", ") / " + a + ")");

export default function Mentorship() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [requestMentor, setRequestMentor] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestType, setRequestType] = useState("mentorship");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: mentors, isLoading } = useQuery({
    queryKey: ["mentors"],
    queryFn: () => base44.entities.Mentor.list("-rating", 30),
  });

  const { data: budRecs } = useQuery({
    queryKey: ["budMentorRecs"],
    queryFn: () =>
      base44.functions.invoke("universityConnectSync", { action: "get_mentor_recommendations" }),
    staleTime: 300000,
  });

  let filtered = mentors || [];
  if (filter === "Senior Students") filtered = filtered.filter(m => m.role === "senior_student");
  else if (filter === "Alumni") filtered = filtered.filter(m => m.role === "alumni");
  else if (filter === "Lecturers") filtered = filtered.filter(m => m.role === "lecturer");
  else if (filter === "Industry") filtered = filtered.filter(m => m.role === "industry_professional");

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.expertise?.some(e => e.toLowerCase().includes(q)) ||
      m.department?.toLowerCase().includes(q) ||
      m.bio?.toLowerCase().includes(q)
    );
  }

  const recommendedSpecs = budRecs?.data?.recommendations?.recommended_specializations || [];
  const topRecommendations = recommendedSpecs.length > 0
    ? filtered.filter(m => m.expertise?.some(e => recommendedSpecs.some(r => e.toLowerCase().includes(r.toLowerCase())))).slice(0, 3)
    : filtered.slice(0, 3);

  const handleSubmitRequest = async () => {
    if (!requestMentor || !requestMessage.trim()) return;
    setSubmitting(true);
    try {
      await base44.entities.MentorshipRequest.create({
        mentor_id: requestMentor.id,
        mentor_name: requestMentor.name,
        student_name: user?.full_name || "Student",
        student_university: user?.university || "",
        student_department: user?.department || "",
        request_type: requestType,
        message: requestMessage.trim(),
        status: "pending",
      });
      await base44.entities.Notification.create({
        title: `Mentorship request sent to ${requestMentor.name}`,
        message: `You requested ${requestType.replace("_", " ")}. We'll notify you when they respond.`,
        type: "system",
        icon: "Users",
        link: "/mentorship",
      }).catch(() => {});
      setRequestMentor(null);
      setRequestMessage("");
      qc.invalidateQueries({ queryKey: ["mentorshipRequests"] });
    } catch (err) {}
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Mentorship</h1>
          <p className="text-[12px] text-muted-foreground">Find your guide</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
          <Users className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, expertise, department..."
            className="w-full pl-10 pr-4 h-[44px] rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow" />
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap ${filter === f ? "bg-foreground text-background soft-shadow" : "bg-card border border-border/40 text-muted-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Bud Recommendations */}
      {!search && filter === "All" && topRecommendations.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-2.5 px-1">
            <Brain className="w-4 h-4 text-primary" />
            <h3 className="font-heading font-bold text-[14px] text-foreground">Bud's Recommendations</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {topRecommendations.map((mentor, i) => (
              <MentorMiniCard key={mentor.id} mentor={mentor} onConnect={() => setRequestMentor(mentor)} delay={i * 0.05} />
            ))}
          </div>
        </div>
      )}

      {/* Mentors List */}
      <div className="px-4 space-y-3">
        {isLoading ? (
          [1,2,3,4].map(i => <div key={i} className="h-[120px] rounded-[20px] shimmer" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No mentors found</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Try a different search or filter</p>
          </div>
        ) : (
          filtered.map((mentor, i) => (
            <MentorCard key={mentor.id} mentor={mentor} onConnect={() => setRequestMentor(mentor)} delay={i * 0.04} />
          ))
        )}
      </div>

      {/* Request Modal */}
      {requestMentor && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
          onClick={() => setRequestMentor(null)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-[24px] w-full max-w-md p-5 premium-shadow border border-border/40"
          >
            <div className="flex items-center gap-3 mb-4">
              {requestMentor.avatar_url ? (
                <img src={requestMentor.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-heading font-bold text-primary">{requestMentor.name?.charAt(0) || "M"}</span>
                </div>
              )}
              <div>
                <p className="font-heading font-bold text-[15px] text-foreground">{requestMentor.name}</p>
                <p className="text-[11px] text-muted-foreground">{roleLabels[requestMentor.role]}</p>
              </div>
            </div>

            {/* Request type */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {[
                { k: "mentorship", l: "Mentor", icon: Users },
                { k: "study_session", l: "Study", icon: BookOpen },
                { k: "career_guidance", l: "Career", icon: Briefcase },
                { k: "video_call", l: "Video", icon: Video },
                { k: "chat", l: "Chat", icon: MessageCircle },
              ].map(t => (
                <button key={t.k} onClick={() => setRequestType(t.k)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-semibold spring-tap ${requestType === t.k ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <t.icon className="w-3 h-3" /> {t.l}
                </button>
              ))}
            </div>

            <textarea value={requestMessage} onChange={e => setRequestMessage(e.target.value)}
              placeholder="Introduce yourself and explain what you'd like help with..."
              rows={3}
              className="w-full px-3.5 py-3 rounded-[14px] bg-muted/50 border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />

            <div className="flex gap-2 mt-4">
              <button onClick={() => setRequestMentor(null)} className="flex-1 h-11 rounded-[14px] bg-muted text-muted-foreground text-[13px] font-semibold spring-tap">
                Cancel
              </button>
              <button onClick={handleSubmitRequest} disabled={!requestMessage.trim() || submitting}
                className="flex-1 h-11 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-1.5 spring-tap disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send Request</>}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

function MentorMiniCard({ mentor, onConnect, delay }) {
  const RoleIcon = roleIcons[mentor.role] || Users;
  const color = roleColors[mentor.role] || "hsl(var(--unibud-gold))";
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}
      className="flex-shrink-0 w-[200px] bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 card-hover"
    >
      <div className="flex items-center gap-2.5 mb-2">
        {mentor.avatar_url ? (
          <img src={mentor.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: withAlpha(color) }}>
            <span className="font-heading font-bold text-[14px]" style={{ color }}>{mentor.name?.charAt(0) || "M"}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-heading font-semibold text-[12px] text-foreground truncate">{mentor.name}</p>
            {mentor.is_verified && <BadgeCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-0.5">
            <RoleIcon className="w-3 h-3" style={{ color }} />
            <span className="text-[9px] text-muted-foreground">{roleLabels[mentor.role]}</span>
          </div>
        </div>
      </div>
      {mentor.expertise && mentor.expertise.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {mentor.expertise.slice(0, 2).map(e => (
            <span key={e} className="px-1.5 py-0.5 rounded-full bg-primary/8 text-primary text-[8px] font-semibold">{e}</span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="flex items-center gap-0.5">
          <Star className="w-3 h-3 text-primary fill-primary" />
          <span className="text-[10px] font-semibold text-foreground">{mentor.rating?.toFixed(1) || "0.0"}</span>
        </div>
        <span className="text-[9px] text-muted-foreground">{mentor.mentorship_count || 0} mentees</span>
      </div>
      <button onClick={onConnect} className="w-full py-2 rounded-[10px] bg-primary text-primary-foreground text-[10px] font-semibold spring-tap">
        Connect
      </button>
    </motion.div>
  );
}

function MentorCard({ mentor, onConnect, delay }) {
  const RoleIcon = roleIcons[mentor.role] || Users;
  const color = roleColors[mentor.role] || "hsl(var(--unibud-gold))";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover"
    >
      <div className="flex items-start gap-3">
        {mentor.avatar_url ? (
          <img src={mentor.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: withAlpha(color) }}>
            <span className="font-heading font-bold text-[16px]" style={{ color }}>{mentor.name?.charAt(0) || "M"}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="font-heading font-semibold text-[14px] text-foreground">{mentor.name}</p>
            {mentor.is_verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <RoleIcon className="w-3 h-3" style={{ color }} />
            <span className="text-[10px] text-muted-foreground">{roleLabels[mentor.role]}</span>
            {mentor.current_position && <span className="text-[10px] text-muted-foreground">· {mentor.current_position}</span>}
          </div>
          {mentor.bio && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{mentor.bio}</p>}
          {mentor.expertise && mentor.expertise.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {mentor.expertise.slice(0, 3).map(e => (
                <span key={e} className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[9px] font-semibold">{e}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3.5 h-3.5 text-primary fill-primary" />
              <span className="text-[11px] font-semibold text-foreground">{mentor.rating?.toFixed(1) || "0.0"}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{mentor.mentorship_count || 0} mentored</span>
            <span className={`text-[10px] font-semibold ${mentor.availability === "available" ? "text-success" : mentor.availability === "limited" ? "text-warning" : "text-muted-foreground"}`}>
              {mentor.availability === "available" ? "● Available" : mentor.availability === "limited" ? "● Limited" : "● Unavailable"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/30">
        <button onClick={onConnect} className="flex-1 py-2 rounded-[12px] bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">
          Connect
        </button>
        <button onClick={onConnect} className="w-9 h-9 rounded-[12px] bg-muted flex items-center justify-center spring-tap" aria-label="Chat">
          <MessageCircle className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={onConnect} className="w-9 h-9 rounded-[12px] bg-muted flex items-center justify-center spring-tap" aria-label="Video call">
          <Video className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
}