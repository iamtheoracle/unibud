import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Users, Plus, MessageSquare, Calendar, Gamepad2 } from "lucide-react";
import { useCreate } from "@/lib/CreateContext";
import { hapticTap } from "@/lib/haptics";

const SPRING = { type: "spring", stiffness: 400, damping: 35 };

const TABS = [
  { id: "discover",    label: "Discover",    to: "/social",      icon: Compass },
  { id: "communities", label: "Communities", to: "/communities", icon: Users },
  { id: "create",      label: "Create",      icon: Plus,          isCreate: true },
  { id: "messages",    label: "Messages",    to: "/messages",    icon: MessageSquare },
  { id: "events",      label: "Events",      to: "/events",      icon: Calendar },
  { id: "games",       label: "Games",       to: "/games",       icon: Gamepad2 },
];

/**
 * SocialTopNav — the five primary sections inside the Social workspace.
 * Discover · Communities · Create · Messages · Events
 */
export default function SocialTopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openCreate } = useCreate();

  const handleTab = (tab) => {
    hapticTap();
    if (tab.isCreate) {
      openCreate();
    } else if (tab.to) {
      navigate(tab.to);
    }
  };

  const isActive = (tab) => {
    if (tab.id === "discover") {
      return ["/social", "/discover", "/square", "/quad", "/shorts"].includes(location.pathname);
    }
    if (tab.to) {
      return location.pathname === tab.to || location.pathname.startsWith(tab.to + "/");
    }
    return false;
  };

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab);
        return (
          <button
            key={tab.id}
            onClick={() => handleTab(tab)}
            className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap shrink-0"
            style={{ color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
          >
            {active && (
              <motion.div
                layoutId="social-topnav-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: "hsl(var(--foreground) / 0.12)", border: "1px solid hsl(var(--foreground) / 0.2)" }}
                transition={SPRING}
              />
            )}
            {!active && <div className="absolute inset-0 rounded-full glass" />}
            <div className="relative flex items-center gap-1.5">
              {tab.isCreate ? (
                <div
                  className="w-4 h-4 rounded-full grid place-items-center"
                  style={{ background: "linear-gradient(135deg, rgba(255,138,42,0.85), rgba(255,110,20,0.75))" }}
                >
                  <Plus className="w-2.5 h-2.5" style={{ color: "#FFF" }} strokeWidth={3} />
                </div>
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              {tab.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}