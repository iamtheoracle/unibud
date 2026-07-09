import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Heart, MessageCircle, Cake, GraduationCap, Trophy,
  Award, Rocket, Star, Users, BookOpen, Sparkles, Send,
  BadgeCheck, PartyPopper, ShoppingBag,
} from "lucide-react";

const milestoneIcons = {
  graduation_countdown: GraduationCap, birthday: Cake, award_winner: Award,
  competition_winner: Trophy, club_launch: Users, achievement: Star,
  deans_list: BookOpen, research_publication: BookOpen, startup_launch: Rocket,
  student_business: ShoppingBag, certification: BadgeCheck, leadership_role: Users,
};

const milestoneColors = {
  graduation_countdown: "hsl(var(--unibud-gold))", birthday: "hsl(var(--unibud-gold))",
  award_winner: "hsl(var(--unibud-gold))", competition_winner: "hsl(var(--unibud-purple))",
  club_launch: "hsl(var(--unibud-blue))", achievement: "hsl(var(--unibud-green))",
  deans_list: "hsl(var(--unibud-blue))", research_publication: "hsl(var(--unibud-green))",
  startup_launch: "hsl(var(--unibud-gold))", student_business: "hsl(var(--unibud-orange))",
  certification: "hsl(var(--unibud-purple))", leadership_role: "hsl(var(--unibud-blue))",
};

const milestoneLabels = {
  graduation_countdown: "Graduation Countdown", birthday: "Birthday",
  award_winner: "Award Winner", competition_winner: "Competition Winner",
  club_launch: "New Club Launch", achievement: "Achievement",
  deans_list: "Dean's List", research_publication: "Research Published",
  startup_launch: "Startup Launch", student_business: "Student Business",
  certification: "Certification", leadership_role: "Leadership Role",
};

const withAlpha = (hsl, a = 0.08) => hsl.replace("))", ") / " + a + ")");

export default function Celebrations() {
  const [commenting, setCommenting] = useState(null);
  const [commentText, setCommentText] = useState("");
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: celebrations } = useQuery({
    queryKey: ["celebrations"],
    queryFn: () => base44.entities.Celebration.list("-celebration_date", 30),
  });

  const toggleReact = async (celebration) => {
    await base44.entities.Celebration.update(celebration.id, {
      is_reacted: !celebration.is_reacted,
      reactions_count: celebration.is_reacted ? celebration.reactions_count - 1 : celebration.reactions_count + 1,
    });
    qc.invalidateQueries({ queryKey: ["celebrations"] });
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Celebrations</h1>
          <p className="text-[12px] text-muted-foreground">Celebrate your classmates</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
          <PartyPopper className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Banner */}
      <div className="px-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] p-4 premium-shadow border border-primary/20"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--card)))" }}>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-[12px] text-foreground font-medium leading-relaxed">
              Congratulate your classmates on their milestones with reactions, comments and celebration badges.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Celebrations feed */}
      <div className="px-4 space-y-3">
        {celebrations?.map((celebration, i) => (
          <CelebrationCard
            key={celebration.id}
            celebration={celebration}
            onReact={() => toggleReact(celebration)}
            isCommenting={commenting === celebration.id}
            onToggleComment={() => setCommenting(commenting === celebration.id ? null : celebration.id)}
            commentText={commentText}
            onCommentChange={setCommentText}
            delay={i * 0.05}
          />
        ))}
      </div>

      {(!celebrations || celebrations.length === 0) && (
        <div className="text-center py-12 px-4">
          <div className="w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-3">
            <PartyPopper className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
          </div>
          <p className="text-[13px] font-semibold text-foreground">No celebrations yet</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Milestones will appear here</p>
        </div>
      )}
    </div>
  );
}

function CelebrationCard({ celebration, onReact, isCommenting, onToggleComment, commentText, onCommentChange, delay }) {
  const Icon = milestoneIcons[celebration.milestone_type] || Star;
  const color = milestoneColors[celebration.milestone_type] || "hsl(var(--unibud-gold))";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover"
    >
      <div className="flex items-start gap-3">
        {celebration.image_url ? (
          <img src={celebration.image_url} alt="" className="w-12 h-12 rounded-[16px] object-cover flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: withAlpha(color) }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-heading font-semibold text-[13px] text-foreground">{celebration.student_name}</p>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ backgroundColor: withAlpha(color), color }}>
              {milestoneLabels[celebration.milestone_type] || celebration.milestone_type}
            </span>
          </div>
          <p className="font-heading font-bold text-[14px] text-foreground mt-1">{celebration.title}</p>
          {celebration.description && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{celebration.description}</p>}
          <div className="flex items-center gap-4 mt-3">
            <button onClick={onReact} className="flex items-center gap-1.5 text-[11px]">
              <Heart className={`w-4 h-4 ${celebration.is_reacted ? "fill-error text-error" : "text-muted-foreground"}`} />
              <span className="text-muted-foreground">{celebration.reactions_count || 0}</span>
            </button>
            <button onClick={onToggleComment} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              <span>{celebration.comments_count || 0}</span>
            </button>
          </div>
          {isCommenting && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 overflow-hidden">
              <div className="flex gap-2">
                <input type="text" value={commentText} onChange={e => onCommentChange(e.target.value)}
                  placeholder="Write a congratulation..."
                  className="flex-1 px-3.5 h-[38px] rounded-[12px] bg-muted/50 border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <button className="w-10 h-[38px] rounded-[12px] bg-primary text-primary-foreground flex items-center justify-center spring-tap">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}