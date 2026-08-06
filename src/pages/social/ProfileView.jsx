import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trophy, FileText, Newspaper, GraduationCap, Calendar } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabBar from "@/components/profile/ProfileTabBar";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ProfileView — real user profile page.
 * Fetches actual user data by ID — never uses demo profiles.
 * Tabs load independently with smooth transitions.
 */
export default function ProfileView() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("posts");

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile", profileId],
    queryFn: () => base44.entities.User.get(profileId),
    enabled: !!profileId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    staleTime: 120000,
  });

  const isOwnProfile = currentUser?.id === profileId;

  const { data: followRecord, refetch: refetchFollow } = useQuery({
    queryKey: ["follow-status", profileId, currentUser?.id],
    queryFn: () => base44.entities.Follow.filter({ follower_id: currentUser?.id, followed_id: profileId }, "-created_date", 1),
    enabled: !!currentUser?.id && !!profileId && !isOwnProfile,
    select: (data) => data?.[0] || null,
  });
  const isFollowing = !!followRecord;

  const { data: posts = [] } = useQuery({
    queryKey: ["profile-posts", profileId],
    queryFn: () => base44.entities.QuadPost.filter({ created_by_id: profileId }, "-created_date", 50),
    enabled: !!profileId,
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["profile-collections", profileId],
    queryFn: () => base44.entities.Highlight.filter({ created_by_id: profileId, visibility: "public" }, "-created_date", 50),
    enabled: !!profileId,
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["profile-achievements", profileId],
    queryFn: () => base44.entities.StudentAchievement.filter({ created_by_id: profileId }, "-created_date", 50),
    enabled: !!profileId,
  });

  const { data: followersData = [] } = useQuery({
    queryKey: ["profile-followers", profileId],
    queryFn: () => base44.entities.Follow.filter({ followed_id: profileId }, "-created_date", 500),
    enabled: !!profileId,
  });

  const { data: followingData = [] } = useQuery({
    queryKey: ["profile-following", profileId],
    queryFn: () => base44.entities.Follow.filter({ follower_id: profileId }, "-created_date", 500),
    enabled: !!profileId,
  });

  const handleFollow = async () => {
    try {
      if (isFollowing && followRecord?.id) {
        await base44.entities.Follow.delete(followRecord.id);
        toast({ title: "Unfollowed" });
      } else {
        await base44.entities.Follow.create({ follower_id: currentUser?.id, followed_id: profileId });
        toast({ title: "Following" });
      }
      refetchFollow();
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const handleAddFriend = async () => {
    try {
      await base44.entities.FriendRequest.create({ sender_id: currentUser?.id, receiver_id: profileId, status: "pending" });
      toast({ title: "Friend request sent" });
    } catch {
      toast({ title: "Couldn't send request", variant: "destructive" });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${profileId}`;
    if (navigator.share) {
      try { await navigator.share({ title: user?.full_name || "Profile", url }); } catch {}
    } else {
      navigator.clipboard?.writeText(url);
      toast({ title: "Link copied!" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pb-32">
        <div className="h-36 shimmer safe-area-pt" />
        <div className="px-4 -mt-10">
          <div className="w-20 h-20 rounded-full ring-4 ring-background shimmer" />
          <div className="h-5 w-1/3 shimmer rounded-full mt-3" />
          <div className="h-3 w-1/4 shimmer rounded-full mt-2" />
          <div className="flex gap-5 mt-4">
            <div className="h-10 w-16 shimmer rounded-full" />
            <div className="h-10 w-20 shimmer rounded-full" />
            <div className="h-10 w-24 shimmer rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <p className="text-[15px] font-bold text-foreground">Profile not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 px-5 py-2.5 rounded-full glass text-[13px] font-semibold spring-tap">
          Go Back
        </button>
      </div>
    );
  }

  const stats = {
    posts: posts.length,
    followers: followersData.length,
    following: followingData.length,
    collections: collections.length,
    achievements: achievements.length,
  };

  return (
    <div className="min-h-screen pb-32">
      <ProfileHeader
        user={user}
        stats={stats}
        isOwnProfile={isOwnProfile}
        onBack={() => navigate(-1)}
        onFollow={handleFollow}
        onAddFriend={handleAddFriend}
        onMessage={() => navigate("/messages")}
        onShare={handleShare}
        isFollowing={isFollowing}
      />

      <ProfileTabBar active={activeTab} onChange={setActiveTab} />

      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {activeTab === "posts" && <PostsTab posts={posts} />}
            {activeTab === "collections" && <CollectionsTab collections={collections} />}
            {activeTab === "achievements" && <AchievementsTab achievements={achievements} />}
            {activeTab === "about" && <AboutTab user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function PostsTab({ posts }) {
  if (posts.length === 0) {
    return <EmptyTab icon={Newspaper} title="No posts yet" description="Posts shared by this student will appear here." />;
  }
  return (
    <div className="space-y-2.5">
      {posts.map((post, i) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
          className="p-3 rounded-[16px] glass-card"
        >
          <p className="text-[13px] text-foreground line-clamp-3 leading-relaxed">{post.content}</p>
          {post.media_urls?.length > 0 && (
            <div className="mt-2 rounded-xl overflow-hidden aspect-[16/9]">
              <Image src={post.media_urls[0]} fittingType="fill" className="w-full h-full" />
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-muted-foreground">{post.likes_count || 0} likes</span>
            <span className="text-[10px] text-muted-foreground">{post.comments_count || 0} comments</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CollectionsTab({ collections }) {
  if (collections.length === 0) {
    return <EmptyTab icon={Bookmark} title="No collections yet" description="Saved items and shared collections will appear here." />;
  }
  return (
    <div className="space-y-2">
      {collections.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
          className="flex items-center gap-3 p-3 rounded-[16px] glass-card"
        >
          <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-card grid place-items-center">
            {item.image_url ? <Image src={item.image_url} fittingType="fill" className="w-full h-full" /> : <Bookmark className="w-4 h-4 text-muted-foreground/40" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-foreground line-clamp-1">{item.title}</p>
            {item.subtitle && <p className="text-[11px] text-muted-foreground line-clamp-1">{item.subtitle}</p>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AchievementsTab({ achievements }) {
  if (achievements.length === 0) {
    return <EmptyTab icon={Trophy} title="No achievements yet" description="Academic and campus achievements will appear here." />;
  }
  return (
    <div className="grid grid-cols-2 gap-2">
      {achievements.map((ach, i) => (
        <motion.div
          key={ach.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
          className="p-3 rounded-[16px] glass-card flex flex-col items-center text-center gap-1.5"
        >
          <div className="w-10 h-10 rounded-full grid place-items-center bg-gold/10">
            <Trophy className="w-5 h-5 text-gold" strokeWidth={1.5} />
          </div>
          <p className="text-[11px] font-bold text-foreground line-clamp-2 leading-tight">{ach.title}</p>
          <p className="text-[9px] text-muted-foreground">{ach.category}</p>
        </motion.div>
      ))}
    </div>
  );
}

function AboutTab({ user }) {
  const data = user?.data || {};
  const fields = [
    { label: "University", value: data.university, icon: GraduationCap },
    { label: "Faculty", value: data.faculty, icon: FileText },
    { label: "Department", value: data.department, icon: FileText },
    { label: "Level", value: data.level || data.year, icon: GraduationCap },
  ].filter((f) => f.value);

  const joinedDate = user?.created_date ? new Date(user.created_date).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  return (
    <div className="space-y-3">
      {data.bio && (
        <div className="p-3 rounded-[16px] glass-card">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Bio</p>
          <p className="text-[13px] text-foreground leading-relaxed">{data.bio}</p>
        </div>
      )}
      {fields.length > 0 && (
        <div className="p-3 rounded-[16px] glass-card space-y-2.5">
          {fields.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex items-center gap-2.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-[10px] text-muted-foreground w-20 shrink-0">{f.label}</span>
                <span className="text-[12px] text-foreground font-medium">{f.value}</span>
              </div>
            );
          })}
        </div>
      )}
      {joinedDate && (
        <div className="p-3 rounded-[16px] glass-card flex items-center gap-2.5">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-[12px] text-muted-foreground">Joined {joinedDate}</span>
        </div>
      )}
    </div>
  );
}

function EmptyTab({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center text-center py-12 px-6">
      <div className="w-14 h-14 rounded-full grid place-items-center mb-3 bg-muted/40">
        <Icon className="w-6 h-6 text-muted-foreground/40" strokeWidth={1.5} />
      </div>
      <p className="text-[13px] font-bold text-foreground">{title}</p>
      <p className="text-[11px] text-muted-foreground mt-1 max-w-[240px]">{description}</p>
    </div>
  );
}