import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Compass, Users, Plus, User, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const NAV_ITEMS = [
  { icon: Home, path: "/home", label: "Home" },
  { icon: Compass, path: "/discover", label: "Discover" },
  { icon: Users, path: "/communities", label: "Communities" },
  { icon: User, path: "/me", label: "Me" },
];

/**
 * GlobalNavDock — persistent bottom navigation dock.
 * 4 nav tabs + center Create button + floating Bud orb.
 * Bud is never a tab — always available as a floating orb.
 *
 * Props:
 *  - onOpenBud: () => void
 *  - onCreate: () => void
 *  - budState: string — current Bud orb state
 */
export default function GlobalNavDock({ onOpenBud, onCreate, budState = "idle" }) {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[5000] safe-area-pb pointer-events-none">
      <div className="flex items-end justify-center px-4 pb-2">
        {/* Floating Bud orb — sits above the dock */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: -28, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenBud}
          className="absolute left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <div className="relative w-12 h-12 rounded-full crystal-dock flex items-center justify-center">
            {/* Breathing glow */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full blur-md"
              style={{ background: "hsl(0 0% 100% / 0.15)" }}
            />

            {/* Ambient ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full"
              style={{
                background: "conic-gradient(from 0deg, transparent, hsl(0 0% 100% / 0.10), transparent, hsl(0 0% 100% / 0.10), transparent)",
                mask: "radial-gradient(circle, transparent 65%, black 67%, black 72%, transparent 74%)",
                WebkitMask: "radial-gradient(circle, transparent 65%, black 67%, black 72%, transparent 74%)",
              }}
            />

            <Sparkles className="w-5 h-5 text-primary relative z-10" strokeWidth={2.2} />
          </div>
        </motion.button>

        {/* Nav dock */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="flex items-center gap-1 px-3 py-2 rounded-[22px] crystal-dock pointer-events-auto max-w-[340px] w-full"
        >
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <NavButton key={item.path} item={item} active={location.pathname === item.path} />
          ))}

          {/* Center create button */}
          <div className="flex-1 flex justify-center">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onCreate}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center spring-tap"
            >
              <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </motion.button>
          </div>

          {NAV_ITEMS.slice(2).map((item) => (
            <NavButton key={item.path} item={item} active={location.pathname === item.path} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function NavButton({ item, active }) {
  const Icon = item.icon;
  return (
    <Link to={item.path} className="flex-1 flex flex-col items-center gap-0.5 py-1">
      <motion.div
        animate={{ scale: active ? 1.12 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 18 }}
        className="relative w-8 h-8 rounded-full flex items-center justify-center spring-tap"
      >
        <Icon
          className={cn("w-4.5 h-4.5", active ? "text-primary" : "text-muted-foreground")}
          strokeWidth={active ? 2.5 : 2.2}
        />
        <AnimatePresence>
          {active && (
            <motion.div
              layoutId="nav-active-dot"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );
}