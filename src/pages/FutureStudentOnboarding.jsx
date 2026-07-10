import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, ArrowLeft, Loader2, Check, Sparkles,
  School, FileText, ClipboardCheck, PenTool, BookOpen,
  ArrowLeftRight, LogIn, ChevronDown, Search, Building2,
  Target, Calendar,
} from "lucide-react";
import AuthLogo from "@/components/auth/AuthLogo";
import { EDUCATION_LEVELS, EXAM_STATUSES } from "@/lib/futureStudentConfig";
import { UNIVERSITIES } from "@/data/universities";

const ICONS = {
  School, FileText, ClipboardCheck, PenTool, BookOpen,
  ArrowLeftRight, LogIn,
};

const ease = [0.16, 1, 0.3, 1];
const currentYear = new Date().getFullYear();
const admissionYears = Array.from({ length: 5 }, (_, i) => currentYear + i);

export default function FutureStudentOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: education level, 2: exam status, 3: university goals, 4: profile
  const [educationLevel, setEducationLevel] = useState("");
  const [examStatus, setExamStatus] = useState("");
  const [targetUniversities, setTargetUniversities] = useState([]);
  const [uniSearch, setUniSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [targetFaculty, setTargetFaculty] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredUnis = uniSearch.length > 0
    ? UNIVERSITIES.filter((u) =>
        u.name.toLowerCase().includes(uniSearch.toLowerCase()) ||
        (u.short && u.short.toLowerCase().includes(uniSearch.toLowerCase()))
      ).slice(0, 6)
    : [];

  const toggleUniversity = (uniName) => {
    setTargetUniversities((prev) =>
      prev.includes(uniName)
        ? prev.filter((u) => u !== uniName)
        : [...prev, uniName]
    );
  };

  const canContinue = () => {
    if (step === 1) return !!educationLevel;
    if (step === 2) return !!examStatus;
    if (step === 3) return targetUniversities.length > 0;
    if (step === 4) return !!preferredName?.trim();
    return false;
  };

  const handleContinue = async () => {
    if (step < 4) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      await base44.auth.updateMe({
        user_type: "future_student",
        education_level: educationLevel,
        exam_status: examStatus,
        target_universities: targetUniversities.length > 0 ? targetUniversities : undefined,
        target_faculty: targetFaculty || undefined,
        target_department: targetDepartment || undefined,
        admission_year: admissionYear ? parseInt(admissionYear, 10) : undefined,
        preferred_name: preferredName,
        onboarding_step: "learning_preferences",
      });
      navigate("/onboarding/learning-preferences");
    } catch {}
    setLoading(false);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const progress = (step / 4) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <motion.div
        className="absolute top-[-15%] left-[-10%] w-[70%] h-[40%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none"
        animate={{ x: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity }}
      />

      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-8 relative z-10 no-scrollbar">
        <AuthLogo size="md" />

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">Step {step} of 4</span>
            <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Future Student
            </span>
          </div>
          <div className="h-1 bg-muted rounded-full">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease }}
            >
              <div className="mb-5">
                <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">
                  Where are you on your journey?
                </h2>
                <p className="text-[14px] text-muted-foreground">
                  Tell us your current education level so Bud can tailor everything for you.
                </p>
              </div>
              <div className="space-y-2.5">
                {EDUCATION_LEVELS.map((level) => {
                  const Icon = ICONS[level.icon] || School;
                  const selected = educationLevel === level.value;
                  return (
                    <button
                      key={level.value}
                      onClick={() => setEducationLevel(level.value)}
                      className={`w-full text-left p-4 rounded-[20px] border transition-all spring-tap ${
                        selected
                          ? "border-primary bg-primary/5 shadow-[0_4px_20px_rgba(124,58,237,0.15)]"
                          : "border-border/40 bg-card hover:border-border/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-[14px] ${level.bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-5 h-5 ${level.color}`} strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <p className="font-heading font-semibold text-[14px] text-foreground">{level.label}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{level.description}</p>
                        </div>
                        {selected && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease }}
            >
              <div className="mb-5">
                <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">
                  What's your exam status?
                </h2>
                <p className="text-[14px] text-muted-foreground">
                  This helps Bud recommend the right preparation and next steps.
                </p>
              </div>
              <div className="space-y-2.5">
                {EXAM_STATUSES.map((status) => {
                  const selected = examStatus === status.value;
                  return (
                    <button
                      key={status.value}
                      onClick={() => setExamStatus(status.value)}
                      className={`w-full text-left p-4 rounded-[20px] border transition-all spring-tap ${
                        selected
                          ? "border-primary bg-primary/5 shadow-[0_4px_20px_rgba(124,58,237,0.15)]"
                          : "border-border/40 bg-card hover:border-border/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="font-heading font-semibold text-[14px] text-foreground">{status.label}</p>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{status.description}</p>
                        </div>
                        {selected && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease }}
            >
              <div className="mb-5">
                <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">
                  Where do you want to go?
                </h2>
                <p className="text-[14px] text-muted-foreground">
                  Pick your target universities and dream faculty. You can change these later.
                </p>
              </div>

              <div className="bg-card rounded-[24px] p-5 premium-shadow border border-border/30 space-y-4">
                {/* University search */}
                <div className="space-y-1.5 relative">
                  <label className="text-[12px] font-semibold text-foreground flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-primary" /> Target Universities
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={uniSearch}
                      onChange={(e) => { setUniSearch(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Search universities..."
                      className="w-full pl-10 pr-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  {showSuggestions && filteredUnis.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-20 mt-1 w-full bg-card rounded-2xl border border-border/50 elevated-shadow overflow-hidden max-h-[240px] overflow-y-auto no-scrollbar"
                    >
                      {filteredUnis.map((uni) => (
                        <button
                          key={uni.name}
                          onClick={() => { toggleUniversity(uni.name); setUniSearch(""); setShowSuggestions(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-0"
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${uni.accent}15` }}>
                            <Building2 className="w-4 h-4" style={{ color: uni.accent }} />
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-foreground">{uni.name}</p>
                            <p className="text-[10px] text-muted-foreground">{uni.short} · {uni.country}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                  {/* Selected universities */}
                  {targetUniversities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {targetUniversities.map((uni) => (
                        <span key={uni} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-medium">
                          {uni.length > 25 ? uni.substring(0, 25) + "..." : uni}
                          <button onClick={() => toggleUniversity(uni)} className="hover:text-primary/70">×</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Faculty + Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-foreground">Dream Faculty</label>
                    <input
                      type="text"
                      value={targetFaculty}
                      onChange={(e) => setTargetFaculty(e.target.value)}
                      placeholder="e.g., Science"
                      className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-foreground">Dream Department</label>
                    <input
                      type="text"
                      value={targetDepartment}
                      onChange={(e) => setTargetDepartment(e.target.value)}
                      placeholder="e.g., Computer Sci."
                      className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>

                {/* Admission year */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> Target Admission Year
                  </label>
                  <div className="relative">
                    <select
                      value={admissionYear}
                      onChange={(e) => setAdmissionYear(e.target.value)}
                      className="w-full px-4 pr-10 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                    >
                      <option value="">Select year</option>
                      {admissionYears.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease }}
            >
              <div className="mb-5">
                <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">
                  What should we call you?
                </h2>
                <p className="text-[14px] text-muted-foreground">
                  Bud will use this to greet you and make your experience feel personal.
                </p>
              </div>
              <div className="bg-card rounded-[24px] p-5 premium-shadow border border-border/30 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-foreground">
                    Preferred Name <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    placeholder="e.g., Alex"
                    className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                    <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    This is how Bud and your future classmates will greet you.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={handleBack}
              className="h-[52px] px-5 rounded-2xl bg-card border border-border/40 text-foreground font-heading font-semibold text-[14px] flex items-center justify-center gap-2 spring-tap"
            >
              <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={2.2} />
            </button>
          )}
          <button
            onClick={handleContinue}
            disabled={!canContinue() || loading}
            className="flex-1 h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
          >
            {loading ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
            ) : step < 4 ? (
              <>Continue <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>
            ) : (
              <>Start My Journey <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}