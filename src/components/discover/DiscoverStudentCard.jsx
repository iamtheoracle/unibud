import React from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, UserPlus, UserCheck, Clock, BadgeCheck,
  GraduationCap, ChevronRight,
} from "lucide-react";
import { Image } from "@/components/ui/image";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/**
 * DiscoverStudentCard — premium student discovery card.
 * Shows real user data: photo, name, university details, bio,
 * interests, connection signals, and networking actions.
 */
export default function DiscoverStudentCard({
  user, currentUser, isFriend, hasPending, onAddFriend, onMessage, onViewProfile, index = 0,
}) {
  const data = user?.data || {};
  const name = user?.full_name || "Student";
  const avatarUrl = data.avatar_url || data.image_url;
  const username = data.username || user?.email?.split("@")[0];
  const university = data.university || "";
  const faculty = data.faculty || "";
  const department = data.department || "";
  const level = data.level || data.year || "";
  const bio = data.bio || "";
  const isVerified = data.is_verified || false;
  const interests = (data.interests || []).slice(0, 3);

  const uniParts = [faculty, department, level].filter(Boolean);
  const sameFaculty = currentUser?.data?.faculty && faculty && currentUser.data.faculty === faculty;
  const sameDepartment = currentUser?.data?.department && department && currentUser.data.department === department;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: Math.min(index * 0.04, 0.3) }}
      className="p-3 rounded-[18px] glass-card"
    >
      <button onClick={() => { hapticTap(); onViewProfile(user); }} className="flex items-center gap-3 w-full text-left">
        <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-border bg-muted shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} fittingType="fill" className="w-full h-full" />
          ) : (
            <div className="w-full h-full grid place-items-center">
              <span className="text-[16px] font-bold text-muted-foreground">{name?.[0]?.toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-[14px] font-bold text-foreground line-clamp-1">{name}</p>
            {isVerified && <BadgeCheck className="w-3.5 h-3.5 text-primary shrink-0" />}
          </div>
          {username && <p className="text-[11px] text-muted-foreground">@{username}</p>}
          {uniParts.length > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <GraduationCap className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="text-[10px] text-muted-foreground line-clamp-1">{uniParts.join(" · ")}</span>
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </button>

      {bio && <p className="text-[12px] text-foreground/70 line-clamp-2 mt-2 leading-relaxed">{bio}</p>}

      {/* Connection signals */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {interests.map((interest) => (
          <span key={interest} className="px-2 py-0.5 rounded-full glass text-[10px] font-medium text-foreground/70">{interest}</span>
        ))}
        {sameFaculty && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary">Same Faculty</span>}
        {sameDepartment && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-bold text-primary">Same Department</span>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3">
        {isFriend ? (
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full glass text-[12px] font-semibold text-foreground">
            <UserCheck className="w-3.5 h-3.5" /> Friends
          </div>
        ) : hasPending ? (
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full glass text-[12px] font-semibold text-muted-foreground">
            <Clock className="w-3.5 h-3.5" /> Pending
          </div>
        ) : (
          <button onClick={() => { hapticTap(); onAddFriend(user); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-foreground text-background text-[12px] font-semibold spring-tap">
            <UserPlus className="w-3.5 h-3.5" /> Connect
          </button>
        )}
        <button onClick={() => { hapticTap(); onMessage(user); }} className="w-9 h-9 rounded-full glass grid place-items-center spring-tap">
          <MessageCircle className="w-4 h-4 text-foreground" />
        </button>
      </div>
    </motion.div>
  );
}