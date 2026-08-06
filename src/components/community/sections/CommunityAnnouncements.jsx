import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Megaphone, Pin, Shield, Info, Plus, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EmptyState from "@/components/ui/EmptyState";
import { toast } from "@/components/ui/use-toast";

const PRIORITIES = ["Normal", "Important", "Urgent"];

/**
 * CommunityAnnouncements — pinned posts, official notices, and community
 * information. Combines community rules and meta into an info hub.
 */
export default function CommunityAnnouncements({ community, accentColor, currentUser }) {
  const accent = accentColor || "0 0% 100%";
  const rules = community?.rules || [];
  const tags = community?.tags || [];
  const communityId = community?.id;
  const qc = useQueryClient();
  const user = currentUser || null;
  const isAdmin = community?.created_by_id === user?.id;
  const [composerOpen, setComposerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", priority: "Normal" });

  const { data: announcements = [] } = useQuery({
    queryKey: ["communityAnnouncements", communityId],
    queryFn: () => base44.entities.CommunityAnnouncement.filter({ hub_id: communityId }, "-created_date", 50),
    enabled: !!communityId,
  });

  const meta = [
    { label: "Type", value: community?.type, icon: Info },
    { label: "University", value: community?.university, icon: Shield },
    { label: "Faculty", value: community?.faculty, icon: Shield },
    { label: "Department", value: community?.department, icon: Shield },
    { label: "Level", value: community?.level, icon: Info },
    { label: "Members", value: community?.members_count, icon: Megaphone },
  ].filter((m) => m.value);

  const priorityStyles = useMemo(() => ({
    Normal: "bg-muted text-muted-foreground border border-border/40",
    Important: "bg-amber-500/10 text-amber-700 border border-amber-500/20",
    Urgent: "bg-red-500/10 text-red-600 border border-red-500/20",
  }), []);

  const handleSubmit = async () => {
    if (!communityId || !user?.id || submitting) return;
    if (!form.title.trim() || !form.content.trim()) {
      toast({ title: "Title and content are required" });
      return;
    }

    setSubmitting(true);
    try {
      await base44.entities.CommunityAnnouncement.create({
        hub_id: communityId,
        title: form.title.trim(),
        content: form.content.trim(),
        priority: form.priority,
        created_by_id: user.id,
      });
      await qc.invalidateQueries({ queryKey: ["communityAnnouncements", communityId] });
      toast({ title: "Announcement posted" });
      setForm({ title: "", content: "", priority: "Normal" });
      setComposerOpen(false);
    } catch (error) {
      toast({
        title: "Could not post announcement",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="crystal-card p-4 edge-light space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-heading font-semibold text-[14px] text-foreground">Announcements</h3>
              <p className="text-[12px] text-muted-foreground">Share updates with everyone in the community.</p>
            </div>
            <button
              onClick={() => setComposerOpen((open) => !open)}
              className="flex items-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-[11px] font-semibold text-background spring-tap"
            >
              <Plus className="h-3.5 w-3.5" />
              Post Announcement
            </button>
          </div>

          {composerOpen && (
            <div className="space-y-3 border-t border-border/30 pt-3">
              <input
                value={form.title}
                onChange={(e) => setForm((s) => ({ ...s, title: e.target.value.slice(0, 80) }))}
                placeholder="Announcement title"
                className="w-full rounded-[16px] border border-border/40 bg-background px-4 py-3 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
              <textarea
                value={form.content}
                onChange={(e) => setForm((s) => ({ ...s, content: e.target.value.slice(0, 500) }))}
                placeholder="Write your update"
                rows={4}
                className="w-full rounded-[16px] border border-border/40 bg-background px-4 py-3 text-[13px] text-foreground outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setForm((s) => ({ ...s, priority }))}
                    className={
                      "rounded-full px-3.5 py-2 text-[11px] font-semibold spring-tap " +
                      (form.priority === priority
                        ? "bg-foreground text-background"
                        : "border border-border/40 bg-card text-muted-foreground")
                    }
                  >
                    {priority}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                <span>{form.title.length}/80 · {form.content.length}/500</span>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-full bg-primary px-4 py-2 text-[11px] font-semibold text-primary-foreground disabled:opacity-50"
                >
                  {submitting ? <span className="flex items-center gap-1.5"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Posting...</span> : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((announcement, index) => (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.25 }}
              className="crystal-card p-4 edge-light"
            >
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading font-semibold text-[14px] text-foreground">{announcement.title}</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {announcement.created_date ? new Date(announcement.created_date).toLocaleString() : "Just now"}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${priorityStyles[announcement.priority] || priorityStyles.Normal}`}>
                  {announcement.priority || "Normal"}
                </span>
              </div>
              <p className="text-[12px] leading-relaxed text-muted-foreground">{announcement.content}</p>
            </motion.div>
          ))}
        </div>
      )}

      {rules.length > 0 && (
        <div className="crystal-card p-4 edge-light">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="w-4 h-4" style={{ color: `hsl(${accent})` }} />
            <h3 className="font-heading font-semibold text-[14px] text-foreground">Community Rules</h3>
          </div>
          <div className="space-y-2">
            {rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[11px] font-bold mt-0.5" style={{ color: `hsl(${accent})` }}>{i + 1}.</span>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {meta.length > 0 && (
        <div className="crystal-card p-4 edge-light">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-heading font-semibold text-[14px] text-foreground">About</h3>
          </div>
          <div className="space-y-2.5">
            {meta.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[12px] text-muted-foreground">{m.label}</span>
                  </div>
                  <span className="text-[12px] font-semibold text-foreground capitalize text-right">{m.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div className="crystal-card p-4 edge-light">
          <h3 className="font-heading font-semibold text-[14px] text-foreground mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 rounded-full glass text-[11px] font-medium text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {announcements.length === 0 && rules.length === 0 && meta.length === 0 && tags.length === 0 && (
        <EmptyState icon={Megaphone} title="No info available" description="Community details will appear here." />
      )}
    </div>
  );
}
