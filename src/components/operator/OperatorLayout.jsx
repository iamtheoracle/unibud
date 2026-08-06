import React from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ListChecks, CalendarDays, User, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { hapticTap } from "@/lib/haptics";
import { useBudPanel } from "@/lib/BudPanelContext";
import { getRoleName } from "@/lib/portalConfig";

const tabs = [
  { path: "/operator", icon: Home, label: "Home" },
  { path: "/operator/tasks", icon: ListChecks, label: "Tasks" },
  { path: "/operator/calendar", icon: CalendarDays, label: "Calendar" },
  { path: "/operator/profile", icon: User, label: "Profile" },
];

export default function OperatorLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { openBud } = useBudPanel();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const isActive = (p) => (p === "/operator" ? location.pathname === "/operator" : location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-10 pb-3 safe-area-pt"
        style={{ background: "linear-gradient(to bottom, hsl(var(--background)), hsl(var(--background)/0.85) 70%, transparent)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">UNIBUD · Operator</p>
            <h1 className="font-heading font-bold text-[16px] text-foreground leading-tight">
              {user?.full_name || "Operator"} · {getRoleName(user?.role)}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 pb-32">
        <Outlet />
      </div>

      {/* Floating command dock */}
      <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none safe-area-px">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="max-w-md mx-auto px-4 safe-area-pb"
        >
          <nav className="pointer-events-auto relative flex items-center justify-between gap-1 rounded-[28px] px-3 py-2"
            style={{ background: "var(--glass-bg)", backdropFilter: "blur(var(--glass-blur)) saturate(1.5)", WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(1.5)", border: "1px solid var(--glass-border)", boxShadow: "var(--shadow-elevated)" }}>
            {tabs.map((t) => {
              const active = isActive(t.path);
              const Icon = t.icon;
              return (
                <Link key={t.path} to={t.path} onClick={() => hapticTap()}
                  className="relative flex items-center justify-center w-14 h-12 spring-tap rounded-full" aria-label={t.label}>
                  {active && <motion.div layoutId="opActivePill" className="absolute inset-0 rounded-full bg-primary/12" transition={{ type: "spring", stiffness: 420, damping: 30 }} />}
                  <motion.div animate={{ scale: active ? 1.08 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 22 }} className="relative flex flex-col items-center">
                    <Icon className={`w-[21px] h-[21px] transition-colors ${active ? "text-primary" : "text-muted-foreground/70"}`} strokeWidth={active ? 2.4 : 1.9} />
                    <span className={`text-[9px] font-semibold mt-0.5 ${active ? "text-primary" : "text-muted-foreground/60"}`}>{t.label}</span>
                  </motion.div>
                </Link>
              );
            })}
            <button onClick={() => { hapticTap(); openBud(); }} className="w-12 h-12 -my-3 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_6px_24px_hsl(var(--primary)/0.4)] relative spring-tap" aria-label="Ask Bud">
              <Sparkles className="w-5 h-5" strokeWidth={2.2} />
              <motion.div className="absolute inset-0 rounded-full border-2 border-primary" initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }} />
            </button>
          </nav>
        </motion.div>
      </div>
    </div>
  );
}