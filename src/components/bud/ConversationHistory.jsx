import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MessageSquare, X } from "lucide-react";
import { formatLastActivity, getAgentById } from "@/lib/agentRegistry";

export default function ConversationHistory({ open, onClose, conversations, onOpen, onNew }) {
  const [search, setSearch] = useState("");

  const filtered = (conversations || []).filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (c.title || "").toLowerCase().includes(q) ||
      (c.summary || "").toLowerCase().includes(q);
  });

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[62]"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="fixed left-0 top-0 bottom-0 w-[85%] max-w-sm bg-background z-[63] flex flex-col"
          >
            <div className="pt-12 pb-3 px-5 flex items-center gap-3">
              <div className="flex-1">
                <h2 className="font-heading font-bold text-[18px] text-foreground">Conversations</h2>
                <p className="text-[11px] text-muted-foreground">Your Bud history</p>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-[12px] bg-card flex items-center justify-center spring-tap">
                <X className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
              </button>
            </div>

            <div className="px-4 pb-3">
              <button
                onClick={() => { onNew(); onClose(); }}
                className="w-full py-3 rounded-[16px] bg-primary text-primary-foreground text-[12px] font-semibold flex items-center justify-center gap-2 spring-tap gold-glow"
              >
                <Plus className="w-4 h-4" /> New Conversation
              </button>
            </div>

            <div className="px-4 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-card border border-border/40 text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 soft-shadow"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 no-scrollbar">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-[18px] bg-primary/8 flex items-center justify-center mb-3">
                    <MessageSquare className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground">No conversations yet</p>
                  <p className="text-[11px] text-muted-foreground mt-1 max-w-[200px]">Start chatting with Bud and your conversations will appear here</p>
                </div>
              ) : (
                filtered.map((conv, i) => {
                  const lastMsg = conv.messages?.[conv.messages.length - 1];
                  const preview = lastMsg?.content || conv.summary || conv.title;
                  const agents = conv.agents_used || [];
                  return (
                    <button
                      key={conv.id || i}
                      onClick={() => { onOpen(conv); onClose(); }}
                      className="w-full text-left p-3.5 rounded-[16px] bg-card border border-border/40 soft-shadow card-hover spring-tap"
                    >
                      <p className="font-heading font-semibold text-[13px] text-foreground line-clamp-1">{conv.title || "Conversation"}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{preview}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {agents.slice(0, 3).map((aid) => {
                          const agent = getAgentById(aid);
                          if (!agent) return null;
                          const AgentIcon = agent.icon;
                          return (
                            <div key={aid} className={"w-5 h-5 rounded-md flex items-center justify-center " + agent.bg} title={agent.name}>
                              <AgentIcon className={"w-3 h-3 " + agent.color} strokeWidth={2} />
                            </div>
                          );
                        })}
                        <span className="text-[9px] text-muted-foreground ml-auto">{formatLastActivity(agents[0])}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}