import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, ChevronLeft, Loader2, Video } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useEntityInfinite } from "@/hooks/useEntityInfinite";
import { SHORT_CATEGORIES } from "@/components/shorts/shortConstants";
import ShortVideoCard from "@/components/shorts/ShortVideoCard";
import ShortUploadModal from "@/components/shorts/ShortUploadModal";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_SHORTS = [
  {
    id: "ds1",
    title: "5 Study Tips Backed by Cognitive Science",
    description: "These techniques actually work. Try them for your next exam! 📚",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
    duration_seconds: 15,
    category: "study_tips",
    author_name: "Adaeze Okafor",
    author_image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    author_handle: "Computer Science · 300L",
    is_verified: true,
    university: "University of Benin",
    hashtags: ["studytips", "examprep", "cognitivescience"],
    likes_count: 342,
    comments_count: 28,
    shares_count: 15,
    bookmarks_count: 47,
    views_count: 1200,
    created_date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "ds2",
    title: "Data Structures: Linked Lists Explained in 60s",
    description: "Visual walkthrough of linked list operations for CSC 301 students.",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80",
    duration_seconds: 60,
    category: "coding",
    author_name: "Dr. Ibrahim",
    author_image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    author_handle: "Computer Science · Lecturer",
    is_verified: true,
    university: "University of Benin",
    hashtags: ["coding", "datastructures", "CSC301"],
    likes_count: 892,
    comments_count: 67,
    shares_count: 124,
    bookmarks_count: 234,
    views_count: 5600,
    created_date: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "ds3",
    title: "Campus Innovation Week Highlights",
    description: "Amazing student projects from this year's innovation showcase! 🚀",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnail_url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&q=80",
    duration_seconds: 30,
    category: "innovation",
    author_name: "Chess Club",
    author_image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&q=80",
    author_handle: "Official Club",
    is_verified: true,
    university: "University of Benin",
    hashtags: ["innovation", "studentprojects", "campus"],
    likes_count: 567,
    comments_count: 43,
    shares_count: 89,
    bookmarks_count: 156,
    views_count: 3400,
    created_date: new Date(Date.now() - 10800000).toISOString(),
  },
];

export default function Shorts() {
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const containerRef = useRef(null);
  const sentinelRef = useRef(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const university = isDemoMode ? "University of Benin" : user?.university || "";

  const query = useMemo(() => {
    const q = { status: "active" };
    if (!isDemoMode && university) q.university = university;
    if (selectedCategory) q.category = selectedCategory;
    return q;
  }, [university, selectedCategory, isDemoMode]);

  const {
    items: shorts,
    fetchNextPage,
    hasNextPage,
    isLoading,
    invalidate: invalidateShorts,
  } = useEntityInfinite({
    entityName: "ShortVideo",
    queryKey: ["shorts", university, selectedCategory],
    query,
    pageSize: 10,
    enabled: !isDemoMode && !!user,
    cacheKey: "shorts_cache",
  });

  const displayShorts = isDemoMode ? DEMO_SHORTS : shorts;

  // IntersectionObserver for active video
  useEffect(() => {
    if (!displayShorts.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = parseInt(entry.target.dataset.index);
            if (!isNaN(index)) setActiveIndex(index);
          }
        });
      },
      { threshold: [0.6] }
    );
    const items = containerRef.current?.querySelectorAll("[data-index]");
    items?.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [displayShorts]);

  // Load more sentinel
  useEffect(() => {
    if (!hasNextPage || isDemoMode) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { threshold: 0 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isDemoMode]);

  // Increment view count
  useEffect(() => {
    if (isDemoMode || !displayShorts[activeIndex]) return;
    const video = displayShorts[activeIndex];
    base44.entities.ShortVideo.update(video.id, {
      views_count: (video.views_count || 0) + 1,
    }).catch(() => {});
  }, [activeIndex, isDemoMode]);

  return (
    <div className="h-[100dvh] bg-black relative overflow-hidden">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-12 pb-2 px-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center spring-tap"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="font-heading font-bold text-[17px] text-white">Shorts</h1>
          <button
            onClick={() => setUploadOpen(true)}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center spring-tap gold-glow"
            aria-label="Upload short video"
          >
            <Plus className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </button>
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={"px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap " + (!selectedCategory ? "bg-white text-black" : "bg-white/15 text-white")}
          >
            For You
          </button>
          {SHORT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={"px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap spring-tap " + (selectedCategory === cat.id ? "bg-white text-black" : "bg-white/15 text-white")}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-white/60" />
        </div>
      ) : displayShorts.length === 0 ? (
        <div className="h-full flex items-center justify-center px-6">
          <EmptyState
            icon={Video}
            title="No Shorts Yet"
            description="Be the first to share an educational short video with your campus."
            action={
              <button
                onClick={() => setUploadOpen(true)}
                className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-[13px] spring-tap"
              >
                Upload a Short
              </button>
            }
          />
        </div>
      ) : (
        <div ref={containerRef} className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar">
          {displayShorts.map((video, i) => (
            <div key={video.id} data-index={i} className="h-[100dvh] snap-start snap-always relative">
              <ShortVideoCard video={video} isActive={i === activeIndex} user={user} isDemoMode={isDemoMode} />
            </div>
          ))}
          {!isDemoMode && hasNextPage && <div ref={sentinelRef} className="h-20" />}
        </div>
      )}

      <ShortUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onPublish={() => {
          setUploadOpen(false);
          if (!isDemoMode) {
            invalidateShorts();
          }
        }}
        user={user}
      />
    </div>
  );
}