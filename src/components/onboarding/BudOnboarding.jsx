import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronRight, SkipForward, Send, Check, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";

const STEPS = [
  {
    id: "welcome",
    type: "info",
    message: "Hey! I'm Bud 👋\n\nI'll be your companion throughout your university journey — helping you study, stay organized, discover opportunities, and make the most of campus life.\n\nLet's get to know each other so I can personalize everything for you. This'll only take a few minutes, and you can skip any question!",
  },
  {
    id: "name",
    type: "text",
    message: "First things first — what's your name? And if you have a nickname you prefer, I'd love to know that too!",
    fields: [
      { key: "full_name", placeholder: "Full name" },
      { key: "preferred_name", placeholder: "Preferred name / nickname (optional)" },
    ],
  },
  {
    id: "location",
    type: "text",
    message: "Where are you based? This helps me show you relevant opportunities and adjust to your timezone.",
    fields: [
      { key: "country", placeholder: "Country" },
      { key: "city", placeholder: "City" },
    ],
  },
  {
    id: "university",
    type: "text",
    message: "Which university are you at? And which campus are you on?",
    fields: [
      { key: "university", placeholder: "University" },
      { key: "campus", placeholder: "Campus (optional)" },
    ],
  },
  {
    id: "faculty",
    type: "text",
    message: "Tell me about your faculty and department — what are you studying?",
    fields: [
      { key: "faculty", placeholder: "Faculty" },
      { key: "department", placeholder: "Department" },
      { key: "course_major", placeholder: "Course / Major" },
    ],
  },
  {
    id: "level",
    type: "text",
    message: "What level or year are you in? And when do you hope to graduate?",
    fields: [
      { key: "level", placeholder: "Level / Year (e.g., 300L)" },
      { key: "expected_graduation", placeholder: "Expected graduation year" },
    ],
  },
  {
    id: "learning_style",
    type: "chips-multi",
    field: "learning_styles",
    message: "Everyone learns differently! How do you prefer to learn? Pick all that feel right to you.",
    options: ["Reading", "Videos", "Diagrams", "Sketches", "Audio", "Practice questions", "Flashcards", "Step-by-step explanations", "Mixed learning"],
  },
  {
    id: "study_time",
    type: "chips-single",
    field: "preferred_study_time",
    message: "When do you feel most productive? I'll schedule reminders around your best study times.",
    options: ["Morning", "Afternoon", "Evening", "Night"],
  },
  {
    id: "subjects",
    type: "text",
    message: "What are your favorite subjects? And which ones do you find most challenging? This helps me focus my support where you need it most.",
    fields: [
      { key: "favorite_subjects", placeholder: "Favorite subjects (comma separated)" },
      { key: "difficult_subjects", placeholder: "Most challenging subjects (comma separated)" },
    ],
  },
  {
    id: "goals",
    type: "chips-multi",
    field: "goals",
    message: "What are your main goals right now? Pick whatever matters to you.",
    options: ["Improve grades", "Pass exams", "Stay organized", "Find internships", "Find scholarships", "Build projects", "Learn new skills", "Prepare for career", "Make friends", "Other"],
  },
  {
    id: "interests",
    type: "chips-multi",
    field: "interests",
    message: "What do you enjoy outside of academics? This helps me suggest communities and events you'd actually love.",
    options: ["Clubs", "Sports", "Music", "Gaming", "Technology", "Entrepreneurship", "Volunteering", "Research", "Photography", "Fitness", "Reading", "Travel"],
  },
  {
    id: "career",
    type: "text",
    message: "Dream big — what's your dream job? And which industries excite you? This is optional, but it helps me suggest the right opportunities.",
    fields: [
      { key: "dream_job", placeholder: "Dream job (optional)" },
      { key: "industries", placeholder: "Industries of interest (optional)" },
    ],
  },
  {
    id: "accessibility",
    type: "chips-multi",
    field: "accessibility",
    message: "I want UNIBUD to work perfectly for you. Do you have any accessibility preferences? You can pick multiple or skip this entirely.",
    options: ["Large text", "High contrast", "Color-blind support", "Screen reader", "Captions", "Reduced motion", "None"],
  },
  {
    id: "complete",
    type: "info",
    message: "That's all for now! 🎉\n\nI'll use everything you've shared to personalize your study plans, reminders, recommendations, and more.\n\nYou can update any of this anytime in your profile settings.\n\nWelcome to UNIBUD — let's make this your best semester yet! 🌟",
  },
];

export default function BudOnboarding() {
  const [messages, setMessages] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [data, setData] = useState({});
  const [chips, setChips] = useState([]);
  const [texts, setTexts] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const showStep = (index) => {
    if (index >= STEPS.length) {
      finish();
      return;
    }
    const step = STEPS[index];
    setIsTyping(true);
    setChips([]);
    setTexts({});
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "bud", content: step.message, stepIndex: index }]);
      setStepIndex(index);
      setIsTyping(false);
    }, 700);
  };

  const formatUserResponse = () => {
    const step = STEPS[stepIndex];
    if (step.type === "info") return null;
    if (step.type === "chips-multi" || step.type === "chips-single") {
      return chips.length > 0 ? chips.join(", ") : null;
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
    } else if (step.type === "text") {
      const textData = {};
      step.fields.forEach(f => {
        if (texts[f.key]) textData[f.key] = texts[f.key];
      });
      setData(prev => ({ ...prev, ...textData }));
    }

    showStep(stepIndex + 1);
  };

  const handleSkip = () => {
    setMessages(prev => [...prev, { role: "user", content: "I'll skip this one" }]);
    showStep(stepIndex + 1);
  };

  const finish = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ ...data, onboarding_completed: true });
      await queryClient.invalidateQueries(["currentUser"]);
    } catch (e) {
      // ignore
    }
    setIsSaving(false);
  };

  const toggleChip = (option) => {
    const step = STEPS[stepIndex];
    if (step.type === "chips-single") {
      setChips([option]);
    } else {
      setChips(prev => prev.includes(option) ? prev.filter(c => c !== option) : [...prev, option]);
    }
  };

  const currentStep = stepIndex >= 0 ? STEPS[stepIndex] : null;
  const canContinue = currentStep?.type === "info" || chips.length > 0 || Object.values(texts).some(Boolean);
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
        {!isLastStep && currentStep?.type !== "info" && (
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
              <p className="text-[12px] text-[#86868B] font-medium">Setting up your experience...</p>
            </div>
          </div>
        )}
      </div>

      {/* Response area */}
      {!isTyping && !isSaving && currentStep && (
        <div className="px-4 pb-6 pt-3 flex-shrink-0 bg-[#F5F5F7] border-t border-black/[0.04]">
          {currentStep.type === "info" ? (
            <button
              onClick={handleContinue}
              className="w-full py-3.5 rounded-2xl bg-[#28A745] text-white font-heading font-semibold text-[14px] shadow-sm flex items-center justify-center gap-1.5 hover:bg-[#1a7a35] transition-colors"
            >
              {isLastStep ? (
                <>Get Started <Check className="w-4 h-4" /></>
            ) : (
              <>Continue <ChevronRight className="w-4 h-4" /></>
            )}
            </button>
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