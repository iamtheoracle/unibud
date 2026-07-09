import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Trophy, Users, Calendar, ArrowLeft, Search, Flame,
  TrendingUp, Globe, Sparkles, ChevronRight, Crown, Award,
  Code, BookOpen, Camera, Music, Lightbulb, Rocket, Dumbbell,
  Heart, Brain, Target, Zap, UserPlus, CheckCircle2, Clock,
} from "lucide-react";
import { Link } from "react-router-dom";

const TYPE_FILTERS = ["All", "Academic", "Coding", "Reading", "Photography", "Dance", "Innovation", "Startup", "Sports", "Quiz", "Fitness", "Hackathon"];

const typeIcons = {
  academic: BookOpen, coding: Code, reading: BookOpen, photography: Camera,
  dance: Music, innovation: Lightbulb, startup: Rocket, sports: Dumbbell,
  volunteer: Heart, quiz: Brain, fitness: Dumbbell, debate: Brain,
  hackathon: Code, music: Music,
};

const typeColors = {
  academic: "hsl(var(--unibud-blue))", coding: "hsl(var(--unibud-purple))",
  reading: "hsl(var(--unibud-green))", photography: "hsl(var(--unibud-orange))",
  dance: "hsl(var(--unibud-gold))", innovation: "hsl(var(--unibud-purple))",
  startup: "hsl(var(--unibud-gold))", sports: "hsl(var(--unibud-red))",
  volunteer: "hsl(var(--unibud-green))", quiz: "hsl(var(--unibud-blue))",
  fitness: "hsl(var(--unibud-red))", hackathon: "hsl(var(--unibud-purple))",
  music: "hsl(var(--unibud-gold))",
};

const withAlpha = (hsl, a = 0.08) => hsl.replace("))", ") / " + a + ")");

export default function Challenges() {
  const [activeType, setActiveType] = useState("All");
  const [scope, setScope] = useState("campus");
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: challenges } = useQuery({
    queryKey: ["challenges", scope],
    queryFn: () => base44.entities.Challenge.list("-created_date", 50),
  });

  const filtered = activeType === "All"
    ? challenges || []
    : challenges?.filter(c => c.type === activeType.toLowerCase()) || [];

  const activeChallenges = filtered.filter(c => c.status === "active");
  const upcomingChallenges = filtered.filter(c => c.status === "upcoming");

  const toggleJoin = async (challenge) => {
    await base44.entities.Challenge.update(challenge.id, {
      is_joined: !challenge.is_joined,
      participants_count: challenge.is_joined ? challenge.participants_count - 1 : challenge.participants_count + 1,
    });
    qc.invalidateQueries({ queryKey: ["challenges"] });
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Challenges</h1>
          <p className="text-[12px] text-muted-foreground">Compete. Learn. Win.</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
          <Trophy className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Scope tabs */}
      <div className="px-4 mb-3 flex gap-1.5 p-1 bg-muted/60 rounded-[16px]">
        {[
          { key: "campus", label: "Campus", icon: Users },
          { key: "global", label: "Global", icon: Globe },
        ].map(s => (
          <button key={s.key} onClick={() => setScope(s.key)}
            className={`flex-1 py-2.5 rounded-[12px] text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 ${scope === s.key ? "bg-card text-foreground soft-shadow" : "text-muted-foreground"}`}>
            <s.icon className="w-3.5 h-3.5" /> {s.label}
          </button>
        ))}
      </div>

      {/* Featured challenge */}
      {activeChallenges[0] && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 mb-4"
        >
          <FeaturedChallenge challenge={activeChallenges[0]} onJoin={() => toggleJoin(activeChallenges[0])} />
        </motion.div>
      )}

      {/* Type filters */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {TYPE_FILTERS.map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-4 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap ${activeType === t ? "bg-foreground text-background soft-shadow" : "bg-card border border-border/40 text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Active Challenges */}
      {activeChallenges.length > 0 && (
        <div className="px-4 mb-4">
          <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-primary" /> Active Now
          </h3>
          <div className="space-y-3">
            {activeChallenges.slice(1).map((c, i) => (
              <ChallengeCard key={c.id} challenge={c} onJoin={() => toggleJoin(c)} delay={i * 0.04} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcomingChallenges.length > 0 && (
        <div className="px-4">
          <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-muted-foreground" /> Upcoming
          </h3>
          <div className="space-y-3">
            {upcomingChallenges.map((c, i) => (
              <ChallengeCard key={c.id} challenge={c} onJoin={() => toggleJoin(c)} delay={i * 0.04} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
          </div>
          <p className="text-[13px] font-semibold text-foreground">No challenges yet</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Check back soon for exciting competitions</p>
        </div>
      )}
    </div>
  );
}

function FeaturedChallenge({ challenge, onJoin }) {
  const Icon = typeIcons[challenge.type] || Trophy;
  const color = typeColors[challenge.type] || "hsl(var(--unibud-gold))";
  return (
    <div className="relative rounded-[24px] overflow-hidden premium-shadow border border-border/30" style={{ background: `linear-gradient(135deg, ${withAlpha(color, 0.12)}, hsl(var(--card)))` }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-[16px] flex items-center justify-center" style={{ backgroundColor: withAlpha(color, 0.15) }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> FEATURED
          </span>
        </div>
        <h3 className="font-heading font-bold text-[18px] text-foreground mb-1">{challenge.title}</h3>
        <p className="text-[12px] text-muted-foreground leading-relaxed mb-3 line-clamp-2">{challenge.description}</p>
        <div className="flex items-center gap-4 mb-4">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Users className="w-3.5 h-3.5" /> {challenge.participants_count || 0} joined
          </span>
          {challenge.prize && (
            <span className="flex items-center gap-1 text-[11px] text-primary font-semibold">
              <Award className="w-3.5 h-3.5" /> {challenge.prize}
            </span>
          )}
        </div>
        <button onClick={onJoin}
          className={`w-full h-[44px] rounded-[16px] font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap ${challenge.is_joined ? "bg-muted text-foreground" : "bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(212,175,55,0.3)]"}`}>
          {challenge.is_joined ? <><CheckCircle2 className="w-4 h-4" /> Joined</> : <><UserPlus className="w-4 h-4" /> Join Challenge</>}
        </button>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, onJoin, delay = 0 }) {
  const Icon = typeIcons[challenge.type] || Trophy;
  const color = typeColors[challenge.type] || "hsl(var(--unibud-gold))";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-[16px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: withAlpha(color) }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading font-semibold text-[13px] text-foreground">{challenge.title}</p>
          <p className="text-[11px] text-muted-foreground truncate">{challenge.organizer_name || challenge.organizer_type}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="w-3 h-3" /> {challenge.participants_count || 0}
            </span>
            {challenge.team_based && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Users className="w-3 h-3" /> Team
              </span>
            )}
            {challenge.end_date && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3" /> {new Date(challenge.end_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </div>
      {challenge.prize && (
        <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/8 w-fit">
          <Crown className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold text-primary">{challenge.prize}</span>
        </div>
      )}
      <button onClick={onJoin}
        className={`mt-3 w-full h-[38px] rounded-[14px] font-semibold text-[12px] flex items-center justify-center gap-1.5 spring-tap ${challenge.is_joined ? "bg-muted text-foreground" : "bg-primary/10 text-primary"}`}>
        {challenge.is_joined ? <><CheckCircle2 className="w-3.5 h-3.5" /> Joined</> : <><UserPlus className="w-3.5 h-3.5" /> Join</>}
      </button>
    </motion.div>
  );
}