import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Flag, Share2, Bell } from "lucide-react";

/**
 * CommunityHeader — immersive app-like header with banner, identity,
 * and action row. Makes entering a community feel like opening a
 * dedicated app rather than navigating to a page.
 */
export default function CommunityHeader({ community, typeMeta, Icon, accentColor, onBack, onReport, onShare, joined, onJoin, onToggleNotif }) {
  const accent = accentColor || "0 0% 100%";

  return (
    <div className="relative">
      {/* Banner — gradient wash in community accent */}
      <div
        className="h-28 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, hsl(${accent} / 0.22), hsl(${accent} / 0.06))` }}
      >
        <div className="absolute inset-0" style={{ background: `radial-gradient(70% 80% at 30% 0%, hsl(${accent} / 0.18), transparent)` }} />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-12 safe-area-pt">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full glass-strong flex items-center justify-center spring-tap"
          >
            <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2.4} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleNotif}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center spring-tap"
              aria-label="Notifications"
            >
              <Bell className="w-[17px] h-[17px] text-foreground" strokeWidth={2.2} />
            </button>
            <button
              onClick={onShare}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center spring-tap"
              aria-label="Share"
            >
              <Share2 className="w-[17px] h-[17px] text-foreground" strokeWidth={2.2} />
            </button>
            <button
              onClick={onReport}
              className="w-10 h-10 rounded-full glass-strong flex items-center justify-center spring-tap"
              aria-label="Report"
            >
              <Flag className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={2.2} />
            </button>
          </div>
        </div>
        {community?.is_verified && (
          <span className="absolute top-14 right-4 px-2.5 py-1 rounded-full glass-strong text-[10px] font-bold flex items-center gap-1" style={{ color: `hsl(${accent})` }}>
            <BadgeCheck className="w-3 h-3" /> Verified
          </span>
        )}
      </div>

      {/* Identity */}
      <div className="px-5 -mt-10 relative z-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="w-[68px] h-[68px] rounded-[22px] flex items-center justify-center border-4 border-background ice-glow"
          style={{ background: `hsl(${accent} / 0.14)` }}
        >
          <Icon className="w-8 h-8" style={{ color: `hsl(${accent})` }} strokeWidth={2.2} />
        </motion.div>

        <div className="mt-2.5">
          <h1 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground leading-tight">
            {community?.name || "Community"}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[12px] text-muted-foreground">{typeMeta?.label}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-[12px] text-muted-foreground">{community?.members_count || 0} members</span>
            {community?.is_official && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-[12px] font-semibold" style={{ color: `hsl(${accent})` }}>Official</span>
              </>
            )}
          </div>
        </div>

        {community?.description && (
          <p className="text-[13px] text-foreground/75 mt-2.5 leading-relaxed line-clamp-2">{community.description}</p>
        )}

        {onJoin && (
          <button
            onClick={onJoin}
            className="mt-3.5 w-full py-3 rounded-[16px] font-heading font-semibold text-[14px] transition-all spring-tap flex items-center justify-center gap-2 liquid-press"
            style={
              joined
                ? { background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border) / 0.4)" }
                : { background: `hsl(${accent})`, color: "hsl(0 0% 0%)", boxShadow: `0 8px 24px hsl(${accent} / 0.3)` }
            }
          >
            {joined ? "✓ Joined" : "Join Community"}
          </button>
        )}
      </div>
    </div>
  );
}