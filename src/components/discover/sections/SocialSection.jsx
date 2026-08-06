import React from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, HeartHandshake } from "lucide-react";
import { SectionTitle, ItemCard, EmptyHint, COLOR } from "@/components/discover/DiscoverShared";

/**
 * SocialSection — people discovery: communities, clubs, study groups,
 * mentorship. Recommended friends/partners come later; the structure stays
 * focused on people, never financial or academic-dashboard content.
 */
export default function SocialSection({ data }) {
  const clubs = (data.clubs || []).slice(0, 4);
  const comm = (data.communities || []).slice(0, 4);

  const spaces = [
    { icon: Users, label: "Communities", to: "/communities", color: "primary" },
    { icon: BookOpen, label: "Study Groups", to: "/study-groups", color: "information" },
    { icon: HeartHandshake, label: "Mentorship", to: "/mentorship", color: "success" },
    { icon: Users, label: "Find Friends", to: "/connect", color: "warning" },
  ];

  const empty = !clubs.length && !comm.length;

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={Users} title="Social" />
        <div className="px-5 grid grid-cols-2 gap-2.5">
          {spaces.map((s) => {
            const c = COLOR[s.color] || COLOR.primary;
            return (
              <Link key={s.to} to={s.to} className="flex items-center gap-2.5 p-3 rounded-[18px] bg-card soft-shadow border border-border/40 spring-tap card-hover">
                <div className={`w-9 h-9 rounded-[12px] ${c.bg} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className={`w-4 h-4 ${c.text}`} strokeWidth={2.2} />
                </div>
                <span className="text-[12px] font-semibold text-foreground truncate">{s.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {clubs.length > 0 && (
        <div>
          <SectionTitle title="Clubs" />
          <div className="px-5 space-y-2.5">
            {clubs.map((c) => <ItemCard key={c.id} icon={Users} title={c.name} subtitle={c.category} to="/clubs" color="warning" />)}
          </div>
        </div>
      )}

      {comm.length > 0 && (
        <div>
          <SectionTitle title="Communities" />
          <div className="px-5 space-y-2.5">
            {comm.map((c) => <ItemCard key={c.id} icon={Users} title={c.name} subtitle={c.description} to="/communities" color="primary" />)}
          </div>
        </div>
      )}

      {empty && (
        <EmptyHint icon={Users} title="Build your circle" desc="Join communities and clubs — Spark will suggest friends, study partners, and mentors." />
      )}
    </div>
  );
}