import React, { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { LayoutGrid, GraduationCap, Users, Trophy, Briefcase, Activity, BarChart3, ShieldCheck } from "lucide-react";

import OverviewSection from "@/components/me/sections/OverviewSection";
import AcademicsSection from "@/components/me/sections/AcademicsSection";
import SocialSection from "@/components/me/sections/SocialSection";
import AchievementsSection from "@/components/me/sections/AchievementsSection";
import PortfolioSection from "@/components/me/sections/PortfolioSection";
import ActivitySection from "@/components/me/sections/ActivitySection";
import AnalyticsSection from "@/components/me/sections/AnalyticsSection";
import IdentitySettingsSection from "@/components/me/sections/IdentitySettingsSection";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: LayoutGrid, component: OverviewSection },
  { id: "academics", label: "Academics", icon: GraduationCap, component: AcademicsSection },
  { id: "social", label: "Social", icon: Users, component: SocialSection },
  { id: "achievements", label: "Achievements", icon: Trophy, component: AchievementsSection },
  { id: "portfolio", label: "Portfolio", icon: Briefcase, component: PortfolioSection },
  { id: "activity", label: "Activity", icon: Activity, component: ActivitySection },
  { id: "analytics", label: "Analytics", icon: BarChart3, component: AnalyticsSection },
  { id: "identity", label: "Identity", icon: ShieldCheck, component: IdentitySettingsSection },
];

export default function MePage({ isOwnProfile = true, profileUser }) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("overview");

  const { data: user, isLoading } = useQuery({
    queryKey: ["me", "user"],
    queryFn: () => base44.auth.me(),
    enabled: isOnline,
  });

  const displayUser = profileUser || user;
  const state = !isOnline ? "offline" : isLoading && !profileUser ? "loading" : "ready";

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient]);

  const visibleSections = isOwnProfile
    ? SECTIONS
    : SECTIONS.filter((s) => !["analytics", "identity"].includes(s.id));

  const ActiveComponent = SECTIONS.find((s) => s.id === activeSection)?.component || OverviewSection;

  return (
    <div className="max-w-[600px] mx-auto pb-24">
      {/* Sticky header with section tabs */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm px-4 pt-5 pb-2">
        <h1 className="text-[24px] font-bold text-foreground tracking-tight mb-3">
          {isOwnProfile ? "Me" : "Profile"}
        </h1>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {visibleSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                  activeSection === section.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground shadow-sm"
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section content */}
      <div className="px-4 py-3">
        <ProductionState state={state} onRefresh={handleRefresh} skeleton={<MeSkeleton />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <ActiveComponent
                user={displayUser}
                isOwnProfile={isOwnProfile}
                onNavigateSection={setActiveSection}
              />
            </motion.div>
          </AnimatePresence>
        </ProductionState>
      </div>
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