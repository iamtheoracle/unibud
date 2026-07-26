import React from "react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import { resolveDisplayName } from "@/lib/userDisplayName";
import { useGreetingMoment } from "@/hooks/useGreetingMoment";

const EASE = [0.16, 1, 0.3, 1];

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function todayLabel() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/**
 * HomeHeader — the emotional entry point of Campus.
 *
 * The full greeting (salutation + large name + wave) only appears at
 * meaningful moments — first launch of the day or returning after many
 * hours. On ordinary repeat visits, Campus leads with useful information
 * (the date + your name) so the greeting never repeatedly occupies the
 * screen. Always the preferred Display Name — never username or email.
 */
export default function HomeHeader({ user, greeting }) {
  const display = resolveDisplayName(user) || "there";
  const greet = greeting || timeGreeting();
  const initial = (display || "U").charAt(0).toUpperCase();
  const { show: showGreeting } = useGreetingMoment();

  const avatar = (
    <button className="w-11 h-11 rounded-full glass-strong overflow-hidden flex items-center justify-center ring-1 ring-primary/20 spring-tap flex-shrink-0">
      {user?.avatar_url ? (
        <Image src={user.avatar_url} alt={display} fittingType="fill" className="w-full h-full" />
      ) : (
        <span className="font-heading font-bold text-[15px] text-foreground">{initial}</span>
      )}
    </button>
  );

  if (showGreeting) {
    return (
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="flex items-start justify-between gap-3"
      >
        <div className="min-w-0">
          <span className="text-[13px] text-muted-foreground font-medium block mb-1.5">{greet},</span>
          <h1 className="font-heading font-extrabold text-[30px] tracking-tight text-foreground leading-[1.1] break-words">
            {display} <span className="inline-block align-middle">👋</span>
          </h1>
          <span className="text-[11px] text-muted-foreground font-medium block mt-2">{todayLabel()}</span>
        </div>
        {avatar}
      </motion.header>
    );
  }

  // Compact, info-first header for repeat visits within the day.
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-start justify-between gap-3"
    >
      <div className="min-w-0">
        <span className="text-[11px] text-muted-foreground/80 font-medium block">{todayLabel()}</span>
        <h1 className="font-heading font-bold text-[22px] tracking-tight text-foreground leading-[1.15] break-words mt-0.5">
          {display}
        </h1>
      </div>
      {avatar}
    </motion.header>
  );
}