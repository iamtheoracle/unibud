import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, PenLine, Image, Video, BarChart3, Calendar, Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, BadgeCheck } from "lucide-react";
import TrendingSection from "@/components/quad/TrendingSection";
import CommunitiesPreview from "@/components/quad/CommunitiesPreview";

const stories = [
  { name: "Your Story", isYou: true },
  { name: "Adaeze", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
  { name: "Femi", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80" },
  { name: "Aisha", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80" },
  { name: "David", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
];

const feedTabs = ["For you", "Trending", "Following", "Clubs", "Courses"];

const posts = [
  {
    author: "Adaeze Okafor",
    handle: "Computer Science · 300L",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    verified: true,
    time: "2h",
    content: "Just finished building my first full-stack project for CSC 301! 🚀 Shoutout to Dr. Adeyemi for the amazing Data Structures lectures. Anyone interested in collaborating on the next assignment?",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80",
    likes: 24, comments: 8, shares: 3,
  },
  {
    author: "Dr. Ibrahim",
    handle: "Physics Department · Lecturer",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    verified: true,
    time: "4h",
    content: "📢 Quantum Mechanics (PHY 203) extra tutorial session this Friday at 3PM in Lab 3. Bring your problem sets. All students welcome!",
    likes: 45, comments: 12, shares: 8,
  },
  {
    author: "UNIBUD Chess Club",
    handle: "Official Club",
    avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&q=80",
    verified: true,
    time: "6h",
    content: "♟️ Inter-University Chess Championship this Saturday! Registration closes tomorrow. Top 3 winners get certificates and cash prizes. Sign up at the Student Centre.",
    likes: 31, comments: 5, shares: 12,
  },
];

export default function Quad() {
  const [activeTab, setActiveTab] = useState("For you");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="pt-12 pb-3 px-5 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Quad</h1>
          <p className="text-[12px] text-muted-foreground font-medium">The heart of campus</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center">
            <Search className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
          </button>
          <button className="w-10 h-10 rounded-full bg-primary shadow-sm flex items-center justify-center">
            <PenLine className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Stories */}
      <div className="px-4 mb-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {stories.map((story, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-14 h-14 rounded-full p-[2px] ${story.isYou ? "bg-muted" : "bg-gradient-to-tr from-primary to-primary/80"}`}>
                <div className="w-full h-full rounded-full bg-card p-[2px]">
                  {story.isYou ? (
                    <div className="w-full h-full rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xl font-light">+</div>
                  ) : (
                    <img src={story.avatar} alt={story.name} className="w-full h-full rounded-full object-cover" />
                  )}
                </div>
              </div>
              <span className="text-[10px] font-medium text-foreground max-w-[60px] truncate">{story.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status Update */}
      <div className="px-4 mb-3">
        <div className="bg-card rounded-2xl shadow-sm border border-border/30 p-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground text-[11px] font-bold flex-shrink-0">Y</div>
            <div className="flex-1 py-2 px-3 rounded-xl bg-muted text-[12px] text-muted-foreground">What's happening on campus?</div>
          </div>
          <div className="flex items-center gap-1 mt-2.5 pt-2.5 border-t border-border/30">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <Image className="w-4 h-4 text-[#28A745]" strokeWidth={1.8} />
              <span className="text-[11px] font-medium text-foreground">Photo</span>
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <Video className="w-4 h-4 text-[#28A745]" strokeWidth={1.8} />
              <span className="text-[11px] font-medium text-foreground">Video</span>
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <BarChart3 className="w-4 h-4 text-[#28A745]" strokeWidth={1.8} />
              <span className="text-[11px] font-medium text-foreground">Poll</span>
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors">
              <Calendar className="w-4 h-4 text-[#28A745]" strokeWidth={1.8} />
              <span className="text-[11px] font-medium text-foreground">Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feed Tabs */}
      <div className="px-4 mb-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {feedTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                activeTab === tab ? "bg-foreground text-background" : "bg-card text-muted-foreground border border-border/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="px-4 space-y-3 pb-8">
        {posts.map((post, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl shadow-sm border border-border/30 overflow-hidden"
          >
            <div className="p-3.5">
              <div className="flex items-center gap-2.5 mb-2.5">
                <img src={post.avatar} alt={post.author} className="w-9 h-9 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-heading font-semibold text-[13px] text-foreground">{post.author}</span>
                    {post.verified && <BadgeCheck className="w-3.5 h-3.5 text-[#28A745] fill-success" />}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{post.handle} · {post.time} ago</p>
                </div>
                <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-[13px] leading-relaxed text-foreground">{post.content}</p>
            </div>
            {post.image && <img src={post.image} alt="" className="w-full h-48 object-cover" />}
            <div className="flex items-center gap-1 px-3.5 py-2.5 border-t border-border/30">
              <button className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors">
                <Heart className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                <span className="text-[11px] font-semibold text-muted-foreground">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors">
                <MessageCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                <span className="text-[11px] font-semibold text-muted-foreground">{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-muted transition-colors">
                <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                <span className="text-[11px] font-semibold text-muted-foreground">{post.shares}</span>
              </button>
              <div className="flex-1" />
              <button className="py-1.5 px-2 rounded-lg hover:bg-muted transition-colors">
                <Bookmark className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <TrendingSection />
      <CommunitiesPreview />
    </div>
  );
}