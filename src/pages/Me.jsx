import React, { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import { resolveDisplayName } from "@/lib/userDisplayName";
import EditProfileModal from "@/components/me/EditProfileModal";
import QRShareSheet from "@/components/shared/QRShareSheet";
import SettingsSection from "@/components/me/SettingsSection";
import MeSocial from "@/components/me/MeSocial";
import MeAcademic from "@/components/me/MeAcademic";
import { Settings, QrCode, Share2, Edit3, Camera, Github, Linkedin, Instagram, Twitter, Globe, Music } from "lucide-react";

const CHIPS = ["Student", "Creator", "Computer Science", "300 Level", "Verified", "Class Rep", "Ambassador"];
const STATS = [
  { label: "Posts", value: 42 },
  { label: "Followers", value: 156 },
  { label: "Following", value: 89 },
  { label: "Views", value: "1.2K" },
  { label: "Reputation", value: 87 },
  { label: "Complete", value: "78%" },
];
const CONNECTED = [
  { icon: Github, label: "GitHub" },
  { icon: Linkedin, label: "LinkedIn" },
  { icon: Globe, label: "Portfolio" },
  { icon: Instagram, label: "Instagram" },
  { icon: Music, label: "TikTok" },
  { icon: Twitter, label: "X" },
];

const avatarBg = () => ({ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" });

/**
 * Me — student profile. Cover + overlapping avatar, identity chips, stats,
 * connected accounts, and a Social/Academic profile toggle. Edit opens the
 * real EditProfileModal (persists); Settings scrolls to the real
 * SettingsSection (logout/account) preserved at the bottom.
 */
export default function Me() {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [mode, setMode] = useState("social");
  const settingsRef = useRef(null);
  const { data: user } = useQuery({ queryKey: ["me"], queryFn: () => base44.auth.me() });

  const name = resolveDisplayName(user) || user?.full_name || "Student";
  const handle = user?.username ? `@${user.username}` : null;
  const initials = name.charAt(0).toUpperCase();
  const bio = user?.bio || "Software Engineering student · AI enthusiast · Building products for students";
  const university = user?.university || "University of Lagos";

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
  const [qrOpen, setQrOpen] = useState(false);
  const handleQR = () => setQrOpen(true);
  const goSettings = () => settingsRef.current?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="w-full max-w-[520px] mx-auto pb-28 safe-area-pt">
      {/* Cover */}
      <div className="relative w-full h-40 overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(var(--surface-elevated)), hsl(var(--surface-secondary)))" }}>
        <div className="absolute inset-0" style={{ background: "radial-gradient(60% 80% at 30% 0%, hsl(var(--primary) / 0.10), transparent 70%)" }} />
        <div className="absolute inset-0 grid place-items-center opacity-30">
          <Camera className="w-10 h-10 text-muted-foreground" />
        </div>
      </div>

      {/* Overlapping avatar */}
      <div className="px-4 -mt-12 relative">
        <div className="w-20 h-20 rounded-full border-4 border-background overflow-hidden grid place-items-center text-[26px] font-bold text-primary-foreground" style={avatarBg()}>
          {user?.avatar_url ? <Image src={user.avatar_url} alt={name} fittingType="fill" className="w-full h-full" /> : initials}
        </div>
      </div>

      {/* Profile info + actions */}
      <div className="px-4 pt-2">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h1 className="text-[20px] font-bold text-foreground truncate">{name}</h1>
            {handle && <p className="text-[13px] text-muted-foreground truncate">{handle}</p>}
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">{university}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditing(true)} className="w-9 h-9 rounded-full glass grid place-items-center spring-tap"><Edit3 className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={handleShare} className="w-9 h-9 rounded-full glass grid place-items-center spring-tap"><Share2 className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={handleQR} className="w-9 h-9 rounded-full glass grid place-items-center spring-tap"><QrCode className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={goSettings} className="w-9 h-9 rounded-full glass grid place-items-center spring-tap"><Settings className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        </div>
        <p className="text-[13px] text-muted-foreground mt-2 leading-relaxed">{bio}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {CHIPS.map((c) => <span key={c} className="px-2.5 py-1 rounded-full text-[10px] font-medium glass border border-border/40 text-muted-foreground">{c}</span>)}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 mt-4">
        <div className="glass-card p-3 grid grid-cols-3 gap-2">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-[16px] font-bold text-foreground">{s.value}</div>
              <div className="text-[9px] uppercase tracking-wide text-muted-foreground/70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected accounts */}
      <div className="px-4 mt-4">
        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-2">Connected</div>
        <div className="flex gap-2.5">
          {CONNECTED.map((c) => (
            <div key={c.label} className="w-10 h-10 rounded-full grid place-items-center glass border border-border/40">
              <c.icon className="w-[18px] h-[18px] text-muted-foreground" />
            </div>
          ))}
          <button onClick={goSettings} className="w-10 h-10 rounded-full grid place-items-center glass border border-border/40 spring-tap">
            <span className="text-[11px] font-bold text-muted-foreground">+5</span>
          </button>
        </div>
      </div>

      {/* Profile mode toggle */}
      <div className="px-4 mt-4">
        <div className="glass rounded-full p-1 flex border border-border/40">
          {["social", "academic"].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-full text-[12px] font-semibold capitalize spring-tap ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{m}</button>
          ))}
        </div>
      </div>

      {/* Profile content */}
      <div className="px-4 mt-4">
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {mode === "social" ? <MeSocial bio={bio} /> : <MeAcademic user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Settings — preserved (logout, account, preferences) */}
      <div ref={settingsRef} className="px-4 mt-6">
        <SettingsSection user={user} />
      </div>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} user={user} />
    </div>
  );
}