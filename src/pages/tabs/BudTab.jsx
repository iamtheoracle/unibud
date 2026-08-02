import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Mic, Search, BookOpen, CalendarClock, TrendingUp,
  ArrowRight, Sun, Moon, MessageSquare, Zap, Bot, Clock,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const CATEGORIES = [
  { id: "chat", label: "Chat" },
  { id: "voice", label: "Voice" },
  { id: "search", label: "Search" },
  { id: "study", label: "Study" },
  { id: "campus", label: "Campus" },
  { id: "productivity", label: "Productivity" },
  { id: "automations", label: "Automations" },
  { id: "history", label: "History" },
];

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
  const [activeCategory, setActiveCategory] = useState("chat");
  const [greeting] = useState(getGreeting());
  const GreetingIcon = greeting.icon;

  const { data: assignments } = useQuery({
    queryKey: ["bud", "assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 3),
    enabled: isOnline,
  });

  const { data: events } = useQuery({
    queryKey: ["bud", "events"],
    queryFn: () => base44.entities.CampusEvent.list("-date", 3),
    enabled: isOnline,
  });

  const { data: courses } = useQuery({
    queryKey: ["bud", "courses"],
    queryFn: () => base44.entities.Course.list("-created_date", 3),
    enabled: isOnline,
  });

  const { data: conversations } = useQuery({
    queryKey: ["bud", "conversations"],
    queryFn: () => base44.entities.BudConversation.list("-created_date", 5),
    enabled: isOnline && (activeCategory === "history" || activeCategory === "chat"),
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["bud"] });
  }, [queryClient]);

  return (
    <div className="max-w-[600px] mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-4 pt-5 pb-2">
        <div className="flex items-center gap-2 mb-1">
          <GreetingIcon className="w-4 h-4 text-primary" strokeWidth={2} />
          <p className="text-[13px] text-muted-foreground font-medium">{greeting.text}</p>
        </div>
        <h1 className="text-[24px] font-bold text-foreground tracking-tight mb-3">Bud</h1>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 h-8 rounded-full text-[12px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground shadow-sm"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        {/* Bud Orb */}
        <div className="flex flex-col items-center py-6">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full bg-primary flex items-center justify-center"
            style={{ boxShadow: "0 8px 32px rgba(255,122,0,0.25)" }}
          >
            <Sparkles className="w-9 h-9 text-white" strokeWidth={2} />
          </motion.div>
        </div>

        {/* Chat */}
        {activeCategory === "chat" && (
          <div className="space-y-3">
            <button
              onClick={() => navigate("/search")}
              className="w-full flex items-center gap-2.5 px-4 h-12 rounded-[18px] bg-card shadow-sm text-left"
            >
              <Search className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
              <span className="text-[13px] text-muted-foreground">Ask Bud anything...</span>
            </button>

            <div className="space-y-2">
              <Suggestion icon={BookOpen} title="Study help" description="Get help with assignments and study materials" onClick={() => navigate("/study")} />
              <Suggestion icon={CalendarClock} title="Plan my day" description="Let Bud organize your schedule" onClick={() => navigate("/timetable")} />
              <Suggestion icon={TrendingUp} title="Grade insights" description="Understand your academic performance" onClick={() => navigate("/academics/results")} />
              <Suggestion icon={Bot} title="Campus guide" description="Ask about events, clubs, or campus life" onClick={() => navigate("/social")} />
            </div>
          </div>
        )}

        {/* Voice */}
        {activeCategory === "voice" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4 py-8">
              <button className="w-24 h-24 rounded-full bg-chocolate flex items-center justify-center active:scale-95 transition-transform" style={{ boxShadow: "0 8px 32px rgba(74,44,29,0.3)" }}>
                <Mic className="w-10 h-10 text-white" strokeWidth={2} />
              </button>
              <p className="text-[13px] text-muted-foreground">Tap to speak with Bud</p>
            </div>
            <div className="space-y-2">
              <Suggestion icon={BookOpen} title="Read my notes aloud" description="Listen to your study materials" onClick={() => navigate("/notes")} />
              <Suggestion icon={CalendarClock} title="What's my schedule?" description="Ask Bud about your classes today" onClick={() => navigate("/timetable")} />
            </div>
          </div>
        )}

        {/* Search */}
        {activeCategory === "search" && (
          <div className="space-y-3">
            <button
              onClick={() => navigate("/search")}
              className="w-full flex items-center gap-2.5 px-4 h-12 rounded-[18px] bg-card shadow-sm text-left"
            >
              <Search className="w-4.5 h-4.5 text-primary" strokeWidth={2} />
              <span className="text-[13px] text-muted-foreground">Search across campus...</span>
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Quick Searches</p>
              <div className="space-y-2">
                <Suggestion icon={BookOpen} title="Courses" description="Find your courses and materials" onClick={() => navigate("/courses")} />
                <Suggestion icon={CalendarClock} title="Events" description="Discover campus events" onClick={() => navigate("/events")} />
                <Suggestion icon={MessageSquare} title="Messages" description="Find conversations and contacts" onClick={() => navigate("/messages")} />
              </div>
            </div>
          </div>
        )}

        {/* Study */}
        {activeCategory === "study" && (
          <div className="space-y-2">
            <Suggestion icon={BookOpen} title="AI Study Assistant" description="Get personalized study help" onClick={() => navigate("/study")} />
            <Suggestion icon={Sparkles} title="Flashcards" description="AI-generated study cards" onClick={() => navigate("/study/flashcards")} />
            <Suggestion icon={CalendarClock} title="Study Planner" description="Plan your study sessions" onClick={() => navigate("/study/planner")} />
            <Suggestion icon={TrendingUp} title="Learning Paths" description="Track your progress" onClick={() => navigate("/study/paths")} />
          </div>
        )}

        {/* Campus */}
        {activeCategory === "campus" && (
          <div className="space-y-2">
            <Suggestion icon={CalendarClock} title={`${events?.length || 0} upcoming events`} description="See what's happening on campus" onClick={() => navigate("/events")} />
            <Suggestion icon={BookOpen} title={`${courses?.length || 0} active courses`} description="Continue your coursework" onClick={() => navigate("/courses")} />
            <Suggestion icon={CalendarClock} title="Today's timetable" description="Check your class schedule" onClick={() => navigate("/timetable")} />
          </div>
        )}

        {/* Productivity */}
        {activeCategory === "productivity" && (
          <div className="space-y-2">
            <Suggestion icon={CalendarClock} title="Plan my day" description="Let Bud organize your schedule" onClick={() => navigate("/timetable")} />
            <Suggestion icon={TrendingUp} title="Grade tracking" description="Monitor your academic progress" onClick={() => navigate("/academics/results")} />
            <Suggestion icon={BookOpen} title={`${assignments?.length || 0} assignments due`} description="Stay on top of your deadlines" onClick={() => navigate("/assignments")} />
            <Suggestion icon={MessageSquare} title="Inbox summary" description="Get a digest of your messages" onClick={() => navigate("/messages")} />
          </div>
        )}

        {/* Automations */}
        {activeCategory === "automations" && (
          <div className="space-y-2">
            <Suggestion icon={Zap} title="Schedule reminders" description="Auto-remind me about assignments" onClick={() => navigate("/assignments")} />
            <Suggestion icon={Zap} title="Class alerts" description="Notify me before each class" onClick={() => navigate("/timetable")} />
            <Suggestion icon={Zap} title="Event notifications" description="Alert me about campus events" onClick={() => navigate("/events")} />
            <Suggestion icon={Zap} title="Grade updates" description="Notify me when grades are posted" onClick={() => navigate("/academics/results")} />
          </div>
        )}

        {/* History */}
        {activeCategory === "history" && (
          <ProductionState
            state={!isOnline ? "offline" : "ready"}
            onRefresh={handleRefresh}
            skeleton={<HistorySkeleton />}
          >
            {(conversations?.length ?? 0) === 0 ? (
              <EmptyState icon={Clock} text="No conversations yet" subtext="Start chatting with Bud to see your history" />
            ) : (
              <div className="space-y-2">
                {conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => navigate("/bud")}
                    className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4.5 h-4.5 text-primary" strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-bold text-foreground truncate">{c.title || c.summary || "Conversation"}</p>
                      <p className="text-[10px] text-muted-foreground">{c.created_date ? new Date(c.created_date).toLocaleDateString() : ""}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" strokeWidth={2} />
                  </button>
                ))}
              </div>
            )}
          </ProductionState>
        )}
      </div>
    </div>
  );
}

function Suggestion({ icon: Icon, title, description, onClick }) {
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
        <p className="text-[12px] font-bold text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function EmptyState({ icon: Icon, text, subtext }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16">
      <div className="w-14 h-14 rounded-[18px] bg-muted flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} />
      </div>
      <p className="text-[13px] text-muted-foreground">{text}</p>
      {subtext && <p className="text-[11px] text-muted-foreground/70">{subtext}</p>}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-[16px] bg-card shadow-sm animate-pulse" />
      ))}
    </div>
  );
}