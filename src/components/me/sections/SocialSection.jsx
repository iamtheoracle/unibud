import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Users, Calendar, ShoppingBag, Package, ChevronRight,
} from "lucide-react";
import MeSocial from "@/components/me/MeSocial";

export default function SocialSection({ user, isOwnProfile }) {
  const navigate = useNavigate();

  const { data: followers = [] } = useQuery({
    queryKey: ["me", "followers"],
    queryFn: () => base44.entities.Follow.filter({ followed_id: user?.id }, "-created_date", 500),
    enabled: !!user?.id,
  });

  const { data: following = [] } = useQuery({
    queryKey: ["me", "following"],
    queryFn: () => base44.entities.Follow.filter({ follower_id: user?.id }, "-created_date", 500),
    enabled: !!user?.id,
  });

  const { data: friends = [] } = useQuery({
    queryKey: ["me", "friends"],
    queryFn: () => base44.entities.FriendRequest.filter({ status: "accepted" }, "-created_date", 500),
    enabled: !!user?.id,
  });

  const friendCount = (friends || []).filter(
    (f) => f.sender_id === user?.id || f.receiver_id === user?.id
  ).length;

  const socialLinks = [
    { label: "Communities", to: "/communities", icon: Users },
    { label: "Events", to: "/events", icon: Calendar },
    { label: "Marketplace", to: "/marketplace", icon: ShoppingBag },
    { label: "Lost & Found", to: "/lost-found", icon: Package },
  ];

  return (
    <div className="space-y-4">
      {/* Relationship summary */}
      <div className="grid grid-cols-3 gap-2">
        <SocialMetric value={friendCount} label="Friends" onClick={() => navigate("/friends")} />
        <SocialMetric value={followers.length || 0} label="Followers" onClick={() => navigate("/discover/people")} />
        <SocialMetric value={following.length || 0} label="Following" onClick={() => navigate("/following")} />
      </div>

      {/* Social quick links */}
      <div className="grid grid-cols-2 gap-2">
        {socialLinks.map((link) => (
          <button
            key={link.label}
            onClick={() => navigate(link.to)}
            className="flex items-center gap-2.5 p-3 rounded-[16px] bg-card shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-8 h-8 rounded-[12px] bg-chocolate/10 flex items-center justify-center flex-shrink-0">
              <link.icon className="w-4 h-4 text-chocolate" strokeWidth={2.2} />
            </div>
            <span className="text-[12px] font-bold text-foreground flex-1 text-left">{link.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" strokeWidth={2.2} />
          </button>
        ))}
      </div>

      {/* MeSocial — posts, media, videos, highlights */}
      <MeSocial bio={user?.bio} user={user} />
    </div>
  );
}

function SocialMetric({ value, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center p-3 rounded-[14px] bg-card shadow-sm active:scale-95 transition-transform">
      <p className="text-[18px] font-bold text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </button>
  );
}