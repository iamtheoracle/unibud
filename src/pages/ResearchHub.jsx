import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Search, FlaskConical } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";
import EmptyState from "@/components/ui/EmptyState";
import ResearchCard from "@/components/career/ResearchCard";
import { RESEARCH_TYPES } from "@/components/career/careerConstants";

const DEMO_PROJECTS = [
  { id: "d1", title: "African Language NLP Models", abstract: "Building transformer-based models for low-resource African languages.", type: "research_group", author_name: "Dr. Adewale Johnson", author_role: "lecturer", university: "Covenant University", department: "Computer Science", is_recruiting: true, is_joined: false, is_verified: true, members_count: 8, funding_amount: "$15,000", funding_source: "Google Research", keywords: ["NLP", "AI", "Transformers"], paper_url: "#", image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80", status: "active" },
  { id: "d2", title: "Solar-Powered Smart Irrigation System", abstract: "IoT-based irrigation system using solar energy and soil moisture sensors for smallholder farms.", type: "project", author_name: "Chioma Eze", author_role: "student", department: "Electrical Engineering", is_recruiting: true, is_joined: false, members_count: 4, keywords: ["IoT", "Solar", "Agriculture"], external_link: "https://github.com", image_url: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=600&q=80", status: "active" },
  { id: "d3", title: "Blockchain for Academic Credential Verification", abstract: "A decentralized system for verifying university degrees and certificates.", type: "publication", author_name: "Femi Adeyanka", author_role: "student", supervisor: "Dr. Bello", is_recruiting: false, is_joined: false, is_verified: true, members_count: 3, keywords: ["Blockchain", "Web3", "Education"], paper_url: "#", status: "published" },
  { id: "d4", title: "Renewable Energy Research Lab", abstract: "Investigating next-gen battery materials for sustainable energy storage.", type: "laboratory", author_name: "Prof. Sarah Okon", author_role: "lecturer", department: "Physics", is_recruiting: true, is_joined: true, is_verified: true, members_count: 12, funding_amount: "$50,000", funding_source: "TETFund", keywords: ["Energy", "Batteries", "Materials"], status: "active" },
  { id: "d5", title: "Mental Health in University Students", abstract: "A longitudinal study on stress factors and coping mechanisms among undergraduates.", type: "collaboration", author_name: "Aisha Bello", author_role: "student", supervisor: "Dr. Okafor", department: "Psychology", is_recruiting: true, is_joined: false, members_count: 6, keywords: ["Mental Health", "Psychology"], paper_url: "#", status: "active" },
  { id: "d6", title: "Undergraduate Research Competition 2026", abstract: "Annual competition for best undergraduate research project. Prize: ₦500k.", type: "competition", author_name: "University Research Office", author_role: "lecturer", is_recruiting: true, is_joined: false, members_count: 45, funding_amount: "₦500,000", funding_source: "University", keywords: ["Research", "Competition"], status: "active" },
];

const FILTER_KEYS = Object.keys(RESEARCH_TYPES);

export default function ResearchHub() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["researchProjects"],
    queryFn: () => base44.entities.ResearchProject.list("-created_date", 50),
    enabled: !isDemoMode,
  });

  const allProjects = isDemoMode ? DEMO_PROJECTS : (projects || []);
  const filtered = allProjects.filter((proj) => {
    if (activeFilter !== "all" && proj.type !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (proj.title || "").toLowerCase().includes(q) ||
        (proj.abstract || "").toLowerCase().includes(q) ||
        (proj.author_name || "").toLowerCase().includes(q);
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
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Research Hub</h1>
          <p className="text-[12px] text-muted-foreground">Groups · Publications · Labs</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center">
          <FlaskConical className="w-5 h-5 text-purple" strokeWidth={2} />
        </div>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search research..."
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
            const meta = RESEARCH_TYPES[key];
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
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-[260px] rounded-[20px] shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-4">
          <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
            <EmptyState icon={FlaskConical} title="No research found" description="Start a research project or join an existing group to collaborate" />
          </div>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((proj, i) => (
            <ResearchCard key={proj.id || i} project={proj} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}