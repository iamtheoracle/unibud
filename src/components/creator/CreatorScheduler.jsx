import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
  CalendarClock, FileText, Video, Mic, Radio, ShoppingBag,
  Clock, CheckCircle2, XCircle, Edit3, Send, X, Sparkles, Loader2,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

const TYPE_META = {
  posts: { icon: FileText, label: "Post", entity: "QuadPost", titleField: "content" },
  shorts: { icon: Video, label: "Short", entity: "ShortVideo", titleField: "title" },
  stories: { icon: Radio, label: "Story", entity: "Story", titleField: "content" },
  podcasts: { icon: Mic, label: "Episode", entity: "PodcastEpisode", titleField: "title" },
  listings: { icon: ShoppingBag, label: "Listing", entity: "MarketplaceListing", titleField: "title" },
};

/**
 * CreatorScheduler — publishing scheduler for all creator content.
 * Shows drafts, scheduled, and published items with the ability to
 * publish now, reschedule, edit before publication, or cancel.
 * Bud reminds before scheduled publishing and notifies after publication.
 */
export default function CreatorScheduler({ user, posts = [], shorts = [], stories = [], episodes = [], listings = [] }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState("scheduled");
  const [editing, setEditing] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [saving, setSaving] = useState(false);

  // Combine all content into a unified list with type metadata
  const allContent = useMemo(() => {
    const items = [];
    const collections = [
      { type: "posts", data: posts },
      { type: "shorts", data: shorts },
      { type: "stories", data: stories },
      { type: "podcasts", data: episodes },
      { type: "listings", data: listings },
    ];
    collections.forEach(({ type, data }) => {
      (data || []).forEach((item) => {
        const meta = TYPE_META[type];
        items.push({
          ...item,
          _type: type,
          _entity: meta.entity,
          _titleField: meta.titleField,
          _icon: meta.icon,
          _label: meta.label,
          _title: type === "posts" ? (item.content || "").slice(0, 60) || "Untitled" : (item[meta.titleField] || "Untitled"),
        });
      });
    });
    return items;
  }, [posts, shorts, stories, episodes, listings]);

  const drafts = allContent.filter((x) => x.draft_status === "draft" && !x.scheduled_at);
  const scheduled = allContent.filter((x) => x.draft_status === "scheduled" || (x.draft_status === "draft" && x.scheduled_at));
  const published = allContent.filter((x) => !x.draft_status || x.draft_status === "published");

  const tabs = [
    { key: "scheduled", label: `Scheduled · ${scheduled.length}` },
    { key: "drafts", label: `Drafts · ${drafts.length}` },
    { key: "published", label: `Published · ${published.length}` },
  ];

  const current = tab === "scheduled" ? scheduled : tab === "drafts" ? drafts : published;

  function openEditor(item) {
    setEditing(item);
    if (item.scheduled_at) {
      const d = new Date(item.scheduled_at);
      setEditDate(d.toISOString().slice(0, 10));
      setEditTime(d.toTimeString().slice(0, 5));
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setEditDate(tomorrow.toISOString().slice(0, 10));
      setEditTime("09:00");
    }
  }

  async function saveSchedule() {
    if (!editing) return;
    setSaving(true);
    try {
      const scheduledAt = new Date(`${editDate}T${editTime}:00`).toISOString();
      await base44.entities[editing._entity].update(editing.id, {
        scheduled_at: scheduledAt,
        draft_status: "scheduled",
      });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
      qc.invalidateQueries({ queryKey: ["myShorts"] });
      qc.invalidateQueries({ queryKey: ["myStories"] });
      qc.invalidateQueries({ queryKey: ["myEpisodes"] });
      qc.invalidateQueries({ queryKey: ["myListings"] });
      toast({ title: "Scheduled", description: `Will publish on ${new Date(scheduledAt).toLocaleString()}` });
      setEditing(null);
    } catch (err) {
      toast({ title: "Could not schedule", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function publishNow(item) {
    try {
      await base44.entities[item._entity].update(item.id, {
        draft_status: "published",
        scheduled_at: null,
      });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
      qc.invalidateQueries({ queryKey: ["myShorts"] });
      qc.invalidateQueries({ queryKey: ["myStories"] });
      qc.invalidateQueries({ queryKey: ["myEpisodes"] });
      qc.invalidateQueries({ queryKey: ["myListings"] });
      toast({ title: "Published", description: `${item._label} is now live.` });
    } catch (err) {
      toast({ title: "Could not publish", description: err.message, variant: "destructive" });
    }
  }

  async function cancelSchedule(item) {
    if (!confirm("Cancel this scheduled post? It will revert to a draft.")) return;
    try {
      await base44.entities[item._entity].update(item.id, {
        draft_status: "draft",
        scheduled_at: null,
      });
      qc.invalidateQueries({ queryKey: ["myPosts"] });
      qc.invalidateQueries({ queryKey: ["myShorts"] });
      qc.invalidateQueries({ queryKey: ["myStories"] });
      qc.invalidateQueries({ queryKey: ["myEpisodes"] });
      qc.invalidateQueries({ queryKey: ["myListings"] });
      toast({ title: "Cancelled", description: "Moved back to drafts." });
    } catch (err) {
      toast({ title: "Could not cancel", description: err.message, variant: "destructive" });
    }
  }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";

  return (
    <div className="space-y-3">
      {/* Timezone badge */}
      <div className="glass-card p-3 flex items-center gap-2.5">
        <Clock className="w-4 h-4 text-primary shrink-0" />
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-foreground">Your timezone: {tz}</p>
          <p className="text-[10px] text-muted-foreground">All schedules use your local time. Bud will remind you before publishing.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-[16px] bg-muted/40">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-[12px] text-[11px] font-semibold whitespace-nowrap transition-colors spring-tap ${tab === t.key ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content list */}
      {current.length === 0 ? (
        <div className="glass-card p-8 flex flex-col items-center text-center">
          <CalendarClock className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-[13px] font-semibold text-foreground">
            {tab === "scheduled" ? "Nothing scheduled" : tab === "drafts" ? "No drafts" : "Nothing published yet"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {tab === "scheduled" ? "Schedule content to publish automatically." : tab === "drafts" ? "Drafts will appear here when you save them." : "Your published content will show here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {current.map((item, i) => {
            const Icon = item._icon;
            const scheduledDate = item.scheduled_at ? new Date(item.scheduled_at) : null;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
                className="glass-card p-3.5"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground line-clamp-2">{item._title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{item._label}</span>
                      {tab === "scheduled" && scheduledDate && (
                        <span className="text-[10px] text-primary font-semibold flex items-center gap-0.5">
                          <CalendarClock className="w-2.5 h-2.5" />
                          {scheduledDate.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                      {tab === "published" && (
                        <span className="text-[10px] text-success font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Live
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-2.5">
                  {tab === "scheduled" && (
                    <>
                      <button onClick={() => publishNow(item)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground spring-tap">
                        <Send className="w-3 h-3" /> Publish now
                      </button>
                      <button onClick={() => openEditor(item)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted/50 text-[10px] font-bold text-foreground spring-tap">
                        <Edit3 className="w-3 h-3" /> Reschedule
                      </button>
                      <button onClick={() => cancelSchedule(item)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-error/10 text-[10px] font-bold text-error spring-tap">
                        <XCircle className="w-3 h-3" /> Cancel
                      </button>
                    </>
                  )}
                  {tab === "drafts" && (
                    <>
                      <button onClick={() => publishNow(item)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary text-[10px] font-bold text-primary-foreground spring-tap">
                        <Send className="w-3 h-3" /> Publish now
                      </button>
                      <button onClick={() => openEditor(item)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted/50 text-[10px] font-bold text-foreground spring-tap">
                        <CalendarClock className="w-3 h-3" /> Schedule
                      </button>
                    </>
                  )}
                  {tab === "published" && item.created_date && (
                    <span className="text-[10px] text-muted-foreground">
                      Published {new Date(item.created_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Schedule editor sheet */}
      <AnimatePresence>
        {editing && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditing(null)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-w-[600px] mx-auto liquid-mirror rounded-t-[28px] p-5 pb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[16px] font-bold text-foreground">Schedule Publication</h3>
                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <p className="text-[12px] text-foreground/80 line-clamp-1 mb-3">{editing._title}</p>

              <div className="glass-card p-3 flex items-start gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Bud will remind you 1 hour before publishing and notify you once it's live.
                </p>
              </div>

              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Date</label>
              <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                className="w-full mb-3 mt-1 px-3 py-2.5 rounded-[12px] bg-muted/40 border border-border/30 text-[13px] text-foreground focus:outline-none focus:border-primary/40" />

              <label className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Time ({tz})</label>
              <input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)}
                className="w-full mb-4 mt-1 px-3 py-2.5 rounded-[12px] bg-muted/40 border border-border/30 text-[13px] text-foreground focus:outline-none focus:border-primary/40" />

              <div className="flex gap-2">
                <button onClick={() => setEditing(null)} className="flex-1 h-11 rounded-full bg-muted/50 text-[13px] font-semibold text-foreground spring-tap">
                  Cancel
                </button>
                <button onClick={saveSchedule} disabled={saving || !editDate || !editTime}
                  className="flex-1 h-11 rounded-full bg-primary text-[13px] font-bold text-primary-foreground spring-tap disabled:opacity-50 flex items-center justify-center gap-1.5">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />}
                  {saving ? "Scheduling…" : "Schedule"}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}