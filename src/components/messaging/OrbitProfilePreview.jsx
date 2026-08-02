import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { X, MessageCircle, UserPlus, BadgeCheck, MapPin } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";

const EASE = [0.16, 1, 0.3, 1];

/**
 * OrbitProfilePreview — floating glass sheet showing participant profile.
 * University, faculty, communities, mutual friends, recent posts.
 */
export default function OrbitProfilePreview({ conversation, user, open, onClose, onMessage }) {
  const other = conversation?.participants?.find((p) => p.user_id !== user?.id);

  const { data: posts = [] } = useQuery({
    queryKey: ["profile-preview-posts", other?.user_id],
    queryFn: () =>
      base44.entities.QuadPost.filter(
        { author_name: other?.name, is_anonymous: { $ne: true } },
        "-created_date",
        3
      ),
    enabled: !!open && !!other?.name,
  });

  return (
    <AnimatePresence>
      {open && other && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="relative w-full max-w-lg glass-strong rounded-t-[28px] pb-8 safe-area-pb overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto" />
              <button onClick={onClose} className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted/60 spring-tap">
                <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
              </button>
            </div>

            {/* Profile header */}
            <div className="flex flex-col items-center px-6 pb-4 text-center">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-primary/15 ring-offset-4 ring-offset-background">
                  {other.image ? (
                    <Image src={other.image} alt="" fittingType="fill" className="w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary text-[28px] font-bold text-foreground">
                      {(other.name || "?").charAt(0)}
                    </div>
                  )}
                </div>
                {other.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-card border-2 border-background flex items-center justify-center">
                    <BadgeCheck className="w-4 h-4 text-primary fill-primary/15" strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-heading font-bold text-[18px] text-foreground tracking-tight">{other.name}</h3>
                {other.is_verified && <BadgeCheck className="w-4 h-4 text-primary fill-primary/15" strokeWidth={2.5} />}
              </div>
              {other.handle && <span className="text-[12px] text-muted-foreground mt-0.5">{other.handle}</span>}
              {(other.university || conversation?.university) && (
                <div className="flex items-center gap-1 mt-1.5">
                  <MapPin className="w-3 h-3 text-muted-foreground/60" strokeWidth={2} />
                  <span className="text-[11px] text-muted-foreground">{other.university || conversation.university}</span>
                </div>
              )}
            </div>

            {/* Info cards */}
            <div className="px-5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <InfoCard label="Faculty" value={other.faculty || conversation?.faculty || "—"} />
                <InfoCard label="Department" value={other.department || conversation?.department || "—"} />
              </div>

              {/* Recent posts */}
              {posts.length > 0 && (
                <div className="glass rounded-[18px] p-3.5">
                  <p className="text-[11px] font-semibold text-muted-foreground mb-2.5 uppercase tracking-wider">Recent Posts</p>
                  <div className="space-y-2">
                    {posts.map((post) => (
                      <div key={post.id} className="text-[12px] text-foreground/80 line-clamp-2 leading-relaxed">
                        {post.content}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => { onMessage?.(); onClose(); }}
                  className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 spring-tap"
                >
                  <MessageCircle className="w-4 h-4" strokeWidth={2.2} /> Message
                </button>
                <button className="px-4 py-2.5 rounded-full glass text-foreground text-[13px] font-semibold flex items-center justify-center gap-2 spring-tap">
                  <UserPlus className="w-4 h-4" strokeWidth={2.2} /> Connect
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="glass rounded-[16px] p-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[13px] font-medium text-foreground truncate">{value}</p>
    </div>
  );
}