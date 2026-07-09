import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Users, User } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Campus" },
  { path: "/quad", icon: Compass, label: "Quad" },
  { path: "/connect", icon: Users, label: "Connect" },
  { path: "/me", icon: User, label: "Me" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-lg mx-auto px-4 pb-3">
        <nav className="pointer-events-auto bg-card rounded-[28px] px-2 py-2 flex items-center justify-around border border-border/50 backdrop-blur-xl premium-shadow">
          {navItems.map((item) => {
            const isActive = item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-2xl transition-all duration-200"
              >
                <Icon
                  className={`w-[22px] h-[22px] transition-colors duration-200 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? "text-foreground" : "text-muted-foreground"
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