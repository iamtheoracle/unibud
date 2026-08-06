import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Search, Send, Eye, Plus, Pencil, Shield, Trash2,
  MessageSquare, Activity, Users2, Bookmark,
  Lock, Mail, Users, Building2, Globe, Check,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { hapticTap } from "@/lib/haptics";
import CollectionDiscussion from "./CollectionDiscussion";
import CollectionItemsTab from "./CollectionItemsTab";
import ItemDiscussionSheet from "./ItemDiscussionSheet";
import CollectionStats from "./CollectionStats";

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
                    <div className="w-9 h-9 rounded-full glass-card grid place-items-center shrink-0 overflow-hidden">
                      {u.image || u.data?.image ? (
                        <img src={u.image || u.data?.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                      ) : (
                        <span className="text-[11px] font-bold">{(u.full_name || u.email || "U").charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate">{u.full_name || u.email}</p>
                      <div className="flex items-center gap-1.5">
                        {u.username && <span className="text-[10px] opacity-60 truncate">@{u.username}</span>}
                        {(u.data?.university || u.university) && (
                          <>
                            <span className="text-[10px] opacity-30">·</span>
                            <span className="text-[10px] opacity-60 truncate">{u.data?.university || u.university}</span>
                          </>
                        )}
                      </div>
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
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" loading="lazy" />
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

function ActivityTab({ activity, collectionId, items, collaborators }) {
  return (
    <div>
      <CollectionStats collectionId={collectionId} items={items} collaborators={collaborators} />
      {activity.length === 0 ? (
        <div className="text-center py-6">
          <Activity className="w-7 h-7 text-muted-foreground/30 mx-auto mb-2" strokeWidth={1.5} />
          <p className="text-[12px] text-muted-foreground">No activity yet. Actions by collaborators will appear here.</p>
        </div>
      ) : (
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
      )}
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

const VIEW_OPTIONS = [
  { id: "only_me", label: "Only Me", icon: Lock },
  { id: "invited", label: "Invited People", icon: Mail },
  { id: "friends", label: "Friends", icon: Users },
  { id: "community", label: "Community Members", icon: Building2 },
  { id: "public", label: "Public", icon: Globe },
];

const CONTRIBUTE_OPTIONS = [
  { id: "no_one", label: "No one" },
  { id: "selected", label: "Selected Collaborators" },
  { id: "all_invited", label: "All Invited Collaborators" },
  { id: "community", label: "Community Members" },
];

const COMMENT_OPTIONS = [
  { id: "off", label: "Off" },
  { id: "collaborators", label: "Collaborators Only" },
  { id: "everyone", label: "Everyone with access" },
];

function PermissionsTab({ permissions = {}, onChange }) {
  const perms = { view: "invited", contribute: "all_invited", comment: "collaborators", allowInvite: false, showHistory: true, ...permissions };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Who can view?</p>
        <div className="space-y-1">
          {VIEW_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = perms.view === opt.id;
            return (
              <button key={opt.id} onClick={() => { hapticTap(); onChange?.({ view: opt.id }); }} className={"w-full flex items-center gap-3 p-2.5 rounded-2xl spring-tap transition-all " + (active ? "bg-foreground text-background" : "glass text-foreground/70")}>
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                <span className="text-[12px] font-medium flex-1 text-left">{opt.label}</span>
                {active && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Who can contribute?</p>
        <div className="space-y-1">
          {CONTRIBUTE_OPTIONS.map((opt) => {
            const active = perms.contribute === opt.id;
            return (
              <button key={opt.id} onClick={() => { hapticTap(); onChange?.({ contribute: opt.id }); }} className={"w-full flex items-center gap-3 p-2.5 rounded-2xl spring-tap transition-all " + (active ? "bg-foreground text-background" : "glass text-foreground/70")}>
                <span className="text-[12px] font-medium flex-1 text-left">{opt.label}</span>
                {active && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 px-1">Who can comment?</p>
        <div className="space-y-1">
          {COMMENT_OPTIONS.map((opt) => {
            const active = perms.comment === opt.id;
            return (
              <button key={opt.id} onClick={() => { hapticTap(); onChange?.({ comment: opt.id }); }} className={"w-full flex items-center gap-3 p-2.5 rounded-2xl spring-tap transition-all " + (active ? "bg-foreground text-background" : "glass text-foreground/70")}>
                <span className="text-[12px] font-medium flex-1 text-left">{opt.label}</span>
                {active && <Check className="w-4 h-4" />}
              </button>
            );
          })}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
          <div>
            <p className="text-[12px] font-medium text-foreground">Allow collaborators to invite others</p>
            <p className="text-[10px] text-muted-foreground">Managers can always invite</p>
          </div>
          <Switch checked={perms.allowInvite} onCheckedChange={(v) => { hapticTap(); onChange?.({ allowInvite: v }); }} />
        </div>
        <div className="flex items-center justify-between p-3 rounded-2xl glass-card">
          <div>
            <p className="text-[12px] font-medium text-foreground">Show collaboration history</p>
            <p className="text-[10px] text-muted-foreground">Activity visible to collaborators</p>
          </div>
          <Switch checked={perms.showHistory} onCheckedChange={(v) => { hapticTap(); onChange?.({ showHistory: v }); }} />
        </div>
      </div>
    </div>
  );
}

const TABS = [
  { id: "items", label: "Items", icon: Bookmark },
  { id: "discussion", label: "Discussion", icon: MessageSquare },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "collaborators", label: "Team", icon: Users2 },
];

/**
 * InviteCollaboratorsSheet — premium bottom sheet with three tabs:
 * Collaborators (invite + manage), Activity (timeline), Comments.
 */
export default function InviteCollaboratorsSheet({
  open, onOpenChange, folder, collaborators, activity, comments,
  permissions, onPermissionsChange,
  onInvite, onRemove, onRoleChange, onAddComment, canComment,
  items = [], user,
}) {
  const [tab, setTab] = useState("discussion");
  const [openItem, setOpenItem] = useState(null);
  const [showPerms, setShowPerms] = useState(false);

  const isOwner = !!user && items.length > 0 && items[0]?.created_by_id === user.id;
  const isManager = collaborators.some((c) => c.user_id === user?.id && c.role === "manager");
  const canModerate = isOwner || isManager;

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
        <div className="flex gap-2 mt-3 mb-4 items-center">
          <div className="flex gap-1.5 flex-1">
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
          <button
            onClick={() => { hapticTap(); setShowPerms(!showPerms); }}
            className={`w-9 h-9 rounded-[14px] grid place-items-center spring-tap shrink-0 ${showPerms ? "bg-foreground text-background" : "glass text-foreground/70"}`}
            title="Permissions"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tab content */}
        <div className="pb-8">
          {tab === "items" && (
            <CollectionItemsTab items={items} collectionId={folder} onOpenItem={setOpenItem} />
          )}
          {tab === "discussion" && (
            <CollectionDiscussion
              collectionId={folder}
              collaborators={collaborators}
              user={user}
              canModerate={canModerate}
              canComment={canComment}
            />
          )}
          {tab === "activity" && <ActivityTab activity={activity} collectionId={folder} items={items} collaborators={collaborators} />}
          {tab === "collaborators" && (
            <CollaboratorsTab
              collaborators={collaborators}
              onInvite={onInvite}
              onRemove={onRemove}
              onRoleChange={onRoleChange}
            />
          )}
          <AnimatePresence>
            {showPerms && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4"
              >
                <PermissionsTab permissions={permissions} onChange={onPermissionsChange} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
      <ItemDiscussionSheet
        item={openItem}
        collectionId={folder}
        collaborators={collaborators}
        user={user}
        canModerate={canModerate}
        onClose={() => setOpenItem(null)}
      />
    </Sheet>
  );
}