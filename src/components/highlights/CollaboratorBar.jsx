import React from "react";
import { motion } from "framer-motion";
import { UserPlus, Crown } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const ROLE_COLORS = {
  owner: "text-gold",
  manager: "text-primary",
  editor: "text-information",
  contributor: "text-success",
  viewer: "text-muted-foreground",
};

/**
 * CollaboratorBar — compact stacked-avatar display of current
 * collaborators with an invite button. Shown above the highlights
 * list when a folder has collaborators or when the owner can invite.
 */
export default function CollaboratorBar({ collaborators, onInvite, ownerName }) {
  const display = collaborators.slice(0, 5);
  const extra = collaborators.length - display.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="flex items-center gap-3 p-3 rounded-[16px] glass-card mb-3"
    >
      <div className="flex -space-x-2">
        {display.map((c, i) => (
          <motion.div
            key={c.user_id}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
            className="w-8 h-8 rounded-full glass-strong border-2 border-background grid place-items-center shrink-0"
            title={`${c.name} · ${c.role}`}
          >
            {c.image ? (
              <img src={c.image} alt={c.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
            ) : (
              <span className="text-[10px] font-bold text-foreground">
                {c.name?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </motion.div>
        ))}
        {extra > 0 && (
          <div className="w-8 h-8 rounded-full glass-strong border-2 border-background grid place-items-center shrink-0">
            <span className="text-[9px] font-bold text-muted-foreground">+{extra}</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground">
          {collaborators.length} {collaborators.length === 1 ? "collaborator" : "collaborators"}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {ownerName && <><Crown className="w-2.5 h-2.5 inline mr-0.5 text-gold" />{ownerName} · Owner</>}
        </p>
      </div>

      <button
        onClick={onInvite}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-foreground text-background text-[11px] font-semibold spring-tap shrink-0"
      >
        <UserPlus className="w-3.5 h-3.5" /> Invite
      </button>
    </motion.div>
  );
}