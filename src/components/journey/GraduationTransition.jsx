import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Award, Check, Loader2, PartyPopper, X, ChevronDown,
  GraduationCap, Briefcase, ArrowRight,
} from "lucide-react";

// Transition modal for graduating students → alumni, or alumni → postgraduate.
export default function GraduationTransition({ open, onClose, user }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState("celebrate");
  const [transitionType, setTransitionType] = useState("alumni"); // alumni | postgraduate
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear());
  const [occupation, setOccupation] = useState(user?.current_occupation || "");
  const [company, setCompany] = useState(user?.current_company || "");
  const [pgType, setPgType] = useState("masters");
  const [pgField, setPgField] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransition = async () => {
    setLoading(true);
    try {
      if (transitionType === "alumni") {
        await base44.auth.updateMe({
          user_type: "alumni",
          graduation_year: graduationYear || new Date().getFullYear(),
          current_occupation: occupation || undefined,
          current_company: company || undefined,
          alumni_since: new Date().toISOString(),
        });
      } else {
        await base44.auth.updateMe({
          user_type: "postgraduate",
          postgraduate_type: pgType,
          postgraduate_field: pgField || undefined,
        });
      }
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    } catch {}
    setLoading(false);
  };

  const handleDone = () => {
    setStep("celebrate");
    onClose();
    window.location.href = "/";
  };

  const ease = [0.16, 1, 0.3, 1];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={step === "done" ? handleDone : onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ duration: 0.4, ease }}
            className="relative w-full sm:max-w-md bg-card rounded-t-[28px] sm:rounded-[28px] border border-border/30 elevated-shadow max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {step !== "done" && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/60 flex items-center justify-center spring-tap z-10"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}

            {/* CELEBRATE STEP */}
            {step === "celebrate" && (
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-success to-success/70 flex items-center justify-center mx-auto mb-4 shadow-[0_8px_30px_rgba(16,185,129,0.3)]"
                >
                  <GraduationCap className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="font-heading font-extrabold text-[22px] text-foreground mb-2">Congratulations, Graduate! 🎓</h2>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                  You've completed your degree! Your entire academic journey — conversations, study records, achievements, and connections — will be preserved as you transition.
                </p>
                <div className="bg-muted/40 rounded-[18px] p-4 mb-6 text-left">
                  <p className="text-[12px] font-semibold text-foreground mb-2">What stays with you:</p>
                  <div className="space-y-1.5">
                    {["Bud conversations & history", "Study progress & goals", "Achievements & badges", "Communities & connections", "Portfolio & projects"].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-success flex-shrink-0" strokeWidth={3} />
                        <span className="text-[12px] text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[13px] font-semibold text-foreground mb-3">What's next?</p>
                <div className="space-y-2.5 mb-6">
                  <button
                    onClick={() => setTransitionType("alumni")}
                    className={`w-full p-4 rounded-2xl border-2 text-left spring-tap transition-colors ${transitionType === "alumni" ? "border-success bg-success/5" : "border-border/40"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[14px] bg-success/10 flex items-center justify-center">
                        <Award className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="font-heading font-semibold text-[13px] text-foreground">Become an Alumni</p>
                        <p className="text-[11px] text-muted-foreground">Stay connected, mentor students, advance your career</p>
                      </div>
                      {transitionType === "alumni" && <Check className="w-5 h-5 text-success" strokeWidth={3} />}
                    </div>
                  </button>
                  <button
                    onClick={() => setTransitionType("postgraduate")}
                    className={`w-full p-4 rounded-2xl border-2 text-left spring-tap transition-colors ${transitionType === "postgraduate" ? "border-purple bg-purple/5" : "border-border/40"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[14px] bg-purple/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-purple" />
                      </div>
                      <div className="flex-1">
                        <p className="font-heading font-semibold text-[13px] text-foreground">Continue to Postgraduate</p>
                        <p className="text-[11px] text-muted-foreground">Pursue a Master's, PhD, or PGD</p>
                      </div>
                      {transitionType === "postgraduate" && <Check className="w-5 h-5 text-purple" strokeWidth={3} />}
                    </div>
                  </button>
                </div>
                <button
                  onClick={() => setStep("details")}
                  className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
                >
                  Continue <ArrowRight className="w-[18px] h-[18px]" />
                </button>
              </div>
            )}

            {/* DETAILS STEP */}
            {step === "details" && (
              <div className="p-6">
                <div className="mb-5">
                  <h2 className="font-heading font-bold text-[20px] text-foreground mb-1">
                    {transitionType === "alumni" ? "Alumni Details" : "Postgraduate Details"}
                  </h2>
                  <p className="text-[13px] text-muted-foreground">
                    {transitionType === "alumni"
                      ? "Tell us about your graduation and current career."
                      : "Tell us about your postgraduate programme."}
                  </p>
                </div>

                <div className="space-y-4">
                  {transitionType === "alumni" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-foreground">Graduation Year</label>
                        <input
                          type="number"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(parseInt(e.target.value) || new Date().getFullYear())}
                          className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-foreground">Current Occupation <span className="text-muted-foreground font-normal ml-1">(optional)</span></label>
                        <input
                          type="text"
                          value={occupation}
                          onChange={(e) => setOccupation(e.target.value)}
                          placeholder="e.g., Software Engineer"
                          className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-foreground">Company / Organization <span className="text-muted-foreground font-normal ml-1">(optional)</span></label>
                        <input
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          placeholder="e.g., Google, Self-employed"
                          className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </>
                  )}

                  {transitionType === "postgraduate" && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-foreground">Programme Type</label>
                        <div className="relative">
                          <select
                            value={pgType}
                            onChange={(e) => setPgType(e.target.value)}
                            className="w-full px-4 pr-10 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                          >
                            <option value="pgd">Postgraduate Diploma (PGD)</option>
                            <option value="masters">Master's Degree</option>
                            <option value="mba">MBA</option>
                            <option value="mphil">MPhil</option>
                            <option value="phd">Doctorate (PhD)</option>
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-foreground">Field of Study</label>
                        <input
                          type="text"
                          value={pgField}
                          onChange={(e) => setPgField(e.target.value)}
                          placeholder="e.g., Computer Science"
                          className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleTransition}
                  disabled={loading}
                  className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 mt-6 spring-tap shadow-[0_4px_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <>Complete Transition {transitionType === "alumni" ? <Award className="w-[18px] h-[18px]" /> : <GraduationCap className="w-[18px] h-[18px]" />}</>}
                </button>
              </div>
            )}

            {/* DONE STEP */}
            {step === "done" && (
              <div className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                  className={`w-20 h-20 rounded-[24px] bg-gradient-to-br ${transitionType === "alumni" ? "from-success to-success/70" : "from-purple to-purple/70"} flex items-center justify-center mx-auto mb-4 shadow-[0_8px_30px_rgba(124,58,237,0.3)]`}
                >
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </motion.div>
                <h2 className="font-heading font-extrabold text-[22px] text-foreground mb-2">
                  {transitionType === "alumni" ? "Welcome to Alumni Life!" : "Welcome to Postgraduate Studies!"}
                </h2>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                  {transitionType === "alumni"
                    ? "Your account is now an Alumni profile. Your entire academic journey has been preserved. Stay connected, mentor students, and keep growing!"
                    : "Your account is now a Postgraduate profile. Your undergraduate journey has been preserved. New research features are now unlocked!"}
                </p>
                <button
                  onClick={handleDone}
                  className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
                >
                  {transitionType === "alumni" ? "Explore Alumni Hub" : "Explore Postgraduate Hub"} <ArrowRight className="w-[18px] h-[18px]" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}