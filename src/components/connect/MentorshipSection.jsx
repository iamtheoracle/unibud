import React from "react";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_MENTORS = [
  { id: "d1", name: "Dr. Adeyemi", role: "lecturer", bio: "Algorithms, Data Structures", rating: 4.9, mentorship_count: 95, avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&q=80", is_verified: true },
  { id: "d2", name: "Prof. Okafor", role: "lecturer", bio: "Linear Algebra, Calculus", rating: 4.8, mentorship_count: 120, avatar_url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&q=80", is_verified: true },
  { id: "d3", name: "Emeka Nwosu", role: "alumni", bio: "Software Engineering at Google", rating: 5.0, mentorship_count: 48, avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80", is_verified: true },
];

const ROLE_LABELS = {
  senior_student: "Senior Student",
  alumni: "Alumni",
  lecturer: "Lecturer",
  researcher: "Researcher",
  industry_professional: "Industry Professional",
};

export default function MentorshipSection() {
  const { isDemoMode } = useDemoMode();

  const { data: mentors, isLoading } = useQuery({
    queryKey: ["connectMentors"],
    queryFn: () => base44.entities.Mentor.filter({ availability: "available" }, "-rating", 5),
    enabled: !isDemoMode,
  });

  const mentorList = isDemoMode ? DEMO_MENTORS : (mentors || []);

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-[16px] text-foreground">Find a Mentor</h3>
      </div>
      {isLoading && !isDemoMode ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[1, 2, 3].map((i) => <div key={i} className="w-[205px] h-[200px] rounded-[20px] shimmer flex-shrink-0" />)}
        </div>
      ) : mentorList.length === 0 ? (
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
          <EmptyState icon={Sparkles} title="No mentors available" description="Browse our mentorship directory to find a mentor" action={<Link to="/mentorship" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">Browse Mentors</Link>} />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {mentorList.map((m, i) => (
            <motion.div
              key={m.id || i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={isDemoMode ? "/mentorship" : "/mentor/" + m.id} className="block">
                <div className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex-shrink-0 w-[205px] card-hover">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    {m.avatar_url ? (
                      <img src={m.avatar_url} alt={m.name} className="w-11 h-11 rounded-full object-cover" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm">{(m.name || "M").charAt(0)}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-heading font-semibold text-[12px] text-foreground truncate">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{ROLE_LABELS[m.role] || m.role || ""}</p>
                    </div>
                    {m.is_verified && (
                      <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    )}
                  </div>
                  {m.bio && <p className="text-[10px] text-foreground mb-2 leading-snug truncate">{m.bio}</p>}
                  <div className="flex items-center gap-2 mb-2.5">
                    {m.rating > 0 && <span className="text-[10px] font-semibold text-warning">★ {m.rating}</span>}
                    <span className="text-[10px] text-muted-foreground">{m.mentorship_count || 0} sessions</span>
                  </div>
                  <button className="w-full py-2 rounded-[12px] bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">Request</button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}