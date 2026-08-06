import React from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

/**
 * CommunityMembers — member roster with role badges.
 */
export default function CommunityMembers({ community, onMessage, accentColor }) {
  const accent = accentColor || "0 0% 100%";
  const members = community?.members || [];

  if (members.length === 0) {
    return <EmptyState icon={Users} title="No members yet" description="Be the first to join this community." />;
  }

  const roleOrder = { leader: 0, admin: 1, moderator: 2, member: 3 };
  const sorted = [...members].sort((a, b) => (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3));

  return (
    <div className="space-y-2">
      {sorted.map((member, i) => {
        const isStaff = ["admin", "leader", "moderator"].includes(member.role);
        return (
          <motion.div
            key={member.user_id || i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className="crystal-card p-3 flex items-center gap-3 hover-lift spring-tap edge-light"
          >
            {member.image ? (
              <img src={member.image} alt="" className="w-11 h-11 rounded-full object-cover" loading="lazy" />
            ) : (
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-primary-foreground font-bold text-[14px]"
                style={{ background: `hsl(${accent})` }}
              >
                {(member.name || "U").charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-[13px] text-foreground truncate">{member.name}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{member.role}</p>
            </div>
            {isStaff && (
              <span
                className="px-2 py-0.5 rounded-full text-[9px] font-bold capitalize"
                style={{ background: `hsl(${accent} / 0.12)`, color: `hsl(${accent})` }}
              >
                {member.role}
              </span>
            )}
            {onMessage && member.user_id && (
              <button
                onClick={() => onMessage(member)}
                className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap"
              >
                <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}