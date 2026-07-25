import React from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/**
 * HomeHeader — greeting, current date, and profile initial.
 */
export default function HomeHeader({ user }) {
  const name = user?.full_name?.split(" ")[0] || "there";

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex items-start justify-between gap-3"
    >
      <div className="min-w-0">
        <span className="text-[11px] text-muted-foreground font-medium block mb-2">{todayLabel()}</span>
        <h1 className="font-heading font-bold text-[26px] tracking-tight text-foreground leading-[1.15]">
          {greeting()},<br />
          {name}
        </h1>
      </div>
      <button className="w-10 h-10 rounded-full glass-strong flex items-center justify-center ring-1 ring-primary/20 spring-tap flex-shrink-0">
        <span className="font-heading font-bold text-[15px] text-foreground">
          {(user?.full_name || "U").charAt(0).toUpperCase()}
        </span>
      </button>
    </motion.header>
  );
}