import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import StoryViewer from "@/components/stories/StoryViewer";
import { getHighlightCategory } from "@/components/stories/storyConstants";
import { Loader2 } from "lucide-react";

export default function HighlightDetail() {
  const { highlightId } = useParams();
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const { data: stories, isLoading } = useQuery({
    queryKey: ["highlightCategory", user?.id, highlightId],
    queryFn: () =>
      base44.entities.Story.filter(
        {
          is_highlight: true,
          highlight_category: highlightId,
          created_by_id: user?.id,
        },
        "-created_date",
        100
      ),
    enabled: !!user && !!highlightId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/60" />
      </div>
    );
  }

  if (!stories || stories.length === 0) {
    navigate("/me");
    return null;
  }

  const cat = getHighlightCategory(highlightId);
  const groups = [
    {
      authorName: user?.full_name || "You",
      authorImage: user?.avatar_url || "",
      authorHandle: cat?.label || "Highlights",
      authorRole: "student",
      isVerified: false,
      stories,
    },
  ];

  return (
    <StoryViewer
      groups={groups}
      user={user}
      mode="highlight"
      onClose={() => navigate("/me")}
    />
  );
}