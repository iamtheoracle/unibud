import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Calendar, MapPin, Users, Heart, Share2, Bookmark, ChevronRight,
  PartyPopper, Users as UsersIcon, GraduationCap, Award, BookOpen,
  Briefcase, Trophy, Rocket, Lightbulb, Dumbbell, Flag, Globe,
  MessageCircle, Code, Palette, Music, Star, Flame, Clock,
} from "lucide-react";

const typeIcons = {
  freshers_week: PartyPopper, orientation: UsersIcon, matriculation: GraduationCap,
  convocation: GraduationCap, final_year_week: Award, department_week: BookOpen,
  faculty_week: UsersIcon, cultural_day: Palette, career_fair: Briefcase,
  awards_night: Trophy, entrepreneurship_week: Rocket, innovation_week: Lightbulb,
  sports_festival: Dumbbell, inter_faculty: Flag, inter_university: Globe,
  debate: MessageCircle, hackathon: Code, research_exhibition: Lightbulb,
  art_exhibition: Palette, music_festival: Music, talent_show: Star,
  charity: Heart, community_outreach: Heart, alumni_event: UsersIcon,
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

const withAlpha = (hsl, a = 0.12) => hsl.replace("))", ") / " + a + ")");

function getCountdown(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  if (days > 0) return { primary: `${days}`, secondary: `${hours}h`, unit: "days" };
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { primary: `${hours}`, secondary: `${mins}m`, unit: "hours" };
}

export default function CampusTraditionsGallery() {
  const qc = useQueryClient();
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [interestedIds, setInterestedIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());

  const { data: traditions, isLoading } = useQuery({
    queryKey: ["quadCampusTraditions"],
    queryFn: () => base44.entities.CampusTradition.list("-start_date", 8),
  });

  const handleJoin = async (tradition) => {
    const newSet = new Set(joinedIds);
    if (newSet.has(tradition.id)) {
      newSet.delete(tradition.id);
    } else {
      newSet.add(tradition.id);
      const dateStr = tradition.start_date
        ? new Date(tradition.start_date).toLocaleDateString("en", { month: "short", day: "numeric" })
        : "soon";
      await base44.entities.Notification.create({
        title: `You joined ${tradition.title}`,
        message: `We'll remind you before it starts on ${dateStr}.`,
        type: "reminder",
        icon: "Calendar",
        link: "/campus-traditions",
      });
    }
    setJoinedIds(newSet);
  };

  const toggleInterested = (id) => {
    const newSet = new Set(interestedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setInterestedIds(newSet);
  };

  const toggleSaved = (id) => {
    const newSet = new Set(savedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSavedIds(newSet);
  };

  if (isLoading) {
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between px-5 mb-3">
          <h3 className="font-heading font-bold text-[16px] text-foreground">Campus Traditions</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[260px] h-[200px] rounded-[20px] shimmer flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!traditions || traditions.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between px-5 mb-3">
        <div>
          <h3 className="font-heading font-bold text-[16px] text-foreground">Campus Traditions</h3>
          <p className="text-[10px] text-muted-foreground">Celebrate campus life & culture</p>
        </div>
        <Link
          to="/campus-traditions"
          className="flex items-center gap-0.5 text-[11px] font-semibold text-primary spring-tap"
        >
          See All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {traditions.map((tradition, i) => {
          const Icon = typeIcons[tradition.type] || PartyPopper;
          const color = typeColors[tradition.type] || "hsl(var(--unibud-gold))";
          const countdown = getCountdown(tradition.start_date);
          const isJoined = joinedIds.has(tradition.id);
          const isInterested = interestedIds.has(tradition.id);
          const isSaved = savedIds.has(tradition.id);
          const isOngoing = tradition.status === "ongoing";

          return (
            <motion.div
              key={tradition.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
              className="flex-shrink-0 w-[270px] bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden card-hover"
            >
              {/* Cover */}
              <div className="relative h-[110px] overflow-hidden">
                {tradition.banner_url ? (
                  <img src={tradition.banner_url} alt={tradition.title} className="w-full h-full object-cover" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: `linear-gradient(135deg, ${withAlpha(color, 0.2)}, ${withAlpha(color, 0.05)})` }}
                  >
                    <Icon className="w-10 h-10" style={{ color }} strokeWidth={1.5} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span
                  className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold backdrop-blur-sm ${
                    isOngoing
                      ? "bg-success/90 text-success-foreground"
                      : tradition.status === "upcoming"
                      ? "bg-primary/90 text-primary-foreground"
                      : "bg-black/50 text-white"
                  }`}
                >
                  {isOngoing ? "● LIVE" : tradition.status === "upcoming" ? "UPCOMING" : "PAST"}
                </span>
                {countdown && (
                  <div className="absolute top-2.5 right-2.5 glass-strong rounded-[12px] px-2.5 py-1.5 text-center min-w-[52px]">
                    <p className="font-heading font-bold text-[14px] text-foreground leading-none">{countdown.primary}</p>
                    <p className="text-[8px] text-muted-foreground uppercase tracking-wide mt-0.5">{countdown.unit}</p>
                  </div>
                )}
                <div className="absolute bottom-2 left-2.5 right-2.5">
                  <p className="text-[10px] font-semibold text-white/90 flex items-center gap-1">
                    <Icon className="w-3 h-3" />
                    {typeLabels[tradition.type] || tradition.type}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <p className="font-heading font-semibold text-[13px] text-foreground leading-snug line-clamp-1">
                  {tradition.title}
                </p>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                  {tradition.start_date && (
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(tradition.start_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {tradition.location && (
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5" />
                      {tradition.location}
                    </span>
                  )}
                </div>
                {tradition.organizer && (
                  <p className="text-[9px] text-muted-foreground mt-1">by {tradition.organizer}</p>
                )}

                {/* Attendance */}
                <div className="flex items-center gap-1 mt-2">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{120 + i * 47} attending</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-border/30">
                  <button
                    onClick={() => handleJoin(tradition)}
                    className={`flex-1 py-2 rounded-[10px] text-[10px] font-semibold spring-tap transition-colors ${
                      isJoined
                        ? "bg-success/15 text-success border border-success/30"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {isJoined ? "✓ Joined" : "Join"}
                  </button>
                  <button
                    onClick={() => toggleInterested(tradition.id)}
                    className={`w-8 h-8 rounded-[10px] flex items-center justify-center spring-tap transition-colors ${
                      isInterested ? "bg-error/10 text-error" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isInterested ? "fill-error" : ""}`} />
                  </button>
                  <button
                    onClick={() => toggleSaved(tradition.id)}
                    className={`w-8 h-8 rounded-[10px] flex items-center justify-center spring-tap transition-colors ${
                      isSaved ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-primary" : ""}`} />
                  </button>
                  <button className="w-8 h-8 rounded-[10px] bg-muted text-muted-foreground flex items-center justify-center spring-tap">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}