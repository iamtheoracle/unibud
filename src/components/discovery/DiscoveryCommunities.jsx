import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

// Communities — real Community records, scoped to the viewer's university when
// available. Join/leave toggles real membership.
export default function DiscoveryCommunities({ user }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(null);

  const { data } = useQuery({
    queryKey: ["discoveryCommunities", user?.university],
    queryFn: () =>
      user?.university
        ? base44.entities.Community.filter({ university: user.university }, "-members_count", 12)
        : base44.entities.Community.list("-members_count", 12),
    enabled: !!user,
  });

  const communities = data || [];
  if (communities.length === 0) return null;

  const isMember = (c) => (c.members || []).some((m) => m.user_id === user?.id);

  const toggleJoin = async (c) => {
    if (!user) return;
    setBusy(c.id);
    try {
      const members = c.members || [];
      const member = isMember(c);
      const newMembers = member
        ? members.filter((m) => m.user_id !== user.id)
        : [...members, { user_id: user.id, name: user.full_name, role: "member", joined_at: new Date().toISOString() }];
      await base44.entities.Community.update(c.id, { members: newMembers, members_count: newMembers.length });
      qc.invalidateQueries({ queryKey: ["discoveryCommunities", user.university] });
    } catch {
      // RLS may restrict; silently ignore
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3 px-5">
        <Users className="w-4 h-4 text-primary" />
        <h2 className="font-heading font-bold text-[15px] text-foreground">Communities</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
        {communities.map((c, i) => {
          const member = isMember(c);
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex-shrink-0 w-[180px] rounded-2xl bg-card border border-border/30 p-3.5 flex flex-col"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="font-heading font-semibold text-[13px] text-foreground line-clamp-1">{c.name}</p>
              {c.description && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 flex-1">{c.description}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">{c.members_count || 0} members</span>
                <button
                  onClick={() => toggleJoin(c)}
                  disabled={busy === c.id}
                  className={"px-3 h-7 rounded-full text-[11px] font-semibold spring-tap disabled:opacity-50 " + (member ? "bg-muted text-muted-foreground" : "bg-foreground text-background")}
                >
                  {member ? "Joined" : "Join"}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}