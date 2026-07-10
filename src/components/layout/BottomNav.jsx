import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass, Users, User, Video, Library, Clapperboard } from "lucide-react";
import { useFeatureFlags } from "@/lib/FeatureFlagContext";
import UnibudMark from "@/components/brand/UnibudMark";

const allNavItems = [
  { path: "/", icon: Home, label: "Campus", flag: "campus" },
  { path: "/quad", icon: Compass, label: "Quad", flag: "quad" },
  { path: "/shorts", icon: Clapperboard, label: "Shorts", flag: null },
  { path: "/connect", icon: Users, label: "Connect", flag: "connect" },
  { path: "/bud", icon: null, label: "Bud", flag: "bud", isCenter: true },
  { path: "/live", icon: Video, label: "Live", flag: "live" },
  { path: "/library", icon: Library, label: "Library", flag: "library" },
  { path: "/me", icon: User, label: "Me", flag: null },
];

export default function BottomNav() {
  const location = useLocation();
  const { isModuleEnabled } = useFeatureFlags();

  const navItems = allNavItems.filter((item) => !item.flag || isModuleEnabled(item.flag));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-lg mx-auto px-4 pb-3">
        <motion.nav
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="pointer-events-auto glass rounded-[28px] px-2 py-2 flex items-center justify-around"
        >
          {navItems.map((item) => {
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

            // Bud — official center gold button
            if (item.isCenter) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative flex flex-col items-center gap-0.5 -mt-5"
                >
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center spring-tap ${
                      isActive ? "bg-primary gold-glow" : "bg-primary"
                    }`}
                  >
                    <UnibudMark className="w-6 h-6 text-primary-foreground" />
                  </motion.div>
                  <span className={`text-[10px] font-semibold transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            }

            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-2.5 rounded-2xl transition-all duration-200 spring-tap"
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute inset-0 rounded-2xl bg-primary/10"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    y: isActive ? -1 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="relative"
                >
                  <Icon
                    className={`w-[22px] h-[22px] transition-colors duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                </motion.div>
                <span className={`relative text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </motion.nav>
      </div>
    </div>
  );
}