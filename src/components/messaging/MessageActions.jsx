import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Reply, Copy, Forward, Pin, Trash2, Edit3, Flag,
} from "lucide-react";
import { QUICK_REACTIONS } from "./messagingConstants";

export default function MessageActions({
  open, message, isOwn, onClose, onReact, onReply, onEdit, onDelete, onPin, onCopy, onForward, onReport,
}) {
  if (!open || !message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 300, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
          className="w-full max-w-lg glass-strong rounded-t-[28px] rounded-b-0 pb-6 pt-3 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />

          {/* Quick reactions */}
          <div className="flex items-center justify-center gap-2 mb-4 px-2">
            {QUICK_REACTIONS.map((emoji) => {
              const active = message.reactions?.[emoji]?.length > 0;
              return (
                <button
                  key={emoji}
                  onClick={() => { onReact(emoji); onClose(); }}
                  className={"w-11 h-11 rounded-full flex items-center justify-center text-[22px] spring-tap transition-all " +
                    (active ? "bg-primary/15 scale-110" : "hover:bg-muted bg-card border border-border/30")}
                >
                  {emoji}
                </button>
              );
            })}
          </div>

          <div className="h-px bg-border/30 mb-2" />

          {/* Action buttons */}
          <div className="grid grid-cols-4 gap-1">
            <ActionButton icon={Reply} label="Reply" onClick={() => { onReply(); onClose(); }} />
            <ActionButton icon={Copy} label="Copy" onClick={() => { onCopy(); onClose(); }} />
            <ActionButton icon={Forward} label="Forward" onClick={() => { onForward(); onClose(); }} />
            <ActionButton icon={Pin} label={message.is_pinned ? "Unpin" : "Pin"} onClick={() => { onPin(); onClose(); }} />
            {isOwn && message.type === "text" && (
              <ActionButton icon={Edit3} label="Edit" onClick={() => { onEdit(); onClose(); }} />
            )}
            {isOwn && (
              <ActionButton icon={Trash2} label="Delete" danger onClick={() => { onDelete(); onClose(); }} />
            )}
            {!isOwn && (
              <ActionButton icon={Flag} label="Report" danger onClick={() => { onReport(); onClose(); }} />
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 py-2.5 rounded-full bg-card border border-border/40 text-[13px] font-medium text-muted-foreground spring-tap"
          >
            Cancel
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl hover:bg-muted transition-colors spring-tap"
    >
      <div className={"w-9 h-9 rounded-full flex items-center justify-center " + (danger ? "bg-destructive/10" : "bg-primary/8")}>
        <Icon className={"w-4 h-4 " + (danger ? "text-destructive" : "text-primary")} strokeWidth={2} />
      </div>
      <span className={"text-[10px] font-medium " + (danger ? "text-destructive" : "text-foreground")}>{label}</span>
    </button>
  );
}