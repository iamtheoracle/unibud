import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";
import {
  UserPlus, UserCheck, Clock, MessageCircle, Share2, BadgeCheck,
  GraduationCap, Newspaper, Bookmark, Trophy,
} from "lucide-react";
import { hapticTap } from "@/lib/haptics";
import { useToast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ProfilePreviewSheet — premium bottom sheet showing a student's
 * full profile without leaving the current screen.
 * Fetches real posts, collections, and achievements on open.
 */
export default function ProfilePreviewSheet({
  user, open, onOpenChange, isFriend, hasPending, onAddFriend, onMessage,
}) {
  const { toast } = useToast();
  const data = user?.data || {};
  const name = user?.full_name || "Student";
  const avatarUrl = data.avatar_url || data.image_url;
  const coverUrl = data.cover_url || data.banner_url;
  const username = data.username || user?.email?.split("@")[0];
  const university = data.university || "";
  const faculty = data.faculty || "";
  const department = data.department || "";
  const level = data.level || data.year || "";
  const bio = data.bio || "";
  const isVerified = data.is_verified || false;
  const interests = data.interests || [];
  const uniParts = [university, faculty, department, level].filter(Boolean);
  const userId = user?.id;

  const { data: posts = [] } = useQuery({
    queryKey: ["preview-posts", userId],
    queryFn: () => base44.entities.QuadPost.filter({ created_by_id: userId }, "-created_date", 3),
    enabled: !!userId && open,
  });
  const { data: collections = [] } = useQuery({
    queryKey: ["preview-collections", userId],
    queryFn: () => base44.entities.Highlight.filter({ created_by_id: userId, visibility: "public" }, "-created_date", 3),
    enabled: !!userId && open,
  });
  const { data: achievements = [] } = useQuery({
    queryKey: ["preview-achievements", userId],
    queryFn: () => base44.entities.StudentAchievement.filter({ created_by_id: userId }, "-created_date", 4),
    enabled: !!userId && open,
  });

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${userId}`;
    if (navigator.share) {
      try { await navigator.share({ title: name, url }); } catch {}
    } else {
      navigator.clipboard?.writeText(url);
      toast({ title: "Link copied!" });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[28px] p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>{name}</SheetTitle>
          <SheetDescription>Student profile preview</SheetDescription>
        </SheetHeader>

        {/* Cover */}
        <div className="relative h-28 bg-gradient-to-br from-muted to-card overflow-hidden rounded-t-[28px]">
          {coverUrl && <Image src={coverUrl} fittingType="fill" className="w-full h-full" />}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        {/* Profile info */}
        <div className="px-4 -mt-8 pb-6">
          <div className="flex items-end gap-3">
            <div className="w-16 h-16 rounded-full ring-4 ring-background overflow-hidden liquid-mirror shrink-0">
              {avatarUrl ? (
                <Image src={avatarUrl} fittingType="fill" className="w-full h-full" />
              ) : (
                <div className="w-full h-full grid place-items-center bg-muted">
                  <span className="text-[20px] font-bold text-muted-foreground">{name?.[0]?.toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-1">
                <h2 className="text-[17px] font-bold text-foreground line-clamp-1">{name}</h2>
                {isVerified && <BadgeCheck className="w-4 h-4 text-primary" />}
              </div>
              {username && <p className="text-[12px] text-muted-foreground">@{username}</p>}
            </div>
          </div>

          {uniParts.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-muted-foreground">
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              <span className="line-clamp-1">{uniParts.join(" · ")}</span>
            </div>
          )}

          {bio && <p className="text-[13px] text-foreground/80 leading-relaxed mt-2">{bio}</p>}

          {/* Stats */}
          <div className="flex items-center gap-5 mt-3">
            <Stat label="Posts" value={posts.length} />
            <Stat label="Collections" value={collections.length} />
            <Stat label="Achievements" value={achievements.length} />
          </div>

          {/* Interests */}
          {interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {interests.slice(0, 6).map((interest) => (
                <span key={interest} className="px-2.5 py-1 rounded-full glass text-[11px] font-medium text-foreground/70">{interest}</span>
              ))}
            </div>
          )}

          {/* Recent posts */}
          {posts.length > 0 && (
            <div className="mt-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Newspaper className="w-3 h-3" /> Recent Posts
              </p>
              <div className="space-y-1.5">
                {posts.map((post) => (
                  <div key={post.id} className="p-2.5 rounded-xl glass-card">
                    <p className="text-[12px] text-foreground line-clamp-2">{post.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Collections */}
          {collections.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Bookmark className="w-3 h-3" /> Collections
              </p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {collections.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 p-2 rounded-xl glass-card shrink-0 min-w-[140px]">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-muted shrink-0">
                      {c.image_url && <Image src={c.image_url} fittingType="fill" className="w-full h-full" />}
                    </div>
                    <span className="text-[11px] font-medium text-foreground line-clamp-1">{c.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Achievements
              </p>
              <div className="flex gap-2">
                {achievements.map((a) => (
                  <div key={a.id} className="flex flex-col items-center gap-1 p-2 rounded-xl glass-card w-16">
                    <div className="w-8 h-8 rounded-full grid place-items-center bg-gold/10">
                      <Trophy className="w-4 h-4 text-gold" strokeWidth={1.5} />
                    </div>
                    <span className="text-[9px] font-bold text-foreground text-center line-clamp-2 leading-tight">{a.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            {isFriend ? (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full glass text-[13px] font-semibold text-foreground">
                <UserCheck className="w-4 h-4" /> Friends
              </div>
            ) : hasPending ? (
              <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full glass text-[13px] font-semibold text-muted-foreground">
                <Clock className="w-4 h-4" /> Request Sent
              </div>
            ) : (
              <button
                onClick={() => { hapticTap(); onAddFriend(user); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-foreground text-background text-[13px] font-semibold spring-tap"
              >
                <UserPlus className="w-4 h-4" /> Connect
              </button>
            )}
            <button onClick={() => { hapticTap(); onMessage(user); }} className="w-10 h-10 rounded-full glass-card grid place-items-center spring-tap">
              <MessageCircle className="w-4 h-4 text-foreground" />
            </button>
            <button onClick={() => { hapticTap(); handleShare(); }} className="w-10 h-10 rounded-full glass-card grid place-items-center spring-tap">
              <Share2 className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[15px] font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}