import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus, BookOpen, Mail, Users, GitBranch, Handshake, Heart,
  MessageSquare, Bookmark, UserCheck, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const CONNECT_ACTIONS = [
  { id: "connect", label: "Connect", icon: UserPlus, color: "hsl(217 91% 60%)", primary: true },
  { id: "study_together", label: "Study Together", icon: BookOpen, color: "hsl(142 71% 45%)" },
  { id: "invite", label: "Invite", icon: Mail, color: "hsl(251 90% 67%)" },
  { id: "join_project", label: "Join Project", icon: GitBranch, color: "hsl(280 65% 60%)" },
  { id: "collaborate", label: "Collaborate", icon: Users, color: "hsl(200 80% 55%)" },
  { id: "buddies", label: "Become Buddies", icon: Handshake, color: "hsl(24 90% 55%)" },
  { id: "follow", label: "Follow", icon: Heart, color: "hsl(330 75% 55%)" },
  { id: "message", label: "Message", icon: MessageSquare, color: "hsl(160 70% 45%)" },
  { id: "save", label: "Save Profile", icon: Bookmark, color: "hsl(46 74% 55%)" },
];

/**
 * CampusConnectActions — unified action sheet for connecting with a student.
 * Replaces "Like" with meaningful academic/social/professional connection types.
 *
 * Props:
 *  - open: boolean
 *  - student: { name, image }
 *  - onAction: (actionId) => void
 *  - onClose: () => void
 */
export default function CampusConnectActions({ open, student, onAction, onClose }) {
  const [selected, setSelected] = useState(null);

  const handleAction = (actionId) => {
    setSelected(actionId);
    onAction?.(actionId);
    setTimeout(() => {
      setSelected(null);
      onClose?.();
    }, 1200);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[7000] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-0 left-0 right-0 z-[7001] rounded-t-[24px] overflow-hidden"
          >
            <div className="crystal-card rounded-t-[24px] pb-6 safe-area-pb">
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3" />

              {/* Header */}
              <div className="flex items-center justify-between px-4 mt-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Connect with</p>
                  <h3 className="font-heading font-bold text-[18px] text-foreground">{student?.name || "Student"}</h3>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full glass flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
                </button>
              </div>

              {/* Actions grid */}
              <div className="grid grid-cols-3 gap-2 px-4 mt-4">
                {CONNECT_ACTIONS.map((action, i) => {
                  const Icon = action.icon;
                  const isDone = selected === action.id;

                  return (
                    <motion.button
                      key={action.id}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => handleAction(action.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-[14px] spring-tap relative",
                        isDone ? "glass-strong" : "glass",
                        action.primary && !isDone && "ring-1 ring-primary/30"
                      )}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: `${action.color}20` }}
                      >
                        {isDone ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}
                          >
                            <UserCheck className="w-4 h-4" strokeWidth={2.5} style={{ color: action.color }} />
                          </motion.div>
                        ) : (
                          <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: action.color }} />
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-foreground text-center leading-tight">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Bud tip */}
              <div className="mx-4 mt-4 px-3 py-2 rounded-[12px] glass">
                <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                  Bud can suggest the best way to connect based on your shared classes and interests.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { CONNECT_ACTIONS };