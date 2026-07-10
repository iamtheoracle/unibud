import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Search, Bookmark, Award } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";
import EmptyState from "@/components/ui/EmptyState";
import ScholarshipCard from "@/components/career/ScholarshipCard";
import { SCHOLARSHIP_TYPES } from "@/components/career/careerConstants";

const DEMO_SCHOLARSHIPS = [
  { id: "d1", title: "Presidential Scholarship", provider: "University", type: "university", description: "Full tuition for students with CGPA 4.5+.", amount: "Full Tuition", deadline: "2026-08-30", is_international: false, level: "undergraduate", link: "#", is_bookmarked: false, is_featured: true, fields_of_study: ["All"], status: "open" },
  { id: "d2", title: "Federal Government Scholarship", provider: "Federal Ministry of Education", type: "government", description: "Tuition and stipend for Nigerian students in STEM fields.", amount: "₦200k/yr", deadline: "2026-09-15", is_international: false, level: "undergraduate", link: "#", is_bookmarked: false, fields_of_study: ["STEM"], status: "open" },
  { id: "d3", title: "MasterCard Foundation Scholars", provider: "MasterCard Foundation", type: "ngo", description: "Full scholarship for academically talented yet economically disadvantaged young people.", amount: "Full Ride", deadline: "2026-10-01", is_international: true, level: "undergraduate", link: "#", is_bookmarked: true, is_featured: true, fields_of_study: ["All"], status: "open" },
  { id: "d4", title: "Chevening Scholarship UK", provider: "UK Government", type: "international", description: "Fully-funded master's programme at any UK university.", amount: "Full Funding", deadline: "2026-11-01", is_international: true, level: "postgraduate", link: "#", is_bookmarked: false, is_featured: true, fields_of_study: ["All"], status: "open" },
  { id: "d5", title: "AI Research Grant", provider: "Google Research", type: "research_grant", description: "$10,000 grant for AI research in African contexts.", amount: "$10,000", deadline: "2026-08-20", is_international: true, level: "phd", link: "#", is_bookmarked: false, fields_of_study: ["AI", "CS"], status: "open" },
  { id: "d6", title: "Conference Travel Grant", provider: "University Research Office", type: "travel_grant", description: "Funding to present papers at international conferences.", amount: "₦500k", deadline: "2026-12-31", is_international: true, level: "all_levels", link: "#", is_bookmarked: false, fields_of_study: ["All"], status: "open" },
  { id: "d7", title: "Innovation Challenge Grant", provider: "UNIBUD Ventures", type: "innovation_grant", description: "Seed funding for student-led innovation projects.", amount: "₦1M", deadline: "2026-09-30", is_international: false, level: "undergraduate", link: "#", is_bookmarked: false, fields_of_study: ["All"], status: "open" },
  { id: "d8", title: "Dean's Merit Award", provider: "Faculty of Engineering", type: "merit", description: "Recognition and stipend for the top-performing student in each department.", amount: "₦100k", deadline: "2026-07-31", is_international: false, level: "undergraduate", link: "#", is_bookmarked: false, fields_of_study: ["Engineering"], status: "open" },
];

const FILTER_KEYS = Object.keys(SCHOLARSHIP_TYPES);

export default function Scholarships() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const { data: scholarships, isLoading } = useQuery({
    queryKey: ["scholarships"],
    queryFn: () => base44.entities.Scholarship.list("-created_date", 50),
    enabled: !isDemoMode,
  });

  const allScholarships = isDemoMode ? DEMO_SCHOLARSHIPS : (scholarships || []);
  const filtered = allScholarships.filter((sch) => {
    if (showBookmarkedOnly && !sch.is_bookmarked) return false;
    if (activeFilter !== "all" && sch.type !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (sch.title || "").toLowerCase().includes(q) ||
        (sch.provider || "").toLowerCase().includes(q) ||
        (sch.description || "").toLowerCase().includes(q);
    }
    return true;
  });

  const featured = filtered.filter((s) => s.is_featured);

  return (
    <div className="min-h-screen pb-8">
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Scholarships</h1>
          <p className="text-[12px] text-muted-foreground">Funding · Grants · Awards</p>
        </div>
        <button
          onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
          className={"w-10 h-10 rounded-full flex items-center justify-center spring-tap border " + (showBookmarkedOnly ? "bg-primary border-primary" : "bg-card border-border/30 soft-shadow")}
        >
          <Bookmark className={"w-[18px] h-[18px] " + (showBookmarkedOnly ? "fill-primary-foreground text-primary-foreground" : "text-foreground")} strokeWidth={2} />
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scholarships..."
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
            const meta = SCHOLARSHIP_TYPES[key];
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
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-[220px] rounded-[20px] shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-4">
          <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
            <EmptyState icon={Award} title="No scholarships found" description="Try adjusting your filters or check back for new funding opportunities" />
          </div>
        </div>
      ) : (
        <>
          {featured.length > 0 && activeFilter === "all" && !searchQuery && (
            <div className="mb-5">
              <h3 className="font-heading font-bold text-[16px] text-foreground px-5 mb-3 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary" /> Featured
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
                {featured.map((sch, i) => (
                  <div key={sch.id || i} className="flex-shrink-0 w-[280px]">
                    <ScholarshipCard scholarship={sch} index={i} />
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="px-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((sch, i) => (
              <ScholarshipCard key={sch.id || i} scholarship={sch} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}