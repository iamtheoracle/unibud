import React from "react";
import { motion } from "framer-motion";

const SPRING = { type: "spring", stiffness: 400, damping: 32 };

const TABS = [
  { id: "posts", label: "Posts" },
  { id: "collections", label: "Collections" },
  { id: "achievements", label: "Achievements" },
  { id: "about", label: "About" },
];

export default function ProfileTabBar({ active, onChange }) {
  return (
    <div className="flex items-center gap-0.5 px-4 mt-5 border-b border-border/30">
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative px-3 py-2.5 text-[12px] font-semibold spring-tap shrink-0"
            style={{ color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
          >
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="profile-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full"
                transition={SPRING}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}