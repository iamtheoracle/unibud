import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ListSkeleton } from "@/components/resilience/SkeletonKit";

export default function FriendsCard() {
  const { data: friends, isLoading } = useQuery({
    queryKey: ["card-friends"],
    queryFn: async () => {
      const data = await base44.entities.SocialConnection.filter({ status: "accepted" }, "-updated_date", 6);
      return data || [];
    },
    staleTime: 60000,
  });

  if (isLoading) return <ListSkeleton rows={2} />;

  if (!friends || friends.length === 0) {
    return (
      <div className="py-2">
        <p className="text-[12px] text-muted-foreground mb-2">Connect with classmates to see them here.</p>
        <Link to="/friends" className="text-[12px] font-medium text-primary">Find friends →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {friends.map((f) => (
          <Link
            key={f.id}
            to={f.connected_user_id ? `/profile/${f.connected_user_id}` : "/friends"}
            className="flex flex-col items-center gap-1.5 shrink-0 w-14 spring-tap"
          >
            <div className="w-11 h-11 rounded-full bg-foreground/[0.08] grid place-items-center overflow-hidden border border-border/30">
              {f.avatar_url ? (
                <img src={f.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[12px] font-bold text-foreground">{(f.display_name || f.connected_user_name || "?")[0]}</span>
              )}
            </div>
            <span className="text-[9px] text-muted-foreground truncate w-full text-center">{f.display_name || f.connected_user_name || "Friend"}</span>
          </Link>
        ))}
      </div>
      <Link to="/friends" className="block text-[12px] font-medium text-primary pt-1">
        View all friends →
      </Link>
    </div>
  );
}