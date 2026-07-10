import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useStorySeen } from "@/hooks/useStorySeen";
import StoryViewer from "./StoryViewer";
import StoryComposer from "./StoryComposer";

const DEMO_GROUPS = [
  {
    authorName: "Your Story",
    authorImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    authorHandle: "Add to your story",
    authorRole: "student",
    isVerified: false,
    stories: [],
  },
  {
    authorName: "Adaeze Okafor",
    authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    authorHandle: "Computer Science · 300L",
    authorRole: "student",
    isVerified: true,
    stories: [
      {
        id: "ds1", type: "photo", content: "Morning study session at the library 📚",
        media_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80",
        duration_seconds: 5, views_count: 42, replies_count: 3, created_date: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "ds2", type: "text", content: "Exam in 3 days! Who's ready? 💪",
        background_color: "linear-gradient(135deg, #6D28D9, #3B82F6)",
        duration_seconds: 5, views_count: 28, replies_count: 7, created_date: new Date(Date.now() - 3000000).toISOString(),
      },
    ],
  },
  {
    authorName: "Dr. Ibrahim",
    authorImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80",
    authorHandle: "Physics Department · Lecturer",
    authorRole: "lecturer",
    isVerified: true,
    stories: [
      {
        id: "ds3", type: "photo", content: "PHY 203 tutorial slides now available",
        media_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80",
        duration_seconds: 6, views_count: 89, replies_count: 12, created_date: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
  },
  {
    authorName: "Chess Club",
    authorImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&q=80",
    authorHandle: "Official Club",
    authorRole: "club",
    isVerified: true,
    stories: [
      {
        id: "ds4", type: "photo", content: "Championship tomorrow! 🏆",
        media_url: "https://images.unsplash.com/photo-1528819622765-d6bcf99f5535?w=600&q=80",
        duration_seconds: 5, views_count: 56, replies_count: 8, created_date: new Date(Date.now() - 5400000).toISOString(),
      },
    ],
  },
];

function groupByAuthor(stories) {
  const map = {};
  for (const s of stories) {
    if (!map[s.author_name]) {
      map[s.author_name] = {
        authorName: s.author_name,
        authorImage: s.author_image,
        authorHandle: s.author_handle,
        authorRole: s.author_role,
        isVerified: s.is_verified,
        stories: [],
      };
    }
    map[s.author_name].stories.push(s);
  }
  const all = Object.values(map);
  for (const g of all) {
    g.stories.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }
  return all;
}

export default function StoryBar({ user, isDemoMode: demoOverride }) {
  const isDemoMode = demoOverride !== undefined ? demoOverride : !user;
  const [viewerState, setViewerState] = useState(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const { isSeen } = useStorySeen();
  const qc = useQueryClient();

  const university = user?.university || "";

  const { data: stories } = useQuery({
    queryKey: ["activeStories", university],
    queryFn: () => base44.entities.Story.filter({
      status: "active",
      expires_at: { $gt: new Date().toISOString() },
    }, "-created_date", 50),
    enabled: !isDemoMode && !!user,
    refetchInterval: 60000,
  });

  const allGroups = useMemo(() => {
    if (isDemoMode) return DEMO_GROUPS;
    return groupByAuthor(stories || []);
  }, [stories, isDemoMode]);

  const myName = user?.full_name;
  const myGroup = allGroups.find((g) => g.authorName === myName);
  const otherGroups = allGroups.filter((g) => g.authorName !== myName);

  const handleMyStoryClick = () => {
    if (myGroup && myGroup.stories.length > 0) {
      const myIndex = allGroups.indexOf(myGroup);
      setViewerState({ groups: allGroups, groupIndex: myIndex, storyIndex: 0 });
    } else {
      setComposerOpen(true);
    }
  };

  const handlePublish = () => {
    qc.invalidateQueries({ queryKey: ["activeStories"] });
    setComposerOpen(false);
  };

  return (
    <>
      <div className="px-4 py-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-3.5">
          {/* Your Story */}
          <button
            onClick={handleMyStoryClick}
            className="flex flex-col items-center gap-1 spring-tap shrink-0"
            aria-label="Your story"
          >
            <div className="relative">
              {myGroup?.stories[0]?.media_url ? (
                <img
                  src={myGroup.stories[0].media_url}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[16px] font-bold text-muted-foreground">
                      {(myName || "U").charAt(0)}
                    </span>
                  )}
                </div>
              )}
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                <Plus className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
              </div>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground max-w-[56px] truncate">Your Story</span>
          </button>

          {/* Other Stories */}
          {otherGroups.map((group, i) => {
            const firstStory = group.stories[0];
            const seen = !isDemoMode && isSeen(firstStory?.id);
            return (
              <button
                key={i}
                onClick={() => {
                  const groupIndex = allGroups.indexOf(group);
                  setViewerState({ groups: allGroups, groupIndex, storyIndex: 0 });
                }}
                className="flex flex-col items-center gap-1 spring-tap shrink-0"
                aria-label={`${group.authorName}'s story`}
              >
                <div className={"p-[2px] rounded-full " + (seen ? "bg-muted-foreground/30" : "bg-gradient-to-br from-primary to-primary/50")}>
                  <div className="p-[2px] rounded-full bg-card">
                    <img
                      src={group.authorImage || firstStory?.media_url}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[10px] font-medium text-muted-foreground max-w-[52px] truncate">
                  {group.authorName.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {viewerState && (
        <StoryViewer
          groups={viewerState.groups}
          initialGroupIndex={viewerState.groupIndex}
          initialStoryIndex={viewerState.storyIndex}
          user={user}
          isDemoMode={isDemoMode}
          onClose={() => setViewerState(null)}
        />
      )}

      <StoryComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        onPublish={handlePublish}
        user={user}
      />
    </>
  );
}