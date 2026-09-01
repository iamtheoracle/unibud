import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";
import { useFollowing } from "@/hooks/useFollowing";

// People you may know — real authors from recent posts, excluding self and
// already-followed accounts. RLS-safe (no User entity reads).
export default function PeopleToFollow({ user }) {
  const { followingIds, isFollowing, toggleFollow } = useFollowing();

  const { data: posts } = useQuery({
    queryKey: ["peoplePosts"],
    queryFn: () => base44.entities.QuadPost.list("-created_date", 100),
    enabled: !!user,
  });

  const people = useMemo(() => {
    const map = new Map();
    for (const p of posts || []) {
      if (!p.created_by_id || p.created_by_id === user?.id) continue;
      if (followingIds.has(p.created_by_id)) continue;
      if (!map.has(p.created_by_id)) {
        map.set(p.created_by_id, {
          id: p.created_by_id, name: p.author_name, image: p.author_image, university: p.university,
        });
      }
    }
    return [...map.values()].slice(0, 10);
  }, [posts, user, followingIds]);

  if (people.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-5">
        <UserPlus className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[15px] text-foreground">People you may know</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
        {people.map((p, i) => {
          const following = isFollowing(p.id);
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex-shrink-0 w-[150px] rounded-2xl bg-card border border-border/30 p-3 flex flex-col items-center text-center"
            >
              {p.image ? (
                <img src={p.image} alt="" className="w-14 h-14 rounded-full object-cover mb-2" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-heading font-bold text-lg mb-2">
                  {(p.name || "?").charAt(0)}
                </div>
              )}
              <p className="font-semibold text-[12px] text-foreground truncate w-full">{p.name}</p>
              {p.university && <p className="text-[10px] text-muted-foreground truncate w-full">{p.university}</p>}
              <button
                onClick={() => toggleFollow(p.id, p.name)}
                className={"mt-2 px-3 h-7 rounded-full text-[11px] font-semibold spring-tap " + (following ? "bg-muted text-muted-foreground" : "bg-foreground text-background")}
              >
                {following ? "Following" : "Follow"}
              </button>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}