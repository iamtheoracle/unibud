import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PenLine } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import SquareHeader from "@/components/square/SquareHeader";
import StoryBar from "@/components/stories/StoryBar";
import QuadFeed from "@/components/quad/QuadFeed";
import PostCard from "@/components/quad/PostCard";
import PostComposer from "@/components/quad/PostComposer";

const DEMO_POSTS = [
  {
    id: "s1",
    author_name: "Adaeze Okafor",
    author_handle: "Computer Science · 300L",
    author_image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    is_verified: true,
    content: "Just finished building my first full-stack project for CSC 301! Shoutout to Dr. Adeyemi for the amazing Data Structures lectures. Anyone interested in collaborating on the next assignment? #CSC301 #Teamwork",
    media_urls: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80"],
    media_types: ["image"],
    type: "photo",
    reactions: { like: 142, love: 18, celebrate: 4 },
    likes_count: 164,
    comments_count: 28,
    shares_count: 12,
    created_date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "s2",
    author_name: "Dr. Ibrahim",
    author_handle: "Physics Department · Lecturer",
    author_image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    is_verified: true,
    content: "Quantum Mechanics (PHY 203) extra tutorial session this Friday at 3PM in Lab 3. Bring your problem sets. All students welcome! #PHY203 #Tutorial",
    type: "text",
    reactions: { like: 32, celebrate: 8, helpful: 5 },
    likes_count: 45,
    comments_count: 12,
    shares_count: 8,
    created_date: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "s3",
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
  },
];

/**
 * Square — Instagram-style social feed.
 * Clean header, stories bar, infinite post feed, compose button.
 * Uses the existing real PostCard / StoryBar / QuadFeed components.
 */
export default function Square() {
  const { isDemoMode } = useDemoMode();
  const [composerOpen, setComposerOpen] = useState(false);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  return (
    <div className="min-h-screen pb-28">
      <SquareHeader user={user} />

      {/* Stories — real data when authenticated, demo groups otherwise */}
      <StoryBar user={user} isDemoMode={isDemoMode || !user} />

      {/* Feed — real infinite feed with real-time updates, or demo posts */}
      {isDemoMode || !user ? (
        <div className="max-w-2xl mx-auto pt-1">
          {DEMO_POSTS.map((post, i) => (
            <PostCard key={post.id} post={post} user={user} index={i} />
          ))}
        </div>
      ) : (
        <QuadFeed user={user} />
      )}

      {/* Compose button */}
      <button
        onClick={() => setComposerOpen(true)}
        className="fixed right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center spring-tap premium-shadow"
        style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}
        aria-label="Create post"
      >
        <PenLine className="w-5 h-5" strokeWidth={2} />
      </button>

      <PostComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        user={user}
      />
    </div>
  );
}