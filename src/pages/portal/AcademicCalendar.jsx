import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays, Plus, RefreshCw, CheckCircle2, Clock, MapPin,
  ExternalLink, Loader2, Calendar as CalendarIcon, X, AlertCircle,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PortalPageHeader, SectionCard } from "@/components/portal/PortalUI";

const EVENT_TYPE_COLORS = {
  exam: "bg-error/10 text-error border-error/20",
  assignment: "bg-warning/10 text-warning border-warning/20",
  class: "bg-info/10 text-info border-info/20",
  deadline: "bg-error/10 text-error border-error/20",
  tradition: "bg-purple/10 text-purple border-purple/20",
  study_session: "bg-success/10 text-success border-success/20",
  live_class: "bg-info/10 text-info border-info/20",
  event: "bg-primary/10 text-primary border-primary/20",
  mentorship: "bg-success/10 text-success border-success/20",
  personal: "bg-muted text-foreground border-border/30",
};

const EVENT_TYPES = ["exam", "assignment", "class", "deadline", "event", "tradition", "study_session", "live_class", "mentorship", "personal"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function AcademicCalendar() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [syncResult, setSyncResult] = useState(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["portalCalendarEvents"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const items = await base44.entities.CalendarEvent.filter({ date: { $gte: today } }, "date", 100);
      return items;
    },
  });

  const { data: googleEvents } = useQuery({
    queryKey: ["googleCalendarEvents"],
    queryFn: async () => {
      const res = await base44.functions.invoke("googleCalendarSync", { action: "fetch" });
      return res.data?.events || [];
    },
    staleTime: 60 * 1000,
  });

  const syncAllMutation = useMutation({
    mutationFn: () => base44.functions.invoke("googleCalendarSync", { action: "sync" }).then((r) => r.data),
    onSuccess: (data) => {
      setSyncResult(data);
      queryClient.invalidateQueries({ queryKey: ["portalCalendarEvents"] });
    },
    onError: (err) => {
      setSyncResult({ status: "error", error: err.message });
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CalendarEvent.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalCalendarEvents"] });
      setShowCreateModal(false);
    },
  });

  const syncSingleMutation = useMutation({
    mutationFn: (eventId) =>
      base44.functions.invoke("googleCalendarSync", { action: "sync_single", event_id: eventId }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portalCalendarEvents"] });
    },
  });

  const syncedCount = events?.filter((e) => e.google_event_id)?.length || 0;
  const totalCount = events?.length || 0;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Academic Calendar"
        subtitle="Manage semester schedules, deadlines, and sync with Google Calendar."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => syncAllMutation.mutate()}
              disabled={syncAllMutation.isPending}
              className="flex items-center gap-2 h-10 px-4 rounded-[14px] bg-primary text-primary-foreground font-semibold text-[13px] hover:bg-primary/90 spring-tap disabled:opacity-50"
            >
              {syncAllMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" strokeWidth={2.2} />
              )}
              Sync to Google
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-[14px] bg-muted/60 text-foreground font-semibold text-[13px] hover:bg-muted spring-tap"
            >
              <Plus className="w-4 h-4" strokeWidth={2.2} />
              New Event
            </button>
          </div>
        }
      />

      {/* Sync status bar */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] bg-card border border-border/40 soft-shadow">
          <CalendarDays className="w-4 h-4 text-primary" />
          <span className="text-[13px] font-semibold text-foreground">{totalCount} events</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] bg-card border border-border/40 soft-shadow">
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="text-[13px] font-semibold text-foreground">{syncedCount} synced</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] bg-card border border-border/40 soft-shadow">
          <Clock className="w-4 h-4 text-info" />
          <span className="text-[13px] font-semibold text-foreground">{googleEvents?.length || 0} on Google Calendar</span>
        </div>
      </div>

      {/* Sync result toast */}
      <AnimatePresence>
        {syncResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-[16px] border ${
              syncResult.status === "error"
                ? "bg-error/5 border-error/20"
                : "bg-success/5 border-success/20"
            }`}
          >
            {syncResult.status === "error" ? (
              <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {syncResult.status === "error" ? (
                <p className="text-[13px] text-foreground font-medium">Sync failed: {syncResult.error}</p>
              ) : (
                <p className="text-[13px] text-foreground font-medium">
                  Sync complete — {syncResult.created} created, {syncResult.updated} updated out of {syncResult.total} events.
                  {syncResult.errors?.length > 0 && ` ${syncResult.errors.length} errors.`}
                </p>
              )}
            </div>
            <button onClick={() => setSyncResult(null)} className="text-muted-foreground hover:text-foreground spring-tap">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events list */}
      <SectionCard
        title="Upcoming Events"
        description="Departmental tasks, deadlines, and academic dates."
      >
        {isLoading ? (
          <div className="p-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !events || events.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <CalendarIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[14px] text-muted-foreground">No upcoming events. Create one to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {events.map((evt, i) => {
              const colorClass = EVENT_TYPE_COLORS[evt.type] || EVENT_TYPE_COLORS.personal;
              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-muted/30 transition-colors"
                >
                  {/* Date block */}
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-[14px] bg-muted/50 flex-shrink-0">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                      {new Date(evt.date + "T00:00:00").toLocaleDateString("en-US", { month: "short" })}
                    </span>
                    <span className="text-[18px] font-heading font-extrabold text-foreground leading-none">
                      {new Date(evt.date + "T00:00:00").getDate()}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-[14px] text-foreground truncate">{evt.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${colorClass}`}>
                        {evt.type?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                      {evt.start_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {evt.start_time}{evt.end_time ? `–${evt.end_time}` : ""}
                        </span>
                      )}
                      {evt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {evt.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sync status */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {evt.google_event_id ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Synced
                      </span>
                    ) : (
                      <button
                        onClick={() => syncSingleMutation.mutate(evt.id)}
                        disabled={syncSingleMutation.isPending}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold hover:bg-primary/10 hover:text-primary spring-tap disabled:opacity-50"
                      >
                        {syncSingleMutation.isPending && syncSingleMutation.variables === evt.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Sync
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Google Calendar preview */}
      {googleEvents && googleEvents.length > 0 && (
        <SectionCard
          title="Google Calendar"
          description="Events visible on the shared staff Google Calendar."
          action={
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["googleCalendarEvents"] })}
              className="flex items-center gap-1.5 h-8 px-3 rounded-[12px] bg-muted/50 text-muted-foreground hover:text-foreground text-[12px] font-medium spring-tap"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          }
        >
          <div className="divide-y divide-border/20">
            {googleEvents.slice(0, 10).map((evt, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3.5">
                <div className="w-8 h-8 rounded-[10px] bg-info/10 flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="w-4 h-4 text-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground truncate">{evt.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {evt.start ? new Date(evt.start).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : ""}
                    {evt.location ? ` · ${evt.location}` : ""}
                  </p>
                </div>
                {evt.html_link && (
                  <a href={evt.html_link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary spring-tap">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Create event modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateEventModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(data) => createMutation.mutate(data)}
            isCreating={createMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateEventModal({ onClose, onCreate, isCreating }) {
  const [form, setForm] = useState({
    title: "",
    type: "event",
    date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "10:00",
    location: "",
    description: "",
    is_all_day: false,
  });

  const handleSubmit = () => {
    if (!form.title || !form.date) return;
    onCreate(form);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg rounded-[24px] bg-card border border-border/40 elevated-shadow pointer-events-auto flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
            <h3 className="font-heading font-bold text-[16px] text-foreground">Create Calendar Event</h3>
            <button onClick={onClose} className="w-9 h-9 rounded-[12px] flex items-center justify-center text-muted-foreground hover:bg-muted/50 hover:text-foreground spring-tap">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Departmental Review Meeting"
                className="w-full h-10 px-3.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full h-10 px-3.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allDay"
                checked={form.is_all_day}
                onChange={(e) => setForm({ ...form, is_all_day: e.target.checked })}
                className="w-4 h-4 rounded accent-primary"
              />
              <label htmlFor="allDay" className="text-[13px] font-medium text-foreground cursor-pointer">All-day event</label>
            </div>
            {!form.is_all_day && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Start Time</label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-foreground mb-1.5 block">End Time</label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Room 204, Engineering Block"
                className="w-full h-10 px-3.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-foreground mb-1.5 block">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Additional details..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-[12px] bg-muted/40 border border-border/40 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-card transition-all resize-none"
              />
            </div>
          </div>
          <div className="px-5 py-4 border-t border-border/30 flex items-center justify-end gap-2">
            <button onClick={onClose} className="h-10 px-4 rounded-[14px] text-[13px] font-semibold text-muted-foreground hover:bg-muted/50 spring-tap">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.title || isCreating}
              className="flex items-center gap-2 h-10 px-5 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 spring-tap disabled:opacity-50"
            >
              {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Event
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}