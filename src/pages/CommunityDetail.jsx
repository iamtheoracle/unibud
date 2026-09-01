import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Users, UserPlus, Check, BadgeCheck, MessageSquare,
  Calendar, Home, ChevronRight, Pin,
} from "lucide-react";
import { useDemoMode } from "@/lib/DemoModeContext";
import EmptyState from "@/components/ui/EmptyState";
import PostCard from "@/components/quad/PostCard";
import EventCard from "@/components/campus/EventCard";
import { COMMUNITY_TYPES, getIcon } from "@/components/campus/campusConstants";

const TABS = [
  { key: "home", label: "Home", icon: Home },
  { key: "discussion", label: "Discussion", icon: MessageSquare },
  { key: "events", label: "Events", icon: Calendar },
  { key: "members", label: "Members", icon: Users },
];

export default function CommunityDetail() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState("home");
  const [joined, setJoined] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const { data: community, isLoading } = useQuery({
    queryKey: ["community", communityId],
    queryFn: () => base44.entities.Community.get(communityId),
    enabled: !isDemoMode && !!communityId,
  });

  const { data: posts } = useQuery({
    queryKey: ["communityPosts", communityId],
    queryFn: () => base44.entities.QuadPost.filter(
      { community: communityId },
      "-created_date",
      20
    ),
    enabled: !isDemoMode && !!communityId && activeTab === "discussion",
  });

  const { data: events } = useQuery({
    queryKey: ["communityEvents", communityId],
    queryFn: () => base44.entities.CampusEvent.filter(
      { community_id: communityId },
      "-date",
      10
    ),
    enabled: !isDemoMode && !!communityId && activeTab === "events",
  });

  useEffect(() => {
    if (community && user) {
      setJoined((community.members || []).some((m) => m.user_id === user.id));
    }
  }, [community, user]);

  const typeMeta = community ? (COMMUNITY_TYPES[community.type] || COMMUNITY_TYPES.department) : COMMUNITY_TYPES.department;
  const Icon = community ? getIcon(community.icon || typeMeta.icon) : Users;

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
    } catch {
      setJoined(false);
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
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!community && !isDemoMode) {
    return (
      <div className="min-h-screen">
        <div className="pt-12 px-5">
          <button onClick={() => navigate("/communities")} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
            <ArrowLeft className="w-[18px] h-[18px]" />
          </button>
        </div>
        <EmptyState icon={Users} title="Community not found" description="This community may have been removed." />
      </div>
    );
  }

  const accentColor = community?.accent_color || typeMeta.color;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="relative">
        <div
          className="h-24 flex items-start justify-between px-5 pt-12"
          style={{ background: `hsl(${accentColor} / 0.10)` }}
        >
          <button onClick={() => navigate("/communities")} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
            <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
          </button>
          {community?.is_verified && (
            <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center gap-1 soft-shadow">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        <div className="px-5 -mt-8 relative z-10">
          <div
            className="w-16 h-16 rounded-[20px] flex items-center justify-center bg-card soft-shadow border-4 border-background"
            style={{ background: `hsl(${accentColor} / 0.12)` }}
          >
            <Icon className="w-7 h-7" style={{ color: `hsl(${accentColor})` }} strokeWidth={2} />
          </div>

          <div className="mt-2.5">
            <h1 className="font-heading font-extrabold text-[20px] tracking-tight text-foreground">{community?.name || "Community"}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[12px] text-muted-foreground">{typeMeta.label}</span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-[12px] text-muted-foreground">{community?.members_count || 0} members</span>
            </div>
          </div>

          {community?.description && (
            <p className="text-[13px] text-foreground/80 mt-3 leading-relaxed">{community.description}</p>
          )}

          {user && (
            <button
              onClick={handleJoin}
              className={
                "mt-3 w-full py-3 rounded-[16px] font-heading font-semibold text-[14px] transition-all spring-tap flex items-center justify-center gap-2 " +
                (joined
                  ? "bg-muted text-muted-foreground border border-border/40"
                  : "bg-primary text-primary-foreground gold-glow")
              }
            >
              {joined ? <><Check className="w-4 h-4" /> Joined</> : <><UserPlus className="w-4 h-4" /> Join Community</>}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4 sticky top-0 z-20 glass border-b border-border/20">
        <div className="flex gap-1 py-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={
                "flex-1 py-2.5 rounded-[14px] text-[11px] font-semibold transition-all spring-tap flex flex-col items-center gap-1 " +
                (activeTab === tab.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground")
              }
            >
              <tab.icon className="w-4 h-4" strokeWidth={2} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Home Tab */}
            {activeTab === "home" && (
              <div className="space-y-4">
                {community?.rules && community.rules.length > 0 && (
                  <div className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40">
                    <div className="flex items-center gap-2 mb-3">
                      <Pin className="w-4 h-4 text-primary" />
                      <h3 className="font-heading font-semibold text-[14px] text-foreground">Community Rules</h3>
                    </div>
                    <div className="space-y-2">
                      {community.rules.map((rule, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-[11px] font-bold text-primary mt-0.5">{i + 1}.</span>
                          <p className="text-[12px] text-muted-foreground">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-card rounded-[16px] p-3 soft-shadow border border-border/40 text-center">
                    <Users className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="font-heading font-bold text-[16px] text-foreground">{community?.members_count || 0}</p>
                    <p className="text-[9px] text-muted-foreground">Members</p>
                  </div>
                  <div className="bg-card rounded-[16px] p-3 soft-shadow border border-border/40 text-center">
                    <MessageSquare className="w-5 h-5 text-info mx-auto mb-1" />
                    <p className="font-heading font-bold text-[16px] text-foreground">{(posts || []).length}</p>
                    <p className="text-[9px] text-muted-foreground">Posts</p>
                  </div>
                  <div className="bg-card rounded-[16px] p-3 soft-shadow border border-border/40 text-center">
                    <Calendar className="w-5 h-5 text-success mx-auto mb-1" />
                    <p className="font-heading font-bold text-[16px] text-foreground">{(events || []).length}</p>
                    <p className="text-[9px] text-muted-foreground">Events</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab("discussion")}
                  className="w-full bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 flex items-center gap-3 card-hover spring-tap"
                >
                  <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-heading font-semibold text-[13px] text-foreground">Start a Discussion</p>
                    <p className="text-[10px] text-muted-foreground">Share with your community</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                <button
                  onClick={() => setActiveTab("events")}
                  className="w-full bg-card rounded-[20px] p-3.5 soft-shadow border border-border/40 flex items-center gap-3 card-hover spring-tap"
                >
                  <div className="w-10 h-10 rounded-[14px] bg-success/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-heading font-semibold text-[13px] text-foreground">Upcoming Events</p>
                    <p className="text-[10px] text-muted-foreground">{(events || []).length} events scheduled</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            )}

            {/* Discussion Tab */}
            {activeTab === "discussion" && (
              <div className="space-y-3">
                {(posts || []).length === 0 ? (
                  <EmptyState
                    icon={MessageSquare}
                    title="No discussions yet"
                    description="Be the first to start a conversation in this community."
                  />
                ) : (
                  (posts || []).map((post, i) => (
                    <PostCard key={post.id} post={post} user={user} index={i} />
                  ))
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === "events" && (
              <div className="space-y-3">
                {(events || []).length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No events scheduled"
                    description="Community events will appear here once created."
                  />
                ) : (
                  (events || []).map((event, i) => (
                    <EventCard key={event.id} event={event} user={user} index={i} onAddToCalendar={handleAddToCalendar} />
                  ))
                )}
              </div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <div className="space-y-2">
                {(community?.members || []).length === 0 ? (
                  <EmptyState
                    icon={Users}
                    title="No members yet"
                    description="Be the first to join this community."
                  />
                ) : (
                  (community?.members || []).map((member, i) => (
                    <motion.div
                      key={member.user_id || i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="bg-card rounded-[16px] p-3 soft-shadow border border-border/40 flex items-center gap-3"
                    >
                      {member.image ? (
                        <img src={member.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-[13px]">
                          {(member.name || "U").charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-heading font-semibold text-[13px] text-foreground truncate">{member.name}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{member.role}</p>
                      </div>
                      {(member.role === "admin" || member.role === "leader" || member.role === "moderator") && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-bold capitalize">
                          {member.role}
                        </span>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}