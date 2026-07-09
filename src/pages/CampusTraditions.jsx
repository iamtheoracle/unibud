import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Calendar, MapPin, Sparkles, Trophy, Music, Palette,
  Users, Heart, Lightbulb, Rocket, BookOpen, PartyPopper,
  Briefcase, Globe, MessageCircle, Code, Star, GraduationCap,
  Award, Flag, Dumbbell, Flame,
} from "lucide-react";

const typeIcons = {
  freshers_week: PartyPopper, orientation: Users, matriculation: GraduationCap,
  convocation: GraduationCap, final_year_week: Award, department_week: BookOpen,
  faculty_week: Users, cultural_day: Palette, career_fair: Briefcase,
  awards_night: Trophy, entrepreneurship_week: Rocket, innovation_week: Lightbulb,
  sports_festival: Dumbbell, inter_faculty: Flag, inter_university: Globe,
  debate: MessageCircle, hackathon: Code, research_exhibition: Lightbulb,
  art_exhibition: Palette, music_festival: Music, talent_show: Star,
  charity: Heart, community_outreach: Heart, alumni_event: Users,
};

const typeColors = {
  freshers_week: "hsl(var(--unibud-gold))", orientation: "hsl(var(--unibud-blue))",
  matriculation: "hsl(var(--unibud-purple))", convocation: "hsl(var(--unibud-gold))",
  final_year_week: "hsl(var(--unibud-orange))", department_week: "hsl(var(--unibud-green))",
  faculty_week: "hsl(var(--unibud-blue))", cultural_day: "hsl(var(--unibud-purple))",
  career_fair: "hsl(var(--unibud-gold))", awards_night: "hsl(var(--unibud-gold))",
  entrepreneurship_week: "hsl(var(--unibud-gold))", innovation_week: "hsl(var(--unibud-purple))",
  sports_festival: "hsl(var(--unibud-red))", inter_faculty: "hsl(var(--unibud-blue))",
  inter_university: "hsl(var(--unibud-green))", debate: "hsl(var(--unibud-blue))",
  hackathon: "hsl(var(--unibud-purple))", research_exhibition: "hsl(var(--unibud-green))",
  art_exhibition: "hsl(var(--unibud-orange))", music_festival: "hsl(var(--unibud-gold))",
  talent_show: "hsl(var(--unibud-gold))", charity: "hsl(var(--unibud-red))",
  community_outreach: "hsl(var(--unibud-green))", alumni_event: "hsl(var(--unibud-blue))",
};

const typeLabels = {
  freshers_week: "Freshers Week", orientation: "Orientation", matriculation: "Matriculation",
  convocation: "Convocation", final_year_week: "Final Year Week", department_week: "Department Week",
  faculty_week: "Faculty Week", cultural_day: "Cultural Day", career_fair: "Career Fair",
  awards_night: "Awards Night", entrepreneurship_week: "Entrepreneurship Week",
  innovation_week: "Innovation Week", sports_festival: "Sports Festival",
  inter_faculty: "Inter-Faculty", inter_university: "Inter-University", debate: "Debate",
  hackathon: "Hackathon", research_exhibition: "Research Exhibition",
  art_exhibition: "Art Exhibition", music_festival: "Music Festival",
  talent_show: "Talent Show", charity: "Charity", community_outreach: "Community Outreach",
  alumni_event: "Alumni Event",
};

const withAlpha = (hsl, a = 0.08) => hsl.replace("))", ") / " + a + ")");

export default function CampusTraditions() {
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: traditions } = useQuery({
    queryKey: ["campusTraditions"],
    queryFn: () => base44.entities.CampusTradition.list("-start_date", 50),
  });

  const filtered = filter === "all" ? traditions : traditions?.filter(t => t.status === filter) || [];
  const ongoing = traditions?.filter(t => t.status === "ongoing") || [];
  const upcoming = traditions?.filter(t => t.status === "upcoming") || [];
  const displayList = filter === "all" ? [...ongoing, ...upcoming] : filtered;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Campus Life</h1>
          <p className="text-[12px] text-muted-foreground">Traditions, events & celebrations</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
          <PartyPopper className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="px-4 mb-4 flex gap-1.5 p-1 bg-muted/60 rounded-[16px]">
        {[{ k: "all", l: "All" }, { k: "ongoing", l: "Ongoing" }, { k: "upcoming", l: "Upcoming" }, { k: "completed", l: "Past" }].map(t => (
          <button key={t.k} onClick={() => setFilter(t.k)}
            className={`flex-1 py-2.5 rounded-[12px] text-[11px] font-semibold transition-all ${filter === t.k ? "bg-card text-foreground soft-shadow" : "text-muted-foreground"}`}>
            {t.l}
          </button>
        ))}
      </div>

      {/* Ongoing highlight */}
      {filter === "all" && ongoing.length > 0 && (
        <div className="px-4 mb-4">
          <h3 className="font-heading font-bold text-[14px] text-foreground mb-2 px-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-primary" /> Happening Now
          </h3>
          <div className="space-y-3">
            {ongoing.map((t, i) => <TraditionCard key={t.id} tradition={t} delay={i * 0.04} highlight />)}
          </div>
        </div>
      )}

      {/* Upcoming / filtered list */}
      <div className="px-4 space-y-3">
        {(filter === "all" ? upcoming : filtered)?.map((t, i) => (
          <TraditionCard key={t.id} tradition={t} delay={i * 0.04} />
        ))}
      </div>

      {displayList?.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-3">
            <PartyPopper className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
          </div>
          <p className="text-[13px] font-semibold text-foreground">Nothing here yet</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Check back for upcoming traditions</p>
        </div>
      )}
    </div>
  );
}

function TraditionCard({ tradition, delay = 0, highlight }) {
  const Icon = typeIcons[tradition.type] || PartyPopper;
  const color = typeColors[tradition.type] || "hsl(var(--unibud-gold))";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover ${highlight ? "border-primary/30" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-[16px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: withAlpha(color) }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-heading font-semibold text-[14px] text-foreground">{tradition.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{typeLabels[tradition.type] || tradition.type}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold flex-shrink-0 ${
              tradition.status === "ongoing" ? "bg-success/10 text-success" :
              tradition.status === "upcoming" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"
            }`}>
              {tradition.status === "ongoing" ? "Live" : tradition.status === "upcoming" ? "Soon" : "Past"}
            </span>
          </div>
          {tradition.description && <p className="text-[11px] text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{tradition.description}</p>}
          <div className="flex items-center gap-3 mt-2.5">
            {tradition.start_date && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3" /> {new Date(tradition.start_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
              </span>
            )}
            {tradition.location && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="w-3 h-3" /> {tradition.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}