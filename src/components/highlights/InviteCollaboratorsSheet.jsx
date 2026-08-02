import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Search, Send, Eye, Plus, Pencil, Shield, Crown, Trash2,
  MessageSquare, Activity, Users2, X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

const PERMISSIONS = [
  { id: "viewer", label: "Viewer", description: "View only", icon: Eye },
  { id: "contributor", label: "Contributor", description: "Add & remove own items, comment", icon: Plus },
  { id: "editor", label: "Editor", description: "Add, edit, remove, organize", icon: Pencil },
  { id: "manager", label: "Manager", description: "Everything + invite & manage", icon: Shield },
];

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function CollaboratorsTab({ collaborators, onInvite, onRemove, onRoleChange }) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("viewer");
  const { toast } = useToast();

  const { data: results = [] } = useQuery({
    queryKey: ["collab-user-search", search],
    queryFn: async () => {
      const res = await base44.functions.invoke("smartUserSearch", { query: search, limit: 10 });
      return res.data?.results || [];
    },
    enabled: search.trim().length >= 2,
    staleTime: 30000,
  });

  const filteredResults = results.filter(
    (u) => !collaborators.some((c) => c.user_id === u.id)
  );

  const handleInvite = async () => {
    if (!selectedUser) return;
    hapticTap();
    try {
      await onInvite(selectedUser, role);
      toast({ title: "Collaborator invited!", description: `${selectedUser.full_name || selectedUser.email} is now a ${role}.` });
      setSelectedUser(null);
      setSearch("");
      setRole("viewer");
    } catch {
      toast({ title: "Couldn't invite", description: "Please try again.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setSelectedUser(null); }}
          placeholder="Search by name or username…"
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
        />
      </div>

      {/* Search results */}
      <AnimatePresence>
        {search.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {filteredResults.length === 0 ? (
              <p className="text-center text-[12px] text-muted-foreground py-4">No users found.</p>
            ) : (
              <div className="space-y-1 max-h-[180px] overflow-y-auto no-scrollbar">
                {filteredResults.map((u, i) => (
                  <motion.button
                    key={u.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => { hapticTap(); setSelectedUser(u); }}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-2xl spring-tap text-left transition-all ${
                      selectedUser?.id === u.id ? "bg-foreground text-background" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full glass-card grid place-items-center shrink-0">
                      <span className="text-[11px] font-bold">{(u.full_name || u.email || "U").charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{u.full_name || u.email}</p>
                      {u.username && <p className="text-[11px] opacity-60 truncate">@{u.username}</p>}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission selector when user selected */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Permission Level
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map((p) => {
                const Icon = p.icon;
                const active = role === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => { hapticTap(); setRole(p.id); }}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl spring-tap transition-all text-left ${
                      active ? "bg-foreground text-background" : "glass text-foreground/70"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold">{p.label}</p>
                      <p className={`text-[9px] truncate ${active ? "text-background/60" : "text-muted-foreground"}`}>{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleInvite}
              className="w-full py-2.5 rounded-2xl bg-foreground text-background text-[13px] font-semibold spring-tap flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Invite as {PERMISSIONS.find((p) => p.id === role)?.label}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current collaborators */}
      {!selectedUser && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Collaborators ({collaborators.length})
          </p>
          {collaborators.length === 0 ? (
            <div className="text-center py-6">
              <Users2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-[12px] text-muted-foreground">No collaborators yet. Search above to invite friends.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {collaborators.map((c, i) => (
                <motion.div
                  key={c.user_id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-2.5 rounded-2xl glass-card"
                >
                  <div className="w-9 h-9 rounded-full bg-card grid place-items-center shrink-0 overflow-hidden">
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[11px] font-bold">{c.name?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">Invited {timeAgo(c.invited_at)}</p>
                  </div>
                  <select
                    value={c.role}
                    onChange={(e) => { hapticTap(); onRoleChange(c.user_id, e.target.value); }}
                    className="bg-card border border-border rounded-lg px-2 py-1 text-[10px] font-semibold text-foreground focus:outline-none"
                  >
                    {PERMISSIONS.map((p) => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => { hapticTap(); onRemove(c.user_id); }}
                    className="w-7 h-7 rounded-full grid place-items-center text-muted-foreground hover:text-destructive spring-tap shrink-0"
                    aria-label="Remove collaborator"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActivityTab({ activity }) {
  if (activity.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
        <p className="text-[12px] text-muted-foreground">No activity yet. Actions by collaborators will appear here.</p>
      </div>
    );
  }
  return (
    <div className="space-y-0.5">
      {[...activity].reverse().map((entry, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-muted/20"
        >
          <div className="w-2 h-2 rounded-full bg-primary/60 mt-2 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-foreground">
              <span className="font-semibold">{entry.name}</span>{" "}
              <span className="text-muted-foreground">{entry.action}</span>{" "}
              <span className="font-medium">"{entry.target}"</span>
            </p>
            <p className="text-[10px] text-muted-foreground/60">{timeAgo(entry.timestamp)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function CommentsTab({ comments, onAdd, canComment }) {
  const [input, setInput] = useState("");

  const handleSubmit = async () => {
    if (!input.trim()) return;
    hapticTap();
    await onAdd(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-[320px]">
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 mb-3">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-[12px] text-muted-foreground">No comments yet. Start the conversation.</p>
          </div>
        ) : (
          [...comments].reverse().map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="p-3 rounded-2xl glass-card"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-card grid place-items-center shrink-0">
                  <span className="text-[9px] font-bold">{c.name?.charAt(0)?.toUpperCase()}</span>
                </div>
                <p className="text-[12px] font-semibold">{c.name}</p>
                <span className="text-[9px] text-muted-foreground/60 ml-auto">{timeAgo(c.timestamp)}</span>
              </div>
              <p className="text-[12px] text-foreground/90 leading-relaxed">{c.content}</p>
            </motion.div>
          ))
        )}
      </div>
      {canComment && (
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Add a comment…"
            className="flex-1 px-3 py-2.5 rounded-2xl bg-card border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-full bg-foreground text-background grid place-items-center spring-tap disabled:opacity-40 shrink-0"
            aria-label="Send comment"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

const TABS = [
  { id: "collaborators", label: "Collaborators", icon: Users2 },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "comments", label: "Comments", icon: MessageSquare },
];

/**
 * InviteCollaboratorsSheet — premium bottom sheet with three tabs:
 * Collaborators (invite + manage), Activity (timeline), Comments.
 */
export default function InviteCollaboratorsSheet({
  open, onOpenChange, folder, collaborators, activity, comments,
  onInvite, onRemove, onRoleChange, onAddComment, canComment,
}) {
  const [tab, setTab] = useState("collaborators");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-[28px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Users2 className="w-4 h-4" /> "{folder}" Collaboration
          </SheetTitle>
          <SheetDescription>
            Invite friends to build and manage this collection together.
          </SheetDescription>
        </SheetHeader>

        {/* Tabs */}
        <div className="flex gap-2 mt-3 mb-4">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { hapticTap(); setTab(t.id); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[14px] text-[11px] font-semibold spring-tap transition-all ${
                  active ? "bg-foreground text-background" : "glass text-foreground/70"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="pb-8">
          {tab === "collaborators" && (
            <CollaboratorsTab
              collaborators={collaborators}
              onInvite={onInvite}
              onRemove={onRemove}
              onRoleChange={onRoleChange}
            />
          )}
          {tab === "activity" && <ActivityTab activity={activity} />}
          {tab === "comments" && (
            <CommentsTab
              comments={comments}
              onAdd={onAddComment}
              canComment={canComment}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}