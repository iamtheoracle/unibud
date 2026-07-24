import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Clock, MessageSquare, Rocket, Award, FlaskConical, Briefcase } from "lucide-react";
import SuggestedPrompts from "./SuggestedPrompts";
import QuickActions from "./QuickActions";
import BudCategories from "./BudCategories";
import BudCharacter from "@/components/brand/BudCharacter";
import { formatLastActivity } from "@/lib/agentRegistry";
import { isFutureStudent } from "@/lib/futureStudentConfig";
import { getJourneyStageForUser } from "@/lib/universityJourney";

const FUTURE_STUDENT_PROMPTS = [
  { label: "What's university life really like?", icon: Sparkles, prompt: "Tell me what university life is really like. What should I expect and how can I prepare?" },
  { label: "Help me prepare for my exams", icon: Rocket, prompt: "I'm preparing for my exams. Can you help me create a study plan and give me tips?" },
  { label: "How do I choose the right university?", icon: Sparkles, prompt: "How do I choose the right university? What should I consider when comparing options?" },
  { label: "Find scholarships I can apply for", icon: Rocket, prompt: "Find scholarships I might be eligible for as a future student preparing for admission." },
  { label: "Connect me with a student mentor", icon: Sparkles, prompt: "I'd love to connect with a verified university student mentor. Who's available?" },
  { label: "Tips for surviving my first year", icon: Rocket, prompt: "Give me university survival tips for my first year. What do students wish they knew earlier?" },
];

const POSTGRADUATE_PROMPTS = [
  { label: "Help with my research methodology", icon: FlaskConical, prompt: "I need help with my research methodology. Can you guide me through different approaches and help me choose the right one?" },
  { label: "Find relevant academic literature", icon: Sparkles, prompt: "Help me find relevant academic literature and publications for my research area." },
  { label: "Plan my thesis timeline", icon: FlaskConical, prompt: "Help me plan a realistic timeline for my thesis or dissertation from proposal to defense." },
  { label: "Find research funding and grants", icon: Sparkles, prompt: "Find research grants, fellowships, and funding opportunities I might be eligible for as a postgraduate student." },
  { label: "Mentor an undergraduate student", icon: Award, prompt: "I'd like to mentor an undergraduate student. How can I get involved and share my experience?" },
  { label: "Academic vs industry career paths", icon: Briefcase, prompt: "Help me weigh academic vs industry career paths after my postgraduate studies. What should I consider?" },
];

const ALUMNI_PROMPTS = [
  { label: "How can I mentor current students?", icon: Award, prompt: "I'd like to give back and mentor current students. How can I get involved as an alumni mentor?" },
  { label: "Help me update my CV", icon: Briefcase, prompt: "Help me update my CV to reflect my current career and achievements since graduation." },
  { label: "Find networking opportunities", icon: Sparkles, prompt: "Find networking opportunities, alumni events, and professional gatherings I can attend." },
  { label: "Explore postgraduate study options", icon: FlaskConical, prompt: "I'm considering going back for postgraduate studies. What options do I have and how do I get started?" },
  { label: "Share my university story", icon: Award, prompt: "I'd love to share my university experience and career journey with current students. How can I do that?" },
  { label: "Stay connected with my university", icon: Sparkles, prompt: "How can I stay connected with my university community and upcoming events?" },
];

export default function BudWelcome({ user, onPrompt, conversations, onOpenConversation }) {
  const recentConvs = (conversations || []).slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = user?.preferred_name || user?.full_name?.split(" ")[0] || "there";
  const futureStudent = isFutureStudent(user);
  const stage = getJourneyStageForUser(user);
  const StageIcon = stage?.icon;

  let stagePrompts = null;
  let stageBadge = null;

  if (futureStudent) {
    stagePrompts = FUTURE_STUDENT_PROMPTS;
    stageBadge = { icon: Rocket, label: "Future Student Companion", bg: "bg-primary/10", color: "text-primary" };
  } else if (user?.user_type === "postgraduate") {
    stagePrompts = POSTGRADUATE_PROMPTS;
    stageBadge = { icon: FlaskConical, label: "Postgraduate Companion", bg: "bg-purple/10", color: "text-purple" };
  } else if (user?.user_type === "alumni") {
    stagePrompts = ALUMNI_PROMPTS;
    stageBadge = { icon: Award, label: "Alumni Companion", bg: "bg-success/10", color: "text-success" };
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4 no-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="pt-6 text-center"
      >
        <BudCharacter
          variant="portrait"
          className="w-28 h-28 rounded-[28px] mx-auto mb-5 border border-border/30 premium-shadow"
        />
        {stageBadge && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${stageBadge.bg} ${stageBadge.color} text-[10px] font-semibold mb-2`}>
            <stageBadge.icon className="w-3 h-3" /> {stageBadge.label}
          </span>
        )}
        <h2 className="font-heading font-bold text-[22px] text-foreground mb-1.5">
          {greeting}, {name}! 👋
        </h2>
        <p className="text-[13px] text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
          {futureStudent
            ? "I'm Bud — your companion before, during, and after university. Ask me anything about university life, exam prep, scholarships, careers, or just say hi!"
            : user?.user_type === "postgraduate"
            ? "I'm Bud — your companion through your postgraduate journey and beyond. I can help with research, thesis planning, funding, career paths, and more."
            : user?.user_type === "alumni"
            ? "I'm Bud — your lifelong companion. I can help with career advancement, mentoring students, networking, and staying connected to your university community."
            : "I'm Bud — your mentor, tutor, and companion. I can help with academics, careers, wellness, campus life, and more. What's on your mind?"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-5"
      >
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">Quick Actions</p>
        <QuickActions onSelect={onPrompt} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mb-5"
      >
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
          {stagePrompts ? "Start Here" : "Suggested"}
        </p>
        {stagePrompts ? (
          <div className="space-y-2">
            {stagePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => onPrompt(prompt.prompt)}
                className="w-full text-left p-3 rounded-[16px] bg-card border border-border/40 soft-shadow card-hover spring-tap flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-[12px] bg-primary/8 flex items-center justify-center flex-shrink-0">
                  <prompt.icon className="w-4 h-4 text-primary" strokeWidth={2} />
                </div>
                <p className="text-[12px] font-medium text-foreground flex-1">{prompt.label}</p>
              </button>
            ))}
          </div>
        ) : (
          <SuggestedPrompts onSelect={onPrompt} />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mb-4"
      >
        <BudCategories onPrompt={onPrompt} />
      </motion.div>

      {recentConvs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mb-4"
        >
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">Recent Conversations</p>
          <div className="space-y-2">
            {recentConvs.map((conv, i) => {
              const lastMsg = conv.messages?.[conv.messages.length - 1];
              const agents = conv.agents_used || [];
              return (
                <button
                  key={conv.id || i}
                  onClick={() => onOpenConversation(conv)}
                  className="w-full text-left p-3 rounded-[16px] bg-card border border-border/40 soft-shadow card-hover spring-tap flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-[12px] bg-primary/8 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-foreground truncate">{conv.title || "Conversation"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{lastMsg?.content || "No messages"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground flex-shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {formatLastActivity(agents[0])}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}