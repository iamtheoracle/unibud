import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet, ShoppingBag, Award, FlaskConical, CalendarDays,
  Bus, Home, HeartPulse, Briefcase, BookOpen,
} from "lucide-react";
import { useExperience } from "@/lib/ExperienceContext";
import { hapticTap } from "@/lib/haptics";

const ACADEMIC_ITEMS = [
  { key: "scholarships", icon: Award, label: "Scholarships", to: "/scholarships" },
  { key: "research", icon: FlaskConical, label: "Research", to: "/research" },
  { key: "library", icon: BookOpen, label: "Library", to: "/knowledge" },
  { key: "events", icon: CalendarDays, label: "Events", to: "/events" },
  { key: "transport", icon: Bus, label: "Transport", to: "/campus" },
  { key: "jobs", icon: Briefcase, label: "Jobs", to: "/opportunities" },
  { key: "wallet", icon: Wallet, label: "Wallet", to: "/wallet" },
  { key: "marketplace", icon: ShoppingBag, label: "Market", to: "/marketplace" },
];

const SOCIAL_ITEMS = [
  { key: "wallet", icon: Wallet, label: "Wallet", to: "/wallet" },
  { key: "marketplace", icon: ShoppingBag, label: "Market", to: "/marketplace" },
  { key: "events", icon: CalendarDays, label: "Events", to: "/events" },
  { key: "housing", icon: Home, label: "Housing", to: "/marketplace" },
  { key: "health", icon: HeartPulse, label: "Health", to: "/student-support" },
  { key: "certificates", icon: Award, label: "Certificates", to: "/portfolio" },
  { key: "scholarships", icon: Award, label: "Scholarships", to: "/scholarships" },
  { key: "jobs", icon: Briefcase, label: "Jobs", to: "/opportunities" },
];

/**
 * QuickAccessStrip — near-invisible floating strip above the dock.
 * No glass container. Softly separated icons that blend into the background.
 * Adapts items based on experience mode.
 */
export default function QuickAccessStrip() {
  const { mode } = useExperience();
  const navigate = useNavigate();
  const items = mode === "social" ? SOCIAL_ITEMS : ACADEMIC_ITEMS;

  return (
    <div className="flex items-center gap-0 overflow-x-auto no-scrollbar max-w-full px-1">
      {items.map((item, i) => {
        const Icon = item.icon;
        return (
          <React.Fragment key={item.key}>
            {i > 0 && <div className="w-px h-3 bg-white/[0.06] mx-0.5 shrink-0" />}
            <button
              onClick={() => { hapticTap(); navigate(item.to); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-white/[0.04] transition-colors spring-tap shrink-0"
              aria-label={item.label}
            >
              <Icon className="w-[18px] h-[18px] text-muted-foreground/50" strokeWidth={1.6} />
              <span className="text-[11px] font-medium text-muted-foreground/50 whitespace-nowrap">{item.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}