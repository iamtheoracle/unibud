import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Search, Globe, ArrowRight, Loader2, Check, Building, MapPin, Rocket, GraduationCap, Sparkles, Award, FlaskConical } from "lucide-react";
import AuthLogo from "@/components/auth/AuthLogo";
import { COUNTRIES, UNIVERSITIES, LEVELS } from "@/data/universities";
import { ensureCommunityInstitution } from "@/lib/institutionService";
import MobileSelect from "@/components/ui/MobileSelect";

export default function UniversitySelection() {
  const navigate = useNavigate();
  const [showPathChoice, setShowPathChoice] = useState(true);
  const [country, setCountry] = useState("");
  const [uniSearch, setUniSearch] = useState("");
  const [uniSelected, setUniSelected] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [campus, setCampus] = useState("");
  const [campuses, setCampuses] = useState([]);
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [courseMajor, setCourseMajor] = useState("");
  const [level, setLevel] = useState("");
  const [accent, setAccent] = useState(null);
  const [loading, setLoading] = useState(false);
  const uniRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (uniRef.current && !uniRef.current.contains(e.target)) setShowSuggestions(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredUnis = uniSearch.length > 0
    ? UNIVERSITIES.filter((u) => u.name.toLowerCase().includes(uniSearch.toLowerCase()) || (u.short && u.short.toLowerCase().includes(uniSearch.toLowerCase()))).slice(0, 6)
    : [];

  const selectUni = (uni) => {
    setUniSelected(uni);
    setUniSearch(uni.name);
    setShowSuggestions(false);
    setAccent(uni.accent);
    setCampuses(uni.campuses || []);
    setCampus("");
  };

  const canContinue = country && uniSearch && faculty && department && courseMajor && level;

  const handleContinue = async () => {
    setLoading(true);
    try {
      const uniName = uniSelected ? uniSelected.name : uniSearch;
      // Save the student's selection to their profile
      await base44.auth.updateMe({ country, university: uniName, campus, faculty, department, course_major: courseMajor, level });
      // Ensure a Community Supported institution profile exists so the student's
      // institution is recognized on the platform and can be claimed later.
      // This runs in the background — it must not block onboarding if it fails.
      ensureCommunityInstitution(uniName, country).catch(() => {});
      navigate("/university-connect");
    } catch {}
    setLoading(false);
  };

  const btnStyle = accent ? { backgroundColor: accent, boxShadow: `0 4px 20px ${accent}40` } : {};
  const barStyle = { width: "50%", backgroundColor: accent || "hsl(var(--primary))" };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <motion.div className="absolute top-[-15%] left-[-10%] w-[70%] h-[40%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none" animate={{ x: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity }} />

      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-8 relative z-10 no-scrollbar">
        <AuthLogo size="md" />

        <AnimatePresence mode="wait">
          {showPathChoice ? (
            <motion.div
              key="path-choice"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="mb-6"
            >
              <div className="mb-6">
                <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">Welcome to UNIBUD</h2>
                <p className="text-[14px] text-muted-foreground">Your lifelong companion — from pre-university through graduation and beyond. Where are you on your journey?</p>
              </div>

              <div className="space-y-3">
                {/* Future Student Path */}
                <button
                  onClick={() => { setShowPathChoice(false); navigate("/future-student-onboarding"); }}
                  className="w-full text-left p-5 rounded-[24px] border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/40 transition-all spring-tap"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[18px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Rocket className="w-7 h-7 text-primary" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-bold text-[15px] text-foreground flex items-center gap-1.5">
                        Future Student
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-semibold">PRE-UNIVERSITY</span>
                      </p>
                      <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                        Preparing for WAEC, NECO, JAMB, or admission? Start your journey here — explore universities, prep courses, scholarships, and mentorship before you're admitted.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2} />
                  </div>
                </button>

                {/* Current Student Path */}
                <button
                  onClick={() => setShowPathChoice(false)}
                  className="w-full text-left p-5 rounded-[24px] border border-border/40 bg-card hover:border-border/70 transition-all spring-tap"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-[18px] bg-info/10 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-7 h-7 text-info" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-bold text-[15px] text-foreground">Undergraduate Student</p>
                      <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">
                        Already enrolled? Select your university and connect your student account to unlock everything.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" strokeWidth={2} />
                  </div>
                </button>
              </div>

              {/* Journey stages preview */}
              <div className="mt-4 p-3.5 rounded-[18px] bg-muted/30 border border-border/20">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your lifelong journey</p>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Rocket className="w-3 h-3 text-primary" /> Future</span>
                  <span className="text-muted-foreground/40">→</span>
                  <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3 text-info" /> Undergrad</span>
                  <span className="text-muted-foreground/40">→</span>
                  <span className="flex items-center gap-1"><FlaskConical className="w-3 h-3 text-purple" /> Postgrad</span>
                  <span className="text-muted-foreground/40">→</span>
                  <span className="flex items-center gap-1"><Award className="w-3 h-3 text-success" /> Alumni</span>
                </div>
              </div>

              <p className="text-center text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Bud transitions with you at every stage — your history is always preserved
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {!showPathChoice && (
          <>
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">Step 1 of 2</span>
            <span className="text-[11px] font-semibold text-muted-foreground">University</span>
          </div>
          <div className="h-1 bg-muted rounded-full">
            <div className="h-full rounded-full transition-all duration-500" style={barStyle} />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">Select Your University</h2>
          <p className="text-[14px] text-muted-foreground">This personalizes your experience — courses, events, opportunities, and more.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-[24px] p-5 premium-shadow border border-border/30 space-y-4">
          {/* Country */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-foreground">Country</label>
            <MobileSelect
              value={country}
              onChange={setCountry}
              placeholder="Select country"
              label="Country"
              leftIcon={Globe}
              options={COUNTRIES.map((c) => ({ value: c, label: c }))}
            />
          </div>

          {/* University search */}
          <div className="space-y-1.5 relative" ref={uniRef}>
            <label className="text-[12px] font-semibold text-foreground">University</label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={uniSearch}
                onChange={(e) => { setUniSearch(e.target.value); setShowSuggestions(true); setUniSelected(null); setAccent(null); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search universities worldwide..."
                className="w-full pl-10 pr-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              {uniSelected && <Check className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />}
            </div>
            {showSuggestions && filteredUnis.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="absolute z-20 mt-1 w-full bg-card rounded-2xl border border-border/50 elevated-shadow overflow-hidden max-h-[240px] overflow-y-auto no-scrollbar">
                {filteredUnis.map((uni) => (
                  <button key={uni.name} onClick={() => selectUni(uni)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${uni.accent}15` }}>
                      <Building className="w-4 h-4" style={{ color: uni.accent }} />
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-foreground">{uni.name}</p>
                      <p className="text-[10px] text-muted-foreground">{uni.short} · {uni.country}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
            {uniSelected && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                {uniSelected.country} — accent applied throughout
              </p>
            )}
          </div>

          {/* Campus */}
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-foreground">Campus <span className="text-muted-foreground font-normal">(optional)</span></label>
            {campuses.length > 0 ? (
              <MobileSelect
                value={campus}
                onChange={setCampus}
                placeholder="Select campus"
                label="Campus"
                leftIcon={MapPin}
                options={campuses.map((c) => ({ value: c, label: c }))}
              />
            ) : (
              <input type="text" value={campus} onChange={(e) => setCampus(e.target.value)} placeholder="e.g., Main Campus" className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            )}
          </div>

          {/* Faculty + Department */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Faculty</label>
              <input type="text" value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="e.g., Science" className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Department</label>
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g., Physics" className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>

          {/* Course + Level */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Course / Major</label>
              <input type="text" value={courseMajor} onChange={(e) => setCourseMajor(e.target.value)} placeholder="e.g., Computer Sci." className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-foreground">Year / Level</label>
              <MobileSelect
                value={level}
                onChange={setLevel}
                placeholder="Select"
                label="Year / Level"
                options={LEVELS.map((l) => ({ value: l, label: l }))}
              />
            </div>
          </div>

          <button onClick={handleContinue} disabled={!canContinue || loading} style={btnStyle} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_4px_20px_rgba(109, 40, 217,0.3)]">
            {loading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <>Continue <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>}
          </button>
        </motion.div>
        </>
        )}
      </div>
    </div>
  );
}