import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Settings, Share2, LogOut, Trash2, Pencil, MoreHorizontal, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Shared profile header for the unified Profile (Social | Academic).
// Owner view shows Edit Profile + a More menu (Share, Settings, Sign out, Delete).
// Other-user view (deferred) would show Follow / Message.
export default function ProfileHeader({
  user,
  isOwner = true,
  followerCount = 0,
  followingCount = 0,
  onEdit,
  onShare,
  onSettings,
  onSignOut,
  onDelete,
}) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const avatar = user?.avatar_url || user?.image;
  const cover = user?.cover_url;
  const name = user?.full_name || user?.preferred_name || user?.email?.split("@")[0] || "Student";
  const username = user?.username || (user?.email ? user.email.split("@")[0] : "");
  const bio = user?.bio || "";
  const university = user?.university || "";
  const programLine = [user?.department, user?.level ? `${user.level} Level` : ""].filter(Boolean).join(" · ");
  const isVerified = !!user?.is_verified;

  const menuItems = [
    { icon: Share2, label: "Share profile", action: onShare },
    { icon: Settings, label: "Settings", action: onSettings },
    { icon: Link2, label: "Connected accounts", action: () => navigate("/connected-accounts") },
    { icon: LogOut, label: "Sign out", action: onSignOut, danger: true },
    { icon: Trash2, label: "Delete account", action: onDelete, danger: true },
  ].filter((i) => i.action);

  return (
    <div className="px-5 pt-12">
      {/* Cover */}
      <div className="relative -mx-5 mb-16">
        <div className="h-28 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent rounded-b-[28px] overflow-hidden">
          {cover && <img src={cover} alt="" className="w-full h-full object-cover" />}
        </div>

        {/* Avatar */}
        <div className="absolute left-5 -bottom-14">
          <div className="w-28 h-28 rounded-full bg-card p-1 soft-shadow">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-heading font-bold text-3xl">
                {name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h1 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground truncate">{name}</h1>
            {isVerified && <BadgeCheck className="w-5 h-5 text-primary fill-primary/20 flex-shrink-0" />}
          </div>
          {username && <p className="text-[13px] text-muted-foreground font-medium">@{username}</p>}
        </div>

        {isOwner ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-card border border-border/50 text-[12px] font-semibold text-foreground spring-tap"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit profile
            </button>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-card border border-border/50 flex items-center justify-center spring-tap"
                aria-label="More"
              >
                <MoreHorizontal className="w-4.5 h-4.5 text-foreground" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 rounded-2xl bg-card elevated-shadow border border-border/40 overflow-hidden z-50"
                  >
                    {menuItems.map((item, i) => (
                      <button
                        key={i}
                        onClick={() => { item.action(); setMenuOpen(false); }}
                        className={`flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left ${
                          i < menuItems.length - 1 ? "border-b border-border/20" : ""
                        }`}
                      >
                        <item.icon className={`w-4 h-4 ${item.danger ? "text-destructive" : "text-muted-foreground"}`} />
                        <span className={`text-[13px] font-medium ${item.danger ? "text-destructive" : "text-foreground"}`}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button className="px-4 h-9 rounded-full bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">Follow</button>
            <button className="px-4 h-9 rounded-full bg-card border border-border/50 text-[12px] font-semibold text-foreground spring-tap">Message</button>
          </div>
        )}
      </div>

      {/* Bio */}
      {bio && <p className="text-[13px] leading-relaxed text-foreground mt-3 whitespace-pre-wrap">{bio}</p>}

      {/* University / program */}
      {(university || programLine) && (
        <p className="text-[12px] text-muted-foreground mt-2">
          {university && <span className="font-medium text-foreground/80">{university}</span>}
          {university && programLine && " · "}
          {programLine}
        </p>
      )}

      {/* Counts */}
      <div className="flex items-center gap-4 mt-3">
        <span className="text-[12px] text-muted-foreground">
          <span className="font-heading font-bold text-foreground">{followingCount}</span> Following
        </span>
        <span className="text-[12px] text-muted-foreground">
          <span className="font-heading font-bold text-foreground">{followerCount}</span> Followers
        </span>
      </div>
    </div>
  );
}