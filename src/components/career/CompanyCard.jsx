import React, { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, MapPin, Briefcase, ExternalLink, Users, UserPlus, Check } from "lucide-react";
import { COMPANY_TYPES, formatNumber } from "./careerConstants";

export default function CompanyCard({ company, index = 0, onFollow }) {
  const [following, setFollowing] = useState(company.is_following || false);
  const typeMeta = COMPANY_TYPES[company.type] || COMPANY_TYPES.other;
  const Icon = typeMeta.icon;

  const handleFollow = () => {
    setFollowing(!following);
    if (onFollow) onFollow(company);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden card-hover"
    >
      {company.banner_url && (
        <div className="h-16 overflow-hidden relative">
          <img src={company.banner_url} alt={company.name} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.name} className="w-12 h-12 rounded-[14px] object-cover flex-shrink-0 border-2 border-card -mt-6" loading="lazy" />
          ) : (
            <div className={"w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 border-2 border-card -mt-6 " + typeMeta.bg}>
              <Icon className={"w-6 h-6 " + typeMeta.color} strokeWidth={2} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-heading font-semibold text-[14px] text-foreground leading-snug truncate">{company.name}</h3>
              {company.is_verified && <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />}
            </div>
            {company.tagline && <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{company.tagline}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className={"px-2.5 py-1 rounded-full text-[10px] font-semibold " + typeMeta.bg + " " + typeMeta.color}>{typeMeta.label}</span>
          {company.headquarters && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <MapPin className="w-3 h-3" /> {company.headquarters}
            </span>
          )}
          {company.is_hiring && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-success">
              <Briefcase className="w-3 h-3" /> Hiring
            </span>
          )}
          {company.followers_count > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Users className="w-3 h-3" /> {formatNumber(company.followers_count)}
            </span>
          )}
        </div>

        {company.perks && company.perks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {company.perks.slice(0, 3).map((perk, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-muted text-[9px] text-muted-foreground font-medium">{perk}</span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-3">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-[14px] bg-muted text-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Website
            </a>
          )}
          <button
            onClick={handleFollow}
            className={"flex-1 py-2.5 rounded-[14px] text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap " + (following ? "bg-success/15 text-success" : "bg-primary text-primary-foreground")}
          >
            {following ? <><Check className="w-3.5 h-3.5" /> Following</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}