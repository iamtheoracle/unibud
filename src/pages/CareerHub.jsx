import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Search, Bookmark, Briefcase } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";
import EmptyState from "@/components/ui/EmptyState";
import CareerCard from "@/components/career/CareerCard";
import { CAREER_TYPES } from "@/components/career/careerConstants";

const DEMO_OPPORTUNITIES = [
  { id: "d1", title: "Software Engineering Internship", organization: "Flutterwave", type: "internship", description: "Join our engineering team for a 6-month internship building payment infrastructure used across Africa.", location: "Lagos, NG", amount: "₦150k/mo", deadline: "2026-08-15", link: "https://flutterwave.com", is_saved: false, tags: ["tech", "internship"] },
  { id: "d2", title: "Graduate Trainee Programme", organization: "MTN Group", type: "graduate_job", description: "A 12-month rotational programme across business units for top graduates.", location: "Multiple", amount: "Competitive", deadline: "2026-09-01", link: "https://mtn.com", is_saved: false, tags: ["graduate"] },
  { id: "d3", title: "Campus Library Assistant", organization: "University Library", type: "campus_job", description: "Part-time role assisting students with resource management and digital archives.", location: "On Campus", amount: "₦30k/mo", deadline: "2026-07-25", link: "#", is_saved: false, tags: ["campus"] },
  { id: "d4", title: "Research Assistant — AI Lab", organization: "Computer Science Dept", type: "research_assistant", description: "Assist in ongoing machine learning research focused on African language NLP models.", location: "On Campus", amount: "₦80k/mo", deadline: "2026-08-10", link: "#", is_saved: true, tags: ["research", "ai"] },
  { id: "d5", title: "Volunteer: Community Teaching", organization: "UNIBUD Outreach", type: "volunteer", description: "Teach STEM subjects at secondary schools in underserved communities every Saturday.", location: "Lagos, NG", amount: "Volunteer", deadline: "2026-12-31", link: "#", is_saved: false, tags: ["volunteer"] },
  { id: "d6", title: "Industrial Training — Backend Developer", organization: "Andela", type: "industrial_training", description: "3-month IT placement working on scalable backend systems with mentorship from senior engineers.", location: "Remote", amount: "₦120k/mo", deadline: "2026-08-20", link: "https://andela.com", is_saved: false, tags: ["tech", "it"] },
  { id: "d7", title: "Freelance: Web Developer", organization: "Direct", type: "freelance", description: "Build a portfolio website for a local business. Flexible schedule, paid per milestone.", location: "Remote", amount: "₦200k", deadline: "2026-07-30", link: "#", is_saved: false, tags: ["freelance"] },
  { id: "d8", title: "Google Africa Developer Competition", organization: "Google", type: "competition", description: "Build an app that solves a local challenge. $10k prize for the winning team.", location: "Virtual", amount: "$10,000", deadline: "2026-09-15", link: "https://google.com", is_saved: false, tags: ["competition", "tech"] },
  { id: "d9", title: "Startup Co-Founder Opportunity", organization: "UNIBUD Ventures", type: "startup", description: "Join a student-led fintech startup as a technical co-founder. Equity-based.", location: "Lagos, NG", amount: "Equity", deadline: "2026-08-05", link: "#", is_saved: false, tags: ["startup"] },
];

const FILTER_KEYS = Object.keys(CAREER_TYPES);

export default function CareerHub() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["careerOpportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 50),
    enabled: !isDemoMode,
  });

  const allOpps = isDemoMode ? DEMO_OPPORTUNITIES : (opportunities || []);
  const filtered = allOpps.filter((opp) => {
    if (showSavedOnly && !opp.is_saved) return false;
    if (activeFilter !== "all" && opp.type !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (opp.title || "").toLowerCase().includes(q) ||
        (opp.organization || "").toLowerCase().includes(q) ||
        (opp.description || "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="min-h-screen pb-8">
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Career Hub</h1>
          <p className="text-[12px] text-muted-foreground">Internships · Jobs · Competitions · IT</p>
        </div>
        <button
          onClick={() => setShowSavedOnly(!showSavedOnly)}
          className={"w-10 h-10 rounded-full flex items-center justify-center spring-tap border " + (showSavedOnly ? "bg-primary border-primary" : "bg-card border-border/30 soft-shadow")}
        >
          <Bookmark className={"w-[18px] h-[18px] " + (showSavedOnly ? "fill-primary-foreground text-primary-foreground" : "text-foreground")} strokeWidth={2} />
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search opportunities..."
            className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 soft-shadow"
          />
        </div>
      </div>

      <div className="px-4 mb-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveFilter("all")}
            className={"px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap " + (activeFilter === "all" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border/40")}
          >
            All
          </button>
          {FILTER_KEYS.map((key) => {
            const meta = CAREER_TYPES[key];
            return (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={"px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap " + (activeFilter === key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border/40")}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading && !isDemoMode ? (
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-[200px] rounded-[20px] shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-4">
          <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
            <EmptyState icon={Briefcase} title="No opportunities found" description="Try adjusting your filters or check back later for new postings" />
          </div>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((opp, i) => (
            <CareerCard key={opp.id || i} opportunity={opp} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}