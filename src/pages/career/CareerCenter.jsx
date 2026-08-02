import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import {
  Search, Bookmark, BookmarkCheck, Briefcase, FileCheck, Clock, Upload, ChevronRight,
  TrendingUp, Calendar, Building2, MapPin, Award, ExternalLink, FileText,
} from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import BudCareerRecommendations from "@/components/career/BudCareerRecommendations";
import OpportunityDetailSheet from "@/components/career/OpportunityDetailSheet";
import ResumeManager from "@/components/career/ResumeManager";
import { TYPE_META, CATEGORIES, TRACKER_STATUSES } from "@/components/career/careerConstants";

const withAlpha = (hsl, a = 0.08) => hsl.replace("))", `) / ${a})`);

export default function CareerCenter() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [resumes, setResumes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("career_resumes") || "[]"); } catch { return []; }
  });

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ["careerOpportunities"],
    queryFn: () => base44.entities.Opportunity.list("-created_date", 100),
  });
  const { data: trackers } = useQuery({
    queryKey: ["applicationTrackers"],
    queryFn: () => base44.entities.ApplicationTracker.list("-created_date", 100),
  });

  const filtered = useMemo(() => {
    let arr = opportunities || [];
    const cat = CATEGORIES.find((c) => c.key === activeCat);
    if (cat?.types?.length > 0) arr = arr.filter((o) => cat.types.includes(o.type));
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((o) =>
        o.title?.toLowerCase().includes(q) ||
        o.organization?.toLowerCase().includes(q) ||
        (o.tags || []).some((t) => t.toLowerCase().includes(q)) ||
        (o.description || "").toLowerCase().includes(q)
      );
    }
    return arr;
  }, [opportunities, activeCat, search]);

  const savedOpps = useMemo(() => (opportunities || []).filter((o) => (o.favorited_by || []).includes(user?.id)), [opportunities, user]);
  const upcomingDeadlines = useMemo(() => {
    return (trackers || [])
      .filter((t) => t.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);
  }, [trackers]);

  const stats = useMemo(() => ({
    saved: savedOpps.length,
    applied: (trackers || []).filter((t) => ["applied", "interview", "offered"].includes(t.status)).length,
    interviews: (trackers || []).filter((t) => t.status === "interview").length,
    offers: (trackers || []).filter((t) => t.status === "offered").length,
  }), [savedOpps, trackers]);

  const toggleBookmark = async (opp) => {
    const favoritedBy = opp.favorited_by || [];
    const isFav = favoritedBy.includes(user.id);
    const next = isFav ? favoritedBy.filter((id) => id !== user.id) : [...favoritedBy, user.id];
    try {
      await base44.entities.Opportunity.update(opp.id, { favorited_by: next });
      qc.invalidateQueries({ queryKey: ["careerOpportunities"] });
    } catch {
      toast({ title: "Couldn't update", variant: "destructive" });
    }
  };

  const updateStatus = async (trackerId, status) => {
    try {
      await base44.entities.ApplicationTracker.update(trackerId, { status });
      qc.invalidateQueries({ queryKey: ["applicationTrackers"] });
      toast({ title: "Status updated" });
    } catch {
      toast({ title: "Couldn't update", variant: "destructive" });
    }
  };

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-6 pb-36 safe-area-pt">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="font-bold text-[28px] text-foreground tracking-tight">Career Center</h1>
          <p className="text-[12px] text-muted-foreground mt-0.5">Internships · Jobs · Scholarships · Competitions</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center ice-glow">
          <Briefcase className="w-5 h-5 text-primary-foreground" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 p-1 bg-muted/60 rounded-[16px]">
        {[
          { key: "overview", label: "Overview" },
          { key: "discover", label: "Discover" },
          { key: "applications", label: "Applications" },
          { key: "resume", label: "Resume" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-[12px] text-[11px] font-semibold transition-all spring-tap ${tab === t.key ? "bg-card text-foreground soft-shadow" : "text-muted-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Saved", value: stats.saved, icon: Bookmark, color: "primary" },
              { label: "Applied", value: stats.applied, icon: FileCheck, color: "information" },
              { label: "Interviews", value: stats.interviews, icon: TrendingUp, color: "warning" },
              { label: "Offers", value: stats.offers, icon: Award, color: "success" },
            ].map((s) => (
              <div key={s.label} className="glass-card p-2.5 rounded-[14px] text-center">
                <s.icon className={`w-3.5 h-3.5 mx-auto mb-1 text-${s.color}`} />
                <p className="text-[16px] font-bold text-foreground tabular-nums">{s.value}</p>
                <p className="text-[8px] text-muted-foreground uppercase">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bud Recommendations */}
          <BudCareerRecommendations user={user} opportunities={opportunities} onOpen={setSelectedOpp} />

          {/* Upcoming Deadlines */}
          {upcomingDeadlines.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-primary" /> Upcoming Deadlines
              </h3>
              <div className="space-y-2">
                {upcomingDeadlines.map((t) => {
                  const days = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={t.id} className="glass-card p-3 rounded-[14px] flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-[12px] flex items-center justify-center ${days <= 3 ? "bg-destructive/10" : "bg-primary/10"}`}>
                        <Clock className={`w-4 h-4 ${days <= 3 ? "text-destructive" : "text-primary"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-foreground truncate">{t.opportunity_title}</p>
                        <p className="text-[10px] text-muted-foreground">{t.organization}</p>
                      </div>
                      <span className={`text-[10px] font-bold ${days <= 3 ? "text-destructive" : "text-muted-foreground"}`}>{days <= 0 ? "Today" : `${days}d`}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Saved Opportunities */}
          {savedOpps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Saved</h3>
                <button onClick={() => setTab("discover")} className="text-[10px] font-medium text-primary spring-tap">Browse all →</button>
              </div>
              <div className="space-y-2">
                {savedOpps.slice(0, 3).map((opp) => (
                  <OppRow key={opp.id} opp={opp} user={user} onOpen={setSelectedOpp} onBookmark={toggleBookmark} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Discover Tab */}
      {tab === "discover" && (
        <div>
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-muted/30 border border-border/30 text-[13px] text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/30"
            />
          </div>

          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCat(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap spring-tap ${activeCat === cat.key ? "bg-foreground text-background" : "bg-muted/30 text-muted-foreground border border-border/20"}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Opportunity list */}
          {isLoading ? (
            <div className="space-y-2">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 rounded-[16px] shimmer" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="bg-card rounded-[20px] border border-border/40">
              <EmptyState icon={Briefcase} title="No opportunities found" description="Try a different search or check back later." />
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((opp, i) => (
                <OppRow key={opp.id} opp={opp} user={user} index={i} onOpen={setSelectedOpp} onBookmark={toggleBookmark} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applications Tab */}
      {tab === "applications" && (
        <div>
          {(!trackers || trackers.length === 0) ? (
            <div className="bg-card rounded-[20px] border border-border/40">
              <EmptyState icon={FileCheck} title="No applications tracked" description="Track opportunities from the Discover tab to manage your applications here." action={<button onClick={() => setTab("discover")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap"><Briefcase className="w-3.5 h-3.5" /> Browse Opportunities</button>} />
            </div>
          ) : (
            <div className="space-y-2">
              {trackers.map((t, i) => {
                const status = TRACKER_STATUSES.find((s) => s.key === t.status);
                const meta = TYPE_META[t.type] || TYPE_META.job;
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    className="glass-card p-3.5 rounded-[16px]"
                  >
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: `hsl(var(--${meta.color}) / 0.10)` }}>
                        <Icon className="w-4 h-4" style={{ color: `hsl(var(--${meta.color}))` }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-foreground truncate">{t.opportunity_title}</p>
                        <p className="text-[11px] text-muted-foreground">{t.organization}</p>
                      </div>
                      {t.deadline && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                          <Calendar className="w-2.5 h-2.5" /> {t.deadline}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      {t.resume_url && (
                        <a href={t.resume_url} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded-full bg-muted/30 text-[9px] font-medium text-muted-foreground flex items-center gap-1 spring-tap">
                          <FileText className="w-2.5 h-2.5" /> {t.resume_name || "Resume"}
                        </a>
                      )}
                      {t.link && (
                        <a href={t.link} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded-full bg-muted/30 text-[9px] font-medium text-muted-foreground flex items-center gap-1 spring-tap">
                          <ExternalLink className="w-2.5 h-2.5" /> Link
                        </a>
                      )}
                    </div>

                    {/* Status selector */}
                    <div className="flex gap-1 flex-wrap">
                      {TRACKER_STATUSES.map((s) => (
                        <button
                          key={s.key}
                          onClick={() => updateStatus(t.id, s.key)}
                          className={`px-2 py-0.5 rounded-full text-[9px] font-semibold spring-tap transition-all ${t.status === s.key ? `bg-${s.color} text-${s.color}-foreground` : "bg-muted/30 text-muted-foreground"}`}
                          style={t.status === s.key ? { background: `hsl(var(--${s.color}) / 0.15)`, color: `hsl(var(--${s.color}))` } : {}}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Resume Tab */}
      {tab === "resume" && <ResumeManager resumes={resumes} setResumes={setResumes} />}

      {/* Detail Sheet */}
      <AnimatePresence>
        {selectedOpp && (
          <OpportunityDetailSheet
            opp={selectedOpp}
            user={user}
            resumes={resumes}
            onClose={() => setSelectedOpp(null)}
            onTracked={() => qc.invalidateQueries({ queryKey: ["applicationTrackers"] })}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function OppRow({ opp, user, index = 0, onOpen, onBookmark }) {
  const meta = TYPE_META[opp.type] || TYPE_META.job;
  const Icon = meta.icon;
  const isFav = (opp.favorited_by || []).includes(user?.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      onClick={() => onOpen?.(opp)}
      className="glass-card p-3.5 rounded-[16px] card-hover cursor-pointer spring-tap"
    >
      <div className="flex items-start gap-2.5">
        <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: `hsl(var(--${meta.color}) / 0.10)` }}>
          <Icon className="w-4 h-4" style={{ color: `hsl(var(--${meta.color}))` }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-foreground truncate">{opp.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{opp.organization}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark?.(opp); }}
              className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted/40 spring-tap"
            >
              {isFav ? <BookmarkCheck className="w-3.5 h-3.5 text-primary" /> : <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {opp.location && <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><MapPin className="w-2.5 h-2.5" /> {opp.location}</span>}
            {opp.deadline && <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><Calendar className="w-2.5 h-2.5" /> {opp.deadline}</span>}
            {opp.amount && <span className="text-[9px] font-bold text-success flex items-center gap-0.5"><Award className="w-2.5 h-2.5" /> {opp.amount}</span>}
          </div>
          {opp.tags?.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {opp.tags.slice(0, 3).map((tag) => <span key={tag} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[8px] font-semibold">{tag}</span>)}
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
      </div>
    </motion.div>
  );
}