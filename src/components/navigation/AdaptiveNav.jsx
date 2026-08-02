import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, MotionConfig } from "framer-motion";
import {
  Home as HomeIcon,
  Users as ConnectIcon,
  User as UserIcon,
  GraduationCap as CampusIcon,
  Wallet as WalletIcon,
  ShoppingBag as MarketIcon,
  LayoutGrid as SquareIcon,
} from "lucide-react";
import { hapticSelect } from "@/lib/haptics";
import { useExperience } from "@/lib/ExperienceContext";

/* ── Spring physics — Apple-like: high stiffness, medium damping, natural bounce ── */
const SPRING = { type: "spring", stiffness: 420, damping: 32, mass: 1 };
const ICON_SPRING = { type: "spring", stiffness: 500, damping: 28, mass: 0.8 };
const FADE = { duration: 0.25, ease: [0.16, 1, 0.3, 1] };
const DOCK_ENTER = { duration: 0.55, ease: [0.16, 1, 0.3, 1] };

/* ── Permanent tabs — Home (left), Connect, Me (always far right) ── */
const PERMANENT = {
  home: { to: "/home", label: "Home", icon: HomeIcon },
  connect: { to: "/connect", label: "Connect", icon: ConnectIcon },
  me: { to: "/me", label: "Me", icon: UserIcon },
};

/* ── Adaptive center — one destination, never multiple simultaneously ── */
const ADAPTIVE_CENTERS = {
  campus: { to: "/academics", label: "Campus", icon: CampusIcon },
  wallet: { to: "/wallet", label: "Wallet", icon: WalletIcon },
  marketplace: { to: "/marketplace", label: "Market", icon: MarketIcon },
  square: { to: "/square", label: "Square", icon: SquareIcon },
};

/** Determine which center destination to show based on the current route. */
function getCenterKey(pathname, mode) {
  if (pathname.startsWith("/wallet")) return "wallet";
  if (pathname.startsWith("/marketplace")) return "marketplace";
  if (pathname.startsWith("/social") || pathname.startsWith("/square") || pathname.startsWith("/quad")) return "square";
  if (pathname.startsWith("/campus") || pathname.startsWith("/academics")) return "campus";
  return mode === "social" ? "square" : "campus";
}

function isActive(pathname, to) {
  return pathname === to || pathname.startsWith(to + "/");
}

/**
 * AdaptiveNav — UNIBUD's signature floating navigation dock.
 *
 * Rebuilt from scratch as a premium pill-shaped floating dock inspired by
 * Apple Wallet, Apple Music, and iOS 26. Heavy frosted glass, large Lucide
 * icons, spring-physics active capsule morph, and an adaptive center slot.
 *
 * Permanent tabs: Home · [adaptive] · Connect · Me
 * Bud is NOT navigation — Bud lives inside the Home page.
 */
export default function AdaptiveNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode } = useExperience();
  const pathname = location.pathname;

  const centerKey = getCenterKey(pathname, mode);
  const center = ADAPTIVE_CENTERS[centerKey];

  /* Build the four tabs: Home · Center · Connect · Me */
  const tabs = [
    { key: "home", ...PERMANENT.home },
    { key: "center", ...center },
    { key: "connect", ...PERMANENT.connect },
    { key: "me", ...PERMANENT.me },
  ];

  const handleNav = (to) => {
    hapticSelect();
    navigate(to);
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.nav
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={DOCK_ENTER}
        className="fixed bottom-0 inset-x-0 z-40 pointer-events-none"
        aria-label="Primary navigation"
      >
        <div className="max-w-[520px] mx-auto px-3 pb-3 safe-area-pb pointer-events-auto">
          {/* ── Floating pill dock — 76px, 36px radius, crystal frosted glass ── */}
          <div className="luxury-dock rounded-[36px] h-[76px] flex items-center justify-between px-2.5">
            {tabs.map((tab) => (
              <NavTab
                key={tab.key}
                tab={tab}
                active={isActive(pathname, tab.to)}
                onClick={() => handleNav(tab.to)}
              />
            ))}
          </div>
        </div>
      </motion.nav>
    </MotionConfig>
  );
}

/**
 * NavTab — a single dock destination.
 * Active state: icon grows + lifts, capsule morphs in, label strengthens,
 * accent color appears, indicator dot appears. All spring-physics.
 */
function NavTab({ tab, active, onClick }) {
  const Icon = tab.icon;

  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      aria-label={tab.label}
      className="relative flex flex-col items-center justify-center flex-1 h-full min-w-0 spring-tap"
    >
      {/* Active capsule — morphs between tabs via shared layoutId */}
      {active && (
        <motion.div
          layoutId="nav-active-capsule"
          className="absolute inset-1.5 rounded-[26px] luxury-capsule"
          transition={SPRING}
        />
      )}

      {/* Icon + Label — scales up and lifts when active */}
      <motion.div
        animate={{
          scale: active ? 1.1 : 1,
          y: active ? -2 : 0,
        }}
        transition={ICON_SPRING}
        className="relative flex flex-col items-center gap-1"
      >
        <Icon
          className={`w-[30px] h-[30px] transition-colors duration-300 ${active ? "dock-icon-active" : "dock-icon"}`}
          strokeWidth={active ? 2.2 : 1.7}
        />
        <motion.span
          animate={{ opacity: active ? 1 : 0.45 }}
          transition={FADE}
          className={`text-[10px] font-medium tracking-tight transition-colors duration-300 ${active ? "dock-label-active" : "dock-label"}`}
        >
          {tab.label}
        </motion.span>
      </motion.div>

      {/* Active indicator — small dot underneath */}
      {active && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute bottom-1 w-1 h-1 rounded-full dock-dot"
          transition={SPRING}
        />
      )}
    </button>
  );
}