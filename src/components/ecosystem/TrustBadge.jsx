import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ShieldCheck, Star } from "lucide-react";

const LEVELS = {
  star: { label: "Star Seller", color: "text-warning", bg: "bg-warning/15" },
  trusted: { label: "Trusted", color: "text-success", bg: "bg-success/15" },
  verified: { label: "Verified", color: "text-primary", bg: "bg-primary/15" },
  unverified: { label: "Unverified", color: "text-muted-foreground", bg: "bg-muted" },
  new: { label: "New", color: "text-muted-foreground", bg: "bg-muted" },
};

export default function TrustBadge({ userId, compact = false }) {
  const { data } = useQuery({
    queryKey: ["trustScore", userId],
    queryFn: () => base44.entities.TrustScore.filter({ user_id: userId }),
    enabled: !!userId,
  });
  const s = data?.[0];
  if (!s) return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${LEVELS.new.bg} ${LEVELS.new.color}`}><ShieldCheck className="w-3 h-3" />New</span>;
  const lv = LEVELS[s.level] || LEVELS.new;
  if (compact) return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${lv.bg} ${lv.color}`}>{s.verified ? <ShieldCheck className="w-3 h-3" /> : <Star className="w-3 h-3" />}{lv.label} · {s.score}</span>;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-semibold ${lv.bg} ${lv.color}`}>
      {s.verified ? <ShieldCheck className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
      <span>{lv.label}</span>
      <span className="opacity-60">·</span>
      <span>{s.score}/100</span>
      <span className="opacity-60">·</span>
      <span>{s.reviews_count} review{s.reviews_count === 1 ? "" : "s"}</span>
    </div>
  );
}