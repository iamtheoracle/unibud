import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, PenLine, Image, Video, BarChart3, Calendar, Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, BadgeCheck, Inbox } from "lucide-react";
import TrendingSection from "@/components/quad/TrendingSection";
import CommunitiesPreview from "@/components/quad/CommunitiesPreview";
import CampusTraditionsGallery from "@/components/quad/CampusTraditionsGallery";
import CelebrationsCarousel from "@/components/quad/CelebrationsCarousel";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_POSTS = [
  {
    id: "d1",
    author_name: "Adaeze Okafor",
    author_handle: "Computer Science · 300L",
    author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    is_verified: true,
    content: "Just finished building my first full-stack project for CSC 301! Shoutout to Dr. Adeyemi for the amazing Data Structures lectures. Anyone interested in collaborating on the next assignment?",
    image_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
    likes_count: 24, comments_count: 8, shares_count: 3,
  },
  {
    id: "d2",
    author_name: "Dr. Ibrahim",
    author_handle: "Physics Department · Lecturer",
    author_avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    is_verified: true,
    content: "Quantum Mechanics (PHY 203) extra tutorial session this Friday at 3PM in Lab 3. Bring your problem sets. All students welcome!",
    likes_count: 45, comments_count: 12, shares_count: 8,
  },
  {
    id: "d3",
    author_name: "UNIBUD Chess Club",
    author_handle: "Official Club",
    author_avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&q=80",
    is_verified: true,
    content: "Inter-University Chess Championship this Saturday! Registration closes tomorrow. Top 3 winners get certificates and cash prizes. Sign up at the Student Centre.",
    likes_count: 31, comments_count: 5, shares_count: 12,
  },
];

const feedTabs = ["For you", "Trending", "Following", "Clubs", "Courses"];

export default function Quad() {
  const { isDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState("For you");
  const [composing, setComposing] = useState(false);
  const [postText, setPostText] = useState("");
  const qc = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["quadPosts"],
    queryFn: () => base44.entities.QuadPost.list("-created_date", 50),
    enabled: !isDemoMode,
  });

  const displayPosts = isDemoMode ? DEMO_POSTS : (posts || []);

  const submitPost = async () => {
    if (!postText.trim()) return;
    try {
      await base44.entities.QuadPost.create({
        content: postText,
        type: "post",
        is_anonymous: false,
      });
      setPostText("");
      setComposing(false);
      qc.invalidateQueries({ queryKey: ["quadPosts"] });
    } catch {}
  };

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
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Quad</h1>
          <p className="text-[12px] text-muted-foreground font-medium">The heart of campus</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
            <Search className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
          </button>
          <button onClick={() => setComposing(!composing)} className="w-10 h-10 rounded-full bg-primary soft-shadow flex items-center justify-center spring-tap">
            <PenLine className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2} />
          </button>
        </div>
      </motion.div>

      {/* Status Update */}
      {composing && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="px-4 mb-3 overflow-hidden">
          <div className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="What's happening on campus?"
              rows={3}
              className="w-full bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/30">
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors spring-tap">
                  <Image className="w-4 h-4 text-success" strokeWidth={1.8} />
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors spring-tap">
                  <Video className="w-4 h-4 text-info" strokeWidth={1.8} />
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors spring-tap">
                  <BarChart3 className="w-4 h-4 text-primary" strokeWidth={1.8} />
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors spring-tap">
                  <Calendar className="w-4 h-4 text-purple" strokeWidth={1.8} />
                </button>
              </div>
              <button onClick={submitPost} disabled={!postText.trim()} className="px-4 py-2 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[12px] disabled:opacity-50 spring-tap">Post</button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Feed Tabs */}
      <div className="px-4 mb-3 overflow-x-auto no-scrollbar">
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

      {/* Feed */}
      <div className="px-4 space-y-3 pb-8">
        {isLoading && !isDemoMode ? (
          [1, 2, 3].map((i) => <div key={i} className="h-[200px] rounded-[20px] shimmer" />)
        ) : displayPosts.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
            <EmptyState
              icon={Inbox}
              title="No posts yet"
              description="Be the first to share something with your campus community"
              action={
                <button onClick={() => setComposing(true)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">
                  <PenLine className="w-3.5 h-3.5" /> Create Post
                </button>
              }
            />
          </div>
        ) : (
          displayPosts.map((post, i) => (
            <motion.div
              key={post.id || i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden card-hover"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt={post.author_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {(post.author_name || "U").charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-heading font-semibold text-[13px] text-foreground">{post.author_name || "Anonymous"}</span>
                      {post.is_verified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/20" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{post.author_handle || post.type || "Post"} {post.created_date ? " · " + new Date(post.created_date).toLocaleDateString("en", { month: "short", day: "numeric" }) : ""}</p>
                  </div>
                  <button className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center spring-tap">
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-[13px] leading-relaxed text-foreground">{post.content}</p>
              </div>
              {post.image_url && <img src={post.image_url} alt="" className="w-full h-52 object-cover" />}
              <div className="flex items-center gap-1 px-4 py-3 border-t border-border/30">
                <button className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors spring-tap">
                  <Heart className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                  <span className="text-[11px] font-semibold text-muted-foreground">{post.likes_count || 0}</span>
                </button>
                <button className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors spring-tap">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                  <span className="text-[11px] font-semibold text-muted-foreground">{post.comments_count || 0}</span>
                </button>
                <button className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors spring-tap">
                  <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                  <span className="text-[11px] font-semibold text-muted-foreground">{post.shares_count || 0}</span>
                </button>
                <div className="flex-1" />
                <button className="py-1.5 px-2 rounded-lg hover:bg-muted transition-colors spring-tap">
                  <Bookmark className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <TrendingSection />
      <CommunitiesPreview />
    </div>
  );
}