import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Settings, Shield, Bell, Palette, Globe, Smartphone,
  BadgeCheck, Award, Briefcase, FileText, ChevronRight, Sparkles,
  Wallet as WalletIcon, Lock, Activity, Calendar as CalendarIcon,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import BudAcademicInsights from "@/components/bud/BudAcademicInsights";
import SmartReminders from "@/components/bud/SmartReminders";
import DeadlineAlertsBanner from "@/components/academics/DeadlineAlertsBanner";
import { Image } from "@/components/ui/image";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

const CATEGORIES = [
  { id: "profile", label: "Profile" },
  { id: "portfolio", label: "Portfolio" },
  { id: "resume", label: "Resume" },
  { id: "activity", label: "Activity" },
  { id: "achievements", label: "Achievements" },
  { id: "skills", label: "Skills" },
  { id: "wallet", label: "Wallet" },
  { id: "settings", label: "Settings" },
  { id: "privacy", label: "Privacy" },
  { id: "security", label: "Security" },
  { id: "devices", label: "Devices" },
];

export default function MeTab() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();
  const [activeCategory, setActiveCategory] = useState("profile");

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["me", "user"],
    queryFn: () => base44.auth.me(),
    enabled: isOnline,
  });

  const { data: achievements, isLoading: achLoading } = useQuery({
    queryKey: ["me", "achievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-date_earned", 10),
    enabled: isOnline && (activeCategory === "achievements" || activeCategory === "profile"),
  });

  const { data: portfolio, isLoading: portLoading } = useQuery({
    queryKey: ["me", "portfolio"],
    queryFn: () => base44.entities.PortfolioItem.list("-created_date", 10),
    enabled: isOnline && (activeCategory === "portfolio" || activeCategory === "profile"),
  });

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["me", "wallet"],
    queryFn: () => base44.entities.Wallet.list("-created_date", 1),
    enabled: isOnline && (activeCategory === "wallet" || activeCategory === "profile"),
  });

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient]);

  const isLoading = userLoading || (activeCategory === "achievements" && achLoading) || (activeCategory === "portfolio" && portLoading) || (activeCategory === "wallet" && walletLoading);
  const state = !isOnline ? "offline" : isLoading ? "loading" : "ready";

  return (
    <div className="max-w-[600px] mx-auto pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-4 pt-5 pb-2">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[24px] font-bold text-foreground tracking-tight">Me</h1>
          <button
            onClick={() => navigate("/settings")}
            className="w-9 h-9 rounded-full bg-card shadow-sm flex items-center justify-center active:scale-90 transition-transform"
          >
            <Settings className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 h-8 rounded-full text-[12px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground shadow-sm"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3">
        <ProductionState state={state} onRefresh={handleRefresh} skeleton={<MeSkeleton />}>
          {/* Profile */}
          {activeCategory === "profile" && (
            <div className="space-y-4">
              {/* Profile header */}
              <div className="flex items-center gap-4 py-2">
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
                  <h2 className="text-[20px] font-bold text-foreground truncate tracking-tight">{user?.full_name || "Student"}</h2>
                  <p className="text-[13px] text-muted-foreground truncate">{user?.email}</p>
                  {user?.role && (
                    <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-primary/10">
                      <BadgeCheck className="w-3 h-3 text-primary" strokeWidth={2.5} />
                      <span className="text-[9px] font-bold text-primary uppercase tracking-wider">{user.role}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Bud suggestion */}
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

              {/* Quick links */}
              <div className="grid grid-cols-4 gap-2">
                <QuickLink icon={FileText} label="Portfolio" onClick={() => setActiveCategory("portfolio")} />
                <QuickLink icon={Briefcase} label="Resume" onClick={() => navigate("/cv-builder")} />
                <QuickLink icon={Award} label="Awards" onClick={() => setActiveCategory("achievements")} />
                <QuickLink icon={WalletIcon} label="Wallet" onClick={() => setActiveCategory("wallet")} />
              </div>

              {/* Wallet preview */}
              <button
                onClick={() => setActiveCategory("wallet")}
                className="w-full p-4 rounded-[20px] bg-chocolate text-white shadow-sm flex items-center justify-between text-left active:scale-[0.98] transition-transform"
              >
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider">Campus Wallet</p>
                  <p className="text-[22px] font-bold mt-0.5">₦{Number(wallet?.[0]?.balance || 0).toLocaleString()}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/40" strokeWidth={2} />
              </button>

 {/* Deadline Alerts — persistent, auto-generated */}
              <DeadlineAlertsBanner />

              {/* Bud Insights */}
              <BudAcademicInsights />

              {/* Smart Reminders */}
              <SmartReminders />

              {/* Calendar Sync — full settings */}
              <button
                onClick={() => navigate("/settings/calendar-sync")}
                className="w-full flex items-center gap-2.5 p-3.5 rounded-[18px] bg-card text-left active:scale-[0.98] transition-transform"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
              >
                <div className="w-9 h-9 rounded-full bg-chocolate/10 flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-foreground">Calendar Sync</p>
                  <p className="text-[11px] text-muted-foreground">Google, Outlook & Apple Calendar</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
              </button>

              {/* Achievements preview */}
              {(achievements?.length ?? 0) > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-[15px] font-bold text-foreground tracking-tight">Achievements</h3>
                    <button onClick={() => navigate("/achievements/gallery")} className="text-[11px] font-bold text-primary active:scale-95 transition-transform">Gallery</button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
                    {achievements.slice(0, 5).map((a) => (
                      <button key={a.id} onClick={() => navigate("/achievements/gallery")} className="flex flex-col items-center gap-1.5 flex-shrink-0 w-20 p-2.5 rounded-[16px] bg-card shadow-sm active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center">
                          <Award className="w-5 h-5 text-primary" strokeWidth={2} />
                        </div>
                        <p className="text-[10px] font-bold text-foreground text-center line-clamp-2">{a.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Portfolio */}
          {activeCategory === "portfolio" && (
            (portfolio?.length ?? 0) === 0 ? (
              <EmptyContent icon={FileText} text="No portfolio items" subtext="Add projects to showcase your work" />
            ) : (
              <div className="space-y-2">
                {portfolio.map((p) => (
                  <ListRow key={p.id} icon={FileText} title={p.title} subtitle={p.description || p.type || "Portfolio"} onClick={() => navigate("/portfolio")} />
                ))}
              </div>
            )
          )}

          {/* Resume */}
          {activeCategory === "resume" && (
            <button
              onClick={() => navigate("/cv-builder")}
              className="w-full p-4 rounded-[18px] bg-card shadow-sm flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <Briefcase className="w-5 h-5 text-primary" strokeWidth={2} />
              <span className="text-[13px] font-bold text-foreground flex-1">Build Your Resume</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
            </button>
          )}

          {/* Activity */}
          {activeCategory === "activity" && (
            <EmptyContent icon={Activity} text="No recent activity" subtext="Your activity will appear here" />
          )}

          {/* Achievements */}
          {activeCategory === "achievements" && (
            (achievements?.length ?? 0) === 0 ? (
              <EmptyContent icon={Award} text="No achievements yet" subtext="Earn achievements by reaching academic milestones" />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {achievements.map((a) => (
                  <div key={a.id} className="flex flex-col items-center gap-2 p-3 rounded-[16px] bg-card shadow-sm">
                    <div className="w-12 h-12 rounded-[14px] bg-primary/10 flex items-center justify-center">
                      <Award className="w-6 h-6 text-primary" strokeWidth={2} />
                    </div>
                    <p className="text-[11px] font-bold text-foreground text-center">{a.title}</p>
                    {a.description && <p className="text-[9px] text-muted-foreground text-center line-clamp-2">{a.description}</p>}
                  </div>
                ))}
              </div>
            )
          )}

          {/* Skills */}
          {activeCategory === "skills" && (
            <EmptyContent icon={BadgeCheck} text="No skills added" subtext="Add your skills to showcase your expertise" />
          )}

          {/* Wallet */}
          {activeCategory === "wallet" && (
            <div className="space-y-3">
              <button
                onClick={() => navigate("/wallet")}
                className="w-full p-4 rounded-[20px] bg-chocolate text-white shadow-sm flex items-center justify-between text-left active:scale-[0.98] transition-transform"
              >
                <div>
                  <p className="text-[10px] text-white/60 uppercase tracking-wider">Campus Wallet</p>
                  <p className="text-[22px] font-bold mt-0.5">₦{Number(wallet?.[0]?.balance || 0).toLocaleString()}</p>
                </div>
                <WalletIcon className="w-6 h-6 text-white/40" strokeWidth={2} />
              </button>
              <button
                onClick={() => navigate("/wallet")}
                className="w-full p-3.5 rounded-[16px] bg-card shadow-sm flex items-center justify-center gap-2 text-center active:scale-[0.98] transition-transform"
              >
                <span className="text-[13px] font-bold text-primary">Manage Wallet</span>
              </button>
            </div>
          )}

          {/* Settings */}
          {activeCategory === "settings" && (
            <div className="space-y-2">
              <SettingsRow icon={Settings} label="General Settings" onClick={() => navigate("/settings")} />
              <SettingsRow icon={Bell} label="Notifications" onClick={() => navigate("/smart-notifications")} />
              <SettingsRow icon={Palette} label="Appearance" onClick={() => navigate("/accessibility")} />
              <SettingsRow icon={Globe} label="Connected Accounts" onClick={() => navigate("/settings/connected-accounts")} />
            </div>
          )}

          {/* Privacy */}
          {activeCategory === "privacy" && (
            <div className="space-y-2">
              <SettingsRow icon={Lock} label="Privacy Controls" onClick={() => navigate("/settings")} />
              <SettingsRow icon={Shield} label="Data & Permissions" onClick={() => navigate("/settings")} />
            </div>
          )}

          {/* Security */}
          {activeCategory === "security" && (
            <div className="space-y-2">
              <SettingsRow icon={Shield} label="Security Center" onClick={() => navigate("/security")} />
              <SettingsRow icon={Lock} label="Password & Auth" onClick={() => navigate("/security")} />
              <SettingsRow icon={Smartphone} label="Two-Factor Auth" onClick={() => navigate("/security")} />
            </div>
          )}

          {/* Devices */}
          {activeCategory === "devices" && (
            <SettingsRow icon={Smartphone} label="Manage Devices" onClick={() => navigate("/security")} />
          )}

          {/* Logout */}
          <div className="mt-6">
            <button
              onClick={() => base44.auth.logout()}
              className="w-full p-3.5 rounded-[16px] bg-card shadow-sm text-center active:scale-[0.98] transition-transform"
            >
              <span className="text-[13px] font-bold text-destructive">Log Out</span>
            </button>
          </div>
        </ProductionState>
      </div>
    </div>
  );
}

function QuickLink({ icon: Icon, label, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 p-2.5 rounded-[16px] bg-card shadow-sm"
    >
      <div className="w-8 h-8 rounded-[12px] bg-chocolate/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
      </div>
      <span className="text-[9px] font-bold text-foreground">{label}</span>
    </motion.button>
  );
}

function ListRow({ icon: Icon, title, subtitle, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] bg-card shadow-sm text-left"
    >
      <div className="w-10 h-10 rounded-[12px] bg-chocolate/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-chocolate" strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground truncate">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
    </motion.button>
  );
}

function SettingsRow({ icon: Icon, label, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-[16px] bg-card shadow-sm text-left"
    >
      <Icon className="w-4.5 h-4.5 text-muted-foreground" strokeWidth={2} />
      <span className="text-[13px] font-bold text-foreground flex-1">{label}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
    </motion.button>
  );
}

function EmptyContent({ icon: Icon, text, subtext }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16">
      <div className="w-14 h-14 rounded-[18px] bg-muted flex items-center justify-center">
        <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} />
      </div>
      <p className="text-[13px] text-muted-foreground">{text}</p>
      {subtext && <p className="text-[11px] text-muted-foreground/70">{subtext}</p>}
    </div>
  );
}

function MeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 py-2">
        <div className="w-20 h-20 rounded-full bg-muted animate-pulse" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded-full bg-muted animate-pulse" />
          <div className="h-3 w-40 rounded-full bg-muted animate-pulse" />
        </div>
      </div>
      <div className="h-16 rounded-[18px] bg-card shadow-sm animate-pulse" />
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-[16px] bg-card shadow-sm animate-pulse" />
        ))}
      </div>
    </div>
  );
}