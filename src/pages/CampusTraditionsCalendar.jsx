import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Calendar, MapPin, ChevronLeft, ChevronRight,
  Users, Heart, Share2, Bookmark, Bell, PartyPopper, Users as UsersIcon,
  GraduationCap, Award, BookOpen, Briefcase, Trophy, Rocket,
  Lightbulb, Dumbbell, Flag, Globe, MessageCircle, Code, Palette,
  Music, Star, Flame, Clock, Plus, Search,
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

const FILTERS = ["All", "My University", "Faculty", "Department", "Sports", "Research", "Public"];

const withAlpha = (hsl, a = 0.08) => hsl.replace("))", ") / " + a + ")");

function getCountdown(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days}d`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  return `${hours}h`;
}

export default function CampusTraditionsCalendar() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 6, 1)); // July 2026
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(null);
  const [rsvpIds, setRsvpIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());

  const { data: traditions, isLoading } = useQuery({
    queryKey: ["traditionsCalendar"],
    queryFn: () => base44.entities.CampusTradition.list("-start_date", 50),
  });

  const monthName = currentMonth.toLocaleDateString("en", { month: "long", year: "numeric" });
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const eventsByDate = useMemo(() => {
    const map = {};
    (traditions || []).forEach(t => {
      if (!t.start_date) return;
      const d = new Date(t.start_date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate();
        if (!map[key]) map[key] = [];
        map[key].push(t);
      }
    });
    return map;
  }, [traditions, year, month]);

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] || [] : [];
  const upcomingList = (traditions || []).filter(t => t.status === "upcoming" || t.status === "ongoing").slice(0, 10);

  const handleRSVP = async (tradition) => {
    const newSet = new Set(rsvpIds);
    if (newSet.has(tradition.id)) {
      newSet.delete(tradition.id);
    } else {
      newSet.add(tradition.id);
      await base44.entities.Notification.create({
        title: `RSVP confirmed: ${tradition.title}`,
        message: `We'll send you a reminder before the event starts.`,
        type: "reminder",
        icon: "Calendar",
        link: "/campus-traditions",
      });
    }
    setRsvpIds(newSet);
  };

  const toggleSave = (id) => {
    const newSet = new Set(savedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSavedIds(newSet);
  };

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const today = new Date();
  const isToday = (day) => today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground">Traditions Calendar</h1>
          <p className="text-[12px] text-muted-foreground">Campus events & milestones</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
          <Calendar className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Month navigation */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between bg-card rounded-[16px] soft-shadow border border-border/40 px-4 py-3">
          <button onClick={prevMonth} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center spring-tap">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <p className="font-heading font-bold text-[15px] text-foreground">{monthName}</p>
          <button onClick={nextMonth} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center spring-tap">
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 mb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap ${activeFilter === f ? "bg-foreground text-background soft-shadow" : "bg-card border border-border/40 text-muted-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="text-center text-[9px] font-bold text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const events = eventsByDate[day] || [];
              const hasEvents = events.length > 0;
              const isSelected = selectedDate === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(hasEvents ? day : null)}
                  className={`aspect-square rounded-[10px] flex flex-col items-center justify-center relative transition-all spring-tap ${
                    isSelected ? "bg-primary text-primary-foreground" :
                    isToday(day) ? "bg-primary/10 text-primary" :
                    hasEvents ? "bg-muted/50 hover:bg-muted" : "hover:bg-muted/30"
                  }`}
                >
                  <span className={`text-[11px] font-semibold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>{day}</span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5">
                      {events.slice(0, 3).map((e, ei) => (
                        <div key={ei} className="w-1 h-1 rounded-full" style={{ backgroundColor: typeColors[e.type] || "hsl(var(--primary))" }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected date events */}
      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-4 mb-4">
          <p className="text-[12px] font-semibold text-foreground mb-2 px-1">
            {new Date(year, month, selectedDate).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <div className="space-y-2.5">
            {selectedEvents.map((t, i) => <EventRow key={t.id} tradition={t} isRSVP={rsvpIds.has(t.id)} isSaved={savedIds.has(t.id)} onRSVP={() => handleRSVP(t)} onSave={() => toggleSave(t.id)} />)}
          </div>
        </motion.div>
      )}

      {/* Upcoming events list */}
      <div className="px-4">
        <h3 className="font-heading font-bold text-[14px] text-foreground mb-2.5 px-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" /> Upcoming Events
        </h3>
        <div className="space-y-2.5">
          {isLoading ? (
            [1,2,3].map(i => <div key={i} className="h-[72px] rounded-[18px] shimmer" />)
          ) : upcomingList.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-[18px] bg-muted flex items-center justify-center mx-auto mb-2">
                <Calendar className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
              </div>
              <p className="text-[12px] font-semibold text-foreground">No upcoming events</p>
            </div>
          ) : (
            upcomingList.map((t, i) => (
              <EventRow key={t.id} tradition={t} isRSVP={rsvpIds.has(t.id)} isSaved={savedIds.has(t.id)} onRSVP={() => handleRSVP(t)} onSave={() => toggleSave(t.id)} delay={i * 0.04} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function EventRow({ tradition, isRSVP, isSaved, onRSVP, onSave, delay = 0 }) {
  const Icon = typeIcons[tradition.type] || PartyPopper;
  const color = typeColors[tradition.type] || "hsl(var(--unibud-gold))";
  const countdown = getCountdown(tradition.start_date);
  const isOngoing = tradition.status === "ongoing";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[18px] p-3.5 soft-shadow border border-border/40 card-hover flex items-center gap-3"
    >
      <div className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: withAlpha(color) }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-[12px] text-foreground leading-snug truncate">{tradition.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {tradition.start_date && (
            <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
              <Calendar className="w-2.5 h-2.5" />
              {new Date(tradition.start_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
            </span>
          )}
          {countdown && (
            <span className={`text-[9px] font-semibold ${isOngoing ? "text-success" : "text-primary"}`}>
              {isOngoing ? "● Live" : `in ${countdown}`}
            </span>
          )}
        </div>
        {tradition.location && (
          <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
            <MapPin className="w-2.5 h-2.5" /> {tradition.location}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <button onClick={onRSVP} className={`px-2.5 py-1 rounded-full text-[9px] font-bold spring-tap ${isRSVP ? "bg-success/15 text-success" : "bg-primary text-primary-foreground"}`}>
          {isRSVP ? "✓ RSVP" : "RSVP"}
        </button>
        <button onClick={onSave} className={`w-7 h-7 rounded-full flex items-center justify-center spring-tap ${isSaved ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Bookmark className={`w-3 h-3 ${isSaved ? "fill-primary" : ""}`} />
        </button>
      </div>
    </motion.div>
  );
}