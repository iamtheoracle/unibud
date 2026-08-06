import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, PenLine, Users, FlaskConical, Award, Briefcase, Headphones } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import QuadFeed from "@/components/quad/QuadFeed";
import PostComposer from "@/components/quad/PostComposer";
import TrendingSection from "@/components/quad/TrendingSection";
import CommunitiesPreview from "@/components/quad/CommunitiesPreview";
import CampusTraditionsGallery from "@/components/quad/CampusTraditionsGallery";
import CelebrationsCarousel from "@/components/quad/CelebrationsCarousel";
import StoryBar from "@/components/stories/StoryBar";
import SocialLiveActivity from "@/components/social/SocialLiveActivity";
import NewsStrip from "@/components/news/NewsStrip";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useExperience } from "@/lib/ExperienceContext";
import { queryClientInstance } from "@/lib/query-client";
import ScreenShell from "@/components/layout/ScreenShell";
import IconAction from "@/components/layout/IconAction";

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
      {!isAcademic && <NewsStrip />}

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

      {/* Feed — always pulls real data, never simulated content */}
      <QuadFeed user={user} university={university} />

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