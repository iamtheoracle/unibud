import React from "react";
import { Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";
import { useDemoMode } from "@/lib/DemoModeContext";

const DEMO_MATCHES = [
  { id: "d1", name: "Chioma Eze", course: "CSC 302", avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" },
  { id: "d2", name: "David Okonkwo", course: "PHY 203", avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80" },
  { id: "d3", name: "Aisha Bello", course: "CSC 302", avatar_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&q=80" },
];

export default function StudyMatching() {
  const { isDemoMode } = useDemoMode();

  const { data: connections, isLoading } = useQuery({
    queryKey: ["studyMatches"],
    queryFn: () => base44.entities.SocialConnection.list("-created_date", 5),
    enabled: !isDemoMode,
  });

  const matches = isDemoMode
    ? DEMO_MATCHES
    : (connections || []).map((c) => ({
        id: c.id,
        name: c.full_name || c.name || "Student",
        course: c.course_code || c.department || "",
        avatar_url: c.avatar_url || c.image || "",
      }));

  return (
    <div className="px-4 pb-8">
      <div className="flex items-center gap-1.5 mb-3 px-1">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-[16px] text-foreground">Study Partners</h3>
      </div>
      {isLoading && !isDemoMode ? (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {[1, 2, 3].map((i) => <div key={i} className="w-[145px] h-[180px] rounded-[20px] shimmer flex-shrink-0" />)}
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-card rounded-[20px] soft-shadow border border-border/40">
          <EmptyState icon={Users} title="No study partners yet" description="Connect with classmates in your courses to find study partners" action={<Link to="/study-groups" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap">Join Groups</Link>} />
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {matches.map((m, i) => (
            <motion.div
              key={m.id || i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3 flex-shrink-0 w-[145px] card-hover"
            >
              <div className="relative">
                {m.avatar_url ? (
                  <img src={m.avatar_url} alt={m.name} className="w-full h-20 rounded-[14px] object-cover mb-2.5" />
                ) : (
                  <div className="w-full h-20 rounded-[14px] bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-2.5">
                    <Users className="w-8 h-8 text-primary/50" />
                  </div>
                )}
              </div>
              <p className="font-heading font-semibold text-[12px] text-foreground truncate">{m.name}</p>
              <p className="text-[10px] text-muted-foreground">{m.course}</p>
              <button className="w-full mt-2 py-1.5 rounded-[12px] bg-primary/10 text-primary text-[11px] font-semibold spring-tap">Connect</button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}