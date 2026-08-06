import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { timeAgo } from "@/components/quad/quadConstants";

const EASE = [0.16, 1, 0.3, 1];

/**
 * OrbitMediaRelated — related content based on real data.
 * Matches by category, community, university, or creator.
 * Never recommends fake content. Shows nothing if no related posts.
 */
export default function OrbitMediaRelated({ post, user }) {
  const { data: related = [] } = useQuery({
    queryKey: ["media-related", post?.id],
    queryFn: async () => {
      if (!post) return [];
      const filters = [];
      if (post.type) filters.push({ type: post.type });
      if (post.author_name) filters.push({ author_name: post.author_name });
      if (post.university) filters.push({ university: post.university });
      if (post.community) filters.push({ community: post.community });

      const results = [];
      for (const filter of filters) {
        if (results.length >= 6) break;
        try {
          const items = await base44.entities.QuadPost.filter(
            { ...filter, id: { $ne: post.id } },
            "-created_date",
            4
          );
          for (const item of items) {
            if (!results.find((r) => r.id === item.id)) results.push(item);
          }
        } catch {}
      }
      return results.slice(0, 6);
    },
    enabled: !!post,
  });

  if (related.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4, ease: EASE }}
      className="absolute bottom-0 left-0 right-0 z-5 bg-gradient-to-t from-black/60 to-transparent pt-8 pb-2 pointer-events-none"
    >
      <div className="px-4">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider mb-2">Related</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pointer-events-auto">
          {related.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.35, ease: EASE }}
              className="flex-shrink-0 w-28 glass-strong rounded-[14px] overflow-hidden spring-tap"
            >
              {item.media_urls?.[0] ? (
                <div className="w-full h-20 overflow-hidden">
                  <Image src={item.media_urls[0]} alt="" fittingType="fill" className="w-full h-full" />
                </div>
              ) : (
                <div className="w-full h-20 flex items-center justify-center p-2">
                  <p className="text-[9px] text-white/60 text-center line-clamp-3">{item.content}</p>
                </div>
              )}
              <div className="px-2 py-1.5">
                <p className="text-[9px] text-white/70 truncate">{item.author_name}</p>
                <p className="text-[8px] text-white/40">{timeAgo(item.created_date)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}