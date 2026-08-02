import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Image } from "@/components/ui/image";
import { resolveDisplayName } from "@/lib/userDisplayName";
import EditProfileModal from "@/components/me/EditProfileModal";
import QRShareSheet from "@/components/shared/QRShareSheet";
import MeSocial from "@/components/me/MeSocial";
import MeAcademic from "@/components/me/MeAcademic";
import { Settings, QrCode, Share2, Edit3, Bookmark, Shield, Heart, FolderOpen, Link2 } from "lucide-react";

const CHIPS = ["Student", "Creator", "Computer Science", "300 Level", "Verified", "Class Rep"];
const STATS = [
  { label: "Posts", value: 0 },
  { label: "Followers", value: 0 },
  { label: "Following", value: 0 },
];
const CONNECTED = ["GitHub", "LinkedIn", "Portfolio", "Instagram", "TikTok", "X"];

const QUICK_ACCESS = [
  { id: "highlights",  label: "Highlights",  to: "/highlights",                icon: Bookmark },
  { id: "saved",       label: "Saved",       to: "/highlights",                icon: Heart },
  { id: "collections", label: "Collections", to: "/highlights",                icon: FolderOpen },
  { id: "settings",    label: "Settings",    to: "/settings",                  icon: Settings },
  { id: "privacy",     label: "Privacy",     to: "/settings",                  icon: Shield },
  { id: "accounts",    label: "Connected",  to: "/settings/connected-accounts", icon: Link2 },
];

/**
 * Me — premium content-first student profile.
 * No settings. Ends after user content.
 * Flow: Header → Identity → Stats → Connected → About → Highlights → Pinned → Posts → End
 */
export default function Me() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [mode, setMode] = useState("social");
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

  const handleQR = () => setQrOpen(true);
  const goSettings = () => navigate("/settings");

  return (
    <div className="w-full max-w-[520px] mx-auto pb-36 safe-area-pt">
      {/* Cover */}
      <div className="relative w-full h-32 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.02))" }}
        />
      </div>

      {/* Avatar */}
      <div className="px-6 -mt-12 relative">
        <div className="w-20 h-20 rounded-full border-4 border-background overflow-hidden grid place-items-center text-[26px] font-semibold text-foreground bg-muted/40">
          {user?.avatar_url ? <Image src={user.avatar_url} alt={name} fittingType="fill" className="w-full h-full" /> : initials}
        </div>
      </div>

      {/* Identity + Actions */}
      <div className="px-6 pt-4">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <h1 className="text-[24px] font-bold text-foreground truncate tracking-tight leading-tight">{name}</h1>
            {handle && <p className="text-[13px] text-muted-foreground truncate mt-0.5">{handle}</p>}
            <p className="text-[12px] text-muted-foreground/70 mt-0.5">{university}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setEditing(true)} className="w-9 h-9 rounded-full bg-card border border-border grid place-items-center spring-tap hover:bg-muted/30 transition-colors" aria-label="Edit profile"><Edit3 className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={1.7} /></button>
            <button onClick={handleShare} className="w-9 h-9 rounded-full bg-card border border-border grid place-items-center spring-tap hover:bg-muted/30 transition-colors" aria-label="Share profile"><Share2 className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={1.7} /></button>
            <button onClick={handleQR} className="w-9 h-9 rounded-full bg-card border border-border grid place-items-center spring-tap hover:bg-muted/30 transition-colors" aria-label="QR code"><QrCode className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={1.7} /></button>
            <button onClick={goSettings} className="w-9 h-9 rounded-full bg-card border border-border grid place-items-center spring-tap hover:bg-muted/30 transition-colors" aria-label="Settings"><Settings className="w-[16px] h-[16px] text-muted-foreground" strokeWidth={1.7} /></button>
          </div>
        </div>
        <p className="text-[15px] text-muted-foreground mt-4 leading-relaxed">{bio}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {CHIPS.map((c) => <span key={c} className="px-3 py-1 rounded-full text-[11px] font-medium bg-muted/40 border border-border text-muted-foreground">{c}</span>)}
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 mt-8">
        <div className="grid grid-cols-3 gap-0 border-t border-b border-border">
          {STATS.map((s, i) => (
            <div key={s.label} className={`text-center py-4 ${i > 0 ? "border-l border-border" : ""}`}>
              <div className="text-[20px] font-bold text-foreground display-number">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected */}
      <div className="px-6 mt-8">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Connected</span>
        <div className="flex flex-wrap gap-2">
          {CONNECTED.map((c) => (
            <span key={c} className="px-3 py-1.5 rounded-full bg-muted/40 border border-border text-[12px] font-medium text-muted-foreground">{c}</span>
          ))}
          <button onClick={goSettings} className="px-3 py-1.5 rounded-full bg-muted/40 border border-border text-[12px] font-medium text-muted-foreground spring-tap">+5</button>
        </div>
      </div>

      {/* Quick Access — personal destinations */}
      <div className="px-6 mt-8">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">Quick Access</span>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACCESS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.to)}
                className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-card border border-border spring-tap hover:bg-muted/30 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl glass-card grid place-items-center shrink-0">
                  <Icon className="w-4 h-4 text-foreground" strokeWidth={1.8} />
                </div>
                <span className="text-[13px] font-medium text-foreground truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile mode toggle */}
      <div className="px-6 mt-8">
        <div className="flex bg-muted/40 rounded-xl p-1">
          {["social", "academic"].map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2.5 rounded-lg text-[13px] font-semibold capitalize spring-tap transition-all ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{m}</button>
          ))}
        </div>
      </div>

      {/* Profile content — ends here, no settings */}
      <div className="px-6 mt-6">
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
            {mode === "social" ? <MeSocial bio={bio} user={user} /> : <MeAcademic user={user} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <EditProfileModal open={editing} onClose={() => setEditing(false)} user={user} />
      <QRShareSheet open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}