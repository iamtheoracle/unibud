import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Users } from "lucide-react";
import ReportModal from "@/components/ecosystem/ReportModal";
import EmptyState from "@/components/ui/EmptyState";
import { COMMUNITY_TYPES, getIcon } from "@/components/campus/campusConstants";
import { useToast } from "@/components/ui/use-toast";
import CommunityHeader from "@/components/community/CommunityHeader";
import CommunityTabBar from "@/components/community/CommunityTabBar";
import CommunityHome from "@/components/community/sections/CommunityHome";
import CommunityFeed from "@/components/community/sections/CommunityFeed";
import CommunityChat from "@/components/community/sections/CommunityChat";
import CommunityEvents from "@/components/community/sections/CommunityEvents";
import CommunityMembers from "@/components/community/sections/CommunityMembers";
import CommunityMedia from "@/components/community/sections/CommunityMedia";
import CommunityAnnouncements from "@/components/community/sections/CommunityAnnouncements";
import CommunitySettings from "@/components/community/sections/CommunitySettings";

const EASE = [0.16, 1, 0.3, 1];

/**
 * CommunityDetail — an app-like community experience.
 * Each community behaves like a dedicated application with its own
 * bottom navigation, immersive header, and distinct section identities.
 */
export default function CommunityDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [joined, setJoined] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [notifOn, setNotifOn] = useState(true);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: community, isLoading } = useQuery({
    queryKey: ["community", communityId],
    queryFn: () => base44.entities.Community.get(communityId),
    enabled: !!communityId,
  });

  const { data: posts } = useQuery({
    queryKey: ["communityPosts", communityId],
    queryFn: () => base44.entities.QuadPost.filter({ community: communityId }, "-created_date", 30),
    enabled: !!communityId,
  });

  const { data: events } = useQuery({
    queryKey: ["communityEvents", communityId],
    queryFn: () => base44.entities.CampusEvent.filter({ community_id: communityId }, "-date", 15),
    enabled: !!communityId,
  });

  useEffect(() => {
    if (community && user) {
      setJoined((community.members || []).some((m) => m.user_id === user.id));
    }
  }, [community, user]);

  const typeMeta = community ? (COMMUNITY_TYPES[community.type] || COMMUNITY_TYPES.department) : COMMUNITY_TYPES.department;
  const Icon = community ? getIcon(community.icon || typeMeta.icon) : Users;
  const accentColor = community?.accent_color || typeMeta.color;

  const handleJoin = async () => {
    if (!user || !community || joined) return;
    setJoined(true);
    try {
      const newMember = {
        user_id: user.id,
        name: user.full_name || "You",
        image: user.avatar_url || user.image || "",
        role: "member",
        joined_at: new Date().toISOString(),
      };
      const updatedMembers = [...(community.members || []), newMember];
      await base44.entities.Community.update(community.id, {
        members: updatedMembers,
        members_count: (community.members_count || 0) + 1,
      });
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
      toast({ title: "Joined!", description: `You're now a member of ${community.name}.` });
    } catch {
      setJoined(false);
      toast({ title: "Couldn't join", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleLeave = async () => {
    if (!user || !community) return;
    setJoined(false);
    setActiveTab("home");
    try {
      const updatedMembers = (community.members || []).filter((m) => m.user_id !== user.id);
      await base44.entities.Community.update(community.id, {
        members: updatedMembers,
        members_count: Math.max(0, (community.members_count || 1) - 1),
      });
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
      toast({ title: "Left community", description: `You've left ${community.name}.` });
    } catch {
      setJoined(true);
    }
  };

  const handleAddToCalendar = async (event) => {
    if (!event) return;
    try {
      await base44.entities.CalendarEvent.create({
        title: event.title,
        description: event.description || "",
        type: "event",
        date: event.date,
        start_time: event.start_time || "",
        end_time: event.end_time || "",
        location: event.location || "",
        source_entity: "CampusEvent",
        source_id: event.id,
      });
      toast({ title: "Added to calendar" });
    } catch {
      toast({ title: "Couldn't add to calendar", variant: "destructive" });
    }
  };

  const handleShare = () => {
    if (navigator.share && community) {
      navigator.share({ title: community.name, text: community.description || "", url: window.location.href }).catch(() => {});
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

  if (!community) {
    return (
      <div className="min-h-screen">
        <div className="pt-12 px-5">
          <button onClick={() => navigate("/communities")} className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
        </div>
        <EmptyState icon={Users} title="Community not found" description="This community may have been removed." />
      </div>
    );
  }

  const members = community?.members || [];

  return (
    <div className="min-h-screen pb-28">
      <CommunityHeader
        community={community}
        typeMeta={typeMeta}
        Icon={Icon}
        accentColor={accentColor}
        onBack={() => navigate("/communities")}
        onReport={() => setReportOpen(true)}
        onShare={handleShare}
        joined={joined}
        onJoin={user ? handleJoin : undefined}
        onToggleNotif={() => { setNotifOn(!notifOn); toast({ title: notifOn ? "Notifications muted" : "Notifications on" }); }}
      />

      {/* Section content with app-like transitions */}
      <div className="px-4 mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {activeTab === "home" && (
              <CommunityHome
                community={community}
                posts={posts}
                events={events}
                members={members}
                onNavigate={setActiveTab}
                accentColor={accentColor}
              />
            )}
            {activeTab === "feed" && (
              <CommunityFeed posts={posts} user={user} />
            )}
            {activeTab === "chat" && (
              <CommunityChat community={community} user={user} accentColor={accentColor} />
            )}
            {activeTab === "events" && (
              <CommunityEvents events={events} user={user} onAddToCalendar={handleAddToCalendar} />
            )}
            {activeTab === "members" && (
              <CommunityMembers community={community} accentColor={accentColor} />
            )}
            {activeTab === "media" && (
              <CommunityMedia posts={posts} accentColor={accentColor} />
            )}
            {activeTab === "announcements" && (
              <CommunityAnnouncements community={community} accentColor={accentColor} currentUser={user} />
            )}
            {activeTab === "settings" && (
              <CommunitySettings
                community={community}
                joined={joined}
                onLeave={handleLeave}
                onReport={() => setReportOpen(true)}
                accentColor={accentColor}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CommunityTabBar activeTab={activeTab} onChange={setActiveTab} accentColor={accentColor} />

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        contentType="community"
        contentId={communityId}
        reportedUserId={community?.created_by_id}
        reportedUserName={community?.name}
      />
    </div>
  );
}