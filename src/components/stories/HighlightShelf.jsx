import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Bookmark } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { HIGHLIGHT_CATEGORIES, getHighlightCategory } from "./storyConstants";
import StoryViewer from "./StoryViewer";
import { useDemoMode } from "@/lib/DemoModeContext";

export default function HighlightShelf() {
  const { isDemoMode } = useDemoMode();
  const [viewerState, setViewerState] = useState(null);

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const { data: highlights } = useQuery({
    queryKey: ["storyHighlights", user?.id],
    queryFn: () => base44.entities.Story.filter({
      is_highlight: true,
      created_by_id: user?.id,
    }, "-created_date", 100),
    enabled: !isDemoMode && !!user,
  });

  const grouped = useMemo(() => {
    const map = {};
    for (const h of highlights || []) {
      const cat = h.highlight_category || "memories";
      if (!map[cat]) map[cat] = [];
      map[cat].push(h);
    }
    // Sort stories within each group by highlight_order then created_date
    for (const cat of Object.keys(map)) {
      map[cat].sort((a, b) => (b.highlight_order || 0) - (a.highlight_order || 0));
    }
    return Object.entries(map).map(([cat, stories]) => ({ category: cat, stories }));
  }, [highlights]);

  // Build viewer-compatible groups
  const buildViewerGroups = (categoryStories) => {
    if (!categoryStories.length) return [];
    const first = categoryStories[0];
    return [{
      authorName: user?.full_name || "You",
      authorImage: user?.avatar_url || "",
      authorHandle: getHighlightCategory(first.highlight_category)?.label || "Highlights",
      authorRole: "student",
      isVerified: false,
      stories: categoryStories,
    }];
  };

  if (isDemoMode) {
    return (
      <div className="px-4 mb-5">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Bookmark className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Highlights</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {HIGHLIGHT_CATEGORIES.slice(0, 4).map((cat, i) => {
            const Icon = cat.icon;
            return (
              <button key={i} className="flex flex-col items-center gap-1 spring-tap shrink-0">
                <div className="w-14 h-14 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className="text-[10px] text-muted-foreground">{cat.label}</span>
              </button>
            );
          })}
          <button className="flex flex-col items-center gap-1 spring-tap shrink-0">
            <div className="w-14 h-14 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground">New</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 mb-5">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Bookmark className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Highlights</h2>
        </div>

        {grouped.length === 0 ? (
          <p className="text-[12px] text-muted-foreground px-1">No highlights yet. Save stories to your profile.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {grouped.map(({ category, stories }, i) => {
              const cat = getHighlightCategory(category);
              const Icon = cat?.icon;
              const coverStory = stories[0];
              return (
                <button
                  key={i}
                  onClick={() => setViewerState({ groups: buildViewerGroups(stories), groupIndex: 0, storyIndex: 0 })}
                  className="flex flex-col items-center gap-1 spring-tap shrink-0"
                  aria-label={`View ${cat?.label} highlights`}
                >
                  <div className="p-[2px] rounded-full bg-gradient-to-br from-primary to-primary/50">
                    <div className="p-[2px] rounded-full bg-card">
                      {coverStory?.media_url ? (
                        <img src={coverStory.media_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : coverStory?.background_color ? (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: coverStory.background_color }}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground max-w-[52px] truncate">{cat?.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {viewerState && (
        <StoryViewer
          groups={viewerState.groups}
          initialGroupIndex={viewerState.groupIndex}
          initialStoryIndex={viewerState.storyIndex}
          user={user}
          mode="highlight"
          onClose={() => setViewerState(null)}
        />
      )}
    </>
  );
}