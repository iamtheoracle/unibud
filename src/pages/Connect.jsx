import React from "react";
import { Search, Plus, UserPlus, Users, Calendar, Circle, Trophy, Heart, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import StudyMatching from "@/components/connect/StudyMatching";
import StudentSearch from "@/components/connect/StudentSearch";
import EventsSection from "@/components/connect/EventsSection";
import MentorshipSection from "@/components/connect/MentorshipSection";
import CareerNetwork from "@/components/connect/CareerNetwork";
import MessagesPreview from "@/components/connect/MessagesPreview";
import SafetyBanner from "@/components/connect/SafetyBanner";
import EmptyState from "@/components/ui/EmptyState";
import { Link } from "react-router-dom";
import { useDemoMode } from "@/lib/DemoModeContext";

const quickActions = [
  { icon: UserPlus, label: "Find Friends", desc: "Connect with classmates", color: "bg-primary/10", iconColor: "text-primary", path: "/connect" },
  { icon: Users, label: "Groups", desc: "Join communities", color: "bg-info/10", iconColor: "text-info", path: "/study-groups" },
  { icon: Trophy, label: "Challenges", desc: "Compete & win", color: "bg-purple/10", iconColor: "text-purple", path: "/challenges" },
  { icon: Shield, label: "Government", desc: "Student leaders", color: "bg-success/10", iconColor: "text-success", path: "/student-government" },
  { icon: Calendar, label: "Events", desc: "What's happening", color: "bg-warning/10", iconColor: "text-warning", path: "/events" },
  { icon: Heart, label: "Support", desc: "We're here for you", color: "bg-error/10", iconColor: "text-error", path: "/student-support" },
];

const DEMO_STUDENTS = [
  { id: "d1", full_name: "Chioma Eze", department: "Computer Science · 300L", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
  { id: "d2", full_name: "Femi Adeyanka", department: "Mathematics · 200L", avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
  { id: "d3", full_name: "Aisha Bello", department: "Physics · 300L", avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80" },
  { id: "d4", full_name: "David Okonkwo", department: "Engineering · 400L", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
];

const DEMO_GROUPS = [
  { id: "d1", name: "Computer Science Hub", members_count: 1234, subject: "CS", status: "active" },
  { id: "d2", name: "UNIBUD Developers", members_count: 234, subject: "Dev", status: "active" },
  { id: "d3", name: "Chess Club", members_count: 89, subject: "Chess", status: "active" },
  { id: "d4", name: "Entrepreneurship Hub", members_count: 312, subject: "Business", status: "active" },
];

export default function Connect() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ["socialConnections"],
    queryFn: () => base44.entities.SocialConnection.list("-created_date", 10),
    enabled: !isDemoMode,
  });
  const { data: groups, isLoading: groupsLoading } = useQuery({
    queryKey: ["connectGroups"],
    queryFn: () => base44.entities.StudyGroup.filter({ status: "active" }, "-members_count", 10),
    enabled: !isDemoMode,
  });

  const students = isDemoMode
    ? DEMO_STUDENTS
    : (connections || []).map((c) => ({
        id: c.id,
        full_name: c.username || c.name || "Connection",
        department: c.platform ? c.platform.charAt(0).toUpperCase() + c.platform.slice(1) : "",
        avatar_url: "",
      }));
  const groupList = isDemoMode ? DEMO_GROUPS : (groups || []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5 flex items-center justify-between"
      >
        <div>
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Connect</h1>
          <p className="text-[12px] text-muted-foreground font-medium">People. Groups. Opportunities.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/discover")} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
            <Search className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
          </button>
          <button onClick={() => navigate("/messages")} className="w-10 h-10 rounded-full bg-primary soft-shadow flex items-center justify-center spring-tap">
            <Plus className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2} />
          </button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
            >
              <Link to={action.path} className="block bg-card rounded-[20px] soft-shadow border border-border/20 p-4 text-left card-hover spring-tap">
                <div className={"w-10 h-10 rounded-[14px] " + action.color + " flex items-center justify-center mb-3"}>
                  <action.icon className={"w-[18px] h-[18px] " + action.iconColor} strokeWidth={2.2} />
                </div>
                <p className="font-heading font-semibold text-[13px] text-foreground">{action.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Messages Preview */}
      <MessagesPreview />

      {/* Scalable student discovery with infinite scroll */}
      {!isDemoMode && (
        <StudentSearch university={user?.university} enabled={!!user} />
      )}

      {/* Study Matching */}
      <StudyMatching />

      {/* Active Groups */}
      <div className="px-5 pb-10">
        <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">Active Groups</h3>
        {groupsLoading && !isDemoMode ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-[68px] rounded-[20px] shimmer" />)}
          </div>
        ) : groupList.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/20">
            <EmptyState icon={Users} title="No groups yet" description="Join or create study groups to connect with classmates" action={<Link to="/study-groups" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">Browse Groups</Link>} />
          </div>
        ) : (
          <div className="space-y-3">
            {groupList.map((group, i) => (
              <motion.div
                key={group.id || i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link to={"/study-groups/" + (group.id || "")} className="block">
                  <div className="bg-card rounded-[20px] soft-shadow border border-border/20 p-4 flex items-center gap-3.5 card-hover">
                    <div className="w-12 h-12 rounded-[16px] bg-muted flex items-center justify-center text-xl flex-shrink-0">
                      <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-semibold text-[13px] text-foreground">{group.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{group.members_count || 0} members</span>
                        {group.status === "active" && (
                          <span className="flex items-center gap-1 text-[10px] text-success font-medium">
                            <Circle className="w-2 h-2 fill-success text-success" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="px-3.5 py-2 rounded-full bg-primary/10 text-primary text-[11px] font-semibold spring-tap">Join</button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Mentorship */}
      <MentorshipSection />

      {/* Events */}
      <EventsSection />

      {/* Career Network */}
      <CareerNetwork />

      {/* Safety */}
      <SafetyBanner />
    </div>
  );
}