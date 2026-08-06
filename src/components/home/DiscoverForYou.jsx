import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp, Award, CalendarDays, Users, Sparkles, FlaskConical,
} from "lucide-react";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";
const AMBER = "#FFB15E";

const DISCOVER = [
  { id: "trending", icon: TrendingUp, title: "Trending on Campus", sub: "What everyone's talking about", to: "/square", color: ORANGE },
  { id: "scholarships", icon: Award, title: "Scholarships", sub: "Funding opportunities for you", to: "/scholarships", color: AMBER },
  { id: "events", icon: CalendarDays, title: "Upcoming Events", sub: "Don't miss what's happening", to: "/events", color: ORANGE },
  { id: "communities", icon: Users, title: "Communities", sub: "Find your people", to: "/communities", color: AMBER },
  { id: "ai", icon: Sparkles, title: "AI Recommendations", sub: "Personalized for you", to: "/discover", color: ORANGE },
  { id: "research", icon: FlaskConical, title: "Research Opportunities", sub: "Projects & positions open", to: "/research", color: AMBER },
];

export default function DiscoverForYou() {
  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
      {DISCOVER.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
          >
            <Link
              to={item.to}
              className="block w-[180px] p-4 rounded-[20px] spring-tap hover-lift relative overflow-hidden"
              style={{
                background: "linear-gradient(160deg, rgba(58, 42, 34, 0.7), rgba(44, 33, 26, 0.7))",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* Glow */}
              <div
                className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${item.color}15, transparent 70%)` }}
              />
              <div className="relative">
                <div className="w-10 h-10 rounded-[14px] grid place-items-center mb-3" style={{ background: `${item.color}15` }}>
                  <Icon className="w-[19px] h-[19px]" strokeWidth={2} style={{ color: item.color }} />
                </div>
                <p className="text-[14px] font-semibold leading-tight" style={{ color: CREAM }}>{item.title}</p>
                <p className="text-[12px] mt-1 leading-snug" style={{ color: CREAM_MUTED }}>{item.sub}</p>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}