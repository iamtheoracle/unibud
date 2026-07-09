import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Users, Compass, User } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/academics", icon: BookOpen, label: "Learn" },
  { path: "/quad", icon: Compass, label: "Quad" },
  { path: "/connect", icon: Users, label: "Connect" },
  { path: "/me", icon: User, label: "Me" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-lg mx-auto px-4 pb-2">
        <nav className="glass-strong rounded-2xl px-2 py-1.5 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = item.path === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 relative z-10 transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span className={`text-[10px] mt-0.5 font-medium relative z-10 transition-colors duration-200 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}