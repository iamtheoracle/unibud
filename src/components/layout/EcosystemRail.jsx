import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {
  Sparkles, CloudSun, Wallet, Calendar, Bell, Newspaper,
  MessageSquare, Search, Settings, Accessibility, BarChart3,
  WifiOff, RefreshCw, Shield, Users,
} from "lucide-react";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { hapticTap } from "@/lib/haptics";
import { useWalletAccess } from "@/lib/wallet/useWalletAccess";
import EcosystemSheet from "./EcosystemSheet";

/**
 * EcosystemRail — a globally-available quick-access rail rendered above the
 * bottom nav on every authenticated screen. Connects every screen to the
 * core OS services (Bud, Weather, Wallet, Calendar, Notifications, Feed,
 * Messages, Search, Settings, Accessibility, Analytics, Offline, Sync,
 * Security) so nothing exists in isolation.
 *
 * Bud is the only AI users interact with; Spark & Oracle are internal
 * engines and are intentionally absent from this rail.
 */
const SERVICES = [
  { key: "bud", label: "Bud", icon: Sparkles, kind: "bud", glow: true },
  { key: "weather", label: "Weather", icon: CloudSun, kind: "sheet:weather" },
  { key: "wallet", label: "Wallet", icon: Wallet, to: "/finance" },
  { key: "calendar", label: "Calendar", icon: Calendar, to: "/calendar" },
  { key: "notifications", label: "Alerts", icon: Bell, to: "/notifications" },
  { key: "feed", label: "Feed", icon: Newspaper, to: "/quad" },
  { key: "social", label: "Social", icon: Users, to: "/social" },
  { key: "messages", label: "Messages", icon: MessageSquare, to: "/messages" },
  { key: "search", label: "Search", icon: Search, to: "/discover" },
  { key: "settings", label: "Settings", icon: Settings, to: "/me" },
  { key: "a11y", label: "Access", icon: Accessibility, kind: "sheet:accessibility" },
  { key: "analytics", label: "Analytics", icon: BarChart3, to: "/me" },
  { key: "offline", label: "Offline", icon: WifiOff, kind: "sheet:offline" },
  { key: "sync", label: "Sync", icon: RefreshCw, kind: "sheet:sync" },
  { key: "security", label: "Security", icon: Shield, to: "/security" },
];

export default function EcosystemRail() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { setOpen } = useBudLauncher();
  const { hasWallet } = useWalletAccess();
  const [sheet, setSheet] = useState(null);
  const services = hasWallet ? SERVICES : SERVICES.filter((s) => s.key !== "wallet");

  const onPick = (s) => {
    hapticTap();
    if (s.kind === "bud") setOpen(true);
    else if (s.kind?.startsWith("sheet:")) setSheet(s.kind.slice(5));
    else if (s.to) navigate(s.to);
  };

  return (
    <>
      <div
        className="fixed left-0 right-0 z-40 pointer-events-none"
        style={{ bottom: "calc(80px + env(safe-area-inset-bottom))" }}
      >
        <div className="max-w-[520px] mx-auto px-4 pointer-events-auto">
          <div className="glass-strong rounded-[20px] px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {services.map((s) => {
              const Icon = s.icon;
              const active = s.to && pathname === s.to;
              return (
                <button
                  key={s.key}
                  onClick={() => onPick(s)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full spring-tap whitespace-nowrap transition-colors ${
                    active ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted/50"
                  } ${s.glow ? "glow-pulse" : ""}`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                  <span className="text-[11px] font-semibold">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {sheet && <EcosystemSheet tab={sheet} onClose={() => setSheet(null)} />}
      </AnimatePresence>
    </>
  );
}