import React from "react";
import { BadgeCheck, ShieldCheck, QrCode } from "lucide-react";

/**
 * DigitalIdCard — a premium wallet-style student ID with QR profile,
 * verification status, and institution branding.
 */
export default function DigitalIdCard({ user, primaryId, isVerified, institution }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://unibud.app";
  const profileUrl = `${origin}/me?u=${user?.id || ""}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&bgcolor=ffffff&color=0B1F4D&data=${encodeURIComponent(profileUrl)}`;
  const idNumber = primaryId?.identifier_value || "—";
  const idLabel = primaryId?.identifier_label || primaryId?.identifier_type?.replace(/_/g, " ") || "Student ID";

  return (
    <div className="relative overflow-hidden rounded-[28px] p-5 text-white premium-shadow"
      style={{ background: "linear-gradient(135deg, #0B1F4D 0%, #14306b 55%, #1d4ed8 130%)" }}>
      <div className="absolute -top-16 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 -left-10 w-52 h-52 rounded-full bg-sky-400/15 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-[10px] bg-white/15 backdrop-blur flex items-center justify-center">
            <span className="font-display font-extrabold text-[15px]">U</span>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-wide opacity-80">UNIBUD</p>
            <p className="text-[9px] opacity-70 -mt-0.5">Campus Identity</p>
          </div>
        </div>
        {isVerified ? (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-400/25 text-emerald-50 border border-emerald-300/30">
            <BadgeCheck className="w-3 h-3" /> Verified
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-white/10 text-white/70 border border-white/15">
            <ShieldCheck className="w-3 h-3" /> Unverified
          </span>
        )}
      </div>

      <div className="relative mt-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/15 flex items-center justify-center text-[20px] font-semibold">
          {(user?.full_name || user?.preferred_name || "?").charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-bold text-[18px] leading-tight truncate">
            {user?.preferred_name || user?.full_name || "Student"}
          </p>
          <p className="text-[11px] opacity-75 truncate">{institution}</p>
          <p className="text-[10px] opacity-60 mt-0.5 truncate">{user?.email}</p>
        </div>
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-[9px] uppercase tracking-wider opacity-60">{idLabel}</p>
          <p className="font-mono text-[15px] font-semibold tracking-wide mt-0.5">{idNumber}</p>
          <p className="text-[9px] opacity-55 mt-2">Issued {primaryId?.issued_at ? new Date(primaryId.issued_at).toLocaleDateString() : "—"}</p>
        </div>
        <div className="rounded-[14px] bg-white p-1.5 ice-glow">
          <img src={qrSrc} alt="QR profile" className="w-[72px] h-[72px] rounded-[8px]" loading="lazy" />
          <p className="text-[8px] text-center text-slate-500 font-semibold mt-0.5 flex items-center justify-center gap-0.5">
            <QrCode className="w-2.5 h-2.5" /> Scan
          </p>
        </div>
      </div>
    </div>
  );
}