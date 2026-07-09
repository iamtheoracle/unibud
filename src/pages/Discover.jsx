import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, TrendingUp, Globe, Flame, Trophy, Sparkles,
  ChevronRight, MapPin, Users, Award, Briefcase, ShoppingBag,
  Lightbulb, Rocket, Music, Dumbbell, Cpu, ChevronDown,
} from "lucide-react";
import { Link } from "react-router-dom";

const SCOPES = [
  { key: "campus", label: "Campus", icon: Users, desc: "Trending at your university" },
  { key: "national", label: "National", icon: TrendingUp, desc: "Across the country" },
  { key: "global", label: "Global", icon: Globe, desc: "Worldwide trends" },
];

const CATEGORIES = [
  { icon: Trophy, label: "Challenges", path: "/challenges", color: "text-primary", bg: "bg-primary/10" },
  { icon: Award, label: "Scholarships", path: "/opportunities", color: "text-success", bg: "bg-success/10" },
  { icon: Briefcase, label: "Internships", path: "/opportunities", color: "text-info", bg: "bg-info/10" },
  { icon: Rocket, label: "Startups", path: "/marketplace", color: "text-warning", bg: "bg-warning/10" },
  { icon: Lightbulb, label: "Innovation", path: "/challenges", color: "text-purple", bg: "bg-purple/10" },
  { icon: Music, label: "Music", path: "/discover", color: "text-primary", bg: "bg-primary/10" },
  { icon: Dumbbell, label: "Sports", path: "/challenges", color: "text-error", bg: "bg-error/10" },
  { icon: Cpu, label: "Tech", path: "/challenges", color: "text-info", bg: "bg-info/10" },
];

const CAMPUS_TRENDS = [
  { text: "Students from Engineering built a solar vehicle", tag: "Engineering", count: 342, emoji: "🚗" },
  { text: "Photography Club started a Sunset Challenge", tag: "Photography", count: 128, emoji: "📸" },
  { text: "30 students from your faculty joined today's Coding Challenge", tag: "Coding", count: 30, emoji: "💻" },
  { text: "Business students are hosting a Pitch Competition", tag: "Startup", count: 89, emoji: "💡" },
  { text: "Dance Challenge trending in Main Campus", tag: "Dance", count: 215, emoji: "💃" },
  { text: "Debate Challenge finals this Friday", tag: "Debate", count: 67, emoji: "🗣️" },
];

export default function Discover() {
  const [scope, setScope] = useState("campus");
  const navigate = useNavigate();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: challenges } = useQuery({ queryKey: ["challenges"], queryFn: () => base44.entities.Challenge.list("-created_date", 5) });
  const { data: opportunities } = useQuery({ queryKey: ["opportunities"], queryFn: () => base44.entities.Opportunity.list("-created_date", 5) });
  const { data: listings } = useQuery({ queryKey: ["marketplace"], queryFn: () => base44.entities.MarketplaceListing.filter({ status: "active" }) });

  const trendingListings = listings?.slice(0, 4) || [];

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Discover</h1>
          <p className="text-[12px] text-muted-foreground">{user?.university || "Your Campus"} · What's happening</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Scope selector */}
      <div className="px-4 mb-4">
        <div className="bg-card rounded-[20px] p-1.5 soft-shadow border border-border/40 flex">
          {SCOPES.map(s => (
            <button key={s.key} onClick={() => setScope(s.key)}
              className={`flex-1 py-2.5 rounded-[16px] text-[11px] font-semibold transition-all flex flex-col items-center gap-0.5 ${scope === s.key ? "bg-primary text-primary-foreground soft-shadow" : "text-muted-foreground"}`}>
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-4 gap-2.5">
          {CATEGORIES.map((cat, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
              <Link to={cat.path} className="flex flex-col items-center gap-2 spring-tap">
                <div className={`w-12 h-12 rounded-[18px] ${cat.bg} soft-shadow border border-border/30 flex items-center justify-center`}>
                  <cat.icon className={`w-5 h-5 ${cat.color}`} strokeWidth={2.2} />
                </div>
                <span className="text-[10px] font-medium text-foreground">{cat.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Campus Trends */}
      <div className="px-4 mb-5">
        <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-primary" /> Campus Trends
        </h3>
        <div className="space-y-2.5">
          {CAMPUS_TRENDS.map((trend, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 flex items-center gap-3 card-hover"
            >
              <div className="w-10 h-10 rounded-[14px] bg-muted flex items-center justify-center text-xl flex-shrink-0">{trend.emoji}</div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-foreground leading-snug">{trend.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[9px] font-semibold">{trend.tag}</span>
                  <span className="text-[10px] text-muted-foreground">{trend.count} students</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      {challenges && challenges.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between px-5 mb-3">
            <h3 className="font-heading font-bold text-[16px] text-foreground flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-primary" /> Active Challenges
            </h3>
            <Link to="/challenges" className="text-[11px] font-semibold text-primary flex items-center gap-0.5">See all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
            {challenges.filter(c => c.status === "active").slice(0, 5).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex-shrink-0 w-[200px] card-hover"
              >
                <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center mb-2.5">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <p className="font-heading font-semibold text-[12px] text-foreground leading-snug mb-1 line-clamp-2">{c.title}</p>
                <p className="text-[10px] text-muted-foreground mb-2">{c.participants_count || 0} joined</p>
                {c.prize && <span className="text-[10px] font-semibold text-primary">{c.prize}</span>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Opportunities */}
      {opportunities && opportunities.length > 0 && (
        <div className="px-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-[16px] text-foreground px-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-success" /> Opportunities
            </h3>
            <Link to="/opportunities" className="text-[11px] font-semibold text-primary flex items-center gap-0.5">See all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-2.5">
            {opportunities.slice(0, 3).map((opp, i) => (
              <motion.div
                key={opp.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 flex items-center gap-3 card-hover"
              >
                <div className="w-10 h-10 rounded-[14px] bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[12px] text-foreground truncate">{opp.title}</p>
                  <p className="text-[10px] text-muted-foreground">{opp.organization}</p>
                </div>
                {opp.amount && <span className="text-[11px] font-bold text-primary">{opp.amount}</span>}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Student Businesses */}
      {trendingListings.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between px-5 mb-3">
            <h3 className="font-heading font-bold text-[16px] text-foreground flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-warning" /> Student Businesses
            </h3>
            <Link to="/marketplace" className="text-[11px] font-semibold text-primary flex items-center gap-0.5">See all <ChevronRight className="w-3 h-3" /></Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
            {trendingListings.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3 flex-shrink-0 w-[160px] card-hover"
              >
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.title} className="w-full h-20 rounded-[14px] object-cover mb-2" />
                ) : (
                  <div className="w-full h-20 rounded-[14px] bg-muted flex items-center justify-center mb-2">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <p className="font-heading font-semibold text-[12px] text-foreground truncate">{item.title}</p>
                <p className="text-[11px] font-bold text-primary mt-0.5">₦{item.price?.toLocaleString()}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Global Mode banner */}
      {scope === "global" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4">
          <div className="bg-card rounded-[20px] p-4 soft-shadow border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-primary" />
              <p className="font-heading font-semibold text-[13px] text-foreground">Global Mode</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              You're now exploring beyond your university. Inter-University competitions, global scholarships, exchange programmes, and worldwide communities are visible. Your campus data remains private.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}