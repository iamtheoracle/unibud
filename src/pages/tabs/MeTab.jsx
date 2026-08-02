import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Settings, Shield, Bell, Palette, Globe, Smartphone,
  BadgeCheck, Award, Briefcase, FileText, ChevronRight, Sparkles,
  Wallet as WalletIcon,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { Image } from "@/components/ui/image";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const SETTINGS_SECTIONS = [
  {
    title: "Account",
    items: [
      { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
      { id: "connected", label: "Connected Accounts", icon: Globe, path: "/settings/connected-accounts" },
      { id: "notifications", label: "Notifications", icon: Bell, path: "/smart-notifications" },
    ],
  },
  {
    title: "Security & Privacy",
    items: [
      { id: "security", label: "Security", icon: Shield, path: "/security" },
      { id: "privacy", label: "Privacy", icon: Shield, path: "/settings" },
      { id: "devices", label: "Devices", icon: Smartphone, path: "/security" },
    ],
  },
  {
    title: "Appearance",
    items: [
      { id: "appearance", label: "Appearance", icon: Palette, path: "/accessibility" },
      { id: "language", label: "Language", icon: Globe, path: "/settings" },
    ],
  },
];

const PROFILE_LINKS = [
  { id: "portfolio", label: "Portfolio", icon: FileText, path: "/portfolio" },
  { id: "achievements", label: "Achievements", icon: Award, path: "/achievements" },
  { id: "wallet", label: "Wallet", icon: WalletIcon, path: "/wallet" },
  { id: "cv", label: "Resume", icon: Briefcase, path: "/cv-builder" },
];

export default function MeTab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me", "user"],
    queryFn: () => base44.auth.me(),
    enabled: isOnline,
  });

  const { data: achievements, isLoading: achLoading } = useQuery({
    queryKey: ["me", "achievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-date_earned", 4),
    enabled: isOnline,
  });

  const { data: portfolio, isLoading: portLoading } = useQuery({
    queryKey: ["me", "portfolio"],
    queryFn: () => base44.entities.PortfolioItem.list("-created_date", 3),
    enabled: isOnline,
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["me", "wallet"],
    queryFn: () => base44.entities.Wallet.list("-created_date", 1),
    enabled: isOnline,
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient]);

  const allLoading = userLoading && achLoading;
  const state = !isOnline ? "offline" : allLoading ? "loading" : "ready";

  return (
    <ProductionState state={state} onRefresh={handleRefresh} skeleton={<MeSkeleton />}>
      <div className="max-w-[600px] mx-auto pb-24">
        {/* Profile header */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted overflow-hidden flex items-center justify-center flex-shrink-0">
              {user?.image || user?.picture ? (
                <Image src={user.image || user.picture} alt={user.full_name} fittingType="fill" className="w-full h-full" />
              ) : (
                <span className="text-[28px] font-bold text-muted-foreground">
                  {(user?.full_name || user?.email || "?").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-[20px] font-bold text-foreground truncate tracking-tight">
                  {user?.full_name || "Student"}
                </h1>
              </div>
              <p className="text-[13px] text-muted-foreground truncate">{user?.email}</p>
              {user?.role && (
                <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10">
                  <BadgeCheck className="w-3 h-3 text-primary" strokeWidth={2.5} />
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{user.role}</span>
                </span>
              )}
            </div>
            <button
              onClick={() => navigate("/settings")}
              className="w-9 h-9 rounded-full bg-card shadow-sm flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
            >
              <Settings className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Bud suggestion */}
        <div className="px-4">
          <button
            onClick={() => navigate("/bud")}
            className="w-full flex items-center gap-3 p-3.5 rounded-[18px] bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
            >
              <Sparkles className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
            </motion.div>
            <p className="text-[12px] text-foreground flex-1">
              {achievements?.length > 0
                ? `You've earned ${achievements.length} achievements. Keep going!`
                : "Complete your profile to unlock personalized recommendations."}
            </p>
            <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
          </button>
        </div>

        {/* Profile links */}
        <div className="px-4 mt-4">
          <div className="grid grid-cols-4 gap-2">
            {PROFILE_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <button
                  key={link.id}
                  onClick={() => navigate(link.path)}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-[16px] bg-card shadow-sm active:scale-95 transition-transform"
                >
                  <div className="w-8 h-8 rounded-[12px] bg-chocolate/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
                  </div>
                  <span className="text-[9px] font-bold text-foreground">{link.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wallet preview */}
        <div className="px-4 mt-4">
          <button
            onClick={() => navigate("/wallet")}
            className="w-full p-4 rounded-[20px] bg-chocolate text-white shadow-sm flex items-center justify-between text-left active:scale-[0.98] transition-transform"
          >
            <div>
              <p className="text-[10px] text-white/60 uppercase tracking-wider">Campus Wallet</p>
              <p className="text-[22px] font-bold mt-0.5">
                ₦{Number(wallet?.[0]?.balance || 0).toLocaleString()}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40" strokeWidth={2} />
          </button>
        </div>

        {/* Achievements */}
        {(achievements?.length ?? 0) > 0 && (
          <div className="px-4 mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[15px] font-bold text-foreground tracking-tight">Achievements</h3>
              <button onClick={() => navigate("/achievements")} className="text-[11px] font-bold text-primary active:scale-95 transition-transform">
                See all
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 w-20 p-2.5 rounded-[16px] bg-card shadow-sm"
                >
                  <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" strokeWidth={2} />
                  </div>
                  <p className="text-[10px] font-bold text-foreground text-center line-clamp-2">{a.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio */}
        {(portfolio?.length ?? 0) > 0 && (
          <div className="px-4 mt-5">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-[15px] font-bold text-foreground tracking-tight">Portfolio</h3>
              <button onClick={() => navigate("/portfolio")} className="text-[11px] font-bold text-primary active:scale-95 transition-transform">
                See all
              </button>
            </div>
            <div className="space-y-2">
              {portfolio.slice(0, 2).map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate("/portfolio")}
                  className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
                >
                  <div className="w-9 h-9 rounded-[12px] bg-chocolate/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-foreground truncate">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{p.description || p.type || "Portfolio"}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings sections */}
        <div className="px-4 mt-5 space-y-4">
          {SETTINGS_SECTIONS.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">{section.title}</p>
              <div className="rounded-[18px] bg-card shadow-sm overflow-hidden">
                {section.items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={`w-full flex items-center gap-3 p-3.5 text-left active:bg-muted/50 transition-colors ${
                        i > 0 ? "border-t border-border/30" : ""
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
                      <span className="text-[13px] font-semibold text-foreground flex-1">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div className="px-4 mt-6">
          <button
            onClick={() => base44.auth.logout()}
            className="w-full p-3.5 rounded-[16px] bg-card shadow-sm text-center active:scale-[0.98] transition-transform"
          >
            <span className="text-[13px] font-bold text-destructive">Log Out</span>
          </button>
        </div>
      </div>
    </ProductionState>
  );
}

function MeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 px-4 pt-6">
        <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded-full bg-muted animate-pulse" />
          <div className="h-3 w-40 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
      <div className="px-4 space-y-2">
        <div className="h-16 rounded-[18px] bg-card shadow-sm animate-pulse" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-[16px] bg-card shadow-sm animate-pulse" />
          ))}
        </div>
        <div className="h-20 rounded-[20px] bg-card shadow-sm animate-pulse" />
      </div>
    </div>
  );
}