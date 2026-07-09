import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Sparkles, MapPin, Calendar, Award, Briefcase, GraduationCap, Globe, Trophy, Bookmark, BookmarkCheck, ChevronRight, CheckCircle2, Clock, FileCheck, Target, Bell } from "lucide-react";

const TYPES = ["All", "Scholarship", "Internship", "Job", "Competition", "Fellowship", "Grant"];

const typeIcons = { scholarship: GraduationCap, internship: Briefcase, competition: Trophy, research: Globe, job: Briefcase, fellowship: Award, grant: Award, exchange: Globe, volunteering: Briefcase, mentorship: Briefcase };
const withAlpha = (hsl, a = 0.08) => hsl.replace("))", ") / " + a + ")");
const typeColors = { scholarship: "hsl(var(--unibud-green))", internship: "hsl(var(--unibud-blue))", competition: "hsl(var(--unibud-gold))", research: "hsl(var(--unibud-purple))", job: "hsl(var(--unibud-red))", fellowship: "hsl(var(--unibud-orange))", grant: "hsl(var(--unibud-green))" };

const TRACKER_STATUSES = [
  { key: "interested", label: "Interested", color: "hsl(var(--unibud-n3))" },
  { key: "preparing", label: "Preparing", color: "hsl(var(--unibud-orange))" },
  { key: "applied", label: "Applied", color: "hsl(var(--unibud-blue))" },
  { key: "interview", label: "Interview", color: "hsl(var(--unibud-purple))" },
  { key: "offered", label: "Offered", color: "hsl(var(--unibud-green))" },
  { key: "rejected", label: "Rejected", color: "hsl(var(--unibud-red))" },
];

export default function Opportunities() {
  const [activeType, setActiveType] = useState("All");
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMatches, setAiMatches] = useState(null);
  const [showEligibility, setShowEligibility] = useState(false);
  const [tab, setTab] = useState("discover");
  const qc = useQueryClient();

  const { data: opportunities } = useQuery({ queryKey: ["opportunities"], queryFn: () => base44.entities.Opportunity.list("-created_date", 50) });
  const { data: trackers } = useQuery({ queryKey: ["applicationTrackers"], queryFn: () => base44.entities.ApplicationTracker.list() });

  const filtered = activeType === "All" ? opportunities : opportunities?.filter(o => o.type === activeType.toLowerCase()) || [];
  const savedOpps = opportunities?.filter(o => o.is_saved) || [];
  const upcomingDeadlines = trackers?.filter(t => t.deadline).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)).slice(0, 5) || [];

  const toggleSave = async (opp) => {
    await base44.entities.Opportunity.update(opp.id, { is_saved: !opp.is_saved });
    qc.invalidateQueries({ queryKey: ["opportunities"] });
  };

  const trackOpportunity = async (opp) => {
    await base44.entities.ApplicationTracker.create({ opportunity_title: opp.title, organization: opp.organization, type: opp.type, status: "interested", deadline: opp.deadline, amount: opp.amount, link: opp.link });
    qc.invalidateQueries({ queryKey: ["applicationTrackers"] });
  };

  const handleAIMatch = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `A student says: "${aiQuery}". From these opportunities: ${JSON.stringify(opportunities?.map(o => ({ title: o.title, type: o.type, eligibility: o.eligibility, tags: o.tags })))}. Return matching titles.`,
        response_json_schema: { type: "object", properties: { matches: { type: "array", items: { type: "string" } }, reasoning: { type: "string" } } },
      });
      setAiMatches({ matches: res?.matches || [], reasoning: res?.reasoning || "" });
    } catch { setAiMatches({ matches: [], reasoning: "" }); }
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen">
      <div className="flex items-center justify-between pt-12 pb-3 px-5">
        <div>
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Opportunities</h1>
          <p className="text-[12px] text-muted-foreground">Discover your next big step</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center gold-glow"><Trophy className="w-5 h-5 text-primary-foreground" /></div>
      </div>

      <div className="px-4 mb-3 flex gap-1.5 p-1 bg-muted/60 rounded-xl">
        <button onClick={() => setTab("discover")} className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${tab === "discover" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Discover</button>
        <button onClick={() => setTab("tracker")} className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${tab === "tracker" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Tracker</button>
        <button onClick={() => setTab("saved")} className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${tab === "saved" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>Saved</button>
      </div>

      {tab === "discover" && (
        <>
          <div className="px-4 pb-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search opportunities..." className="w-full pl-9 pr-4 h-[44px] rounded-2xl bg-card border border-border/50 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          <div className="px-4 pb-3">
            <button onClick={() => setShowAI(!showAI)} className={`w-full h-[44px] rounded-2xl font-semibold text-[12px] flex items-center justify-center gap-1.5 transition-colors ${showAI ? "bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(218,175,55,0.3)]" : "bg-card border border-primary/20 text-primary"}`}>
              <Sparkles className="w-4 h-4" /> AI Match Finder
            </button>
          </div>

          {showAI && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-4 pb-3">
              <div className="bg-card rounded-2xl p-3 premium-shadow border border-primary/20">
                <div className="flex gap-2 mb-2">
                  <input type="text" value={aiQuery} onChange={e => setAiQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAIMatch()} placeholder="Tell Bud about yourself..." className="flex-1 px-3 h-[40px] rounded-xl bg-muted text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  <button onClick={handleAIMatch} disabled={aiLoading} className="px-3 h-[40px] rounded-xl bg-primary text-primary-foreground font-semibold text-[12px] disabled:opacity-50">{aiLoading ? "..." : "Match"}</button>
                </div>
                {aiMatches && (
                  <div className="mt-2">
                    {aiMatches.reasoning && <p className="text-[11px] text-muted-foreground mb-2 flex items-start gap-1"><Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" /> {aiMatches.reasoning}</p>}
                    {aiMatches.matches.length > 0 && (
                      <div className="space-y-2">
                        {aiMatches.matches.map(title => {
                          const opp = opportunities?.find(o => o.title === title);
                          if (!opp) return null;
                          return <OpportunityCard key={opp.id} opp={opp} onToggleSave={() => toggleSave(opp)} onTrack={() => trackOpportunity(opp)} compact />;
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="px-4 pb-3">
            <button onClick={() => setShowEligibility(!showEligibility)} className="w-full bg-card rounded-2xl p-3.5 premium-shadow border border-border/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Target className="w-5 h-5 text-primary" /></div>
              <div className="flex-1 text-left"><p className="font-heading font-semibold text-[13px] text-foreground">Eligibility Checker</p><p className="text-[11px] text-muted-foreground">Find opportunities you qualify for</p></div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {showEligibility && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-4 pb-3">
              <div className="bg-card rounded-2xl p-4 premium-shadow border border-border/30">
                <p className="text-[12px] font-semibold text-foreground mb-3">Quick Profile</p>
                <div className="space-y-2">
                  <select className="w-full h-[40px] rounded-xl bg-muted px-3 text-[12px] text-foreground"><option>Level: 300 Level</option><option>100 Level</option><option>200 Level</option><option>400 Level</option><option>Postgraduate</option></select>
                  <select className="w-full h-[40px] rounded-xl bg-muted px-3 text-[12px] text-foreground"><option>GPA: 4.0+</option><option>3.5+</option><option>3.0+</option><option>Any</option></select>
                  <select className="w-full h-[40px] rounded-xl bg-muted px-3 text-[12px] text-foreground"><option>Field: Computer Science</option><option>Engineering</option><option>Medicine</option><option>Business</option><option>Any</option></select>
                </div>
                <button className="mt-3 w-full h-[40px] rounded-xl bg-primary text-primary-foreground font-semibold text-[12px] flex items-center justify-center gap-1.5"><Target className="w-4 h-4" /> Check Eligibility</button>
              </div>
            </motion.div>
          )}

          <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
            {TYPES.map(t => (
              <button key={t} onClick={() => setActiveType(t)} className={`px-3.5 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${activeType === t ? "bg-foreground text-background shadow-sm" : "bg-card border border-border/50 text-muted-foreground"}`}>{t}</button>
            ))}
          </div>

          <div className="px-4 space-y-3 pb-8">
            {filtered?.map((opp, i) => <OpportunityCard key={opp.id} opp={opp} onToggleSave={() => toggleSave(opp)} onTrack={() => trackOpportunity(opp)} delay={i * 0.04} />)}
          </div>
        </>
      )}

      {tab === "tracker" && (
        <div className="px-4 pb-8 space-y-4">
          {upcomingDeadlines.length > 0 && (
            <>
              <p className="font-heading font-bold text-[14px] text-foreground flex items-center gap-1.5"><Bell className="w-4 h-4 text-primary" /> Upcoming Deadlines</p>
              {upcomingDeadlines.map((t, i) => {
                const days = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-card rounded-2xl p-3.5 premium-shadow border border-border/30 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${days <= 3 ? "bg-destructive/10" : "bg-primary/10"}`}><Clock className={`w-4 h-4 ${days <= 3 ? "text-destructive" : "text-primary"}`} /></div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-[12px] text-foreground truncate">{t.opportunity_title}</p><p className="text-[10px] text-muted-foreground">{t.organization}</p></div>
                    <span className={`text-[10px] font-bold ${days <= 3 ? "text-destructive" : "text-muted-foreground"}`}>{days}d left</span>
                  </motion.div>
                );
              })}
            </>
          )}
          <p className="font-heading font-bold text-[14px] text-foreground mt-2">All Applications</p>
          {trackers && trackers.length > 0 ? trackers.map((t, i) => {
            const status = TRACKER_STATUSES.find(s => s.key === t.status);
            return (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-card rounded-2xl p-4 premium-shadow border border-border/30">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: withAlpha(typeColors[t.type] || "hsl(var(--unibud-gold))") }}><FileCheck className="w-5 h-5" style={{ color: typeColors[t.type] || "hsl(var(--unibud-gold))" }} /></div>
                  <div className="flex-1 min-w-0"><p className="font-heading font-semibold text-[13px] text-foreground">{t.opportunity_title}</p><p className="text-[11px] text-muted-foreground">{t.organization}</p></div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ backgroundColor: withAlpha(status?.color), color: status?.color }}>{status?.label}</span>
                  {t.deadline && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(t.deadline).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>}
                </div>
              </motion.div>
            );
          }) : <EmptyState icon={FileCheck} title="No tracked applications" subtitle="Track opportunities to stay organized" />}
        </div>
      )}

      {tab === "saved" && (
        <div className="px-4 pb-8 space-y-3">
          {savedOpps.length > 0 ? savedOpps.map((opp, i) => <OpportunityCard key={opp.id} opp={opp} onToggleSave={() => toggleSave(opp)} onTrack={() => trackOpportunity(opp)} delay={i * 0.04} />) : <EmptyState icon={Bookmark} title="No saved opportunities" subtitle="Bookmark opportunities to find them here" />}
        </div>
      )}
    </div>
  );
}

function OpportunityCard({ opp, onToggleSave, onTrack, delay = 0, compact }) {
  const Icon = typeIcons[opp.type] || Briefcase;
  const color = typeColors[opp.type] || "hsl(var(--unibud-gold))";
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="bg-card rounded-2xl p-4 premium-shadow border border-border/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: withAlpha(color) }}><Icon className="w-5 h-5" style={{ color }} /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div><p className="font-heading font-semibold text-[13px] leading-snug text-foreground">{opp.title}</p><p className="text-[11px] text-muted-foreground">{opp.organization}</p></div>
            <button onClick={onToggleSave} className="flex-shrink-0">{opp.is_saved ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4 text-muted-foreground" />}</button>
          </div>
          {opp.amount && <p className="font-heading font-bold text-[14px] text-primary mt-1">{opp.amount}</p>}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {opp.location && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="w-2.5 h-2.5" /> {opp.location}</span>}
            {opp.deadline && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Calendar className="w-2.5 h-2.5" /> {opp.deadline}</span>}
          </div>
          {opp.tags && opp.tags.length > 0 && <div className="flex gap-1.5 mt-2">{opp.tags.slice(0, 3).map(tag => <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[9px] font-semibold">{tag}</span>)}</div>}
          {!compact && (
            <div className="flex gap-2 mt-3">
              <button onClick={onTrack} className="flex-1 h-[36px] rounded-xl bg-primary/10 text-primary font-semibold text-[11px] flex items-center justify-center gap-1"><FileCheck className="w-3.5 h-3.5" /> Track</button>
              {opp.link && <a href={opp.link} target="_blank" rel="noreferrer" className="flex-1 h-[36px] rounded-xl bg-foreground text-background font-semibold text-[11px] flex items-center justify-center gap-1">Apply <ChevronRight className="w-3 h-3" /></a>}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return <div className="text-center py-12"><Icon className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-[13px] font-semibold text-foreground">{title}</p><p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p></div>;
}