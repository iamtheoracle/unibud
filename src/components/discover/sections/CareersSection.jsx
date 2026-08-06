import React from "react";
import { Link } from "react-router-dom";
import { Briefcase, Award, Building2, FileText, Rocket, GraduationCap } from "lucide-react";
import { SectionTitle, ItemCard, EmptyHint } from "@/components/discover/DiscoverShared";

/**
 * CareersSection — intelligent career hub. Quick links first, then live
 * opportunities and scholarships recommended by degree, faculty and goals.
 */
export default function CareersSection({ data }) {
  const opps = (data.opportunities || []).slice(0, 4);
  const schol = (data.scholarships || []).slice(0, 3);

  const links = [
    { icon: Briefcase, label: "Career Hub", subtitle: "Jobs & internships", to: "/career", color: "information" },
    { icon: Award, label: "Scholarships", subtitle: "Funding & grants", to: "/scholarships", color: "success" },
    { icon: Building2, label: "Companies", subtitle: "Hiring & sponsors", to: "/companies", color: "warning" },
    { icon: FileText, label: "CV Builder", subtitle: "Professional CV", to: "/cv-builder", color: "primary" },
    { icon: Rocket, label: "Competitions", subtitle: "Challenge yourself", to: "/challenges", color: "error" },
  ];

  const empty = !opps.length && !schol.length;

  return (
    <div className="space-y-5">
      <div>
        <SectionTitle icon={Briefcase} title="Careers" action={<Link to="/career" className="text-[11px] font-semibold text-primary">See all</Link>} />
        <div className="px-5 space-y-2.5">
          {links.map((l) => <ItemCard key={l.to} icon={l.icon} title={l.label} subtitle={l.subtitle} to={l.to} color={l.color} />)}
        </div>
      </div>

      {opps.length > 0 && (
        <div>
          <SectionTitle icon={Award} title="Opportunities for you" />
          <div className="px-5 space-y-2.5">
            {opps.map((o) => <ItemCard key={o.id} icon={Briefcase} title={o.title} subtitle={o.organization} right={o.amount} to="/opportunities" color="success" />)}
          </div>
        </div>
      )}

      {schol.length > 0 && (
        <div>
          <SectionTitle icon={GraduationCap} title="Scholarships" />
          <div className="px-5 space-y-2.5">
            {schol.map((s) => <ItemCard key={s.id} icon={GraduationCap} title={s.title} subtitle={s.provider} to="/scholarships" color="success" />)}
          </div>
        </div>
      )}

      {empty && (
        <EmptyHint icon={Briefcase} title="No opportunities yet" desc="Spark will recommend internships, jobs, and scholarships based on your degree, faculty, and goals." />
      )}
    </div>
  );
}