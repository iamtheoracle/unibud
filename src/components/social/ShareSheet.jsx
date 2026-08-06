import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Check } from "lucide-react";

const PLATFORMS = [
  { key: "whatsapp", label: "WhatsApp", color: "#25D366", url: (t, u) => `https://wa.me/?text=${encodeURIComponent((t || "") + (u ? " " + u : ""))}` },
  { key: "telegram", label: "Telegram", color: "#229ED9", url: (t, u) => `https://t.me/share/url?url=${encodeURIComponent(u || "")}&text=${encodeURIComponent(t || "")}` },
  { key: "x", label: "X", color: "#000000", url: (t, u) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t || "")}${u ? `&url=${encodeURIComponent(u)}` : ""}` },
  { key: "facebook", label: "Facebook", color: "#1877F2", url: (t, u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u || "")}` },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2", url: (t, u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u || "")}` },
  { key: "reddit", label: "Reddit", color: "#FF4500", url: (t, u) => `https://www.reddit.com/submit?title=${encodeURIComponent(t || "")}&url=${encodeURIComponent(u || "")}` },
  { key: "instagram", label: "Instagram", color: "#E4405F", url: null },
  { key: "tiktok", label: "TikTok", color: "#010101", url: null },
  { key: "threads", label: "Threads", color: "#000000", url: null },
  { key: "discord", label: "Discord", color: "#5865F2", url: null },
];

/**
 * ShareSheet — share an achievement/insight to connected platforms. Uses the
 * native Web Share API when available, with per-platform deep links as fallback.
 */
export default function ShareSheet({ open, onClose, title, text, url }) {
  const [copied, setCopied] = React.useState(false);
  const shareText = text || title || "";
  const shareUrl = url || window.location.origin;

  const native = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: title || shareText, text: shareText, url: shareUrl }); } catch {}
    } else copy();
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(`${shareText} ${shareUrl}`.trim()); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch {}
  };
  const openPlat = (p) => {
    if (p.url) window.open(p.url(shareText, shareUrl), "_blank", "noopener,noreferrer");
    else copy();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 360, damping: 36 }} className="relative w-full max-w-[520px] glass-strong rounded-t-[32px] p-5 pb-7 safe-area-pb">
            <div className="flex items-center justify-between mb-4">
              <p className="font-heading font-bold text-[16px] text-foreground">Share</p>
              <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap" aria-label="Close"><X className="w-4 h-4" /></button>
            </div>
            <p className="text-[12px] text-muted-foreground mb-3 truncate">{shareText}</p>
            <button onClick={native} className="w-full h-12 rounded-[18px] bg-primary text-primary-foreground font-semibold text-[14px] flex items-center justify-center gap-2 spring-tap ice-glow mb-3">
              {navigator.share ? "Share via device…" : (copied ? <><Check className="w-4 h-4" /> Copied link</> : <><Link2 className="w-4 h-4" /> Copy link</>)}
            </button>
            <div className="grid grid-cols-5 gap-3">
              {PLATFORMS.map((p) => (
                <button key={p.key} onClick={() => openPlat(p)} className="flex flex-col items-center gap-1.5 spring-tap">
                  <span className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[14px]" style={{ background: p.color }}>
                    {p.label[0]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{p.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/70 text-center mt-4">Bud never posts automatically. You're always in control.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}