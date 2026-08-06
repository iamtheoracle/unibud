import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Bookmark, Settings, PenLine, X, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { HIGHLIGHT_CATEGORIES, getHighlightCategory } from "./storyConstants";
import StoryViewer from "./StoryViewer";
import { useDemoMode } from "@/lib/DemoModeContext";

export default function HighlightShelf() {
  const { isDemoMode } = useDemoMode();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [viewerState, setViewerState] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // { category, label }
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [savingLabel, setSavingLabel] = useState(false);

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

  const handleDeleteCategory = async (category, stories) => {
    setDeletingCategory(category);
    try {
      await Promise.all(stories.map((s) => base44.entities.Story.update(s.id, { is_highlight: false })));
      qc.invalidateQueries({ queryKey: ["storyHighlights"] });
      toast({ title: "Highlight removed" });
    } catch {
      toast({ title: "Failed to remove highlight", variant: "destructive" });
    } finally {
      setDeletingCategory(null);
    }
  };

  const handleRenameCategory = async () => {
    if (!editingCategory || savingLabel) return;
    const { category, label, stories } = editingCategory;
    if (!label.trim()) return;
    setSavingLabel(true);
    try {
      // Update highlight_category for all stories in the group to the new slug
      const slug = label.trim().toLowerCase().replace(/\s+/g, "_");
      await Promise.all(stories.map((s) => base44.entities.Story.update(s.id, { highlight_category: slug })));
      qc.invalidateQueries({ queryKey: ["storyHighlights"] });
      toast({ title: "Highlight renamed" });
      setEditingCategory(null);
    } catch {
      toast({ title: "Failed to rename highlight", variant: "destructive" });
    } finally {
      setSavingLabel(false);
    }
  };

  return (
    <>
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-primary" />
            <h2 className="font-heading font-bold text-[15px] text-foreground">Highlights</h2>
          </div>
          {grouped.length > 0 && (
            <button
              onClick={() => { setEditMode((v) => !v); setEditingCategory(null); }}
              className="text-[12px] font-medium text-primary spring-tap flex items-center gap-1"
              aria-label={editMode ? "Done editing highlights" : "Edit highlights"}
            >
              {editMode ? "Done" : <><Settings className="w-3.5 h-3.5" /> Edit</>}
            </button>
          )}
        </div>

        {grouped.length === 0 ? (
          <p className="text-[12px] text-muted-foreground px-1">No highlights yet. Save stories to your profile.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {grouped.map(({ category, stories }, i) => {
              const cat = getHighlightCategory(category);
              const Icon = cat?.icon;
              const coverStory = stories[0];
              const isDeleting = deletingCategory === category;
              return (
                <div key={i} className="relative flex flex-col items-center gap-1 shrink-0">
                  {/* Delete badge in edit mode */}
                  {editMode && (
                    <button
                      onClick={() => handleDeleteCategory(category, stories)}
                      disabled={isDeleting}
                      className="absolute -top-1 -right-1 z-10 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center shadow-sm spring-tap"
                      aria-label={`Remove ${cat?.label} highlight`}
                    >
                      {isDeleting ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <X className="w-2.5 h-2.5" />}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (editMode) {
                        setEditingCategory({ category, label: cat?.label || category, stories });
                      } else {
                        setViewerState({ groups: buildViewerGroups(stories), groupIndex: 0, storyIndex: 0 });
                      }
                    }}
                    className={`flex flex-col items-center gap-1 spring-tap ${editMode ? "opacity-80" : ""}`}
                    aria-label={editMode ? `Rename ${cat?.label} highlight` : `View ${cat?.label} highlights`}
                  >
                    <div className="p-[2px] rounded-full bg-gradient-to-br from-primary to-primary/50">
                      <div className="p-[2px] rounded-full bg-card">
                        {coverStory?.media_url ? (
                          <img src={coverStory.media_url} alt="" className="w-12 h-12 rounded-full object-cover" loading="lazy" />
                        ) : coverStory?.background_color ? (
                          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: coverStory.background_color }}>
                            {Icon && <Icon className="w-5 h-5 text-white" />}
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground max-w-[52px] truncate">
                      {editMode ? <PenLine className="w-3 h-3 inline" /> : null}
                      {cat?.label || category}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Rename modal */}
        {editingCategory && (
          <div className="mt-4 glass-strong rounded-[14px] p-4 flex items-center gap-3">
            <input
              autoFocus
              value={editingCategory.label}
              onChange={(e) => setEditingCategory((prev) => ({ ...prev, label: e.target.value }))}
              className="flex-1 bg-transparent text-[13px] text-foreground focus:outline-none border-b border-border pb-0.5"
              placeholder="Highlight name"
              maxLength={40}
              aria-label="Rename highlight"
              onKeyDown={(e) => { if (e.key === "Enter") handleRenameCategory(); if (e.key === "Escape") setEditingCategory(null); }}
            />
            <button
              onClick={() => setEditingCategory(null)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted spring-tap"
              aria-label="Cancel rename"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={handleRenameCategory}
              disabled={!editingCategory.label.trim() || savingLabel}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 spring-tap"
              aria-label="Save rename"
            >
              {savingLabel ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
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