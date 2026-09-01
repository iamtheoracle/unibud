import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Media — real photos/videos from posts. Visual exploration only; each tile
// belongs to a real UNIBUD post.
export default function DiscoveryMedia({ user }) {
  const { data: posts } = useQuery({
    queryKey: ["discoveryMedia"],
    queryFn: () => base44.entities.QuadPost.list("-created_date", 50),
    enabled: !!user,
  });

  const media = useMemo(() => {
    const tiles = [];
    for (const p of posts || []) {
      for (let i = 0; i < (p.media_urls || []).length; i++) {
        tiles.push({ url: p.media_urls[i], type: p.media_types?.[i], postId: p.id, author: p.author_name });
      }
    }
    return tiles.slice(0, 15);
  }, [posts]);

  if (media.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-5">
        <ImageIcon className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[15px] text-foreground">Media</h2>
      </div>
      <div className="px-4 grid grid-cols-3 gap-1.5">
        {media.map((m, i) => (
          <div key={i} className="aspect-square rounded-lg overflow-hidden bg-muted">
            {m.type === "video" ? (
              <video src={m.url} className="w-full h-full object-cover" preload="metadata" />
            ) : (
              <img src={m.url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}