import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Compass, Users, User, Video, Library } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Campus" },
  { path: "/quad", icon: Compass, label: "Quad" },
  { path: "/live", icon: Video, label: "Live" },
  { path: "/library", icon: Library, label: "Library" },
  { path: "/me", icon: User, label: "Me" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-lg mx-auto px-4 pb-3">
        <motion.nav
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="pointer-events-auto glass rounded-[28px] px-2.5 py-2.5 flex items-center justify-around"
        >
          {navItems.map((item) => {
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-3.5 rounded-2xl transition-all duration-200 spring-tap"
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