import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight, SkipForward, Check, User, Bell, Calendar, Camera, Mic, Image as ImageIcon, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const STEPS = [
  {
    id: "intro",
    type: "info",
    message: "Let's set up your UNIBUD experience! 🎓\n\nI'll ask a few quick questions to personalize everything — your courses, schedule, recommendations, and more.\n\nThis takes about 3 minutes, and you can skip anything. Ready?",
    buttonText: "Let's Go",
  },
  {
    id: "university",
    type: "text",
    message: "Let's start with where you study. This helps me show you the right courses, events, and opportunities.",
    fields: [
      { key: "country", placeholder: "Country" },
      { key: "university", placeholder: "University" },
      { key: "campus", placeholder: "Campus (optional)" },
      { key: "faculty", placeholder: "Faculty" },
      { key: "department", placeholder: "Department" },
      { key: "course_major", placeholder: "Course / Major" },
      { key: "level", placeholder: "Level / Year (e.g., 300L)" },
    ],
  },
  {
    id: "profile",
    type: "profile",
    message: "Let's set up your profile! Add a photo so classmates can recognize you, and a few details to personalize your experience.",
    fields: [
      { key: "preferred_name", placeholder: "Preferred name / nickname" },
      { key: "student_id", placeholder: "Student ID (optional)" },
      { key: "expected_graduation", placeholder: "Expected graduation year" },
      { key: "date_of_birth", placeholder: "Date of birth (optional)" },
    ],
  },
  {
    id: "learning_preferences",
    type: "chips-multi",
    field: "learning_styles",
    message: "Everyone learns differently! How do you prefer to learn? Pick all that feel right.",
    options: ["Reading", "Videos", "Sketches", "Diagrams", "Audio", "Flashcards", "Practice Questions", "Step-by-Step Lessons", "Mixed Learning"],
  },
  {
    id: "academic_goals",
    type: "chips-multi",
    field: "goals",
    message: "What are your main goals right now? Pick whatever matters to you.",
    options: ["Improve GPA", "Pass Exams", "Stay Organized", "Learn New Skills", "Get Scholarships", "Get Internships", "Build Projects", "Study Abroad", "Career Preparation"],
  },
  {
    id: "study_schedule",
    type: "schedule",
    field: "preferred_study_time",
    message: "When do you feel most productive? And how many hours do you usually study per day? I'll schedule reminders around your best times.",
    options: ["Morning", "Afternoon", "Evening", "Night"],
    fields: [
      { key: "study_hours_per_day", placeholder: "Study hours per day (e.g., 3 hours)" },
    ],
  },
  {
    id: "interests",
    type: "chips-multi",
    field: "interests",
    message: "What do you enjoy? This helps me suggest communities, events, and friends you'd actually love.",
    options: ["Technology", "Engineering", "Business", "Medicine", "Arts", "Sports", "Music", "Gaming", "Entrepreneurship", "Research", "Volunteering", "Photography", "AI", "Programming"],
  },
  {
    id: "accessibility",
    type: "chips-multi",
    field: "accessibility",
    message: "I want UNIBUD to work perfectly for you. Any accessibility preferences? You can pick multiple or skip.",
    options: ["Large Text", "High Contrast", "Screen Reader", "Captions", "Reduced Motion", "Color-Blind Support"],
  },
  {
    id: "meet_bud",
    type: "info",
    message: "Hi, I'm Bud! 🌟\n\nI'll help you study, stay organized, discover opportunities, and make university life easier.\n\nI'll learn how you study best and adapt to you over time. Think of me as your personal senior student — always here when you need me.",
    buttonText: "Let's Start",
    secondaryButtonText: "Ask Bud",
  },
  {
    id: "permissions",
    type: "permissions",
    message: "Almost there! Let me know which permissions you'd like to enable. You can change these anytime in settings.",
    permissions: [
      { key: "notifications", label: "Notifications", desc: "Reminders for classes, assignments, and events", icon: Bell },
      { key: "calendar", label: "Calendar", desc: "Sync your timetable and events", icon: Calendar },
      { key: "camera", label: "Camera", desc: "Scan documents and take photos", icon: Camera },
      { key: "microphone", label: "Microphone", desc: "Voice notes and audio messages", icon: Mic },
      { key: "photos", label: "Photos", desc: "Upload photos to posts and profile", icon: ImageIcon },
      { key: "location", label: "Location", desc: "Campus navigation and nearby events", icon: MapPin },
    ],
  },
  {
    id: "dashboard_setup",
    type: "setup",
    message: "Setting up your campus dashboard... ✨",
    setupItems: [
      "Today's Timetable",
      "Weather",
      "Assignments",
      "Exams",
      "Campus News",
      "Suggested Friends",
      "Clubs",
      "Opportunities",
    ],
  },
  {
    id: "complete",
    type: "info",
    message: "All ready! 🎉\n\nYour campus dashboard is set up with everything you need — timetable, assignments, opportunities, and more.\n\nWelcome to UNIBUD — let's make this your best semester yet! 🌟",
    buttonText: "Enter Campus",
  },
];

export default function BudOnboarding() {
  const [messages, setMessages] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [data, setData] = useState({});
  const [chips, setChips] = useState([]);
  const [texts, setTexts] = useState({});
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permissions, setPermissions] = useState({});
  const [setupProgress, setSetupProgress] = useState(0);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    showStep(0);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const step = STEPS[stepIndex];
    if (!step || step.type !== "setup") return;

    setSetupProgress(0);
    saveProfile();

    const items = step.setupItems;
    let advanceTimer;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setSetupProgress(count);
      if (count >= items.length) {
        clearInterval(interval);
        advanceTimer = setTimeout(() => showStep(stepIndex + 1), 800);
      }
    }, 450);

    return () => {
      clearInterval(interval);
      clearTimeout(advanceTimer);
    };
  }, [stepIndex]);

  const showStep = (index) => {
    if (index >= STEPS.length) {
      finish();
      return;
    }
    const step = STEPS[index];
    setIsTyping(true);
    setChips([]);
    setTexts({});
    setPhotoUrl(null);
    setPermissions({});
    setSetupProgress(0);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "bud", content: step.message, stepIndex: index }]);
      setStepIndex(index);
      setIsTyping(false);
    }, 700);
  };

  const formatUserResponse = () => {
    const step = STEPS[stepIndex];
    if (step.type === "info" || step.type === "setup") return null;
    if (step.type === "permissions") {
      const enabled = step.permissions.filter(p => permissions[p.key]).map(p => p.label);
      return enabled.length > 0 ? enabled.join(", ") : "Maybe later";
    }
    if (step.type === "chips-multi" || step.type === "chips-single") {
      return chips.length > 0 ? chips.join(", ") : null;
    }
    if (step.type === "profile") {
      const vals = [];
      if (photoUrl) vals.push("Photo added ✓");
      step.fields.forEach(f => { if (texts[f.key]) vals.push(texts[f.key]); });
      return vals.length > 0 ? vals.join(" · ") : null;
    }
    if (step.type === "schedule") {
      const vals = [];
      if (chips.length > 0) vals.push(chips.join(", "));
      step.fields.forEach(f => { if (texts[f.key]) vals.push(texts[f.key]); });
      return vals.length > 0 ? vals.join(" · ") : null;
    }
    if (step.type === "text") {
      const vals = step.fields.map(f => texts[f.key]).filter(Boolean);
      return vals.length > 0 ? vals.join(" · ") : null;
    }
    return null;
  };

  const handleContinue = () => {
    const response = formatUserResponse();
    const userMsg = response || "I'll skip this one";

    setMessages(prev => [...prev, { role: "user", content: userMsg }]);

    const step = STEPS[stepIndex];
    if (step.type === "chips-multi" && chips.length > 0) {
      setData(prev => ({ ...prev, [step.field]: chips }));
    } else if (step.type === "chips-single" && chips.length > 0) {
      setData(prev => ({ ...prev, [step.field]: chips[0] }));
    } else if (step.type === "profile") {
      if (photoUrl) setData(prev => ({ ...prev, profile_photo: photoUrl }));
      const textData = {};
      step.fields.forEach(f => { if (texts[f.key]) textData[f.key] = texts[f.key]; });
      setData(prev => ({ ...prev, ...textData }));
    } else if (step.type === "schedule") {
      if (chips.length > 0) setData(prev => ({ ...prev, [step.field]: chips[0] }));
      const textData = {};
      step.fields.forEach(f => { if (texts[f.key]) textData[f.key] = texts[f.key]; });
      setData(prev => ({ ...prev, ...textData }));
    } else if (step.type === "permissions") {
      setData(prev => ({ ...prev, permissions }));
    } else if (step.type === "text") {
      const textData = {};
      step.fields.forEach(f => { if (texts[f.key]) textData[f.key] = texts[f.key]; });
      setData(prev => ({ ...prev, ...textData }));
    }

    showStep(stepIndex + 1);
  };

  const handleSkip = () => {
    setMessages(prev => [...prev, { role: "user", content: "I'll skip this one" }]);
    showStep(stepIndex + 1);
  };

  const saveProfile = async () => {
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      await base44.auth.updateMe({ ...data, time_zone: timeZone });
    } catch (e) {
      // ignore
    }
  };

  const finish = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ onboarding_completed: true });
      await queryClient.invalidateQueries(["currentUser"]);
    } catch (e) {
      // ignore
    }
    setIsSaving(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotoUrl(file_url);
    } catch (err) {
      // ignore
    }
    setUploading(false);
  };

  const toggleChip = (option) => {
    const step = STEPS[stepIndex];
    if (step.type === "chips-single" || step.type === "schedule") {
      setChips([option]);
    } else {
      setChips(prev => prev.includes(option) ? prev.filter(c => c !== option) : [...prev, option]);
    }
  };

  const currentStep = stepIndex >= 0 ? STEPS[stepIndex] : null;
  const canContinue =
    currentStep?.type === "info" ||
    currentStep?.type === "permissions" ||
    currentStep?.type === "setup" ||
    (currentStep?.type === "profile" && (photoUrl || Object.values(texts).some(Boolean))) ||
    (currentStep?.type === "schedule" && (chips.length > 0 || Object.values(texts).some(Boolean))) ||
    ((currentStep?.type === "chips-multi" || currentStep?.type === "chips-single") && chips.length > 0) ||
    (currentStep?.type === "text" && Object.values(texts).some(Boolean));
  const isLastStep = stepIndex === STEPS.length - 1;
  const progress = stepIndex >= 0 ? ((stepIndex + 1) / STEPS.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[60] bg-[#F5F5F7] flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-[#E5E5EA] flex-shrink-0">
        <motion.div
          className="h-full bg-[#28A745]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#28A745] to-[#1a7a35] flex items-center justify-center shadow-sm">
            <Sparkles className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="font-heading font-bold text-[14px] text-[#1A1A1A]">Bud</p>
            <p className="text-[10px] text-[#28A745] font-medium">Getting to know you</p>
          </div>
        </div>
        {!isLastStep && currentStep?.type !== "info" && currentStep?.type !== "setup" && (
          <button onClick={handleSkip} className="flex items-center gap-1 text-[12px] font-semibold text-[#86868B] hover:text-[#1A1A1A] transition-colors">
            <SkipForward className="w-3.5 h-3.5" />
            Skip
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "bud" && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#28A745] to-[#1a7a35] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[82%] px-4 py-3 ${
              msg.role === "user"
                ? "bg-[#1A1A1A] text-white rounded-2xl rounded-br-md"
                : "bg-white text-[#1A1A1A] rounded-2xl rounded-bl-md shadow-sm border border-black/[0.04]"
            }`}>
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#28A745] to-[#1a7a35] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white rounded-2xl rounded-bl-md shadow-sm border border-black/[0.04] px-4 py-3 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#28A745]/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-[#28A745]/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-[#28A745]/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        {isSaving && (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#28A745] border-t-transparent animate-spin" />
              <p className="text-[12px] text-[#86868B] font-medium">Welcome to campus...</p>
            </div>
          </div>
        )}
      </div>

      {/* Response area */}
      {!isTyping && !isSaving && currentStep && (
        <div className="px-4 pb-6 pt-3 flex-shrink-0 bg-[#F5F5F7] border-t border-black/[0.04]">
          {currentStep.type === "info" ? (
            <div className="space-y-2">
              <button
                onClick={handleContinue}
                className="w-full py-3.5 rounded-2xl bg-[#28A745] text-white font-heading font-semibold text-[14px] shadow-sm flex items-center justify-center gap-1.5 hover:bg-[#1a7a35] transition-colors"
              >
                {isLastStep ? (
                  <>{currentStep.buttonText || "Get Started"} <Check className="w-4 h-4" /></>
                ) : (
                  <>{currentStep.buttonText || "Continue"} <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
              {currentStep.secondaryButtonText && (
                <button
                  onClick={handleContinue}
                  className="w-full py-3.5 rounded-2xl bg-white text-[#1A1A1A] font-heading font-semibold text-[14px] border border-black/[0.08] shadow-sm hover:bg-[#F5F5F7] transition-colors"
                >
                  {currentStep.secondaryButtonText}
                </button>
              )}
            </div>
          ) : currentStep.type === "setup" ? (
            <div className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-4">
              <div className="space-y-2.5">
                {currentStep.setupItems.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0.3 }}
                    animate={i < setupProgress ? { opacity: 1 } : { opacity: 0.3 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2.5"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${i < setupProgress ? "bg-[#28A745]" : "bg-[#E5E5EA]"}`}>
                      {i < setupProgress && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-[12px] transition-colors ${i < setupProgress ? "text-[#1A1A1A] font-medium" : "text-[#86868B]"}`}>{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : currentStep.type === "permissions" ? (
            <div>
              <div className="space-y-2 mb-3">
                {currentStep.permissions.map((p) => {
                  const Icon = p.icon;
                  const isEnabled = !!permissions[p.key];
                  return (
                    <button
                      key={p.key}
                      onClick={() => setPermissions(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white border border-black/[0.06] shadow-sm"
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isEnabled ? "bg-[#28A745]/10" : "bg-[#F5F5F7]"}`}>
                        <Icon className={`w-4 h-4 ${isEnabled ? "text-[#28A745]" : "text-[#86868B]"}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-heading font-semibold text-[12px] text-[#1A1A1A]">{p.label}</p>
                        <p className="text-[10px] text-[#86868B]">{p.desc}</p>
                      </div>
                      <div className={`w-9 h-5 rounded-full p-0.5 transition-colors flex-shrink-0 ${isEnabled ? "bg-[#28A745]" : "bg-[#E5E5EA]"}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isEnabled ? "translate-x-4" : "translate-x-0"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleContinue}
                className="w-full py-3.5 rounded-2xl bg-[#28A745] text-white font-heading font-semibold text-[14px] shadow-sm flex items-center justify-center gap-1.5 hover:bg-[#1a7a35] transition-colors"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : currentStep.type === "profile" ? (
            <div className="space-y-3">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" id="photo-upload-profile" />
              <label htmlFor="photo-upload-profile" className="flex items-center gap-3 cursor-pointer">
                {uploading ? (
                  <div className="w-16 h-16 rounded-full border-2 border-[#28A745] border-t-transparent animate-spin" />
                ) : photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center">
                    <User className="w-6 h-6 text-[#86868B]" />
                  </div>
                )}
                <div>
                  <p className="text-[12px] font-medium text-[#28A745]">{photoUrl ? "Change photo" : "Upload photo"}</p>
                  <p className="text-[10px] text-[#86868B]">Optional</p>
                </div>
              </label>
              {currentStep.fields.map((field) => (
                <input
                  key={field.key}
                  type="text"
                  value={texts[field.key] || ""}
                  onChange={(e) => setTexts(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-black/[0.06] text-[13px] text-[#1A1A1A] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#28A745]/30 shadow-sm"
                />
              ))}
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full py-3.5 rounded-2xl bg-[#28A745] text-white font-heading font-semibold text-[14px] shadow-sm flex items-center justify-center gap-1.5 hover:bg-[#1a7a35] transition-colors disabled:opacity-40 disabled:shadow-none"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : currentStep.type === "schedule" ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {currentStep.options.map((option) => {
                  const selected = chips.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleChip(option)}
                      className={`px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all ${
                        selected
                          ? "bg-[#28A745] text-white shadow-sm"
                          : "bg-white text-[#1A1A1A] border border-black/[0.08] hover:border-[#28A745]/30"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1" />}
                      {option}
                    </button>
                  );
                })}
              </div>
              {currentStep.fields.map((field) => (
                <input
                  key={field.key}
                  type="text"
                  value={texts[field.key] || ""}
                  onChange={(e) => setTexts(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-black/[0.06] text-[13px] text-[#1A1A1A] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#28A745]/30 shadow-sm mb-3"
                />
              ))}
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full py-3.5 rounded-2xl bg-[#28A745] text-white font-heading font-semibold text-[14px] shadow-sm flex items-center justify-center gap-1.5 hover:bg-[#1a7a35] transition-colors disabled:opacity-40 disabled:shadow-none"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : currentStep.type === "text" ? (
            <div className="space-y-2">
              {currentStep.fields.map((field) => (
                <input
                  key={field.key}
                  type="text"
                  value={texts[field.key] || ""}
                  onChange={(e) => setTexts(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-black/[0.06] text-[13px] text-[#1A1A1A] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#28A745]/30 shadow-sm"
                />
              ))}
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full py-3.5 rounded-2xl bg-[#28A745] text-white font-heading font-semibold text-[14px] shadow-sm flex items-center justify-center gap-1.5 hover:bg-[#1a7a35] transition-colors disabled:opacity-40 disabled:shadow-none"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {currentStep.options.map((option) => {
                  const selected = chips.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleChip(option)}
                      className={`px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all ${
                        selected
                          ? "bg-[#28A745] text-white shadow-sm"
                          : "bg-white text-[#1A1A1A] border border-black/[0.08] hover:border-[#28A745]/30"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3 inline mr-1" />}
                      {option}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleContinue}
                disabled={!canContinue}
                className="w-full py-3.5 rounded-2xl bg-[#28A745] text-white font-heading font-semibold text-[14px] shadow-sm flex items-center justify-center gap-1.5 hover:bg-[#1a7a35] transition-colors disabled:opacity-40 disabled:shadow-none"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}