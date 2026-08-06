import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Users, BadgeCheck, Share2, Bell, BellOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "@/components/ui/EmptyState";
import { ORG_TABS, isOfficer, ROLE_META } from "@/components/organization/orgConstants";
import OrgOverview from "@/components/organization/OrgOverview";
import OrgFeed from "@/components/organization/OrgFeed";
import OrgMembers from "@/components/organization/OrgMembers";
import OrgEvents from "@/components/organization/OrgEvents";
import OrgElections from "@/components/organization/OrgElections";
import OrgFinance from "@/components/organization/OrgFinance";

const EASE = [0.16, 1, 0.3, 1];

export default function OrganizationHub() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [joined, setJoined] = useState(false);
  const [notifOn, setNotifOn] = useState(true);

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });

  const { data: club, isLoading } = useQuery({
    queryKey: ["club", clubId],
    queryFn: () => base44.entities.Club.get(clubId),
    enabled: !!clubId,
  });

  useEffect(() => {
    if (club && user) setJoined((club.members || []).some((m) => m.user_id === user.id));
  }, [club, user]);

  const officer = club ? isOfficer(club.members || [], user?.id) : false;
  const userRole = club ? (club.members || []).find((m) => m.user_id === user?.id)?.role : null;

  const handleJoin = async () => {
    if (!user || !club || joined) return;
    setJoined(true);
    try {
      const newMember = { user_id: user.id, name: user.full_name || "You", image: user.avatar_url || "", role: "member", joined_at: new Date().toISOString() };
      await base44.entities.Club.update(club.id, { members: [...(club.members || []), newMember], members_count: (club.members_count || 0) + 1 });
      qc.invalidateQueries({ queryKey: ["club", clubId] });
      toast({ title: "Joined!", description: `You're now a member of ${club.name}.` });
    } catch {
      setJoined(false);
      toast({ title: "Couldn't join", variant: "destructive" });
    }
  };

  const handleLeave = async () => {
    if (!user || !club) return;
    setJoined(false);
    setActiveTab("overview");
    try {
      await base44.entities.Club.update(club.id, {
        members: (club.members || []).filter((m) => m.user_id !== user.id),
        members_count: Math.max(0, (club.members_count || 1) - 1),
      });
      qc.invalidateQueries({ queryKey: ["club", clubId] });
      toast({ title: "Left club", description: `You've left ${club.name}.` });
    } catch {
      setJoined(true);
    }
  };

  const handleShare = () => {
    if (navigator.share && club) {
      navigator.share({ title: club.name, text: club.description || "", url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast({ title: "Link copied" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen">
        <div className="pt-12 px-5">
          <button onClick={() => navigate("/clubs")} className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
        </div>
        <EmptyState icon={Users} title="Club not found" description="This organization may have been removed." />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="relative">
        {club.banner_url ? (
          <div className="h-32 overflow-hidden">
            <img src={club.banner_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
          </div>
        ) : (
          <div className="h-24 bg-gradient-to-br from-primary/15 to-accent/5" />
        )}

        <div className="px-4 -mt-10 relative z-10">
          <button onClick={() => navigate("/clubs")} className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap mb-3">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>

          <div className="flex items-end gap-3 mb-3">
            <div className="w-16 h-16 rounded-[20px] bg-card soft-shadow flex items-center justify-center overflow-hidden border-2 border-background flex-shrink-0">
              {club.logo_url ? <img src={club.logo_url} alt="" className="w-full h-full object-cover" /> : <Users className="w-7 h-7 text-primary" />}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-[20px] font-bold text-foreground leading-tight flex items-center gap-1.5">
                {club.name}
                {club.is_verified && <BadgeCheck className="w-4 h-4 text-primary" />}
              </h1>
              <p className="text-[12px] text-muted-foreground capitalize">{club.category} {club.is_official ? "· Official" : ""}</p>
            </div>
          </div>

          {club.mission && <p className="text-[13px] text-foreground/70 leading-relaxed mb-3">{club.mission}</p>}

          {/* Action buttons */}
          <div className="flex gap-2 mb-1">
            {joined ? (
              <button onClick={handleLeave} className="flex-1 py-2.5 rounded-[14px] bg-muted text-muted-foreground text-[13px] font-semibold spring-tap">Leave</button>
            ) : club.join_mode === "invite_only" ? (
              <button disabled className="flex-1 py-2.5 rounded-[14px] bg-muted text-muted-foreground text-[13px] font-semibold opacity-60">Invite Only</button>
            ) : (
              <button onClick={handleJoin} className="flex-1 py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">Join Club</button>
            )}
            <button onClick={() => { setNotifOn(!notifOn); toast({ title: notifOn ? "Notifications muted" : "Notifications on" }); }} className="w-11 h-11 rounded-[14px] bg-card soft-shadow flex items-center justify-center spring-tap">
              {notifOn ? <Bell className="w-4 h-4 text-foreground" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
            </button>
            <button onClick={handleShare} className="w-11 h-11 rounded-[14px] bg-card soft-shadow flex items-center justify-center spring-tap">
              <Share2 className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {joined && userRole && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${(ROLE_META[userRole] || ROLE_META.member).bg} ${(ROLE_META[userRole] || ROLE_META.member).color}`}>
                {(ROLE_META[userRole] || ROLE_META.member).label}
              </span>
              <span className="text-[11px] text-muted-foreground">{club.members_count || 0} members</span>
              {club.meeting_schedule && <span className="text-[11px] text-muted-foreground">· {club.meeting_schedule}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div className="sticky top-0 z-20 mt-4 px-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {ORG_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap ${active ? "bg-foreground text-background soft-shadow" : "bg-card text-muted-foreground border border-border/40"}`}>
                <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-2">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.28, ease: EASE }}>
            {activeTab === "overview" && <OrgOverview club={club} user={user} onNavigate={setActiveTab} />}
            {activeTab === "feed" && <OrgFeed club={club} user={user} />}
            {activeTab === "members" && <OrgMembers club={club} user={user} />}
            {activeTab === "events" && <OrgEvents club={club} user={user} />}
            {activeTab === "elections" && <OrgElections club={club} user={user} />}
            {activeTab === "finance" && <OrgFinance club={club} user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}