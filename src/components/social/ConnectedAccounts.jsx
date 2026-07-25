import React, { useState, useEffect } from "react";
import { Shield, Check, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

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

// Real per-student OAuth connectors (workspace-registered)
const OAUTH = {
  tiktok: "6a64d08fb9414f10f292dac6",
  discord: "6a64cbde892c4603ea7adbd1",
};

const KEY = "unibud_social_connections";

/**
 * ConnectedAccounts — opt-in, revocable social connections. TikTok & Discord
 * use real per-student OAuth; the rest are local opt-in toggles. Bud never
 * posts or reads private messages, and any account can be revoked instantly.
 */
export default function ConnectedAccounts() {
  const [connected, setConnected] = useState({});
  const [authed, setAuthed] = useState(false);
  const [busy, setBusy] = useState({});

  useEffect(() => {
    try { setConnected(JSON.parse(localStorage.getItem(KEY) || "{}")); } catch {}
    base44.auth.isAuthenticated().then(setAuthed);
  }, []);

  const detect = async (key) => {
    try {
      const res = await base44.functions.invoke("socialProfile", { connector: key });
      const ok = res?.data?.connected || res?.connected || false;
      setConnected((p) => {
        const n = { ...p, [key]: ok };
        try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {}
        return n;
      });
      return ok;
    } catch {
      setConnected((p) => ({ ...p, [key]: false }));
      return false;
    }
  };

  useEffect(() => {
    if (!authed) return;
    Object.keys(OAUTH).forEach((k) => detect(k));
  }, [authed]);

  const handleConnect = async (key) => {
    if (!authed) { base44.auth.redirectToLogin(); return; }
    setBusy((b) => ({ ...b, [key]: true }));
    try {
      const urlRes = await base44.connectors.connectAppUser(OAUTH[key]);
      const url = typeof urlRes === "string" ? urlRes : urlRes?.url;
      const popup = window.open(url, "_blank");
      const timer = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(timer);
          detect(key).finally(() => setBusy((b) => ({ ...b, [key]: false })));
        }
      }, 500);
    } catch {
      setBusy((b) => ({ ...b, [key]: false }));
    }
  };

  const handleDisconnect = async (key) => {
    setBusy((b) => ({ ...b, [key]: true }));
    try {
      await base44.connectors.disconnectAppUser(OAUTH[key]);
      setConnected((p) => {
        const n = { ...p, [key]: false };
        try { localStorage.setItem(KEY, JSON.stringify(n)); } catch {}
        return n;
      });
    } finally {
      setBusy((b) => ({ ...b, [key]: false }));
    }
  };

  const onClick = (key) => {
    if (busy[key]) return;
    if (OAUTH[key]) {
      connected[key] ? handleDisconnect(key) : handleConnect(key);
    } else {
      setConnected((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
        return next;
      });
    }
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
          const isOAuth = !!OAUTH[p.key];
          return (
            <button key={p.key} onClick={() => onClick(p.key)} className={`flex items-center gap-2.5 p-2.5 rounded-[16px] border spring-tap ${on ? "bg-primary/8 border-primary/40" : "bg-card border-border/40"}`}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: p.color, color: p.fg || "#fff" }}>{p.label[0]}</span>
              <span className="flex-1 min-w-0 text-left">
                <span className="flex items-center gap-1">
                  <span className="block text-[12px] font-medium text-foreground truncate">{p.label}</span>
                  {isOAuth && <span className="text-[8px] font-bold text-primary bg-primary/10 px-1 rounded">OAuth</span>}
                </span>
                <span className={`block text-[10px] ${on ? "text-primary" : "text-muted-foreground"}`}>
                  {busy[p.key] ? "Connecting…" : on ? "Connected" : authed || !isOAuth ? "Connect" : "Sign in to connect"}
                </span>
              </span>
              {busy[p.key] ? <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" /> : on ? <Check className="w-4 h-4 text-primary flex-shrink-0" strokeWidth={2.4} /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}