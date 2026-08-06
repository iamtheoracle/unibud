import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Building2, BadgeCheck } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";
import EmptyState from "@/components/ui/EmptyState";
import CompanyCard from "@/components/career/CompanyCard";
import ScreenShell from "@/components/layout/ScreenShell";
import { COMPANY_TYPES } from "@/components/career/careerConstants";

const DEMO_COMPANIES = [
  { id: "d1", name: "Flutterwave", tagline: "Payments infrastructure for Africa", type: "tech", headquarters: "Lagos, NG", size: "large", is_verified: true, is_hiring: true, is_sponsor: true, active_jobs_count: 12, followers_count: 5400, website: "https://flutterwave.com", logo_url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&q=80", banner_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", perks: ["Health Insurance", "Remote Work", "Learning Budget"], tags: ["fintech", "payments"] },
  { id: "d2", name: "Google Africa", tagline: "Organizing the world's information", type: "tech", headquarters: "Lagos, NG", size: "enterprise", is_verified: true, is_hiring: true, active_jobs_count: 8, followers_count: 12000, website: "https://google.com", logo_url: "https://images.unsplash.com/photo-1573804633927-bfcb890f6673?w=200&q=80", banner_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c3344?w=600&q=80", perks: ["Relocation", "Free Meals", "Wellness"], tags: ["big_tech", "search"] },
  { id: "d3", name: "MTN Nigeria", tagline: "Connecting people, enriching lives", type: "telecommunications", headquarters: "Lagos, NG", size: "enterprise", is_verified: true, is_hiring: true, is_sponsor: true, active_jobs_count: 5, followers_count: 8300, website: "https://mtn.com", logo_url: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&q=80", banner_url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80", perks: ["Health", "Pension", "Airtime Allowance"], tags: ["telecom", "mobile"] },
  { id: "d4", name: "Andela", tagline: "Hiring brilliant African technologists", type: "tech", headquarters: "Lagos, NG", size: "medium", is_verified: true, is_hiring: true, active_jobs_count: 15, followers_count: 4200, website: "https://andela.com", logo_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&q=80", banner_url: "https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=600&q=80", perks: ["Remote First", "Mentorship", "Hardware"], tags: ["tech", "talent"] },
  { id: "d5", name: "UNIBUD Research Lab", tagline: "Advancing African AI research", type: "research_lab", headquarters: "On Campus", size: "small", is_verified: true, is_hiring: false, followers_count: 890, website: "#", perks: ["Research Grants", "Publication Support"], tags: ["research", "ai"] },
  { id: "d6", name: "Paystack", tagline: "Modern online and offline payments", type: "tech", headquarters: "Lagos, NG", size: "medium", is_verified: true, is_hiring: true, active_jobs_count: 7, followers_count: 6100, website: "https://paystack.com", logo_url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&q=80", banner_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80", perks: ["Equity", "Remote", "Health"], tags: ["fintech", "payments"] },
];

const FILTER_KEYS = Object.keys(COMPANY_TYPES);

export default function Companies() {
  const { isDemoMode } = useDemoMode();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [hiringOnly, setHiringOnly] = useState(false);

  const { data: companies, isLoading } = useQuery({
    queryKey: ["companyPages"],
    queryFn: () => base44.entities.CompanyPage.list("-created_date", 50),
    enabled: !isDemoMode,
  });

  const allCompanies = isDemoMode ? DEMO_COMPANIES : (companies || []);
  const filtered = allCompanies.filter((comp) => {
    if (hiringOnly && !comp.is_hiring) return false;
    if (activeFilter !== "all" && comp.type !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (comp.name || "").toLowerCase().includes(q) ||
        (comp.tagline || "").toLowerCase().includes(q) ||
        (comp.industry || "").toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <ScreenShell
      title="Companies"
      subtitle="Organizations · Hiring · Sponsors"
      back
      actions={
        <button
          onClick={() => setHiringOnly(!hiringOnly)}
          aria-label="Filter hiring companies"
          className={"px-3.5 h-10 rounded-full flex items-center gap-1.5 spring-tap text-[11px] font-semibold " + (hiringOnly ? "bg-success text-success-foreground" : "bg-card text-muted-foreground border border-border/30 soft-shadow")}
        >
          <BadgeCheck className="w-4 h-4" /> Hiring
        </button>
      }
    >
      <div className="relative mt-4 mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search companies..."
          className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 soft-shadow"
        />
      </div>

      <div className="mb-5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveFilter("all")}
            className={"px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap " + (activeFilter === "all" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border/40")}
          >
            All
          </button>
          {FILTER_KEYS.map((key) => {
            const meta = COMPANY_TYPES[key];
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
        <div className="responsive-cards">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-[240px] rounded-[20px] shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
          <EmptyState icon={Building2} title="No companies found" description="Try adjusting your filters to discover organizations" />
        </div>
      ) : (
        <div className="responsive-cards">
          {filtered.map((comp, i) => (
            <CompanyCard key={comp.id || i} company={comp} index={i} />
          ))}
        </div>
      )}
    </ScreenShell>
  );
}