import React, { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, Image, PenLine, BarChart3, Award, TrendingUp, Bookmark } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";

const feedTabs = ["For You", "Trending", "Academic", "Campus"];

const mockPosts = [
  {
    author: "Adaeze Okafor", role: "student", avatar: "AO",
    content: "Just finished building my first full-stack project for CSC 301! 🚀 Shoutout to Dr. Adeyemi for the amazing Data Structures lectures. Anyone interested in collaborating on the next assignment?",
    time: "2h ago", likes: 24, comments: 8, type: "post",
    tags: ["#CSC301", "#DataStructures"],
  },
  {
    author: "Dr. Ibrahim", role: "lecturer", avatar: "DI",
    content: "📢 Quantum Mechanics (PHY 203) extra tutorial session this Friday at 3PM in Lab 3. Bring your problem sets. All students welcome!",
    time: "4h ago", likes: 45, comments: 12, type: "news", verified: true,
  },
  {
    author: "UNIBUD Chess Club", role: "club", avatar: "CC",
    content: "♟️ Inter-University Chess Championship this Saturday! Registration closes tomorrow. Top 3 winners get certificates and cash prizes. Sign up at the Student Centre.",
    time: "6h ago", likes: 31, comments: 5, type: "event",
    tags: ["#Chess", "#Competition"],
  },
  {
    author: "Emeka Nwosu", role: "student", avatar: "EN",
    content: "Poll: Which study method works best for you before exams?",
    time: "8h ago", likes: 56, comments: 23, type: "poll",
    pollOptions: [
      { text: "Practice questions", votes: 45 },
      { text: "Group study", votes: 28 },
      { text: "Summarized notes", votes: 32 },
      { text: "Teaching others", votes: 19 },
    ],
  },
];

const roleColors = {
  student: "bg-blue-100 text-blue-700",
  lecturer: "bg-purple-100 text-purple-700",
  club: "bg-emerald-100 text-emerald-700",
};

export default function Quad() {
  const [activeTab, setActiveTab] = useState("For You");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="pt-12 pb-3 px-5">
        <h1 className="font-heading font-bold text-[22px] tracking-tight">Quad</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Your digital campus square</p>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {feedTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-white border border-border/50 text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Create Post */}
      <div className="px-4 mb-4">
        <GlassCard variant="solid" className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-[11px] font-bold">
              Y
            </div>
            <div className="flex-1 py-2 px-3 rounded-xl bg-muted/50 text-[12px] text-muted-foreground">
              Share something with the campus...
            </div>
            <div className="flex gap-1.5">
              <button className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Image className="w-4 h-4 text-blue-500" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-purple-500" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Feed */}
      <div className="px-4 space-y-3 pb-8">
        {mockPosts.map((post, i) => (
          <GlassCard key={i} variant="solid" className="p-4" delay={i * 0.06}>
            {/* Author */}
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold ${roleColors[post.role]}`}>
                {post.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading font-semibold text-[13px]">{post.author}</span>
                  {post.verified && (
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                      <Award className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">{post.time}</p>
              </div>
              <button className="w-7 h-7 rounded-lg hover:bg-muted/60 flex items-center justify-center">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <p className="text-[13px] leading-relaxed text-foreground mb-2">{post.content}</p>

            {/* Tags */}
            {post.tags && (
              <div className="flex gap-1.5 mb-3 flex-wrap">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[11px] font-medium text-primary">{tag}</span>
                ))}
              </div>
            )}

            {/* Poll */}
            {post.pollOptions && (
              <div className="space-y-1.5 mb-3">
                {post.pollOptions.map((opt, oi) => {
                  const total = post.pollOptions.reduce((s, o) => s + o.votes, 0);
                  const pct = Math.round((opt.votes / total) * 100);
                  return (
                    <div key={oi} className="relative overflow-hidden rounded-lg border border-border/50">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.3 + oi * 0.1 }}
                        className="absolute inset-y-0 left-0 bg-primary/8"
                      />
                      <div className="relative flex items-center justify-between px-3 py-2">
                        <span className="text-[12px] font-medium">{opt.text}</span>
                        <span className="text-[11px] font-semibold text-muted-foreground">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-1 pt-2 border-t border-border/30">
              <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Heart className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                <span className="text-[11px] font-medium text-muted-foreground">{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <MessageCircle className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                <span className="text-[11px] font-medium text-muted-foreground">{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              </button>
              <div className="flex-1" />
              <button className="py-1.5 px-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Bookmark className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}