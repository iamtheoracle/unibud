import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home, GraduationCap, Compass, Users, ShoppingBag, Wallet, FlaskConical, User,
} from "lucide-react";
import { FLOATING_NAV_ITEMS } from "@/lib/platformManifest";

const ICON_MAP = {
  Home, GraduationCap, Compass, Users, ShoppingBag, Wallet, FlaskConical, User,
};

const EASE = [0.16, 1, 0.3, 1];

/**
 * FloatingNav — the ONE floating navigator.
 *
 * Positioned at the top of the interface, stories-style.
 * No duplicate floating navigation controls exist anywhere else.
 */
export default function FloatingNav() {
  const location = useLocation();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed top-0 left-0 right-0 z-[9997] safe-area-pt"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-3xl px-3 pt-2 pb-2">
        <div className="crystal-dock rounded-full px-2 py-1.5 flex items-center gap-0.5 overflow-x-auto no-scrollbar edge-light">
          {FLOATING_NAV_ITEMS.map((item) => {
            const Icon = ICON_MAP[item.icon] || Home;
            const active = location.pathname === item.to ||
              (item.to !== "/home" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`relative flex flex-col items-center justify-center min-w-[60px] px-2.5 py-1.5 rounded-full spring-tap transition-all duration-300 flex-shrink-0 ${
                  active ? "dock-pill" : "hover:bg-white/[0.04]"
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] mb-0.5 transition-colors duration-300 ${
                    active ? "dock-icon-active" : "dock-icon"
                  }`}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span className={`text-[9px] font-semibold transition-colors duration-300 ${
                  active ? "dock-label-active" : "dock-label"
                }`}>
                  {item.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="nav-active-dot"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full dock-dot"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}