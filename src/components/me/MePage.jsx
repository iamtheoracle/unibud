import React, { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import MeDashboardHeader from "@/components/me/MeDashboardHeader";
import MeStatsGrid from "@/components/me/MeStatsGrid";
import MeBudPanel from "@/components/me/MeBudPanel";
import MeAcademicOverview from "@/components/me/MeAcademicOverview";
import MeShortcutGrid from "@/components/me/MeShortcutGrid";
import MeSectionCard from "@/components/me/MeSectionCard";

import {
  GraduationCap, BookOpen, Calendar, FileText, TrendingUp,
  CheckCircle2, Award, Trophy, FlaskConical, FolderOpen, UserCircle, Library,
  UserPlus, Building2, Users, Images, Bookmark, BookmarkCheck, CalendarDays,
  Rocket, Briefcase, Wrench, Code2, Clapperboard, Building, BarChart3,
  Wallet, ArrowLeftRight, RefreshCw, ShoppingBag, Package, Gift,
  Palette, BellRing, Lock, Shield, Globe, Eye, HardDrive, Info, LifeBuoy, Settings, Link,
} from "lucide-react";

const ACADEMIC_ITEMS = [
  { icon: UserCircle, label: "Academic Profile", to: "/academic-timeline" },
  { icon: Calendar, label: "Timetable", to: "/timetable" },
  { icon: FileText, label: "Assignments", to: "/assignments" },
  { icon: TrendingUp, label: "Grades", to: "/academics/results" },
  { icon: BookOpen, label: "Courses", to: "/courses" },
  { icon: Trophy, label: "Achievements", to: "/achievements/gallery" },
  { icon: Award, label: "Certificates", to: "/digital-id" },
  { icon: FlaskConical, label: "Research", to: "/research" },
  { icon: Library, label: "Library", to: "/library" },
  { icon: FolderOpen, label: "Portfolio", to: "/portfolio" },
];

const SOCIAL_ITEMS = [
  { icon: UserPlus, label: "Friends", to: "/friends" },
  { icon: Building2, label: "Communities", to: "/communities" },
  { icon: Users, label: "Groups", to: "/study-groups" },
  { icon: Bookmark, label: "Saved Posts", to: "/highlights" },
  { icon: Images, label: "Media", to: "/studio", color: "#EC4899" },
  { icon: CalendarDays, label: "Events", to: "/events" },
  { icon: BookmarkCheck, label: "Bookmarks", to: "/highlights" },
];

const PROFESSIONAL_ITEMS = [
  { icon: Rocket, label: "Projects", to: "/projects" },
  { icon: FileText, label: "Resume", to: "/cv-builder" },
  { icon: Wrench, label: "Skills", to: "/cv-builder" },
  { icon: Code2, label: "Developer", to: "/architect", color: "#6366F1" },
  { icon: Clapperboard, label: "Creator Studio", to: "/creator-studio", color: "#A855F7" },
  { icon: Building, label: "Business Center", to: "/clubs", color: "#F59E0B" },
  { icon: BarChart3, label: "Analytics", to: "/academics/insights" },
  { icon: Briefcase, label: "Career", to: "/career" },
];

const WALLET_ITEMS = [
  { icon: Wallet, label: "Wallet", to: "/wallet" },
  { icon: ArrowLeftRight, label: "Transactions", to: "/wallet" },
  { icon: RefreshCw, label: "Subscriptions", to: "/wallet" },
  { icon: ShoppingBag, label: "Marketplace", to: "/marketplace", color: "#14B8A6" },
  { icon: Package, label: "Orders", to: "/marketplace" },
  { icon: ShoppingBag, label: "Purchases", to: "/marketplace" },
  { icon: Gift, label: "Rewards", to: "/wallet" },
];

const SETTINGS_ITEMS = [
  { icon: BellRing, label: "Notifications", to: "/smart-notifications" },
  { icon: Palette, label: "Appearance", to: "/settings" },
  { icon: Lock, label: "Privacy", to: "/settings", color: "#EF4444" },
  { icon: Shield, label: "Security", to: "/security", color: "#EF4444" },
  { icon: Link, label: "Connected Apps", to: "/settings/connected-accounts" },
  { icon: HardDrive, label: "Storage", to: "/settings" },
  { icon: Eye, label: "Accessibility", to: "/accessibility" },
  { icon: Globe, label: "Language", to: "/settings" },
  { icon: LifeBuoy, label: "Help", to: "/help" },
  { icon: Info, label: "About", to: "/about" },
];

export default function MePage({ isOwnProfile = true, profileUser }) {
  const isOnline = useOnlineStatus();
  const queryClient = useQueryClient();

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

  return (
    <div className="max-w-[520px] mx-auto pb-28 px-4 pt-3">
      <ProductionState state={state} onRefresh={handleRefresh} skeleton={<MeSkeleton />}>
        <div className="space-y-4">
          {/* Dashboard */}
          <MeDashboardHeader user={displayUser} />
          <MeStatsGrid user={displayUser} />
          <MeBudPanel user={displayUser} />
          <MeAcademicOverview user={displayUser} />
          <MeShortcutGrid />

          {/* Settings sections */}
          <MeSectionCard title="Academics" icon={GraduationCap} color="#10B981" items={ACADEMIC_ITEMS} delay={0.25} />
          <MeSectionCard title="Social" icon={Users} color="#3B82F6" items={SOCIAL_ITEMS} delay={0.3} />
          <MeSectionCard title="Professional" icon={Briefcase} color="#8B5CF6" items={PROFESSIONAL_ITEMS} delay={0.35} />
          <MeSectionCard title="Wallet" icon={Wallet} color="#FACC15" items={WALLET_ITEMS} delay={0.4} />
          <MeSectionCard title="Settings" icon={Settings} color="#9CA3AF" items={SETTINGS_ITEMS} delay={0.45} />
        </div>
      </ProductionState>
    </div>
  );
}

function MeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] animate-pulse" style={{ background: "rgba(255,255,255,0.025)", height: 180 }} />
      <div className="grid grid-cols-3 gap-2">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="rounded-[16px] animate-pulse" style={{ background: "rgba(255,255,255,0.025)", height: 72 }} />
        ))}
      </div>
      <div className="rounded-[24px] animate-pulse" style={{ background: "rgba(255,255,255,0.025)", height: 160 }} />
      <div className="rounded-[24px] animate-pulse" style={{ background: "rgba(255,255,255,0.025)", height: 120 }} />
    </div>
  );
}