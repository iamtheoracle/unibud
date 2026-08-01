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
import { Settings, QrCode, Share2, Edit3, Camera, ChevronRight } from "lucide-react";

const CHIPS = ["Student", "Creator", "Computer Science", "300 Level", "Verified", "Class Rep"];
const STATS = [
  { label: "Posts", value: 42 },
  { label: "Followers", value: 156 },
  { label: "Following", value: 89 },
];
const CONNECTED = ["GitHub", "LinkedIn", "Portfolio", "Instagram", "TikTok", "X"];

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
      <div className="relative w-full h-36 overflow-hidden bg-muted/20">
        <div className="absolute inset-0" style={{ background: "radial-gradient(60% 80% at 30% 0%, hsl(var(--foreground) / 0.04), transparent 70%)" }} />
        <div className="absolute inset-0 grid place-items-center opacity-20">
          <Camera className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>

      {/* Overlapping avatar */}
      <div className="px-5 -mt-10 relative">
        <div className="w-20 h-20 rounded-full border-4 border-background overflow-hidden grid place-items-center text-[26px] font-semibold text-foreground bg-muted/40">
          {user?.avatar_url ? <Image src={user.avatar_url} alt={name} fittingType="fill" className="w-full h-full" /> : initials}
        </div>
      </div>

      {/* Profile info + actions */}
      <div className="px-5 pt-3">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold text-foreground truncate tracking-tight">{name}</h1>
            {handle && <p className="text-[13px] text-muted-foreground truncate mt-0.5">{handle}</p>}
            <p className="text-[12px] text-muted-foreground/60 mt-0.5">{university}</p>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button onClick={() => setEditing(true)} className="w-9 h-9 rounded-full bg-muted/30 grid place-items-center spring-tap hover:bg-muted/50 transition-colors"><Edit3 className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={1.7} /></button>
            <button onClick={handleShare} className="w-9 h-9 rounded-full bg-muted/30 grid place-items-center spring-tap hover:bg-muted/50 transition-colors"><Share2 className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={1.7} /></button>
            <button onClick={handleQR} className="w-9 h-9 rounded-full bg-muted/30 grid place-items-center spring-tap hover:bg-muted/50 transition-colors"><QrCode className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={1.7} /></button>
            <button onClick={goSettings} className="w-9 h-9 rounded-full bg-muted/30 grid place-items-center spring-tap hover:bg-muted/50 transition-colors"><Settings className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={1.7} /></button>
          </div>
        </div>
        <p className="text-[14px] text-muted-foreground mt-3 leading-relaxed">{bio}</p>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {CHIPS.map((c) => <span key={c} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted/25 border border-border/15 text-muted-foreground">{c}</span>)}
        </div>
      </div>

      {/* Stats — divider-based, Apple Settings style */}
      <div className="px-4 mt-5">
        <div className="grid grid-cols-3 gap-0">
          {STATS.map((s, i) => (
            <div key={s.label} className={`text-center py-2 ${i > 0 ? "border-l border-border/30" : ""}`}>
              <div className="text-[17px] font-bold text-foreground display-number">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected accounts — text-based, no icon mismatch */}
      <div className="px-5 mt-8">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-3">Connected</div>
        <div className="flex flex-wrap gap-2">
          {CONNECTED.map((c) => (
            <span key={c} className="px-3 py-1.5 rounded-full bg-muted/25 border border-border/15 text-[12px] font-medium text-muted-foreground">{c}</span>
          ))}
          <button onClick={goSettings} className="px-3 py-1.5 rounded-full bg-muted/25 border border-border/15 text-[12px] font-medium text-muted-foreground spring-tap">+5</button>
        </div>
      </div>

      {/* Profile mode toggle */}
      <div className="px-5 mt-6">
        <div className="flex bg-muted/20 rounded-xl p-1 border border-border/10">
          {["social", "academic"].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-[13px] font-medium capitalize spring-tap transition-colors ${mode === m ? "bg-foreground text-background" : "text-muted-foreground"}`}>{m}</button>
          ))}
        </div>
      </div>

      {/* Profile content */}
      <div className="px-5 mt-6">
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            {mode === "social" ? <MeSocial bio={bio} /> : <MeAcademic user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Settings */}
      <div ref={settingsRef} className="px-5 mt-8">
        <SettingsSection user={user} />
      </div>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} user={user} />
    </div>
  );
}