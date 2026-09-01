import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Search, Star, Github, FileText, Video,
  Image, Users, Heart, MessageCircle, Award, Sparkles,
  ChevronRight, Filter, Rocket, Lightbulb, Code, Cpu,
} from "lucide-react";

const TYPE_FILTERS = ["All", "Featured", "Software", "Hardware", "Research", "Prototype"];

const typeIcons = {
  software: Code, hardware: Cpu, research: Lightbulb, prototype: Rocket, design: Lightbulb, mixed: Sparkles,
};

const typeColors = {
  software: "hsl(var(--unibud-purple))", hardware: "hsl(var(--unibud-blue))",
  research: "hsl(var(--unibud-green))", prototype: "hsl(var(--unibud-orange))",
  design: "hsl(var(--unibud-gold))", mixed: "hsl(var(--unibud-blue))",
};

const withAlpha = (hsl, a = 0.08) => hsl.replace("))", ") / " + a + ")");

export default function FYPHub() {
  const [activeType, setActiveType] = useState("All");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: projects } = useQuery({
    queryKey: ["fypProjects"],
    queryFn: () => base44.entities.FYPProject.list("-created_date", 50),
  });

  let filtered = projects || [];
  if (activeType === "Featured") filtered = filtered.filter(p => p.is_featured);
  else if (activeType !== "All") filtered = filtered.filter(p => p.project_type === activeType.toLowerCase());
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.student_name?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  const featured = projects?.filter(p => p.is_featured)?.[0];
  const toggleLike = async (project) => {
    await base44.entities.FYPProject.update(project.id, {
      likes_count: project.is_reacted ? project.likes_count - 1 : project.likes_count + 1,
      is_reacted: !project.is_reacted,
    });
    qc.invalidateQueries({ queryKey: ["fypProjects"] });
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">FYP Hub</h1>
          <p className="text-[12px] text-muted-foreground">Final Year Projects Showcase</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow">
          <Rocket className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects, students, departments..."
            className="w-full pl-10 pr-4 h-[44px] rounded-[16px] bg-card border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 soft-shadow" />
        </div>
      </div>

      {/* Featured */}
      {featured && activeType === "All" && !search && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-4 mb-4">
          <div className="relative rounded-[24px] overflow-hidden premium-shadow border border-border/30" style={{ background: `linear-gradient(135deg, ${withAlpha(featured.accent_color || "hsl(var(--unibud-gold))", 0.12)}, hsl(var(--card)))` }}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-[16px] bg-primary/15 flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> FEATURED
                </span>
              </div>
              <h3 className="font-heading font-bold text-[17px] text-foreground mb-1">{featured.title}</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">{featured.description}</p>
              <div className="flex items-center gap-3 mb-3 text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{featured.student_name}</span>
                <span>·</span>
                <span>{featured.department}</span>
              </div>
              <div className="flex items-center gap-3">
                {featured.github_url && (
                  <a href={featured.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/50 text-[10px] font-semibold">
                    <Github className="w-3 h-3" /> Code
                  </a>
                )}
                {featured.video_url && (
                  <a href={featured.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/50 text-[10px] font-semibold">
                    <Video className="w-3 h-3" /> Demo
                  </a>
                )}
                {featured.report_url && (
                  <a href={featured.report_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted/50 text-[10px] font-semibold">
                    <FileText className="w-3 h-3" /> Report
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {TYPE_FILTERS.map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-4 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap ${activeType === t ? "bg-foreground text-background soft-shadow" : "bg-card border border-border/40 text-muted-foreground"}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Projects */}
      <div className="px-4 space-y-3">
        {filtered.map((project, i) => (
          <ProjectCard key={project.id} project={project} onLike={() => toggleLike(project)} delay={i * 0.04} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-3">
            <Rocket className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
          </div>
          <p className="text-[13px] font-semibold text-foreground">No projects found</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onLike, delay = 0 }) {
  const Icon = typeIcons[project.project_type] || Rocket;
  const color = typeColors[project.project_type] || "hsl(var(--unibud-gold))";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover"
    >
      <div className="flex items-start gap-3">
        {project.cover_image_url ? (
          <img src={project.cover_image_url} alt={project.title} className="w-14 h-14 rounded-[16px] object-cover flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-[16px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: withAlpha(color) }}>
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-heading font-semibold text-[13px] text-foreground leading-snug">{project.title}</p>
              <p className="text-[11px] text-muted-foreground">{project.student_name}</p>
            </div>
            {project.is_featured && <Star className="w-4 h-4 text-primary flex-shrink-0 fill-primary" />}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{project.description}</p>
          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-[10px] text-muted-foreground">{project.department}</span>
            {project.grade && (
              <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[9px] font-semibold">{project.grade}</span>
            )}
          </div>
          {project.tags && project.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {project.tags.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[9px] font-semibold">{tag}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-3">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                <Github className="w-3.5 h-3.5" /> Code
              </a>
            )}
            {project.video_url && (
              <a href={project.video_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                <Video className="w-3.5 h-3.5" /> Demo
              </a>
            )}
            {project.report_url && (
              <a href={project.report_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
                <FileText className="w-3.5 h-3.5" /> Report
              </a>
            )}
            <button onClick={onLike} className="flex items-center gap-1 text-[10px] ml-auto">
              <Heart className={`w-3.5 h-3.5 ${project.is_reacted ? "fill-error text-error" : "text-muted-foreground"}`} />
              <span className="text-muted-foreground">{project.likes_count || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}