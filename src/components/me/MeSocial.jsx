import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Camera } from "lucide-react";
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
 * Flow: About -> Highlights -> Pinned -> Posts/Media/Videos
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
      {bio && (
        <div>
          <SectionLabel>About</SectionLabel>
          <p className="text-[14px] text-muted-foreground whitespace-pre-line leading-relaxed">{bio}</p>
        </div>
      )}

      {/* Highlights */}
      <div>
        <SectionLabel>Highlights</SectionLabel>
        <HighlightsSection user={user} />
      </div>

      {/* Pinned */}
      <div>
        <SectionLabel>Pinned</SectionLabel>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Bookmark className="w-7 h-7 text-muted-foreground/30 mb-2" strokeWidth={1.5} />
          <p className="text-[14px] text-muted-foreground">No Pinned Posts Yet</p>
        </div>
      </div>

      {/* Posts / Media / Videos */}
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
            <div className="text-[40px] mb-2">{"📷"}</div>
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

function HighlightsSection({ user }) {
  const navigate = useNavigate();
  const { data: highlights = [] } = useQuery({
    queryKey: ["me-highlights", user?.id],
    queryFn: () => base44.entities.Highlight.filter({ created_by_id: user.id }, "-created_date", 10),
    enabled: !!user?.id,
  });

  if (highlights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <Bookmark className="w-6 h-6 text-muted-foreground/30 mb-2" strokeWidth={1.5} />
        <p className="text-[13px] text-muted-foreground">No saved collections yet</p>
        <button onClick={() => navigate("/highlights")} className="mt-2 text-[12px] font-semibold text-primary spring-tap">
          Browse Highlights
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {highlights.map((h) => (
        <button
          key={h.id}
          onClick={() => navigate("/highlights")}
          className="flex flex-col items-start gap-1.5 p-2.5 rounded-[14px] glass-card shrink-0 w-32 text-left spring-tap"
        >
          <div className="w-full h-16 rounded-lg overflow-hidden bg-muted/30">
            {h.image_url && <UIImage src={h.image_url} fittingType="fill" className="w-full h-full" />}
          </div>
          <span className="text-[11px] font-semibold text-foreground line-clamp-1">{h.title}</span>
          <span className="text-[9px] text-muted-foreground">{h.content_type?.replace(/_/g, " ") || "Collection"}</span>
        </button>
      ))}
    </div>
  );
}