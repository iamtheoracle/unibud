import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { User, Camera, ArrowRight, Loader2, Check, ChevronDown, SkipForward, Sparkles } from "lucide-react";
import AuthLogo from "@/components/auth/AuthLogo";

const currentYear = new Date().getFullYear();
const gradYears = Array.from({ length: 7 }, (_, i) => currentYear + i);
const PRONOUNS = ["he/him", "she/her", "they/them", "Prefer not to say", "Other"];

const LEVELS = ["100", "200", "300", "400", "500", "600"];

const ACADEMIC_FIELDS = [
  { key: "matriculation_number", label: "Matriculation Number", placeholder: "e.g., CSC/2026/01452", required: false, hint: "Your official university matriculation number. Unique to you within your university.", type: "text", mono: true },
  { key: "faculty", label: "Faculty", placeholder: "e.g., Science", required: false, hint: "Helps filter classmates, events, and resources.", type: "text" },
  { key: "department", label: "Department", placeholder: "e.g., Computer Science", required: false, hint: "Connects you with departmental communities.", type: "text" },
  { key: "level", label: "Level", placeholder: "", required: false, hint: "Your current academic level.", type: "select", options: LEVELS },
  { key: "student_id", label: "Student ID", placeholder: "e.g., UNI2024001", required: false, hint: "Connects your timetable and academic records.", type: "text" },
];

const PERSONAL_FIELDS = [
  { key: "preferred_name", label: "Preferred Name", placeholder: "e.g., Alex", required: true, hint: "How Bud and classmates will greet you." },
  { key: "expected_graduation", label: "Expected Graduation Year", placeholder: "", required: false, hint: "Helps track progress and suggest timely opportunities.", type: "select", options: gradYears },
  { key: "date_of_birth", label: "Date of Birth", placeholder: "", required: false, hint: "Enables birthday celebrations and age-appropriate recommendations.", type: "date" },
  { key: "pronouns", label: "Pronouns", placeholder: "", required: false, hint: "Ensures everyone addresses you respectfully.", type: "select", options: PRONOUNS },
];

export default function StudentProfile() {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
    } catch {}
    setUploading(false);
  };

  const setValue = (key, val) => setValues((p) => ({ ...p, [key]: val }));
  const canContinue = !!values.preferred_name?.trim();

  const saveAndNavigate = async (data) => {
    setLoading(true);
    try {
      const payload = { ...data };
      if (photoUrl) payload.profile_photo = photoUrl;
      await base44.auth.updateMe({ ...payload, onboarding_step: "learning_preferences" });

      // Sync matriculation data to StudentRecord for directory search
      if (payload.matriculation_number || payload.faculty || payload.department || payload.level) {
        try {
          await base44.functions.invoke("studentSearch", {
            action: "upsert_record",
            matriculation_number: payload.matriculation_number || undefined,
            faculty: payload.faculty || undefined,
            department: payload.department || undefined,
            level: payload.level || undefined,
            student_id: payload.student_id || undefined,
          });
        } catch {}
      }

      navigate("/onboarding/learning-preferences");
    } catch {}
    setLoading(false);
  };

  const handleContinue = () => saveAndNavigate(values);
  const handleSkip = () => saveAndNavigate({ preferred_name: values.preferred_name });

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <motion.div className="absolute top-[-15%] left-[-10%] w-[70%] h-[40%] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none" animate={{ x: [0, 40, 0] }} transition={{ duration: 22, repeat: Infinity }} />

      <div className="flex-1 overflow-y-auto px-6 pt-10 pb-8 relative z-10 no-scrollbar">
        <AuthLogo size="md" />

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-muted-foreground">Step 2 of 2</span>
            <span className="text-[11px] font-semibold text-muted-foreground">Profile</span>
          </div>
          <div className="h-1 bg-muted rounded-full">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: "100%" }} />
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <h2 className="font-heading font-bold text-[22px] tracking-tight text-foreground mb-1">Set Up Your Profile</h2>
          <p className="text-[14px] text-muted-foreground">Almost there! Let's personalize your experience.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-[24px] p-5 premium-shadow border border-border/30 space-y-4">
          {/* Photo upload */}
          <div className="flex flex-col items-center pb-2">
            <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload-profile" />
            <label htmlFor="photo-upload-profile" className="cursor-pointer relative">
              {uploading ? (
                <div className="w-20 h-20 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              ) : photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center relative">
                  <User className="w-8 h-8 text-muted-foreground" />
                  <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                    <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                </div>
              )}
            </label>
            <p className="text-[11px] text-muted-foreground mt-2 text-center max-w-[200px]">Helps classmates recognize you in communities and study groups.</p>
          </div>

          {/* Academic Identity Fields */}
          <div>
            <p className="text-[12px] font-bold text-foreground mb-1">Academic Identity</p>
            <p className="text-[11px] text-muted-foreground mb-3">Link your matriculation number and academic details for verification and discovery.</p>
            <div className="space-y-4">
              {ACADEMIC_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-foreground">
                    {field.label}
                    {field.required ? <span className="text-primary ml-0.5">*</span> : <span className="text-muted-foreground font-normal ml-1">(optional)</span>}
                  </label>
                  {field.type === "select" ? (
                    <div className="relative">
                      <select value={values[field.key] || ""} onChange={(e) => setValue(field.key, e.target.value)} className="w-full px-4 pr-10 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                        <option value="">Select</option>
                        {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={values[field.key] || ""}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className={"w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 " + (field.mono ? "font-mono tracking-wide" : "")}
                    />
                  )}
                  <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                    <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    {field.hint}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Fields */}
          <div>
            <p className="text-[12px] font-bold text-foreground mb-3">Personal Details</p>
            <div className="space-y-4">
              {PERSONAL_FIELDS.map((field) => (
                <div key={field.key} className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-foreground">
                    {field.label}
                    {field.required ? <span className="text-primary ml-0.5">*</span> : <span className="text-muted-foreground font-normal ml-1">(optional)</span>}
                  </label>
                  {field.type === "select" ? (
                    <div className="relative">
                      <select value={values[field.key] || ""} onChange={(e) => setValue(field.key, e.target.value)} className="w-full px-4 pr-10 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                        <option value="">Select</option>
                        {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type={field.type || "text"}
                      value={values[field.key] || ""}
                      onChange={(e) => setValue(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      required={field.required}
                      className="w-full px-4 h-[48px] rounded-2xl bg-muted/50 border border-border/50 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  )}
                  <p className="text-[11px] text-muted-foreground flex items-start gap-1">
                    <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                    {field.hint}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={handleContinue} disabled={!canContinue || loading} className="w-full h-[52px] rounded-2xl bg-primary text-primary-foreground font-heading font-semibold text-[15px] flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-[0_4px_20px_rgba(109, 40, 217,0.3)]">
            {loading ? <Loader2 className="w-[18px] h-[18px] animate-spin" /> : <>Continue <ArrowRight className="w-[18px] h-[18px]" strokeWidth={2.2} /></>}
          </button>
          <button onClick={handleSkip} disabled={!canContinue || loading} className="w-full h-[44px] rounded-2xl bg-transparent text-muted-foreground font-heading font-semibold text-[13px] flex items-center justify-center gap-1.5 hover:text-foreground transition-colors disabled:opacity-50">
            <SkipForward className="w-3.5 h-3.5" /> Skip optional fields
          </button>
        </motion.div>

        <p className="text-center text-[11px] text-muted-foreground mt-4 px-4">
          You can change any of this later in Settings.
        </p>
      </div>
    </div>
  );
}