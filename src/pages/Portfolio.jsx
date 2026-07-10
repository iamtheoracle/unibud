import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Search, Plus, FolderOpen } from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";
import EmptyState from "@/components/ui/EmptyState";
import PortfolioCard from "@/components/career/PortfolioCard";
import { PORTFOLIO_TYPES } from "@/components/career/careerConstants";

const DEMO_ITEMS = [
  { id: "d1", title: "Solar-Powered Smart Irrigation System", description: "IoT project using solar energy and moisture sensors for automated farm irrigation.", type: "programming", author_name: "Chioma Eze", cover_url: "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=600&q=80", external_link: "https://github.com", skills: ["Arduino", "IoT", "C++"], is_featured: true, likes_count: 124, views_count: 890, is_public: true, status: "published" },
  { id: "d2", title: "Campus Photography Series", description: "A collection capturing the beauty of university architecture and student life.", type: "photography", author_name: "David Okonkwo", cover_url: "https://images.unsplash.com/photo-1466097853558-13663f7813a2?w=600&q=80", skills: ["Photography", "Editing"], likes_count: 256, views_count: 1200, is_public: true, status: "published" },
  { id: "d3", title: "AI-Powered Study Planner", description: "Machine learning app that creates personalized study schedules based on learning patterns.", type: "project", author_name: "Femi Adeyanka", cover_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80", external_link: "https://github.com", skills: ["Python", "ML", "React"], is_featured: true, likes_count: 340, views_count: 2100, is_public: true, status: "published" },
  { id: "d4", title: "The Economics of Student Startups", description: "Research paper analyzing funding patterns and success rates of student-led ventures.", type: "research", author_name: "Aisha Bello", file_url: "#", skills: ["Economics", "Research"], likes_count: 89, views_count: 450, is_public: true, status: "published" },
  { id: "d5", title: "UNIBUD Mobile App Design", description: "Complete UI/UX design system for a campus management application.", type: "design", author_name: "Chioma Eze", cover_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80", external_link: "https://behance.net", skills: ["Figma", "UI/UX", "Design Systems"], likes_count: 412, views_count: 3200, is_public: true, status: "published" },
  { id: "d6", title: "AWS Cloud Practitioner Certificate", description: "Certified by Amazon Web Services in cloud fundamentals.", type: "certificate", author_name: "David Okonkwo", cover_url: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=600&q=80", skills: ["AWS", "Cloud"], likes_count: 67, views_count: 230, is_public: true, status: "published" },
];

const FILTER_KEYS = Object.keys(PORTFOLIO_TYPES);

export default function Portfolio() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: items, isLoading } = useQuery({
    queryKey: ["portfolioItems"],
    queryFn: () => base44.entities.PortfolioItem.list("-created_date", 50),
    enabled: !isDemoMode,
  });

  const allItems = isDemoMode ? DEMO_ITEMS : (items || []);
  const filtered = allItems.filter((item) => {
    if (activeFilter !== "all" && item.type !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (item.title || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q);
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
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Portfolio</h1>
          <p className="text-[12px] text-muted-foreground">Projects · Designs · Certificates</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center spring-tap gold-glow">
          <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={2.2} />
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search portfolio..."
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
            const meta = PORTFOLIO_TYPES[key];
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
        <div className="px-4 grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-[260px] rounded-[20px] shimmer" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-4">
          <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
            <EmptyState icon={FolderOpen} title="No portfolio items" description="Showcase your projects, research, designs, and achievements to build your professional identity" />
          </div>
        </div>
      ) : (
        <div className="px-4 grid grid-cols-2 gap-3">
          {filtered.map((item, i) => (
            <PortfolioCard key={item.id || i} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}