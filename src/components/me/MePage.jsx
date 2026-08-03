import React, { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ProductionState from "@/components/shared/ProductionState";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import MeProfileHeader from "@/components/me/MeProfileHeader";
import MeSectionCard from "@/components/me/MeSectionCard";
import MeBudCard from "@/components/me/MeBudCard";

import {
  GraduationCap, BookOpen, Calendar, FileText, TrendingUp,
  CheckCircle2, Award, Trophy, FlaskConical, FolderOpen, UserCircle,
  UserPlus, Building2, Users, Images, Bookmark, CalendarDays, Star, Activity,
  Rocket, Briefcase, Wrench, Code2, Clapperboard, Building, BarChart3,
  Wallet, ArrowLeftRight, RefreshCw, ShoppingBag, CreditCard, Receipt, Gift,
  Palette, BellRing, Lock, Shield, Globe, Eye, HardDrive, Smartphone, Info, LifeBuoy, Settings,
} from "lucide-react";

const ACADEMIC_ITEMS = [
  { icon: UserCircle, label: "Academic Profile", to: "/academic-timeline" },
  { icon: BookOpen, label: "Courses", to: "/courses" },
  { icon: Calendar, label: "Timetable", to: "/timetable" },
  { icon: FileText, label: "Assignments", to: "/assignments" },
  { icon: TrendingUp, label: "Grades", to: "/academics/results" },
  { icon: CheckCircle2, label: "Attendance", to: "/attendance" },
  { icon: Award, label: "Certificates", to: "/digital-id" },
  { icon: Trophy, label: "Achievements", to: "/achievements/gallery" },
  { icon: FlaskConical, label: "Research", to: "/research" },
  { icon: FolderOpen, label: "Academic Portfolio", to: "/portfolio" },
];

const SOCIAL_ITEMS = [
  { icon: UserPlus, label: "Friends", to: "/friends" },
  { icon: Building2, label: "Communities", to: "/communities" },
  { icon: Users, label: "Groups", to: "/study-groups" },
  { icon: Images, label: "Media", to: "/studio" },
  { icon: Bookmark, label: "Saved Posts", to: "/highlights" },
  { icon: CalendarDays, label: "Events", to: "/events" },
  { icon: Star, label: "Highlights", to: "/highlights" },
  { icon: Activity, label: "Activity", to: "/social" },
];

const PROFESSIONAL_ITEMS = [
  { icon: Rocket, label: "Projects", to: "/projects" },
  { icon: FileText, label: "Resume", to: "/cv-builder" },
  { icon: Briefcase, label: "Portfolio", to: "/portfolio" },
  { icon: Wrench, label: "Skills", to: "/cv-builder" },
  { icon: Code2, label: "Developer", to: "/architect", color: "#6366F1" },
  { icon: Clapperboard, label: "Creator Studio", to: "/creator-studio", color: "#EC4899" },
  { icon: Building, label: "Business", to: "/clubs" },
  { icon: BarChart3, label: "Analytics", to: "/academics/insights" },
];

const WALLET_ITEMS = [
  { icon: Wallet, label: "Wallet", to: "/wallet" },
  { icon: ArrowLeftRight, label: "Transactions", to: "/wallet" },
  { icon: RefreshCw, label: "Subscriptions", to: "/wallet" },
  { icon: ShoppingBag, label: "Marketplace", to: "/marketplace", color: "#14B8A6" },
  { icon: ShoppingBag, label: "Orders", to: "/marketplace" },
  { icon: CreditCard, label: "Payments", to: "/wallet" },
  { icon: Receipt, label: "Invoices", to: "/wallet" },
  { icon: Gift, label: "Rewards", to: "/wallet" },
];

const PREFERENCES_ITEMS = [
  { icon: Palette, label: "Appearance", to: "/settings" },
  { icon: BellRing, label: "Notifications", to: "/smart-notifications" },
  { icon: Lock, label: "Privacy", to: "/settings", color: "#EF4444" },
  { icon: Shield, label: "Security", to: "/security", color: "#EF4444" },
  { icon: Globe, label: "Language", to: "/settings" },
  { icon: Eye, label: "Accessibility", to: "/accessibility" },
  { icon: HardDrive, label: "Storage", to: "/settings" },
  { icon: Smartphone, label: "Connected Devices", to: "/settings" },
  { icon: Info, label: "About", to: "/about" },
  { icon: LifeBuoy, label: "Support", to: "/help" },
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
          {/* Profile header */}
          <MeProfileHeader user={displayUser} />

          {/* Bud — companion card */}
          <MeBudCard user={displayUser} />

          {/* Academic */}
          <MeSectionCard
            title="Academic"
            icon={GraduationCap}
            color="#3B82F6"
            items={ACADEMIC_ITEMS}
            delay={0.15}
          />

          {/* Social */}
          <MeSectionCard
            title="Social"
            icon={Users}
            color="#8B5CF6"
            items={SOCIAL_ITEMS}
            delay={0.2}
          />

          {/* Professional */}
          <MeSectionCard
            title="Professional"
            icon={Briefcase}
            color="#10B981"
            items={PROFESSIONAL_ITEMS}
            delay={0.25}
          />

          {/* Wallet */}
          <MeSectionCard
            title="Wallet"
            icon={Wallet}
            color="#FACC15"
            items={WALLET_ITEMS}
            delay={0.3}
          />

          {/* Preferences */}
          <MeSectionCard
            title="Preferences"
            icon={Settings}
            color="#9CA3AF"
            items={PREFERENCES_ITEMS}
            delay={0.35}
          />
        </div>
      </ProductionState>
    </div>
  );
}

function MeSkeleton() {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] animate-pulse" style={{ background: "rgba(255,255,255,0.025)", height: 240 }} />
      <div className="rounded-[24px] animate-pulse" style={{ background: "rgba(255,255,255,0.025)", height: 160 }} />
      <div className="rounded-[24px] animate-pulse" style={{ background: "rgba(255,255,255,0.025)", height: 340 }} />
      <div className="rounded-[24px] animate-pulse" style={{ background: "rgba(255,255,255,0.025)", height: 260 }} />
    </div>
  );
}