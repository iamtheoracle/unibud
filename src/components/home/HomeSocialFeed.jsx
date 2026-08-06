import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, MessageCircle, Share2, Bookmark } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { timeAgo, formatCount } from "@/components/quad/quadConstants";
import { Image } from "@/components/ui/image";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";

export default function HomeSocialFeed() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["home-feed-posts"],
    queryFn: () => base44.entities.QuadPost.filter({ draft_status: "published" }, "-created_date", 8),
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-[24px] p-5 shimmer" style={{ background: "rgba(44, 33, 26, 0.4)", height: 260 }} />
        ))}
      </div>
    );
  }

  const feed = (posts || []).filter((p) => p.content);

  if (feed.length === 0) {
    return (
      <div className="rounded-[24px] p-8 text-center" style={{ background: "rgba(44, 33, 26, 0.4)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <p className="text-[15px] font-medium" style={{ color: CREAM }}>Your feed is quiet</p>
        <p className="text-[13px] mt-1" style={{ color: CREAM_MUTED }}>Posts from your campus will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {feed.map((post, i) => (
        <FeedCard key={post.id} post={post} index={i} />
      ))}
    </div>
  );
}

function FeedCard({ post, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 }}
      className="rounded-[24px] overflow-hidden"
      style={{
        background: "linear-gradient(170deg, rgba(58, 42, 34, 0.6), rgba(44, 33, 26, 0.6))",
        border: "1px solid rgba(255,255,255,0.04)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 grid place-items-center text-[16px] font-bold" style={{ background: "rgba(255,138,42,0.12)", color: ORANGE }}>
          {post.author_image ? (
            <Image src={post.author_image} alt="" className="w-full h-full object-cover" />
          ) : (
            (post.author_name || "?").charAt(0).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-semibold truncate" style={{ color: CREAM }}>{post.author_name}</p>
            {post.is_verified && <BadgeCheck className="w-[14px] h-[14px] shrink-0" style={{ color: ORANGE }} fill={ORANGE} />}
            {post.is_seed_content && (
              <span className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full shrink-0" style={{ background: "rgba(255,138,42,0.12)", color: ORANGE }}>
                Launch
              </span>
            )}
          </div>
          <p className="text-[12px] truncate" style={{ color: CREAM_MUTED }}>
            {[post.author_handle, post.university, timeAgo(post.created_date)].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="px-4 pb-3 text-[15px] leading-relaxed" style={{ color: CREAM }}>{post.content}</p>
      )}

      {/* Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className={post.media_urls.length === 1 ? "" : "grid grid-cols-2 gap-0.5"}>
          {post.media_urls.slice(0, 4).map((url, idx) => (
            <div key={idx} className={post.media_urls.length === 1 ? "aspect-[4/3] overflow-hidden" : "aspect-square overflow-hidden"}>
              <Image src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3">
        <FeedAction icon={MessageCircle} count={post.comments_count || 0} />
        <FeedAction icon={Share2} count={post.shares_count || 0} />
        <FeedAction icon={Bookmark} />
      </div>
    </motion.div>
  );
}

function FeedAction({ icon: Icon, count }) {
  return (
    <button className="flex items-center gap-1.5 spring-tap px-2">
      <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM_MUTED }} />
      {count > 0 && <span className="text-[13px] font-medium" style={{ color: CREAM_MUTED }}>{formatCount(count)}</span>}
    </button>
  );
}