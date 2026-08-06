import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  X, BadgeCheck, MapPin, UserPlus, MessageCircle, Users, Trophy, FolderOpen,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

/**
 * OrbitMediaProfileSheet — floating creator profile preview.
 * Photo, university, faculty, communities, achievements, collections.
 * Follow, friend request, message — no full page navigation.
 */
export default function OrbitMediaProfileSheet({ post, user, open, onClose }) {
  const authorName = post?.author_name || "";
  const authorImage = post?.author_image || "";

  const { data: posts = [] } = useQuery({
    queryKey: ["media-profile-posts", authorName],
    queryFn: () =>
      base44.entities.QuadPost.filter(
        { author_name: authorName, is_anonymous: { $ne: true } },
        "-created_date",
        4
      ),
    enabled: !!open && !!authorName,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["media-profile-achievements", authorName],
    queryFn: () =>
      base44.entities.StudentAchievement.filter(
        { student_name: authorName, visibility: { $in: ["public", "university"] } },
        "-date_earned",
        3
      ),
    enabled: !!open && !!authorName,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["media-profile-collections", authorName],
    queryFn: () =>
      base44.entities.Highlight.filter(
        { visibility: "public" },
        "-created_date",
        4
      ),
    enabled: !!open,
  });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[60] flex items-end"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="relative w-full max-h-[85%] overflow-y-auto glass-strong rounded-t-[28px] pb-8 safe-area-pb"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-4 pb-2 glass-strong">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto" />
              <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/60 spring-tap">
                <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
              </button>
            </div>

            {/* Profile header */}
            <div className="flex flex-col items-center px-6 pb-4 text-center">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary/15 ring-offset-4 ring-offset-background">
                  {authorImage ? (
                    <Image src={authorImage} alt="" fittingType="fill" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-[28px] font-bold text-foreground">
                      {authorName.charAt(0)}
                    </div>
                  )}
                </div>
                {post?.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border-2 border-background flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-primary fill-primary/15" strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-bold text-[18px] text-foreground tracking-tight">{authorName}</h3>
                {post?.is_verified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/15" strokeWidth={2.5} />}
              </div>
              {(post?.university || post?.author_handle) && (
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3 h-3 text-muted-foreground/60" strokeWidth={2} />
                  <span className="text-[11px] text-muted-foreground">{post?.university || post?.author_handle}</span>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="flex items-center justify-center gap-6 px-6 pb-4">
              <Stat label="Posts" value={posts.length} />
              <div className="w-px h-8 bg-border/30" />
              <Stat label="Achievements" value={achievements.length} />
              <div className="w-px h-8 bg-border/30" />
              <Stat label="Collections" value={collections.length} />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 px-5 pb-4">
              <button className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 spring-tap">
                <UserPlus className="w-4 h-4" strokeWidth={2.2} /> Follow
              </button>
              <button className="flex-1 py-2.5 rounded-full glass text-foreground text-[13px] font-semibold flex items-center justify-center gap-2 spring-tap">
                <MessageCircle className="w-4 h-4" strokeWidth={2.2} /> Message
              </button>
            </div>

            {/* Recent posts */}
            {posts.length > 0 && (
              <Section title="Recent Posts" icon={MessageCircle}>
                <div className="grid grid-cols-2 gap-2">
                  {posts.map((p) => (
                    <div key={p.id} className="glass rounded-[14px] p-3">
                      <p className="text-[11px] text-foreground/80 line-clamp-2 leading-relaxed">{p.content}</p>
                      {p.media_urls?.[0] && (
                        <div className="mt-2 aspect-square rounded-lg overflow-hidden bg-muted/30">
                          <Image src={p.media_urls[0]} alt="" fittingType="fill" className="w-full h-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <Section title="Achievements" icon={Trophy}>
                <div className="flex flex-wrap gap-2">
                  {achievements.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-full glass">
                      <Trophy className="w-3.5 h-3.5 text-gold" strokeWidth={2} />
                      <span className="text-[11px] font-medium text-foreground">{a.title}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Collections */}
            {collections.length > 0 && (
              <Section title="Public Collections" icon={FolderOpen}>
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                  {collections.map((c) => (
                    <div key={c.id} className="flex-shrink-0 w-28 glass rounded-[14px] p-2.5">
                      <div className="w-full h-16 rounded-lg overflow-hidden bg-muted/30 mb-2">
                        {c.image_url && <Image src={c.image_url} alt="" fittingType="fill" className="w-full h-full" />}
                      </div>
                      <span className="text-[10px] font-semibold text-foreground line-clamp-1">{c.title}</span>
                      <span className="text-[9px] text-muted-foreground">{c.content_type?.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {posts.length === 0 && achievements.length === 0 && collections.length === 0 && (
              <div className="px-6 py-8 text-center">
                <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-[12px] text-muted-foreground">No public activity yet.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[16px] font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="px-5 pb-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}