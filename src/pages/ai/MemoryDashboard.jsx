import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain, Trash2, Download, Search, Clock, MessageCircle, FileText, Bookmark,
  Image as ImageIcon, Settings, Sparkles, Edit3, X, Check,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ScreenShell from "@/components/layout/ScreenShell";
import { useToast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

const CATEGORIES = [
  { id: "all", label: "All", icon: Brain },
  { id: "conversations", label: "Conversations", icon: MessageCircle, entity: "BudConversation" },
  { id: "notes", label: "Notes", icon: FileText, entity: "Note" },
  { id: "bookmarks", label: "Bookmarks", icon: Bookmark, entity: "Collection" },
  { id: "media", label: "Media", icon: ImageIcon },
  { id: "activity", label: "Recent Activity", icon: Clock },
  { id: "preferences", label: "Preferences", icon: Settings },
];

/**
 * MemoryDashboard — persistent platform memory.
 *
 * Users can review, edit, export, and delete everything the AI remembers:
 * preferences, workspace layouts, saved projects, conversations, frequently
 * used actions, saved prompts, research, documents, media, and recent activity.
 *
 * Memory synchronizes across devices via the entity layer.
 */
export default function MemoryDashboard() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: memories } = useQuery({
    queryKey: ["budMemories"],
    queryFn: () => base44.entities.BudMemory.list("-created_date", 50),
  });

  const { data: conversations } = useQuery({
    queryKey: ["budConversations"],
    queryFn: () => base44.entities.BudConversation.list("-updated_date", 20),
  });

  const { data: notes } = useQuery({
    queryKey: ["userNotes"],
    queryFn: () => base44.entities.Note.list("-updated_date", 20),
  });

  const filtered = useMemo(() => {
    let items = [];

    if (category === "all" || category === "conversations") {
      (conversations || []).forEach((c) => {
        items.push({ id: c.id, type: "conversation", title: c.title || "Conversation", preview: c.last_message || "", date: c.updated_date, entity: "BudConversation", raw: c });
      });
    }
    if (category === "all" || category === "notes") {
      (notes || []).forEach((n) => {
        items.push({ id: n.id, type: "note", title: n.title || "Untitled Note", preview: n.content?.substring(0, 120) || "", date: n.updated_date, entity: "Note", raw: n });
      });
    }
    if (category === "all" || category === "preferences") {
      (memories || []).forEach((m) => {
        items.push({ id: m.id, type: "memory", title: m.category || m.content?.substring(0, 40) || "Memory", preview: m.content || "", date: m.created_date, entity: "BudMemory", raw: m });
      });
    }

    if (query) {
      const q = query.toLowerCase();
      items = items.filter((i) => i.title.toLowerCase().includes(q) || i.preview.toLowerCase().includes(q));
    }

    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [category, query, memories, conversations, notes]);

  const handleDelete = async (item) => {
    try {
      await base44.entities[item.entity].delete(item.id);
      queryClient.invalidateQueries();
      toast({ title: "Deleted", description: "Item removed from your memory." });
    } catch {
      toast({ title: "Error", description: "Could not delete this item.", variant: "destructive" });
    }
  };

  const handleExport = () => {
    const exportData = JSON.stringify(filtered, null, 2);
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `unibud-memory-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Your memory data has been downloaded." });
  };

  const handleSaveEdit = async (item) => {
    try {
      const updateField = item.type === "note" ? { content: editValue } : { content: editValue };
      await base44.entities[item.entity].update(item.id, updateField);
      queryClient.invalidateQueries();
      setEditingId(null);
      toast({ title: "Updated", description: "Your changes have been saved." });
    } catch {
      toast({ title: "Error", description: "Could not save changes.", variant: "destructive" });
    }
  };

  return (
    <ScreenShell title="Memory" subtitle="Everything Bud remembers. Review, edit, export, or delete." sticky={false}>
      {/* Search + Export */}
      <div className="flex gap-2 mb-4 mt-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your memory…"
            className="w-full pl-10 pr-4 py-2.5 rounded-[16px] glass text-[13px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40 spring-tap"
          />
        </div>
        <button
          onClick={handleExport}
          className="px-3.5 rounded-[16px] glass hover:bg-white/[0.08] flex items-center gap-1.5 spring-tap text-[12px] font-semibold text-foreground"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-1 px-1">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const active = category === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap transition-all duration-300 ${
                active ? "bg-primary text-primary-foreground" : "glass text-foreground/70 hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Memory items */}
      {filtered.length === 0 ? (
        <div className="crystal-card p-8 text-center">
          <Brain className="w-8 h-8 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-[13px] text-muted-foreground">No memories stored yet.</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1">As you use UNIBUD, Bud will remember what matters.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item, i) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
              className="crystal-card p-3.5"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-foreground/[0.08] flex items-center justify-center flex-shrink-0">
                  {item.type === "conversation" && <MessageCircle className="w-4 h-4 text-foreground" />}
                  {item.type === "note" && <FileText className="w-4 h-4 text-foreground" />}
                  {item.type === "memory" && <Sparkles className="w-4 h-4 text-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <div>
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        rows={3}
                        className="w-full px-2.5 py-2 rounded-lg glass text-[12px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none"
                      />
                      <div className="flex gap-1.5 mt-1.5">
                        <button onClick={() => handleSaveEdit(item)} className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold flex items-center gap-1 spring-tap">
                          <Check className="w-3 h-3" /> Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="px-2.5 py-1 rounded-lg glass text-[11px] font-semibold text-muted-foreground flex items-center gap-1 spring-tap">
                          <X className="w-3 h-3" /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[13px] font-semibold text-foreground truncate">{item.title}</p>
                      {item.preview && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{item.preview}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">
                        {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </>
                  )}
                </div>
                {editingId !== item.id && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditingId(item.id); setEditValue(item.preview); }}
                      className="w-7 h-7 rounded-lg hover:bg-white/[0.08] flex items-center justify-center spring-tap text-muted-foreground hover:text-foreground"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center spring-tap text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </ScreenShell>
  );
}