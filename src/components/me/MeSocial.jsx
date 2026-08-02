import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Bookmark, Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image as UIImage } from "@/components/ui/image";

const TABS = ["Posts", "Media", "Videos"];

function SectionLabel({ children }) {
  return <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-3">{children}</h2>;
}

/**
 * MeSocial — content-first profile sections with real data and premium empty states.
 * No fake highlights, no placeholder posts, no empty grids.
 * Flow: About → Highlights → Pinned → Posts/Media/Videos
 */
export default function MeSocial({ bio, user }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState("Posts");

  const { data: posts, isLoading } = useQuery({
    queryKey: ["my-posts", user?.id],
    queryFn: () => base44.entities.QuadPost.filter({ created_by_id: user.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const myPosts = posts || [];
  const hasPosts = myPosts.length > 0;

  const mediaPosts = myPosts.filter((p) => p.media_urls?.length > 0 && p.media_types?.some((t) => t === "image"));
  const videoPosts = myPosts.filter((p) => p.media_types?.some((t) => t === "video"));
  const filtered = tab === "Media" ? mediaPosts : tab === "Videos" ? videoPosts : myPosts;

  return (
    <div className="flex flex-col gap-8">
      {/* About */}
      <div>
        <SectionLabel>About</SectionLabel>
        <p className="text-[14px] text-muted-foreground whitespace-pre-line leading-relaxed">{bio}</p>
      </div>

      {/* Highlights — empty state until user creates one */}
      <div>
        <SectionLabel>Highlights</SectionLabel>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-[14px] text-muted-foreground mb-3">No Highlights Yet</p>
          <button
            onClick={() => toast({ title: "Coming soon", description: "Highlight creation is on the roadmap." })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full glass text-foreground text-[13px] font-semibold spring-tap hover:shadow-premium transition-shadow"
          >
            <Plus className="w-4 h-4" strokeWidth={2.2} /> New Highlight
          </button>
        </div>
      </div>

      {/* Pinned — empty state */}
      <div>
        <SectionLabel>Pinned</SectionLabel>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Bookmark className="w-7 h-7 text-muted-foreground/30 mb-2" strokeWidth={1.5} />
          <p className="text-[14px] text-muted-foreground">No Pinned Posts Yet</p>
        </div>
      </div>

      {/* Posts / Media / Videos — grid only appears when content exists */}
      <div>
        {hasPosts ? (
          <>
            <div className="flex gap-4 border-b border-border/20 pb-2.5 mb-3">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`text-[13px] font-medium spring-tap transition-colors ${tab === t ? "text-foreground" : "text-muted-foreground/40"}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1">
              {filtered.map((p) => (
                <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-muted/15">
                  {p.media_urls?.[0] ? (
                    <UIImage src={p.media_urls[0]} alt="" fittingType="fill" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full grid place-items-center p-2">
                      <p className="text-[10px] text-muted-foreground text-center leading-tight line-clamp-3">{p.content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="text-[40px] mb-2">📷</div>
            <h3 className="text-[16px] font-semibold text-foreground">No Posts Yet</h3>
            <p className="text-[13px] text-muted-foreground mt-1 max-w-[260px]">
              Share your first moment with your university community.
            </p>
            <button
              onClick={() => navigate("/square")}
              className="mt-4 flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-foreground/10 text-foreground text-[13px] font-semibold spring-tap hover:bg-foreground/15 transition-colors"
            >
              <Camera className="w-4 h-4" strokeWidth={2} /> Create Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
}