import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Sparkles, Mic, Search, CalendarClock, BookOpen, TrendingUp,
  ArrowRight, Sun, Moon,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useNavigate } from "react-router-dom";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: "Good morning", icon: Sun };
  if (h < 17) return { text: "Good afternoon", icon: Sun };
  if (h < 21) return { text: "Good evening", icon: Moon };
  return { text: "Good night", icon: Moon };
}

export default function BudTab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [input, setInput] = useState("");
  const [greeting] = useState(getGreeting());
  const GreetingIcon = greeting.icon;

  const { data: assignments, isLoading: aLoading } = useQuery({
    queryKey: ["bud", "assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 3),
    enabled: isOnline,
  });

  const { data: events, isLoading: eLoading } = useQuery({
    queryKey: ["bud", "events"],
    queryFn: () => base44.entities.CampusEvent.list("-date", 3),
    enabled: isOnline,
  });

  const { data: courses, isLoading: cLoading } = useQuery({
    queryKey: ["bud", "courses"],
    queryFn: () => base44.entities.Course.list("-created_date", 3),
    enabled: isOnline,
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["bud"] });
  }, [queryClient]);

  const allLoading = aLoading && eLoading && cLoading;
  const state = !isOnline ? "offline" : allLoading ? "loading" : "ready";

  const suggestions = buildSuggestions(assignments || [], events || [], courses || []);

  return (
    <ProductionState
      state={state}
      onRefresh={handleRefresh}
      skeleton={<BudSkeleton />}
    >
      <div className="px-4 py-6 space-y-6 max-w-[600px] mx-auto">
        {/* Greeting */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GreetingIcon className="w-5 h-5 text-primary" strokeWidth={2} />
            <p className="text-[13px] text-muted-foreground font-medium">{greeting.text}</p>
          </div>
          <h1 className="text-[28px] font-bold text-foreground tracking-tight leading-tight">
            How can I help?
          </h1>
        </div>

        {/* Bud Orb */}
        <div className="flex flex-col items-center py-4">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center"
            style={{ boxShadow: "0 8px 32px rgba(255,122,0,0.25)" }}
          >
            <Sparkles className="w-9 h-9 text-white" strokeWidth={2} />
          </motion.div>
        </div>

        {/* Search bar */}
        <button
          onClick={() => navigate("/search")}
          className="w-full flex items-center gap-2.5 px-4 h-12 rounded-[18px] bg-card shadow-sm text-left"
        >
          <Search className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
          <span className="text-[13px] text-muted-foreground">Ask Bud anything or search campus...</span>
        </button>

        {/* Voice button */}
        <button className="w-full flex items-center justify-center gap-2.5 h-12 rounded-[18px] bg-chocolate text-white shadow-sm active:scale-[0.98] transition-transform">
          <Mic className="w-4.5 h-4.5" strokeWidth={2} />
          <span className="text-[13px] font-bold">Talk to Bud</span>
        </button>

        {/* AI Suggestions */}
        <div>
          <h3 className="text-[15px] font-bold text-foreground tracking-tight mb-3">Suggested for You</h3>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <SuggestionCard key={i} suggestion={s} onClick={() => navigate(s.path)} />
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h3 className="text-[15px] font-bold text-foreground tracking-tight mb-3">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-2">
            <QuickAction icon={CalendarClock} label="Schedule" onClick={() => navigate("/timetable")} />
            <QuickAction icon={BookOpen} label="Study" onClick={() => navigate("/study")} />
            <QuickAction icon={TrendingUp} label="Grades" onClick={() => navigate("/academics/results")} />
          </div>
        </div>
      </div>
    </ProductionState>
  );
}

function SuggestionCard({ suggestion, onClick }) {
  const Icon = suggestion.icon;
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-[18px] bg-card shadow-sm text-left"
    >
      <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-primary" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-foreground">{suggestion.title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{suggestion.description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] bg-card shadow-sm"
    >
      <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" strokeWidth={2.2} />
      </div>
      <span className="text-[10px] font-bold text-foreground">{label}</span>
    </motion.button>
  );
}

function buildSuggestions(assignments, events, courses) {
  const suggestions = [];

  if (assignments.length > 0) {
    suggestions.push({
      icon: BookOpen,
      title: `${assignments.length} assignments due`,
      description: "Let me help you prioritize and plan your study time.",
      path: "/assignments",
    });
  }

  if (events.length > 0) {
    suggestions.push({
      icon: CalendarClock,
      title: `${events.length} upcoming events`,
      description: "Check what's happening on campus this week.",
      path: "/events",
    });
  }

  if (courses.length > 0) {
    suggestions.push({
      icon: TrendingUp,
      title: `Continue ${courses[0]?.code || courses[0]?.name || "studying"}`,
      description: "Pick up where you left off in your courses.",
      path: "/courses",
    });
  }

  suggestions.push({
    icon: Sparkles,
    title: "Summarize my day",
    description: "Get a quick overview of everything happening today.",
    path: "/bud",
  });

  return suggestions.slice(0, 4);
}

function BudSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="h-3 w-28 rounded-full bg-muted animate-pulse" />
        <div className="h-7 w-48 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="flex justify-center py-4">
        <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
      </div>
      <div className="h-12 rounded-[18px] bg-card shadow-sm animate-pulse" />
      <div className="h-12 rounded-[18px] bg-card shadow-sm animate-pulse" />
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-[18px] bg-card shadow-sm animate-pulse" />
        ))}
      </div>
    </div>
  );
}