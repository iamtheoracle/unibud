import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Hash, Users, Building2, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import PostCard from "@/components/quad/PostCard";
import EmptyState from "@/components/ui/EmptyState";
import { useFollowing } from "@/hooks/useFollowing";

// Real cross-entity search. People are matched from denormalized post authors
// (RLS-safe — never reads the restricted User entity).
export default function DiscoverySearch({ query, user, onPickTag }) {
  const { isFollowing, toggleFollow } = useFollowing();
  const q = query.toLowerCase();

  const { data: posts } = useQuery({
    queryKey: ["searchPosts", query],
    queryFn: () => base44.entities.QuadPost.list("-created_date", 60),
    enabled: query.length >= 2,
  });
  const { data: communities } = useQuery({
    queryKey: ["searchCommunities", query],
    queryFn: () => base44.entities.Community.list(50),
    enabled: query.length >= 2,
  });
  const { data: events } = useQuery({
    queryKey: ["searchEvents", query],
    queryFn: () => base44.entities.CampusEvent.list(50),
    enabled: query.length >= 2,
  });

  const matchedPosts = useMemo(
    () => (posts || []).filter((p) =>
      (p.content || "").toLowerCase().includes(q) ||
      (p.hashtags || []).some((h) => h.toLowerCase().includes(q))
    ),
    [posts, q]
  );

  const matchedPeople = useMemo(() => {
    const map = new Map();
    for (const p of posts || []) {
      if (!p.created_by_id || p.created_by_id === user?.id) continue;
      if ((p.author_name || "").toLowerCase().includes(q)) {
        map.set(p.created_by_id, {
          id: p.created_by_id, name: p.author_name, image: p.author_image, university: p.university,
        });
      }
    }
    return [...map.values()];
  }, [posts, q, user]);

  const matchedCommunities = (communities || []).filter((c) => (c.name || "").toLowerCase().includes(q));
  const matchedEvents = (events || []).filter((e) => (e.title || "").toLowerCase().includes(q));

  const empty =
    matchedPosts.length === 0 && matchedPeople.length === 0 &&
    matchedCommunities.length === 0 && matchedEvents.length === 0;

  if (query.length < 2) return null;

  if (empty) {
    return (
      <div className="px-4 py-10">
        <EmptyState icon={Search} title={`No results for "${query}"`} description="Try a different name, topic, or hashtag." />
      </div>
    );
  }

  return (
    <div className="px-4 pb-8 space-y-5">
      {matchedPeople.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1"><Users className="w-4 h-4 text-primary" /><h3 className="font-heading font-bold text-[14px] text-foreground">People</h3></div>
          <div className="space-y-2">
            {matchedPeople.map((p) => {
              const following = isFollowing(p.id);
              return (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border/30 p-3">
                  {p.image ? <img src={p.image} alt="" className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold">{(p.name || "?").charAt(0)}</div>}
                  <div className="flex-1 min-w-0"><p className="font-semibold text-[13px] truncate">{p.name}</p>{p.university && <p className="text-[11px] text-muted-foreground truncate">{p.university}</p>}</div>
                  <button onClick={() => toggleFollow(p.id, p.name)} className={"px-3 h-7 rounded-full text-[11px] font-semibold spring-tap shrink-0 " + (following ? "bg-muted text-muted-foreground" : "bg-foreground text-background")}>{following ? "Following" : "Follow"}</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {matchedPosts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1"><Hash className="w-4 h-4 text-primary" /><h3 className="font-heading font-bold text-[14px] text-foreground">Posts</h3></div>
          <div className="space-y-3">{matchedPosts.slice(0, 10).map((p, i) => <PostCard key={p.id} post={p} user={user} index={i} />)}</div>
        </div>
      )}

      {matchedCommunities.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1"><Building2 className="w-4 h-4 text-primary" /><h3 className="font-heading font-bold text-[14px] text-foreground">Communities</h3></div>
          <div className="space-y-2">{matchedCommunities.slice(0, 8).map((c) => <div key={c.id} className="rounded-2xl bg-card border border-border/30 p-3"><p className="font-semibold text-[13px]">{c.name}</p>{c.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{c.description}</p>}<p className="text-[10px] text-muted-foreground mt-1">{c.members_count || 0} members</p></div>)}</div>
        </div>
      )}

      {matchedEvents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2 px-1"><Calendar className="w-4 h-4 text-primary" /><h3 className="font-heading font-bold text-[14px] text-foreground">Events</h3></div>
          <div className="space-y-2">{matchedEvents.slice(0, 8).map((e) => <div key={e.id} className="rounded-2xl bg-card border border-border/30 p-3"><p className="font-semibold text-[13px]">{e.title}</p>{e.date && <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}{e.location ? " · " + e.location : ""}</p>}</div>)}</div>
        </div>
      )}
    </div>
  );
}