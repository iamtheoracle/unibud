import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Users, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { CONVERSATION_TYPES } from "./messagingConstants";

export default function NewConversationModal({ open, onClose, user, onCreate }) {
  const [mode, setMode] = useState("direct");
  const [name, setName] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] = useState("study_group");
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const handleCreateDirect = async () => {
    if (!name.trim() || !user) return;
    setCreating(true);
    try {
      const now = new Date().toISOString();
      const conversation = await base44.entities.Conversation.create({
        type: "direct",
        participants: [
          {
            user_id: user.id,
            name: user.full_name || user.email || "You",
            image: user.avatar_url || user.image || "",
            role: "student",
            joined_at: now,
            last_read_at: now,
          },
          {
            user_id: "ext_" + Date.now(),
            name: name.trim(),
            role: "student",
            joined_at: now,
          },
        ],
        university: user.university,
      });
      onCreate(conversation);
      setName("");
      setMode("direct");
    } catch {
      // Error
    } finally {
      setCreating(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || !user) return;
    setCreating(true);
    try {
      const now = new Date().toISOString();
      const conversation = await base44.entities.Conversation.create({
        type: groupType,
        title: groupName.trim(),
        participants: [
          {
            user_id: user.id,
            name: user.full_name || user.email || "You",
            image: user.avatar_url || user.image || "",
            role: "student",
            is_admin: true,
            joined_at: now,
            last_read_at: now,
          },
        ],
        university: user.university,
      });
      onCreate(conversation);
      setGroupName("");
      setGroupType("study_group");
    } catch {
      // Error
    } finally {
      setCreating(false);
    }
  };

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
          className="w-full max-w-lg glass-strong rounded-t-[28px] pb-6 pt-3 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mb-4" />

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-[18px] text-foreground">New Conversation</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode("direct")}
              className={"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold spring-tap " +
                (mode === "direct" ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-muted-foreground")}
            >
              <MessageCircle className="w-4 h-4" /> Direct
            </button>
            <button
              onClick={() => setMode("group")}
              className={"flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold spring-tap " +
                (mode === "group" ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-muted-foreground")}
            >
              <Users className="w-4 h-4" /> Group
            </button>
          </div>

          {mode === "direct" ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Recipient name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateDirect()}
                  placeholder="Enter name..."
                  className="w-full bg-card border border-border/40 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-primary/40"
                  autoFocus
                />
              </div>
              <button
                onClick={handleCreateDirect}
                disabled={!name.trim() || creating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold spring-tap disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Start Conversation
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Group name</label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. CSC 301 Study Group"
                  className="w-full bg-card border border-border/40 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-primary/40"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">Group type</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CONVERSATION_TYPES)
                    .filter(([key]) => !["direct", "mentor", "lecturer", "alumni"].includes(key))
                    .map(([key, meta]) => {
                      const Icon = meta.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setGroupType(key)}
                          className={"flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium spring-tap " +
                            (groupType === key ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-muted-foreground")}
                        >
                          <Icon className="w-3 h-3" />
                          {meta.label}
                        </button>
                      );
                    })}
                </div>
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || creating}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-semibold spring-tap disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Create Group
              </button>
              <p className="text-[11px] text-muted-foreground text-center">
                You can invite members after creating the group.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}