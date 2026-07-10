import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, FlaskConical, ArrowRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import JourneyStageBanner from "@/components/journey/JourneyStageBanner";
import { POSTGRADUATE_CATEGORIES } from "@/lib/universityJourney";
import EmptyState from "@/components/ui/EmptyState";

export default function PostgraduateDashboard({ user }) {
  const firstName = user?.preferred_name || user?.full_name?.split(" ")[0] || "Researcher";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const pgLabels = {
    pgd: "PGD",
    masters: "Master's",
    phd: "PhD",
    mba: "MBA",
    mphil: "MPhil",
  };

  const { data: researchProjects } = useQuery({
    queryKey: ["pgResearchProjects"],
    queryFn: () => base44.entities.ResearchProject.filter({ status: "active" }, "-created_date", 5),
  });

  const { data: scholarships } = useQuery({
    queryKey: ["pgScholarships"],
    queryFn: () => base44.entities.Scholarship.filter({ status: "open", level: "postgraduate" }, "-created_date", 5),
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between pt-12 pb-2 px-5"
      >
        <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">UNIBUD</h1>
        <div className="flex items-center gap-2.5">
          <Link to="/notifications" className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
            <Bell className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
          </Link>
          <Link to="/me" className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-purple/80 soft-shadow flex items-center justify-center text-white font-bold text-sm spring-tap">
            {firstName.charAt(0)}
          </Link>
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-4"
      >
        <h2 className="font-heading font-bold text-[20px] tracking-tight text-foreground">{greeting}, {firstName}</h2>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[12px] text-purple font-medium">
            <FlaskConical className="w-3.5 h-3.5" /> Postgraduate
          </span>
          {user?.postgraduate_type && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-[12px] text-muted-foreground font-medium">{pgLabels[user.postgraduate_type] || user.postgraduate_type}</span>
            </>
          )}
          {user?.postgraduate_field && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-[12px] text-muted-foreground font-medium">{user.postgraduate_field}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Journey Stage Banner */}
      <JourneyStageBanner user={user} />

      {/* Postgraduate Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-6"
      >
        <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">Research & Academic Tools</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {POSTGRADUATE_CATEGORIES.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.03, type: "spring", stiffness: 300, damping: 24 }}
              >
                <Link to={cat.path} className="block">
                  <div className="bg-card rounded-[18px] soft-shadow border border-border/20 p-3 text-center card-hover spring-tap h-full">
                    <div className={`w-9 h-9 rounded-[12px] ${cat.bg} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-[17px] h-[17px] ${cat.color}`} strokeWidth={2} />
                    </div>
                    <p className="font-heading font-semibold text-[10px] text-foreground leading-tight">{cat.label}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Research Projects */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-6"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-heading font-bold text-[16px] text-foreground">Active Research</h3>
          <Link to="/research" className="text-[12px] text-primary font-semibold spring-tap">View all</Link>
        </div>
        {!researchProjects || researchProjects.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/20">
            <EmptyState icon={FlaskConical} title="No research projects yet" description="Explore ongoing research projects or start your own." />
          </div>
        ) : (
          <div className="space-y-2.5">
            {researchProjects.slice(0, 3).map((proj, i) => (
              <Link key={proj.id || i} to="/research" className="block">
                <div className="bg-card rounded-[20px] soft-shadow border border-border/20 p-4 flex items-center gap-3 card-hover">
                  <div className="w-10 h-10 rounded-[14px] bg-purple/10 flex items-center justify-center flex-shrink-0">
                    <FlaskConical className="w-5 h-5 text-purple" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-[13px] text-foreground">{proj.title}</p>
                    <p className="text-[11px] text-muted-foreground">{proj.author_name}{proj.is_recruiting ? " · Recruiting" : ""}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Funding & Scholarships */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-6"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-heading font-bold text-[16px] text-foreground">Research Funding</h3>
          <Link to="/scholarships" className="text-[12px] text-primary font-semibold spring-tap">View all</Link>
        </div>
        {!scholarships || scholarships.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/20">
            <EmptyState icon={Sparkles} title="No funding yet" description="Research grants and scholarships will appear here as they become available." />
          </div>
        ) : (
          <div className="space-y-2.5">
            {scholarships.slice(0, 3).map((sch, i) => (
              <Link key={sch.id || i} to="/scholarships" className="block">
                <div className="bg-card rounded-[20px] soft-shadow border border-border/20 p-4 flex items-center gap-3 card-hover">
                  <div className="w-10 h-10 rounded-[14px] bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-[13px] text-foreground">{sch.title}</p>
                    <p className="text-[11px] text-muted-foreground">{sch.provider} · {sch.amount || "See details"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Mentorship CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-10"
      >
        <Link to="/mentorship" className="block">
          <div className="rounded-[24px] bg-gradient-to-br from-purple/10 to-purple/5 border border-purple/15 p-5 card-hover spring-tap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[16px] bg-purple/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-purple" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-[15px] text-foreground">Mentor Undergraduate Students</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Share your research experience and guide the next generation</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}