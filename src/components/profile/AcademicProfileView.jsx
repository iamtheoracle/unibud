import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  GraduationCap, Building2, BookOpen, Award, FolderGit2, Users,
  Sparkles, Briefcase, Calendar, Inbox,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-[12px] text-muted-foreground w-24">{label}</span>
      <span className="text-[13px] font-medium text-foreground flex-1">{value}</span>
    </div>
  );
}

function Section({ icon: Icon, title, children, empty }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Icon className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[15px] text-foreground">{title}</h2>
      </div>
      {empty ? (
        <div className="rounded-2xl bg-card border border-border/30">
          <EmptyState icon={Inbox} title={`No ${title.toLowerCase()} yet`} description="" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default function AcademicProfileView({ user }) {
  const { data: projects } = useQuery({
    queryKey: ["profileProjects", user?.id],
    queryFn: () => base44.entities.PortfolioItem.filter({ created_by_id: user.id, status: "published" }, "-created_date", 50),
    enabled: !!user,
  });

  const { data: achievements } = useQuery({
    queryKey: ["profileAchievements", user?.id],
    queryFn: () => base44.entities.StudentAchievement.filter({ created_by_id: user.id }, "-created_date", 50),
    enabled: !!user,
  });

  const { data: communities } = useQuery({
    queryKey: ["profileCommunities", user?.id],
    queryFn: () => base44.entities.Community.filter({ university: user.university || "" }, "-members_count", 50),
    enabled: !!user && !!user.university,
  });

  const myCommunities = useMemo(
    () => (communities || []).filter((c) => (c.members || []).some((m) => m.user_id === user?.id)),
    [communities, user?.id]
  );

  const skills = useMemo(() => {
    const set = new Set();
    (projects || []).forEach((p) => (p.skills || []).forEach((s) => set.add(s)));
    (user?.skills || []).forEach((s) => set.add(s));
    return [...set];
  }, [projects, user?.skills]);

  const hasIdentity = user?.university || user?.faculty || user?.department || user?.level || user?.course_code;

  return (
    <div className="px-5 pt-5 pb-8">
      {/* Academic identity */}
      <Section icon={GraduationCap} title="Academic profile" empty={!hasIdentity}>
        {hasIdentity && (
          <div className="rounded-2xl bg-card border border-border/30 px-4 py-2">
            <InfoRow icon={Building2} label="University" value={user?.university} />
            <InfoRow icon={Building2} label="Faculty" value={user?.faculty} />
            <InfoRow icon={BookOpen} label="Department" value={user?.department} />
            <InfoRow icon={Briefcase} label="Program" value={user?.course_code} />
            <InfoRow icon={GraduationCap} label="Level" value={user?.level ? `${user.level} Level` : ""} />
            <InfoRow icon={Calendar} label="Enrolled" value={user?.enrollment_year ? String(user.enrollment_year) : ""} />
          </div>
        )}
      </Section>

      {/* Skills */}
      {skills.length > 0 && (
        <Section icon={Sparkles} title="Skills">
          <div className="flex flex-wrap gap-2">
            {skills.map((s, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[12px] font-medium">{s}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Projects */}
      <Section icon={FolderGit2} title="Projects" empty={(projects || []).length === 0}>
        {(projects || []).length > 0 && (
          <div className="space-y-3">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.2) }}
                className="rounded-2xl bg-card border border-border/30 overflow-hidden card-hover"
              >
                {p.cover_url && <img src={p.cover_url} alt="" className="w-full h-32 object-cover" />}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-[14px] text-foreground">{p.title}</h3>
                    {p.is_featured && <Award className="w-3.5 h-3.5 text-warning" />}
                  </div>
                  {p.description && <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{p.description}</p>}
                  {p.skills && p.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {p.skills.slice(0, 4).map((s, j) => (
                        <span key={j} className="px-2 py-0.5 rounded-full bg-muted text-[10px] font-medium text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  )}
                  {p.external_link && (
                    <a href={p.external_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-semibold text-primary">
                      View project →
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* Achievements */}
      <Section icon={Award} title="Achievements" empty={(achievements || []).length === 0}>
        {(achievements || []).length > 0 && (
          <div className="space-y-2">
            {achievements.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border/30 p-3.5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[13px] text-foreground truncate">{a.title}</h3>
                  {a.issuer && <p className="text-[11px] text-muted-foreground">{a.issuer}</p>}
                </div>
                {a.date && <span className="text-[10px] text-muted-foreground">{new Date(a.date).getFullYear()}</span>}
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Communities */}
      <Section icon={Users} title="Academic communities" empty={myCommunities.length === 0}>
        {myCommunities.length > 0 && (
          <div className="space-y-2">
            {myCommunities.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border/30 p-3.5">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `hsl(${c.accent_color || "160 72% 34%"} / 0.12)` }}>
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[13px] text-foreground truncate">{c.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{c.members_count || 0} members</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}