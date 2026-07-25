import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, BookOpen, Users2, Store, ShieldCheck, Flag, BadgeCheck, Star, MessageSquare, ChevronRight, ArrowLeft } from "lucide-react";

const TILES = [
  { to: "/communities", icon: Users, label: "Communities", desc: "Institution, department & course groups", color: "text-info" },
  { to: "/study-groups", icon: BookOpen, label: "Study Groups", desc: "Course revision & project teams", color: "text-primary" },
  { to: "/clubs", icon: Users2, label: "Clubs", desc: "Societies & student organizations", color: "text-success" },
  { to: "/marketplace", icon: Store, label: "Marketplace", desc: "Books, past questions, tutoring, jobs", color: "text-warning" },
];

const PILLARS = [
  { icon: BadgeCheck, title: "Verification", desc: "Verified badges for trusted sellers, groups & communities." },
  { icon: Flag, title: "Reporting", desc: "Flag any listing, group, or user for review in one tap." },
  { icon: ShieldCheck, title: "Moderation", desc: "Admins action reports and approve verifications." },
  { icon: Star, title: "Reviews", desc: "Rate sellers after every exchange — public reputation." },
  { icon: MessageSquare, title: "Trust System", desc: "A living 0–100 score from reviews, reports & verification." },
];

export default function EcosystemHub() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pb-12">
      <div className="pt-12 pb-3 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30"><ArrowLeft className="w-[18px] h-[18px]" /></button>
        <div className="flex-1"><h1 className="font-heading font-extrabold text-[22px] tracking-tight">UNIBUD Ecosystem</h1><p className="text-[12px] text-muted-foreground">Communities, marketplace & trust — all in one place.</p></div>
        <div className="w-10 h-10 rounded-full bg-primary grid place-items-center gold-glow"><Store className="w-5 h-5 text-primary-foreground" /></div>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        {TILES.map((t) => (
          <Link key={t.to} to={t.to} className="glass-card radius-lg p-4 card-hover flex flex-col gap-2">
            <div className="w-11 h-11 rounded-[14px] bg-primary/10 grid place-items-center"><t.icon className={`w-5 h-5 ${t.color}`} /></div>
            <p className="font-heading font-semibold text-[14px]">{t.label}</p>
            <p className="text-[11px] text-muted-foreground leading-snug">{t.desc}</p>
          </Link>
        ))}
      </div>

      <div className="px-4 mt-5">
        <div className="glass-card radius-lg p-4">
          <div className="flex items-center gap-2 mb-3"><ShieldCheck className="w-5 h-5 text-primary" /><h2 className="font-heading font-semibold text-[15px]">Trust & Safety</h2></div>
          <p className="text-[12px] text-muted-foreground mb-3">Every part of the ecosystem is built on five safety pillars.</p>
          <div className="space-y-2.5">
            {PILLARS.map((p) => (
              <div key={p.title} className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-[10px] bg-muted/60 grid place-items-center shrink-0"><p.icon className="w-4 h-4 text-primary" /></div>
                <div><p className="font-semibold text-[13px]">{p.title}</p><p className="text-[11px] text-muted-foreground leading-snug">{p.desc}</p></div>
              </div>
            ))}
          </div>
          <Link to="/trust" className="mt-4 w-full py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-center gap-1.5 spring-tap">View your Trust Profile<ChevronRight className="w-4 h-4" /></Link>
        </div>
      </div>
    </div>
  );
}