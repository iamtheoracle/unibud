import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, ExternalLink, FileText, DollarSign, BadgeCheck, UserPlus, Check } from "lucide-react";
import { RESEARCH_TYPES } from "./careerConstants";

export default function ResearchCard({ project, index = 0, onJoin }) {
  const [joined, setJoined] = useState(project.is_joined || false);
  const typeMeta = RESEARCH_TYPES[project.type] || RESEARCH_TYPES.project;
  const Icon = typeMeta.icon;

  const handleJoin = () => {
    setJoined(!joined);
    if (onJoin) onJoin(project);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden card-hover"
    >
      {project.image_url && (
        <div className="h-24 overflow-hidden">
          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={"w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 " + typeMeta.bg}>
            <Icon className={"w-5 h-5 " + typeMeta.color} strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5">
              <h3 className="font-heading font-semibold text-[14px] text-foreground leading-snug line-clamp-2 flex-1">{project.title}</h3>
              {project.is_verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">{project.author_name}{project.supervisor ? ` · ${project.supervisor}` : ""}</p>
          </div>
        </div>

        {project.abstract && (
          <p className="text-[12px] text-muted-foreground mt-3 line-clamp-2 leading-relaxed">{project.abstract}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={"px-2.5 py-1 rounded-full text-[10px] font-semibold " + typeMeta.bg + " " + typeMeta.color}>{typeMeta.label}</span>
          {project.members_count > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="w-3 h-3" /> {project.members_count}
            </span>
          )}
          {project.funding_amount && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-primary">
              <DollarSign className="w-3 h-3" /> {project.funding_amount}
            </span>
          )}
        </div>

        {project.keywords && project.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {project.keywords.slice(0, 3).map((kw, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-[9px] text-muted-foreground font-medium">{kw}</span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          {project.paper_url && (
            <a
              href={project.paper_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-[14px] bg-muted text-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap"
            >
              <FileText className="w-3.5 h-3.5" /> Paper
            </a>
          )}
          {project.is_recruiting && (
            <button
              onClick={handleJoin}
              className={"flex-1 py-2.5 rounded-[14px] text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap " + (joined ? "bg-success/15 text-success" : "bg-primary text-primary-foreground")}
            >
              {joined ? <><Check className="w-3.5 h-3.5" /> Joined</> : <><UserPlus className="w-3.5 h-3.5" /> Join</>}
            </button>
          )}
          {!project.is_recruiting && !project.paper_url && project.external_link && (
            <a
              href={project.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap"
            >
              View <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}