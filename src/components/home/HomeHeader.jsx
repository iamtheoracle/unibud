import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { resolveFirstName } from "@/lib/userDisplayName";
import { useSearch } from "@/lib/SearchContext";
import { useQuery } from "@tanstack/react-query";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";

const MOTIVATIONS = [
  "Every step forward counts.",
  "Small habits, big results.",
  "You're building something great.",
  "Progress over perfection.",
  "Today is yours to shape.",
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getMotivation() {
  return MOTIVATIONS[new Date().getDate() % MOTIVATIONS.length];
}

export default function HomeHeader() {
  const { openSearch } = useSearch();
  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: notifs } = useQuery({
    queryKey: ["home-unread-notifs"],
    queryFn: () => base44.entities.Notification.filter({ is_read: false }, "-created_date", 1),
    staleTime: 30000,
  });
  const unread = (notifs || []).length;
  const firstName = resolveFirstName(user);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium" style={{ color: CREAM_MUTED }}>{getGreeting()},</p>
          <h1 className="text-[26px] font-bold tracking-tight leading-tight" style={{ color: CREAM }}>
            {firstName} <span className="text-[22px]">👋</span>
          </h1>
        </div>
        <Link to="/notifications" className="relative w-11 h-11 rounded-full grid place-items-center shrink-0 spring-tap" style={{ background: "rgba(44, 33, 26, 0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <Bell className="w-[19px] h-[19px]" strokeWidth={1.8} style={{ color: CREAM }} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full" style={{ background: ORANGE, boxShadow: `0 0 8px ${ORANGE}` }} />
          )}
        </Link>
      </div>

      <p className="text-[14px] leading-relaxed mb-5" style={{ color: CREAM_MUTED }}>{getMotivation()}</p>

      <button onClick={openSearch} className="flex items-center gap-3 w-full h-[48px] px-4 rounded-[16px] spring-tap" style={{ background: "rgba(44, 33, 26, 0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
        <Search className="w-[18px] h-[18px] shrink-0" strokeWidth={1.8} style={{ color: CREAM_MUTED }} />
        <span className="text-[14px]" style={{ color: CREAM_MUTED }}>Search people, courses, events…</span>
      </button>
    </motion.div>
  );
}