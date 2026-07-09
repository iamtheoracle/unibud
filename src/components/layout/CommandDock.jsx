import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles, Bell, CalendarPlus, Clock, PenLine, Image as ImageIcon,
  PartyPopper, TrendingUp, UserPlus, Users, MessageCircle, GraduationCap,
  Search, ScanLine, BookOpen, Mic, Lightbulb, Workflow, Video, HelpCircle,
  Tag, Bookmark, ChevronUp, PlayCircle, Target, Award, BarChart3, Heart,
} from "lucide-react";

const CONTEXT_ACTIONS = {
  "/": [
    { icon: Clock, label: "Timetable", path: "/academics" },
    { icon: BookOpen, label: "Exams", path: "/academics" },
    { icon: Bell, label: "Reminder", path: "/notifications" },
    { icon: CalendarPlus, label: "Events", path: "/campus-traditions" },
  ],
  "/quad": [
    { icon: PenLine, label: "Post", path: "/quad" },
    { icon: ImageIcon, label: "Story", path: "/quad" },
    { icon: Award, label: "Achievement", path: "/achievements" },
    { icon: MessageCircle, label: "Discuss", path: "/quad" },
    { icon: TrendingUp, label: "Trends", path: "/discover" },
  ],
  "/connect": [
    { icon: GraduationCap, label: "Find Mentor", path: "/mentorship" },
    { icon: MessageCircle, label: "Start Chat", path: "/connect" },
    { icon: Users, label: "Create Group", path: "/study-groups" },
    { icon: UserPlus, label: "Study Partner", path: "/connect" },
  ],
  "/me": [
    { icon: UserPlus, label: "Edit Profile", path: "/student-profile" },
    { icon: Award, label: "Achievements", path: "/achievements" },
    { icon: BarChart3, label: "Progress", path: "/academics" },
    { icon: Sparkles, label: "Insights", path: "/academic-analytics" },
  ],
  "/academics": [
    { icon: PlayCircle, label: "Study Session", path: "/study-session" },
    { icon: CalendarPlus, label: "Calendar", path: "/calendar" },
    { icon: Target, label: "Study Goal", path: "/academics" },
    { icon: Users, label: "Study Group", path: "/study-groups" },
    { icon: GraduationCap, label: "Log Grade", path: "/academics" },
  ],
  "/wellbeing": [
    { icon: Heart, label: "Journal", path: "/wellbeing" },
    { icon: BookOpen, label: "Mood", path: "/wellbeing" },
    { icon: Lightbulb, label: "Resources", path: "/wellbeing" },
    { icon: Sparkles, label: "Ask Bud", path: "/bud" },
  ],
  "/library": [
    { icon: Search, label: "Search", path: "/library" },
    { icon: ScanLine, label: "Scan", path: "/library" },
    { icon: BookOpen, label: "Reading", path: "/library" },
  ],
  "/bud": [
    { icon: Mic, label: "Voice", path: "/bud" },
    { icon: Lightbulb, label: "Explain", path: "/bud" },
    { icon: Workflow, label: "Diagram", path: "/bud" },
    { icon: Video, label: "Video", path: "/bud" },
    { icon: HelpCircle, label: "Quiz", path: "/bud" },
  ],
  "/marketplace": [
    { icon: Tag, label: "Sell", path: "/marketplace" },
    { icon: Search, label: "Search", path: "/marketplace" },
    { icon: Bookmark, label: "Saved", path: "/marketplace" },
  ],
};

const DEFAULT_ACTIONS = [
  { icon: Sparkles, label: "Ask Bud", path: "/bud" },
  { icon: Bell, label: "Alerts", path: "/notifications" },
  { icon: Search, label: "Search", path: "/quad" },
];

export default function CommandDock() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const dockRef = useRef(null);

  const pathname = location.pathname;
  const contextKey = Object.keys(CONTEXT_ACTIONS).find((key) =>
    key === "/" ? pathname === "/" : pathname.startsWith(key)
  );
  const actions = CONTEXT_ACTIONS[contextKey] || DEFAULT_ACTIONS;

  useEffect(() => {
    setExpanded(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    if (expanded) {
      document.addEventListener("touchstart", handleClickOutside);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [expanded]);

  const handleAction = (action) => {
    setExpanded(false);
    if (action.path) navigate(action.path);
  };

  return (
    <div
      ref={dockRef}
      className="fixed bottom-[88px] left-0 right-0 z-50 pointer-events-none"
    >
      <div className="max-w-lg mx-auto px-4 flex justify-end">
        <div className="pointer-events-auto relative">
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 16, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="flex flex-col gap-1.5 mb-2"
              >
                <AnimatePresence>
                  {actions.map((action, i) => (
                    <motion.button
                      key={action.label}
                      initial={{ opacity: 0, x: 24, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 24, scale: 0.8 }}
                      transition={{ delay: i * 0.04, type: "spring", stiffness: 400, damping: 24 }}
                      onClick={() => handleAction(action)}
                      className="flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full glass spring-tap self-end"
                      aria-label={action.label}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/12 flex items-center justify-center">
                        <action.icon className="w-4 h-4 text-primary" strokeWidth={2} />
                      </div>
                      <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">
                        {action.label}
                      </span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Bud button */}
          <motion.button
            onClick={() => {
              if (expanded) {
                setExpanded(false);
              } else if (contextKey) {
                setExpanded(true);
              } else {
                navigate("/bud");
              }
            }}
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            className="w-14 h-14 rounded-full flex items-center justify-center bg-primary text-primary-foreground shadow-[0_4px_24px_rgba(212,175,55,0.35)] relative"
            aria-label={expanded ? "Close quick actions" : "Open quick actions"}
          >
            <AnimatePresence mode="wait">
              {expanded ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronUp className="w-6 h-6" strokeWidth={2.2} />
                </motion.div>
              ) : (
                <motion.div
                  key="bud"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sparkles className="w-6 h-6" strokeWidth={2} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pulsing ring when collapsed */}
            {!expanded && (
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}