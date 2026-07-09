import React, { useState } from "react";
import { Search, Bookmark, MapPin, Calendar, ExternalLink, Award, Briefcase, GraduationCap, Globe, Trophy } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";

const types = ["All", "Scholarships", "Internships", "Jobs", "Competitions", "Research"];

const opportunities = [
  { title: "Africa Merit Scholarship 2026", org: "Global Education Fund", type: "scholarship", deadline: "Aug 15, 2026", amount: "$10,000", location: "Global", tags: ["STEM", "Undergrad"], saved: false },
  { title: "Software Engineering Intern", org: "TechCorp Africa", type: "internship", deadline: "Jul 30, 2026", amount: "₦350,000/mo", location: "Lagos, NG", tags: ["Tech", "Remote"], saved: true },
  { title: "Inter-University Hackathon 2026", org: "UNIBUD Network", type: "competition", deadline: "Jul 25, 2026", amount: "$5,000 Prize", location: "Virtual", tags: ["Tech", "Innovation"], saved: false },
  { title: "Graduate Research Assistant", org: "MIT Collaboration", type: "research", deadline: "Sep 1, 2026", amount: "$2,500/mo", location: "Cambridge, US", tags: ["PhD", "AI"], saved: false },
  { title: "Junior Data Analyst", org: "FinTech Solutions", type: "job", deadline: "Aug 5, 2026", amount: "₦500,000/mo", location: "Remote", tags: ["Data", "Entry-level"], saved: true },
];

const typeIcons = { scholarship: GraduationCap, internship: Briefcase, competition: Trophy, research: Globe, job: Briefcase };
const typeColors = { scholarship: "from-emerald-500 to-emerald-600", internship: "from-blue-500 to-blue-600", competition: "from-amber-500 to-amber-600", research: "from-purple-500 to-purple-600", job: "from-rose-500 to-rose-600" };

export default function Opportunities() {
  const [activeType, setActiveType] = useState("All");

  const filtered = activeType === "All" ? opportunities : opportunities.filter((o) => o.type === activeType.toLowerCase().slice(0, -1));

  return (
    <div className="min-h-screen">
      <div className="pt-12 pb-3 px-5">
        <h1 className="font-heading font-bold text-[22px] tracking-tight">Opportunities</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Discover your next big step</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search opportunities..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-border/50 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Type Filter */}
      <div className="px-4 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                activeType === type
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-white border border-border/50 text-muted-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Featured */}
      <div className="px-4 mb-4">
        <GlassCard className="p-4 bg-gradient-to-br from-primary/5 via-purple-50 to-emerald-50 border-primary/10" delay={0.05}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-achievement" />
            <span className="text-[11px] font-semibold text-achievement">Featured Opportunity</span>
          </div>
          <h3 className="font-heading font-bold text-[15px] mb-1">Africa Merit Scholarship 2026</h3>
          <p className="text-[12px] text-muted-foreground mb-2">Full tuition coverage for outstanding STEM students across Africa</p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-primary">$10,000</span>
            <span className="text-[10px] text-muted-foreground">Deadline: Aug 15</span>
          </div>
        </GlassCard>
      </div>

      {/* List */}
      <div className="px-4 space-y-3 pb-8">
        <SectionHeader title="All Opportunities" subtitle={`${filtered.length} found`} icon={Briefcase} />
        {filtered.map((opp, i) => {
          const Icon = typeIcons[opp.type] || Briefcase;
          return (
            <GlassCard key={i} variant="solid" className="p-4" delay={0.1 + i * 0.04}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${typeColors[opp.type] || "from-slate-400 to-slate-500"} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-heading font-semibold text-[13px] leading-snug">{opp.title}</p>
                      <p className="text-[11px] text-muted-foreground">{opp.org}</p>
                    </div>
                    <button className="flex-shrink-0">
                      <Bookmark className={`w-4 h-4 ${opp.saved ? "text-primary fill-primary" : "text-muted-foreground"}`} strokeWidth={1.8} />
                    </button>
                  </div>
                  <p className="font-heading font-bold text-[14px] text-primary mt-1">{opp.amount}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{opp.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">{opp.deadline}</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {opp.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[9px] font-semibold">{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}