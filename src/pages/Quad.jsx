import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, PenLine } from "lucide-react";
import { base44 } from "@/api/base44Client";
import QuadFeed from "@/components/quad/QuadFeed";
import PostCard from "@/components/quad/PostCard";
import PostComposer from "@/components/quad/PostComposer";
import TrendingSection from "@/components/quad/TrendingSection";
import CommunitiesPreview from "@/components/quad/CommunitiesPreview";
import CampusTraditionsGallery from "@/components/quad/CampusTraditionsGallery";
import CelebrationsCarousel from "@/components/quad/CelebrationsCarousel";
import { useDemoMode } from "@/lib/DemoModeContext";

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

const feedTabs = ["For you", "Trending", "Latest", "Clubs", "Courses"];

export default function Quad() {
  const { isDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState("For you");
  const [composerOpen, setComposerOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const university = isDemoMode ? "University of Benin" : user?.university || "";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5 flex items-center justify-between sticky top-0 z-20 glass border-b border-border/20"
      >
        <div>
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Quad</h1>
          <p className="text-[12px] text-muted-foreground font-medium">The heart of campus</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
            <Search className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => setComposerOpen(true)}
            className="w-10 h-10 rounded-full bg-primary soft-shadow flex items-center justify-center spring-tap gold-glow"
          >
            <PenLine className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2} />
          </button>
        </div>
      </motion.div>

      {/* Feed Tabs */}
      <div className="px-4 py-3 overflow-x-auto no-scrollbar sticky top-[68px] z-10 glass border-b border-border/20">
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

      {/* Campus Traditions */}
      <CampusTraditionsGallery />

      {/* Celebrations */}
      <CelebrationsCarousel />

      {/* Quick compose trigger */}
      {!isDemoMode && (
        <div className="px-4 mb-3">
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
            <span className="flex-1 text-[13px] text-muted-foreground">Share something with campus...</span>
            <PenLine className="w-4 h-4 text-primary" strokeWidth={1.8} />
          </button>
        </div>
      )}

      {/* Feed */}
      {isDemoMode ? (
        <div className="px-4 space-y-3 pb-8">
          {DEMO_POSTS.map((post, i) => (
            <PostCard key={post.id} post={post} user={user} index={i} />
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
    </div>
  );
}