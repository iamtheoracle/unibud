import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PenLine, FlaskConical, Briefcase, Award, Users, FileText, ArrowUpRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useDemoMode } from "@/lib/DemoModeContext";
import { useInfiniteFeed } from "@/hooks/useInfiniteFeed";
import ScholarHeader from "@/components/scholar/ScholarHeader";
import PostCard from "@/components/quad/PostCard";
import PostComposer from "@/components/quad/PostComposer";
import PostSkeleton from "@/components/quad/PostSkeleton";
import EmptyState from "@/components/ui/EmptyState";

const ACADEMIC_TYPES = ["research", "achievement", "study_resource", "discussion", "question", "note"];

const QUICK_LINKS = [
  { to: "/research", label: "Research", desc: "Projects & papers", icon: FlaskConical },
  { to: "/opportunities", label: "Opportunities", desc: "Internships & jobs", icon: Briefcase },
  { to: "/scholarships", label: "Scholarships", desc: "Funding & grants", icon: Award },
  { to: "/mentorship", label: "Mentors", desc: "Find a guide", icon: Users },
];

const DEMO_POSTS = [
  {
    id: "a1",
    author_name: "Dr. Funmilayo Adeyemi",
    author_handle: "Computer Science · Senior Lecturer",
    author_image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
    author_role: "lecturer",
    is_verified: true,
    content: "Our lab just published findings on federated-learning privacy preservation in low-bandwidth environments. Open to collaboration with graduate students interested in edge ML — full paper below. #FederatedLearning #EdgeML",
    type: "research",
    reactions: { like: 89, celebrate: 24, helpful: 12 },
    likes_count: 125,
    comments_count: 18,
    shares_count: 9,
    created_date: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: "a2",
    author_name: "Chukwuemeka Obi",
    author_handle: "Mechanical Engineering · 500L",
    author_image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    author_role: "student",
    is_verified: false,
    content: "Honoured to receive the Shell Undergraduate Scholarship for Excellence! Grateful to my supervisors and the UNIBUD mentorship network. To anyone applying next cycle — happy to share my essays. #Scholarship #Grateful",
    type: "achievement",
    reactions: { like: 156, celebrate: 42, love: 18 },
    likes_count: 216,
    comments_count: 24,
    shares_count: 3,
    created_date: new Date(Date.now() - 9000000).toISOString(),
  },
  {
    id: "a3",
    author_name: "Dr. Ibrahim Sani",
    author_handle: "Physics · Researcher",
    author_image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    author_role: "lecturer",
    is_verified: true,
    content: "Discussion: Has anyone explored quantum error correction thresholds below the surface-code threshold? Our group is seeing promising results with subsystem codes. Would love to hear approaches from other labs. #QuantumComputing #QEC",
    type: "discussion",
    reactions: { like: 34, helpful: 8 },
    likes_count: 42,
    comments_count: 11,
    shares_count: 2,
    created_date: new Date(Date.now() - 14400000).toISOString(),
  },
];

/**
 * Scholar — LinkedIn / Academia.edu-style academic professional network.
 * Academic header, scholarly quick links, research highlights strip,
 * and an infinite feed of academic posts (research, achievements,
 * discussions, questions, study resources). Compose button creates
 * posts that flow into the academic feed.
 */
export default function Scholar() {
  const { isDemoMode } = useDemoMode();
  const qc = useQueryClient();
  const [composerOpen, setComposerOpen] = useState(false);
  const sentinelRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const { posts, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteFeed({
    queryKey: ["scholarFeed"],
    query: { type: { $in: ACADEMIC_TYPES } },
    enabled: !isDemoMode && !!user,
  });

  const { data: research = [] } = useQuery({
    queryKey: ["scholarResearch"],
    queryFn: () => base44.entities.ResearchProject.list("-created_date", 8),
    enabled: !isDemoMode && !!user,
  });

  // Realtime — keep the academic feed fresh (new posts from compose, live counts).
  useEffect(() => {
    const unsubscribe = base44.entities.QuadPost.subscribe(() => {
      qc.invalidateQueries({ queryKey: ["scholarFeed"] });
    });
    return unsubscribe;
  }, [qc]);

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const showDemo = isDemoMode || !user;

  return (
    <div className="min-h-screen pb-28 safe-area-pt">
      <ScholarHeader user={user} />

      {/* Academic quick links */}
      <div className="max-w-2xl mx-auto px-4 pt-4 grid grid-cols-4 gap-2">
        {QUICK_LINKS.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.to} to={l.to} className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl glass-card spring-tap text-center">
              <div className="w-10 h-10 rounded-full bg-primary/12 flex items-center justify-center">
                <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-semibold text-foreground leading-tight">{l.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Research highlights strip */}
      {!showDemo && research.length > 0 && (
        <section className="max-w-2xl mx-auto px-4 pt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[13px] font-bold text-foreground flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" /> Research highlights
            </h2>
            <Link to="/research" className="text-[11px] font-semibold text-primary spring-tap">See all</Link>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
            {research.slice(0, 6).map((r) => (
              <Link key={r.id} to="/research" className="flex-shrink-0 w-[200px] p-3 rounded-2xl glass-card spring-tap">
                <span className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-primary/10 text-primary mb-1.5">
                  {r.type.replace("_", " ")}
                </span>
                <p className="text-[12px] font-semibold text-foreground leading-tight line-clamp-2">{r.title}</p>
                <p className="text-[10px] text-muted-foreground mt-1 truncate">{r.author_name}</p>
                {r.is_recruiting && (
                  <span className="inline-block mt-1.5 text-[9px] font-bold text-success">Recruiting collaborators</span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Compose trigger */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <button
          onClick={() => setComposerOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-card soft-shadow border border-border/40 spring-tap text-left card-hover"
        >
          {user?.avatar_url || user?.image ? (
            <img src={user.avatar_url || user.image} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-[12px] font-bold text-foreground">
              {(user?.full_name || "U").charAt(0)}
            </div>
          )}
          <span className="flex-1 text-[13px] text-muted-foreground">Share research, an achievement, or a question…</span>
          <PenLine className="w-4 h-4 text-primary" strokeWidth={1.8} />
        </button>
      </div>

      {/* Feed */}
      <div className="px-4 pt-3 max-w-2xl mx-auto space-y-3">
        {showDemo ? (
          DEMO_POSTS.map((post, i) => (
            <PostCard key={post.id} post={post} user={user} index={i} />
          ))
        ) : isLoading && posts.length === 0 ? (
          [0, 1, 2].map((i) => <PostSkeleton key={i} />)
        ) : posts.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
            <EmptyState
              icon={FileText}
              title="No academic posts yet"
              description="Share your research, achievements, or a scholarly question to start the conversation."
            />
          </div>
        ) : (
          <>
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} user={user} index={i} />
            ))}
            {hasNextPage && (
              <div ref={sentinelRef} className="py-4"><PostSkeleton /></div>
            )}
            {!hasNextPage && posts.length > 0 && (
              <div className="flex items-center justify-center gap-1.5 py-6 text-center">
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/40" />
                <p className="text-[11px] text-muted-foreground/60 font-medium">You're all caught up</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating compose button */}
      <button
        onClick={() => setComposerOpen(true)}
        className="fixed right-4 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center spring-tap glow-pulse"
        style={{ bottom: "calc(96px + env(safe-area-inset-bottom))" }}
        aria-label="Create post"
      >
        <PenLine className="w-5 h-5" strokeWidth={2} />
      </button>

      <PostComposer open={composerOpen} onClose={() => setComposerOpen(false)} user={user} />
    </div>
  );
}