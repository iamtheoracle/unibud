import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, BookOpen, Users, GitBranch, Heart, MessageCircle,
  Bookmark, Briefcase, Zap, X,
} from "lucide-react";
import PremiumAvatar from "@/components/ui/PremiumAvatar";
import { EASE } from "@/lib/motion/motionPresets";

const CONNECT_ACTIONS = [
  { id: "connect", label: "Connect", icon: UserPlus, description: "Add to your network" },
  { id: "study_together", label: "Study Together", icon: BookOpen, description: "Invite to a study session" },
  { id: "collaborate", label: "Collaborate", icon: GitBranch, description: "Invite to a project" },
  { id: "message", label: "Message", icon: MessageCircle, description: "Start a conversation" },
  { id: "follow", label: "Follow", icon: Users, description: "Follow their activity" },
  { id: "buddy", label: "Become Buddies", icon: Heart, description: "Regular study partner" },
  { id: "save", label: "Save Profile", icon: Bookmark, description: "Save for later" },
  { id: "invite_project", label: "Invite to Project", icon: Briefcase, description: "Recruit for a project" },
];

/**
 * ConnectActionSheet — premium bottom sheet for connecting with a student.
 *
 * Instead of a "Like" button, shows contextual connection actions:
 * Connect, Study Together, Collaborate, Message, Follow, etc.
 *
 * Props:
 *  - student: { name, image, faculty, department, level, is_verified }
 *  - open: boolean
 *  - onClose: () => void
 *  - onAction: (actionId) => void
 *  - matchReasons: string[] — Bud AI match reasons to show at top
 */
export default function ConnectActionSheet({ student, open, onClose, onAction, matchReasons = [] }) {
  return (
    <AnimatePresence>
      {open && student && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed bottom-0 left-0 right-0 z-50 crystal-dock rounded-t-[28px] safe-area-pb"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-foreground/20" />
            </div>

            {/* Student header */}
            <div className="flex items-center gap-3 px-5 py-3">
              <PremiumAvatar src={student.image} alt={student.name} size="md" verified={student.is_verified} />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-[16px] text-foreground truncate">{student.name}</h3>
                <p className="text-[11px] text-muted-foreground truncate">
                  {[student.faculty, student.department, student.level].filter(Boolean).join(" · ")}
                </p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full glass flex items-center justify-center spring-tap">
                <X className="w-4 h-4 text-foreground" strokeWidth={2.2} style={{ width: 18, height: 18 }} />
              </button>
            </div>

            {/* Bud AI match reasons */}
            {matchReasons.length > 0 && (
              <div className="px-5 pb-3">
                <div className="flex items-start gap-2 p-3 rounded-[14px] glass">
                  <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" strokeWidth={2.2} />
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Bud Match</p>
                    <div className="flex flex-wrap gap-1">
                      {matchReasons.map((reason, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions grid */}
            <div className="px-3 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {CONNECT_ACTIONS.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.05 + i * 0.03, duration: 0.3, ease: EASE }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { onAction?.(action.id); onClose?.(); }}
                      className="flex flex-col items-start gap-1 p-3 rounded-[16px] glass hover:bg-primary/5 spring-tap text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-0.5">
                        <Icon className="w-4 h-4 text-primary" strokeWidth={2.2} style={{ width: 16, height: 16 }} />
                      </div>
                      <span className="text-[12px] font-bold text-foreground leading-tight">{action.label}</span>
                      <span className="text-[9px] text-muted-foreground leading-tight">{action.description}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { CONNECT_ACTIONS };