import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap, Check, Loader2, PartyPopper, ShieldCheck, X,
  ChevronDown,
} from "lucide-react";
import { UNIVERSITIES, getMatricPlaceholder, validateMatricNumber } from "@/data/universities";

export default function TransitionToStudent({ open, onClose, user }) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState("celebrate"); // celebrate → details → done
  const [university, setUniversity] = useState(user?.university || user?.target_universities?.[0] || "");
  const [faculty, setFaculty] = useState(user?.faculty || user?.target_faculty || "");
  const [department, setDepartment] = useState(user?.department || user?.target_department || "");
  const [level, setLevel] = useState("100");
  const [matricNumber, setMatricNumber] = useState("");
  const [matricError, setMatricError] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredUnis = university.length > 0
    ? UNIVERSITIES.filter((u) => u.name.toLowerCase().includes(university.toLowerCase())).slice(0, 5)
    : UNIVERSITIES.slice(0, 5);

  const placeholder = getMatricPlaceholder(university);

  const handleTransition = async () => {
    // Validate matric number format if university has a format
    if (matricNumber && university) {
      const validation = validateMatricNumber(matricNumber, university);
      if (!validation.valid) {
        setMatricError(validation.message);
        return;
      }
    }
    setMatricError("");
    setLoading(true);
    try {
      await base44.auth.updateMe({
        user_type: "student",
        university: university || undefined,
        faculty: faculty || undefined,
        department: department || undefined,
        level: level || "100",
        matriculation_number: matricNumber || undefined,
        matriculation_verified: false,
        enrollment_year: new Date().getFullYear(),
        transitioned_at: new Date().toISOString(),
      });

      // Sync to StudentRecord for directory search
      if (matricNumber || faculty || department || level) {
        try {
          await base44.functions.invoke("studentSearch", {
            action: "upsert_record",
            matriculation_number: matricNumber || undefined,
            faculty: faculty || undefined,
            department: department || undefined,
            level: level || undefined,
            university: university || undefined,
          });
        } catch {}
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
                  className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4 shadow-[0_8px_30px_rgba(124,58,237,0.3)]"
                >
                  <PartyPopper className="w-10 h-10 text-white" />
                </motion.div>
                <h2 className="font-heading font-extrabold text-[22px] text-foreground mb-2">You're in! 🎉</h2>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                  Congratulations on your admission! Let's transition your account to a full student profile.
                  All your conversations, study progress, and achievements will be preserved.
                </p>
                <div className="bg-muted/40 rounded-[18px] p-4 mb-6 text-left">
                  <p className="text-[12px] font-semibold text-foreground mb-2">What stays with you:</p>
                  <div className="space-y-1.5">
                    {["Bud conversations & history", "Study progress & goals", "Achievements & badges", "Communities & connections"].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-success flex-shrink-0" strokeWidth={3} />
                        <span className="text-[12px] text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setStep("details")}
                  className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
                >
                  Set Up Student Profile <GraduationCap className="w-[18px] h-[18px]" />
                </button>
              </div>
            )}

            {/* DETAILS STEP */}
            {step === "details" && (
              <div className="p-6">
                <div className="mb-5">
                  <h2 className="font-heading font-bold text-[20px] text-foreground mb-1">Student Details</h2>
                  <p className="text-[13px] text-muted-foreground">Fill in your university information to unlock the full experience.</p>
                </div>

                <div className="space-y-4">
                  {/* University */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-foreground">University</label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="Search your university..."
                      list="transition-unis"
                      className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <datalist id="transition-unis">
                      {UNIVERSITIES.map((u) => <option key={u.name} value={u.name} />)}
                    </datalist>
                  </div>

                  {/* Faculty + Department */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-foreground">Faculty</label>
                      <input
                        type="text"
                        value={faculty}
                        onChange={(e) => setFaculty(e.target.value)}
                        placeholder="e.g., Science"
                        className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-foreground">Department</label>
                      <input
                        type="text"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="e.g., Physics"
                        className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {/* Level */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-foreground">Level</label>
                    <div className="relative">
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-4 pr-10 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                      >
                        {["100", "200", "300", "400", "500"].map((l) => <option key={l} value={l}>{l} Level</option>)}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Matriculation Number */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-foreground">
                      Matriculation Number
                      <span className="text-muted-foreground font-normal ml-1">(if you have it)</span>
                    </label>
                    <input
                      type="text"
                      value={matricNumber}
                      onChange={(e) => { setMatricNumber(e.target.value); setMatricError(""); }}
                      placeholder={placeholder}
                      className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono tracking-wide"
                    />
                    {matricError ? (
                      <p className="text-[11px] text-error">{matricError}</p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                        <ShieldCheck className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                        Each university has its own format. You can add or update this later.
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleTransition}
                  disabled={loading}
                  className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 mt-6 spring-tap shadow-[0_4px_20px_rgba(124,58,237,0.3)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <>Complete Transition <GraduationCap className="w-[18px] h-[18px]" /></>}
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
                  className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-success to-success/70 flex items-center justify-center mx-auto mb-4 shadow-[0_8px_30px_rgba(16,185,129,0.3)]"
                >
                  <Check className="w-10 h-10 text-white" strokeWidth={3} />
                </motion.div>
                <h2 className="font-heading font-extrabold text-[22px] text-foreground mb-2">Welcome to University Life!</h2>
                <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                  Your account is now a full student profile. Everything from your pre-university journey has been preserved.
                  New features are now unlocked — timetable, courses, grades, and more!
                </p>
                <button
                  onClick={handleDone}
                  className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 spring-tap shadow-[0_4px_20px_rgba(124,58,237,0.3)]"
                >
                  Explore Campus <GraduationCap className="w-[18px] h-[18px]" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}