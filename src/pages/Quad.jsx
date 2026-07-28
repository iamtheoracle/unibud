import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, PenLine, Users, FlaskConical, Award, Briefcase, Headphones } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import QuadFeed from "@/components/quad/QuadFeed";
import PostCard from "@/components/quad/PostCard";
import PostComposer from "@/components/quad/PostComposer";
import TrendingSection from "@/components/quad/TrendingSection";
import CommunitiesPreview from "@/components/quad/CommunitiesPreview";
import CampusTraditionsGallery from "@/components/quad/CampusTraditionsGallery";
import CelebrationsCarousel from "@/components/quad/CelebrationsCarousel";
import StoryBar from "@/components/stories/StoryBar";
import SocialLiveActivity from "@/components/social/SocialLiveActivity";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useExperience } from "@/lib/ExperienceContext";
import { queryClientInstance } from "@/lib/query-client";
import ScreenShell from "@/components/layout/ScreenShell";
import IconAction from "@/components/layout/IconAction";

const DEMO_POSTS = [
  {
    id: "d1",
    author_name: "Adaeze Okafor",
    author_handle: "Computer Science · 300L",
    author_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    is_verified: true,
    content: "Just finished building my first full-stack project for CSC 301! Shoutout to Dr. Adeyemi for the amazing Data Structures lectures. Anyone interested in collaborating on the next assignment? #CSC301 #Teamwork",
    media_urls: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80"],
    media_types: ["image"],
    type: "photo",
    reactions: { like: 18, celebrate: 4, love: 2 },
    likes_count: 24,
    comments_count: 8,
    shares_count: 3,
    created_date: new Date(Date.now() - 3600000).toISOString(),
    university: "University of Benin",
  },
  {
    id: "d2",
    author_name: "Dr. Ibrahim",
    author_handle: "Physics Department · Lecturer",
    author_image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    is_verified: true,
    content: "Quantum Mechanics (PHY 203) extra tutorial session this Friday at 3PM in Lab 3. Bring your problem sets. All students welcome! #PHY203 #Tutorial",
    type: "event",
    reactions: { like: 32, celebrate: 8, helpful: 5 },
    likes_count: 45,
    comments_count: 12,
    shares_count: 8,
    created_date: new Date(Date.now() - 7200000).toISOString(),
    university: "University of Benin",
  },
  {
    id: "d3",
    author_name: "UNIBUD Chess Club",
    author_handle: "Official Club",
    author_image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&q=80",
    is_verified: true,
    content: "Inter-University Chess Championship this Saturday! Registration closes tomorrow. Top 3 winners get certificates and cash prizes. Sign up at the Student Centre. #ChessChampionship #InterUniversity",
    type: "club_update",
    reactions: { like: 20, celebrate: 8, love: 3 },
    likes_count: 31,
    comments_count: 5,
    shares_count: 12,
    created_date: new Date(Date.now() - 10800000).toISOString(),
    university: "University of Benin",
  },
];

const ACADEMIC_TABS = ["For you", "Courses", "Study Groups", "Research", "Latest"];
const SOCIAL_TABS = ["For you", "Trending", "Latest", "Clubs", "Courses"];

export default function Quad() {
  const { isDemoMode } = useDemoMode();
  const { mode } = useExperience();
  const isAcademic = mode === "academic";
  const navigate = useNavigate();
  const feedTabs = isAcademic ? ACADEMIC_TABS : SOCIAL_TABS;
  const [activeTab, setActiveTab] = useState(feedTabs[0]);
  const [composerOpen, setComposerOpen] = useState(false);

  const { data: user, refetch: refetchUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const university = isDemoMode ? "University of Benin" : user?.university || "";

  const handleRefresh = async () => {
    await Promise.all([refetchUser(), queryClientInstance.invalidateQueries()]);
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <ScreenShell
      title="Quad"
      subtitle={isAcademic ? "Course discussions & study collaboration" : "The heart of campus"}
      sticky={false}
      actions={
        <>
          <IconAction icon={Headphones} to="/podcasts" label="Podcasts" />
          <IconAction icon={Search} onClick={() => navigate("/discover")} label="Search" />
          <IconAction icon={PenLine} variant="primary" onClick={() => setComposerOpen(true)} label="Compose" />
        </>
      }
    >

      {/* Academic quick links — surface study groups, research, scholarships & internships */}
      {isAcademic && (
        <div className="pt-4 grid grid-cols-2 gap-3">
          <Link to="/study-groups" className="flex items-center gap-2.5 px-3.5 py-3 rounded-[18px] glass-card spring-tap">
            <div className="w-9 h-9 rounded-[12px] bg-primary/12 flex items-center justify-center">
              <Users className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-foreground">Study Groups</p>
              <p className="text-[11px] text-muted-foreground">Collaborate & learn</p>
            </div>
          </Link>
          <Link to="/research" className="flex items-center gap-2.5 px-3.5 py-3 rounded-[18px] glass-card spring-tap">
            <div className="w-9 h-9 rounded-[12px] bg-success/12 flex items-center justify-center">
              <FlaskConical className="w-[18px] h-[18px] text-success" strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-foreground">Research Feed</p>
              <p className="text-[11px] text-muted-foreground">Projects & papers</p>
            </div>
          </Link>
          <Link to="/scholarships" className="flex items-center gap-2.5 px-3.5 py-3 rounded-[18px] glass-card spring-tap">
            <div className="w-9 h-9 rounded-[12px] bg-gold/12 flex items-center justify-center">
              <Award className="w-[18px] h-[18px] text-gold" strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-foreground">Scholarships</p>
              <p className="text-[11px] text-muted-foreground">Funding updates</p>
            </div>
          </Link>
          <Link to="/opportunities" className="flex items-center gap-2.5 px-3.5 py-3 rounded-[18px] glass-card spring-tap">
            <div className="w-9 h-9 rounded-[12px] bg-accent/12 flex items-center justify-center">
              <Briefcase className="w-[18px] h-[18px] text-accent" strokeWidth={2} />
            </div>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-foreground">Internships</p>
              <p className="text-[11px] text-muted-foreground">Build experience</p>
            </div>
          </Link>
        </div>
      )}

      {/* Stories — social context only */}
      {!isAcademic && <StoryBar user={user} isDemoMode={isDemoMode} />}

      {/* Feed Tabs */}
      <div className="-mx-5 px-5 py-3 overflow-x-auto no-scrollbar sticky top-0 z-10 glass border-b border-border/20">
        <div className="flex gap-2">
          {feedTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={"px-3.5 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all spring-tap " + (activeTab === tab ? "bg-foreground text-background soft-shadow" : "bg-card text-muted-foreground border border-border/40")}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Campus Traditions & Celebrations — social context only */}
      {!isAcademic && <CampusTraditionsGallery />}
      {!isAcademic && <CelebrationsCarousel />}
      {!isAcademic && <SocialLiveActivity />}

      {/* Quick compose trigger */}
      {!isDemoMode && (
        <div className="mb-3">
          <button
            onClick={() => setComposerOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[20px] bg-card soft-shadow border border-border/40 spring-tap text-left card-hover"
          >
            {user?.avatar_url || user?.image ? (
              <img src={user.avatar_url || user.image} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-[12px]">
                {(user?.full_name || user?.email || "U").charAt(0)}
              </div>
            )}
            <span className="flex-1 text-[13px] text-muted-foreground">
              {isAcademic ? "Share a study note or question..." : "Share something with campus..."}
            </span>
            <PenLine className="w-4 h-4 text-primary" strokeWidth={1.8} />
          </button>
        </div>
      )}

      {/* Feed — always available */}
      {isDemoMode ? (
        <div className="space-y-3 pb-8">
          {DEMO_POSTS.map((post) => (
            <PostCard key={post.id} post={post} user={user} index={0} />
          ))}
        </div>
      ) : (
        <QuadFeed user={user} university={university} />
      )}

      <TrendingSection />
      <CommunitiesPreview />

      {/* Post Composer Modal */}
      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        user={user}
      />
    </ScreenShell>
    </PullToRefresh>
  );
}