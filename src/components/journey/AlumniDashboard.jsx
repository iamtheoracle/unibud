import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, ArrowRight, Sparkles, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import JourneyStageBanner from "@/components/journey/JourneyStageBanner";
import { ALUMNI_CATEGORIES } from "@/lib/universityJourney";
import EmptyState from "@/components/ui/EmptyState";

export default function AlumniDashboard({ user }) {
  const firstName = user?.preferred_name || user?.full_name?.split(" ")[0] || "Alumni";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const { data: mentors } = useQuery({
    queryKey: ["alumniMentors"],
    queryFn: () => base44.entities.Mentor.filter({ is_available: true }, "-rating", 5),
  });

  const { data: opportunities } = useQuery({
    queryKey: ["alumniOpportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 5),
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
          <Link to="/me" className="w-10 h-10 rounded-full bg-gradient-to-br from-success to-success/80 soft-shadow flex items-center justify-center text-white font-bold text-sm spring-tap">
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
          <span className="inline-flex items-center gap-1 text-[12px] text-success font-medium">
            <Award className="w-3.5 h-3.5" /> Alumni
          </span>
          {user?.graduation_year && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-[12px] text-muted-foreground font-medium">Class of {user.graduation_year}</span>
            </>
          )}
          {user?.current_occupation && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-[12px] text-muted-foreground font-medium">{user.current_occupation}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Journey Stage Banner */}
      <JourneyStageBanner user={user} />

      {/* Alumni Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-6"
      >
        <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">Stay Connected</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {ALUMNI_CATEGORIES.map((cat, i) => {
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

      {/* Mentorship — Give Back */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-6"
      >
        <Link to="/mentorship" className="block">
          <div className="rounded-[24px] bg-gradient-to-br from-error/10 to-error/5 border border-error/15 p-5 card-hover spring-tap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[16px] bg-error/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-error" />
              </div>
              <div className="flex-1">
                <p className="font-heading font-bold text-[15px] text-foreground">Give Back as a Mentor</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Share your journey and inspire the next generation of students</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Career Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-6"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-heading font-bold text-[16px] text-foreground">Career Opportunities</h3>
          <Link to="/opportunities" className="text-[12px] text-primary font-semibold spring-tap">View all</Link>
        </div>
        {!opportunities || opportunities.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/20">
            <EmptyState icon={Award} title="No opportunities yet" description="New career opportunities will appear here as they become available." />
          </div>
        ) : (
          <div className="space-y-2.5">
            {opportunities.slice(0, 3).map((opp, i) => (
              <Link key={opp.id || i} to="/opportunities" className="block">
                <div className="bg-card rounded-[20px] soft-shadow border border-border/20 p-4 flex items-center gap-3 card-hover">
                  <div className="w-10 h-10 rounded-[14px] bg-info/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-info" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-[13px] text-foreground">{opp.title}</p>
                    <p className="text-[11px] text-muted-foreground">{opp.organization || opp.provider}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Mentor Connections */}
      {mentors && mentors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="px-5 pb-10"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-heading font-bold text-[16px] text-foreground">Fellow Mentors</h3>
            <Link to="/mentorship" className="text-[12px] text-primary font-semibold spring-tap">View all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {mentors.slice(0, 5).map((mentor, i) => (
              <Link key={mentor.id || i} to={`/mentor/${mentor.id || ""}`} className="flex-shrink-0 w-[160px]">
                <div className="bg-card rounded-[20px] soft-shadow border border-border/20 p-4 card-hover">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-success/30 to-success/10 flex items-center justify-center mb-2 overflow-hidden">
                    {mentor.image_url || mentor.avatar_url ? (
                      <img src={mentor.image_url || mentor.avatar_url} alt={mentor.name} className="w-full h-full object-cover" />
                    ) : (
                      <Award className="w-5 h-5 text-success" />
                    )}
                  </div>
                  <p className="font-heading font-semibold text-[12px] text-foreground truncate">{mentor.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{mentor.role || "Alumni Mentor"}</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}