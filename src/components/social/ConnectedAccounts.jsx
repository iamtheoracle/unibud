import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Check } from "lucide-react";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", color: "#E4405F" },
  { key: "tiktok", label: "TikTok", color: "#010101" },
  { key: "x", label: "X (Twitter)", color: "#000000" },
  { key: "linkedin", label: "LinkedIn", color: "#0A66C2" },
  { key: "facebook", label: "Facebook", color: "#1877F2" },
  { key: "discord", label: "Discord", color: "#5865F2" },
  { key: "reddit", label: "Reddit", color: "#FF4500" },
  { key: "youtube", label: "YouTube", color: "#FF0000" },
  { key: "telegram", label: "Telegram", color: "#229ED9" },
  { key: "whatsapp", label: "WhatsApp", color: "#25D366" },
  { key: "threads", label: "Threads", color: "#000000" },
  { key: "pinterest", label: "Pinterest", color: "#BD081C" },
  { key: "snapchat", label: "Snapchat", color: "#FFFC00", fg: "#000" },
];

const KEY = "unibud_social_connections";

/**
 * ConnectedAccounts — opt-in, revocable social connections. Everything is
 * local and permissive: Bud never posts, never reads private messages, and
 * any permission can be revoked instantly.
 */
export default function ConnectedAccounts() {
  const [connected, setConnected] = useState({});
  useEffect(() => { try { setConnected(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {} }, []);
  const toggle = (key) => {
    setConnected((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <div className="p-4 rounded-[22px] glass">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-4 h-4 text-primary" strokeWidth={2} />
        <p className="font-heading font-semibold text-[14px] text-foreground">Connected accounts</p>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3 leading-snug">
        Opt in to the platforms you want Bud to draw from. Everything is opt-in — Bud never posts or reads private messages, and you can revoke any account instantly.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {PLATFORMS.map((p) => {
          const on = !!connected[p.key];
          return (
            <button key={p.key} onClick={() => toggle(p.key)} className={`flex items-center gap-2.5 p-2.5 rounded-[16px] border spring-tap ${on ? "bg-primary/8 border-primary/40" : "bg-card border-border/40"}`}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0" style={{ background: p.color, color: p.fg || "#fff" }}>{p.label[0]}</span>
              <span className="flex-1 min-w-0 text-left">
                <span className="block text-[12px] font-medium text-foreground truncate">{p.label}</span>
                <span className={`block text-[10px] ${on ? "text-primary" : "text-muted-foreground"}`}>{on ? "Connected" : "Connect"}</span>
              </span>
              {on && <Check className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2.4} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}