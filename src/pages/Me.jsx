import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useFriends } from "@/lib/social/useFriends";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import { resolveDisplayName } from "@/lib/userDisplayName";
import EditProfileModal from "@/components/me/EditProfileModal";
import QRShareSheet from "@/components/shared/QRShareSheet";
import MeSocial from "@/components/me/MeSocial";
import MeAcademic from "@/components/me/MeAcademic";
import {
  Settings, QrCode, Share2, Edit3, Bookmark, Shield, Heart, FolderOpen, Link2,
  BadgeCheck, Trophy, ChevronRight,
} from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const QUICK_ACCESS = [
  { id: "highlights",  label: "Highlights",  to: "/highlights",                icon: Bookmark },
  { id: "saved",       label: "Saved",       to: "/highlights",                icon: Heart },
  { id: "collections", label: "Collections", to: "/highlights",                icon: FolderOpen },
  { id: "settings",    label: "Settings",    to: "/settings",                  icon: Settings },
  { id: "privacy",     label: "Privacy",     to: "/settings",                  icon: Shield },
  { id: "accounts",    label: "Connected",  to: "/settings/connected-accounts", icon: Link2 },
];

export default function Me() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [mode, setMode] = useState("social");

  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });
  const { friends } = useFriends();

  const { data: posts = [] } = useQuery({
    queryKey: ["me-posts-count", user?.id],
    queryFn: () => base44.entities.QuadPost.filter({ created_by_id: user.id }, "-created_date", 50),
    enabled: !!user?.id,
  });
  const { data: achievements = [] } = useQuery({
    queryKey: ["me-achievements", user?.id],
    queryFn: () => base44.entities.StudentAchievement.filter({ created_by_id: user.id }, "-created_date", 50),
    enabled: !!user?.id,
  });
  const { data: collections = [] } = useQuery({
    queryKey: ["me-collections-count", user?.id],
    queryFn: () => base44.entities.Highlight.filter({ created_by_id: user.id }, "-created_date", 50),
    enabled: !!user?.id,
  });

  const name = resolveDisplayName(user) || user?.full_name || "Student";
  const handle = user?.username ? `@${user.username}` : null;
  const initials = name.charAt(0).toUpperCase();
  const bio = user?.bio || "";
  const avatarUrl = user?.avatar_url;
  const coverUrl = user?.cover_url || user?.data?.cover_url;
  const university = user?.university || "";
  const faculty = user?.faculty || "";
  const department = user?.department || "";
  const level = user?.level || "";
  const isVerified = user?.is_verified || false;
  const uniParts = [university, faculty, department, level].filter(Boolean);

  const stats = [
    { label: "Posts", value: posts.length },
    { label: "Friends", value: friends.length },
    { label: "Awards", value: achievements.length },
    { label: "Saved", value: collections.length },
  ];

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text: `Check out ${name} on UNIBUD` });
      } else {
        await navigator.clipboard?.writeText(window.location.href);
        toast({ title: "Profile link copied" });
      }
    } catch {}
  };

  return (
    <div className="w-full max-w-[520px] mx-auto pb-36 safe-area-pt">
      {/* Cover */}
      <div className="relative w-full h-32 overflow-hidden">
        {coverUrl ? (
          <Image src={coverUrl} fittingType="fill" className="w-full h-full" />
        ) : (
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.02))" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Avatar */}
      <div className="px-5 -mt-12 relative">
        <div className="w-20 h-20 rounded-full ring-4 ring-background overflow-hidden liquid-mirror">
          {avatarUrl ? (
            <Image src={avatarUrl} fittingType="fill" className="w-full h-full" />
          ) : (
            <div className="w-full h-full grid place-items-center bg-muted">
              <span className="text-[24px] font-bold text-muted-foreground">{initials}</span>
            </div>
          )}
        </div>
      </div>

      {/* Identity + Actions */}
      <div className="px-5 pt-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-[22px] font-bold text-foreground truncate tracking-tight leading-tight">{name}</h1>
              {isVerified && <BadgeCheck className="w-[18px] h-[18px] text-primary shrink-0" />}
            </div>
            {handle && <p className="text-[13px] text-muted-foreground truncate mt-0.5">{handle}</p>}
            {uniParts.length > 0 && (
              <p className="text-[11px] text-muted-foreground/70 mt-0.5 line-clamp-1">{uniParts.join(" · ")}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditing(true)} className="w-9 h-9 rounded-full glass-card grid place-items-center spring-tap" aria-label="Edit profile">
              <Edit3 className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
            </button>
            <button onClick={handleShare} className="w-9 h-9 rounded-full glass-card grid place-items-center spring-tap" aria-label="Share profile">
              <Share2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
            </button>
            <button onClick={() => setQrOpen(true)} className="w-9 h-9 rounded-full glass-card grid place-items-center spring-tap" aria-label="QR code">
              <QrCode className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
            </button>
            <button onClick={() => navigate("/settings")} className="w-9 h-9 rounded-full glass-card grid place-items-center spring-tap" aria-label="Settings">
              <Settings className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {bio && <p className="text-[14px] text-muted-foreground mt-3 leading-relaxed">{bio}</p>}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-0 mt-5 rounded-[18px] glass-card overflow-hidden">
          {stats.map((s, i) => (
            <div key={s.label} className={`text-center py-3 ${i > 0 ? "border-l border-border/30" : ""}`}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3, ease: EASE }}
                className="text-[18px] font-bold text-foreground tabular-nums"
              >
                {s.value}
              </motion.div>
              <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Access */}
        <div className="mt-5">
          <div className="grid grid-cols-3 gap-2">
            {QUICK_ACCESS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.to)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] glass-card spring-tap"
                >
                  <div className="w-8 h-8 rounded-full grid place-items-center bg-muted/40">
                    <Icon className="w-4 h-4 text-foreground" strokeWidth={1.8} />
                  </div>
                  <span className="text-[10px] font-medium text-foreground truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mt-5">
          <div className="flex bg-muted/40 rounded-full p-1">
            {["social", "academic"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-full text-[12px] font-semibold capitalize spring-tap transition-all ${mode === m ? "bg-foreground text-background" : "text-muted-foreground"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Mode content */}
        <div className="mt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: EASE }}
            >
              {mode === "social" ? <MeSocial bio={bio} user={user} /> : <MeAcademic user={user} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Achievements preview */}
        {achievements.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[14px] font-bold text-foreground tracking-tight">Achievements</h2>
              <button onClick={() => navigate("/achievements")} className="flex items-center gap-0.5 text-[11px] font-semibold text-muted-foreground spring-tap">
                See All <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {achievements.slice(0, 6).map((a) => (
                <div key={a.id} className="flex flex-col items-center gap-1.5 p-3 rounded-[16px] glass-card shrink-0 w-20">
                  <div className="w-9 h-9 rounded-full grid place-items-center bg-gold/10">
                    <Trophy className="w-4 h-4 text-gold" strokeWidth={1.5} />
                  </div>
                  <span className="text-[10px] font-bold text-foreground text-center line-clamp-2 leading-tight">{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} user={user} />
      <QRShareSheet open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}