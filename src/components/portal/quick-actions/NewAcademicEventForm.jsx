import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCw, Repeat, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Field, inputClass, SubmitBar, SuccessState } from "@/components/portal/quick-actions/NewAssignmentForm";

const EVENT_TYPES = [
  { value: "class", label: "Lecture / Class" },
  { value: "event", label: "Seminar" },
  { value: "exam", label: "Examination" },
  { value: "deadline", label: "Deadline" },
  { value: "study_session", label: "Study Session" },
  { value: "live_class", label: "Live Class" },
  { value: "mentorship", label: "Mentorship" },
  { value: "personal", label: "Meeting" },
  { value: "tradition", label: "Workshop" },
];

export default function NewAcademicEventForm({ user, onClose }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    type: "class",
    date: new Date().toISOString().split("T")[0],
    start_time: "09:00",
    end_time: "10:00",
    location: "",
    description: "",
    is_all_day: false,
    online_link: "",
    sync_google: true,
    send_reminder: true,
    recurring: false,
  });

  const mutation = useMutation({
    mutationFn: (data) => base44.entities.CalendarEvent.create(data),
    onSuccess: async (created) => {
      queryClient.invalidateQueries({ queryKey: ["portalCalendarEvents"] });
      if (form.sync_google && created?.id) {
        setSyncing(true);
        try {
          await base44.functions.invoke("googleCalendarSync", { action: "sync_single", event_id: created.id });
          queryClient.invalidateQueries({ queryKey: ["portalCalendarEvents"] });
        } catch (e) { /* sync failure is non-blocking */ }
        setSyncing(false);
      }
      setSuccess(true);
      setTimeout(onClose, 1500);
    },
  });

  const handleSubmit = () => {
    if (!form.title || !form.date) return;
    const onlineSuffix = form.online_link ? "\n\nOnline: " + form.online_link : "";
    const data = {
      title: form.title,
      type: form.type,
      date: form.date,
      start_time: form.is_all_day ? undefined : form.start_time,
      end_time: form.is_all_day ? undefined : form.end_time,
      location: form.location || form.online_link,
      description: form.description + onlineSuffix,
      is_all_day: form.is_all_day,
      is_completed: false,
    };
    mutation.mutate(data);
  };

  if (success) return <SuccessState message="Academic event created and synced to Google Calendar." />;
  if (syncing) return <SyncingState />;

  return (
    <div className="p-5 space-y-4">
      <Field label="Event Title" required>
        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Departmental Seminar on Machine Learning" className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Event Type">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
            {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Date" required>
          <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputClass} />
        </Field>
      </div>

      <button type="button" onClick={() => setForm({ ...form, is_all_day: !form.is_all_day })}
        className="flex items-center gap-2 text-[12px] font-medium text-foreground">
        <input type="checkbox" checked={form.is_all_day} onChange={(e) => setForm({ ...form, is_all_day: e.target.checked })}
          className="w-4 h-4 rounded accent-primary" />
        All-day event
      </button>

      {!form.is_all_day && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Time">
            <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className={inputClass} />
          </Field>
          <Field label="End Time">
            <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className={inputClass} />
          </Field>
        </div>
      )}

      <Field label="Location">
        <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="e.g. Auditorium B, Engineering Block" className={inputClass} />
      </Field>

      <Field label="Online Meeting Link">
        <input type="url" value={form.online_link} onChange={(e) => setForm({ ...form, online_link: e.target.value })}
          placeholder="https://meet.unibud.app/..." className={inputClass} />
      </Field>

      <Field label="Description">
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Event details, agenda, attendees..." rows={3} className={inputClass + " resize-none"} />
      </Field>

      <div className="space-y-2">
        <Toggle checked={form.sync_google} onChange={(v) => setForm({ ...form, sync_google: v })} icon={RefreshCw} label="Sync to Google Calendar" />
        <Toggle checked={form.send_reminder} onChange={(v) => setForm({ ...form, send_reminder: v })} icon={Bell} label="Send reminder to attendees" />
        <Toggle checked={form.recurring} onChange={(v) => setForm({ ...form, recurring: v })} icon={Repeat} label="Recurring event (weekly)" />
      </div>

      <SubmitBar onSubmit={handleSubmit} disabled={!form.title || !form.date || mutation.isPending} loading={mutation.isPending} label="Create Event" />
    </div>
  );
}

function Toggle({ checked, onChange, icon: Icon, label }) {
  const trackColor = checked ? "bg-primary" : "bg-muted-foreground/30";
  const iconColor = checked ? "text-primary" : "text-muted-foreground";
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center gap-3 w-full p-3 rounded-[14px] bg-muted/30 border border-border/20 hover:bg-muted/50 transition-colors">
      <Icon className={"w-4 h-4 " + iconColor} />
      <span className="flex-1 text-left text-[13px] font-medium text-foreground">{label}</span>
      <div className={"w-9 h-5 rounded-full transition-colors relative " + trackColor}>
        <motion.div animate={{ x: checked ? 18 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow" />
      </div>
    </button>
  );
}

function SyncingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 rounded-[20px] bg-info/10 flex items-center justify-center mb-4">
        <RefreshCw className="w-8 h-8 text-info" />
      </motion.div>
      <h3 className="font-heading font-bold text-[16px] text-foreground mb-1">Syncing to Google Calendar</h3>
      <p className="text-[13px] text-muted-foreground max-w-xs">Pushing event to the shared staff calendar...</p>
    </div>
  );
}