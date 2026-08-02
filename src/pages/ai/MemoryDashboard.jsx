import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Brain, Trash2, Download, Search, Edit3, X, Check, ShieldCheck,
  GraduationCap, Settings, MapPin, Briefcase, MessageCircle, Clock, Eye, EyeOff,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import ScreenShell from "@/components/layout/ScreenShell";
import { useToast } from "@/components/ui/use-toast";
import { MEMORY_CATEGORIES, scoreMemory, update as updateMemory, forget as forgetMemory, clearAll as clearAllMemories } from "@/lib/bud/memoryBank";

const EASE = [0.16, 1, 0.3, 1];

const CATEGORY_META = {
  academic: { label: "Academic", icon: GraduationCap },
  preferences: { label: "Preferences", icon: Settings },
  campus: { label: "Campus", icon: MapPin },
  career: { label: "Career", icon: Briefcase },
  conversation: { label: "Conversation", icon: MessageCircle },
};

const PAUSE_KEY = "bud_memory_paused";

/**
 * MemoryDashboard — Bud Memory Bank v1.0
 *
 * Users can review, edit, export, and delete everything Bud remembers.
 * Every memory shows its category, confidence, source, and reason for existing.
 * Memory can be disabled entirely (privacy-first).
 */
export default function MemoryDashboard() {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [paused, setPaused] = useState(() => {
    try { return localStorage.getItem(PAUSE_KEY) === "1"; } catch { return false; }
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: memories = [] } = useQuery({
    queryKey: ["budMemories"],
    queryFn: () => base44.entities.BudMemory.list("-created_date", 100),
  });

  const filtered = useMemo(() => {
    let items = (memories || []).map((m) => ({
      ...m,
      scores: scoreMemory(m, query),
    }));

    if (category !== "all") {
      items = items.filter((m) => m.category === category);
    }

    if (query) {
      const q = query.toLowerCase();
      items = items.filter((m) =>
        (m.key || "").toLowerCase().includes(q) ||
        (m.value || "").toLowerCase().includes(q) ||
        (m.reason || "").toLowerCase().includes(q)
      );
    }

    return items.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [category, query, memories]);

  const handleDelete = async (item) => {
    await forgetMemory(item.id);
    queryClient.invalidateQueries({ queryKey: ["budMemories"] });
    toast({ title: "Forgotten", description: "Memory removed from your bank." });
  };

  const handleClearAll = async () => {
    await clearAllMemories();
    queryClient.invalidateQueries({ queryKey: ["budMemories"] });
    toast({ title: "Cleared", description: "All memories have been erased." });
  };

  const handleExport = () => {
    const exportData = filtered.map((m) => ({
      category: m.category,
      key: m.key,
      value: m.value,
      confidence: m.confidence,
      source_type: m.source_type,
      reason: m.reason,
      created_at: m.created_date,
      expires_at: m.expires_at,
      usage_count: m.usage_count,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bud-memory-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Your memory data has been downloaded." });
  };

  const handleSaveEdit = async (item) => {
    const result = await updateMemory(item.id, { value: editValue, content: editValue });
    if (result.success) {
      queryClient.invalidateQueries({ queryKey: ["budMemories"] });
      setEditingId(null);
      toast({ title: "Updated", description: "Your memory has been edited." });
    } else {
      toast({ title: "Error", description: result.reason, variant: "destructive" });
    }
  };

  const togglePause = () => {
    setPaused((p) => {
      const n = !p;
      try { localStorage.setItem(PAUSE_KEY, n ? "1" : "0"); } catch {}
      return n;
    });
    toast({
      title: paused ? "Memory enabled" : "Memory paused",
      description: paused ? "Bud will remember again." : "Bud will not store new memories.",
    });
  };

  const totalMemories = (memories || []).length;

  return (
    <ScreenShell title="Memory Bank" subtitle="Everything Bud remembers. Review, edit, export, or forget." sticky={false}>
      {/* Privacy status banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE }}
        className="crystal-card p-4 mb-4 mt-4 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-full bg-foreground/[0.08] grid place-items-center flex-shrink-0">
          {paused ? <EyeOff className="w-5 h-5 text-muted-foreground" /> : <ShieldCheck className="w-5 h-5 text-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-foreground">
            {paused ? "Memory is paused" : "Memory is active"}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {totalMemories} {totalMemories === 1 ? "memory" : "memories"} stored · You own and control all data
          </p>
        </div>
        <button
          onClick={togglePause}
          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold spring-tap ${
            paused ? "bg-primary text-primary-foreground" : "glass text-foreground"
          }`}
        >
          {paused ? "Enable" : "Pause"}
        </button>
      </motion.div>

      {/* Search + Export + Clear */}
      <div className="flex gap-2 mb-4">
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
        {totalMemories > 0 && (
          <button
            onClick={handleClearAll}
            className="px-3.5 rounded-[16px] glass hover:bg-destructive/10 flex items-center gap-1.5 spring-tap text-[12px] font-semibold text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-1 px-1">
        <button
          onClick={() => setCategory("all")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap transition-all duration-300 ${
            category === "all" ? "bg-primary text-primary-foreground" : "glass text-foreground/70 hover:text-foreground"
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          All
        </button>
        {MEMORY_CATEGORIES.map((c) => {
          const Icon = CATEGORY_META[c.id]?.icon || Brain;
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
          <p className="text-[11px] text-muted-foreground/60 mt-1">
            As you interact with Bud, it will remember what matters — you control everything.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item, i) => {
            const catMeta = CATEGORY_META[item.category] || CATEGORY_META.conversation;
            const Icon = catMeta.icon;
            const confidencePct = Math.round((item.confidence || 0) * 100);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
                className="crystal-card p-3.5"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-foreground/[0.08] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-foreground" />
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
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{catMeta.label}</span>
                          <span className="text-[10px] text-muted-foreground/60">·</span>
                          <span className="text-[10px] text-muted-foreground/70 font-medium">{item.key || "—"}</span>
                        </div>
                        <p className="text-[13px] font-semibold text-foreground line-clamp-2">{item.value || item.content}</p>
                        {item.reason && (
                          <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-start gap-1">
                            <span className="font-semibold">Why:</span> <span className="line-clamp-1">{item.reason}</span>
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5">
                          {/* Confidence meter */}
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1 rounded-full bg-foreground/[0.08] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-foreground/60"
                                style={{ width: `${confidencePct}%` }}
                              />
                            </div>
                            <span className="text-[9px] text-muted-foreground/60 font-medium">{confidencePct}%</span>
                          </div>
                          {/* Source badge */}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                            item.source_type === "user"
                              ? "bg-primary/10 text-primary"
                              : "bg-foreground/[0.06] text-muted-foreground"
                          }`}>
                            {item.source_type === "user" ? "You said" : "Inferred"}
                          </span>
                          {(item.usage_count > 0) && (
                            <span className="text-[9px] text-muted-foreground/50 flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" /> {item.usage_count}×
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  {editingId !== item.id && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => { setEditingId(item.id); setEditValue(item.value || item.content || ""); }}
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
            );
          })}
        </div>
      )}
    </ScreenShell>
  );
}