import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, MapPin, Clock, Plus, CalendarPlus } from "lucide-react";
import { isOfficer } from "./orgConstants";
import EmptyState from "@/components/ui/EmptyState";

export default function OrgEvents({ club, user }) {
  const officer = isOfficer(club.members, user?.id);
  const [composing, setComposing] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["org-events", club.id],
    queryFn: () => base44.entities.CampusEvent.filter({ community_id: club.id }, "date", 30),
  });

  const addToCalendar = async (ev) => {
    try {
      await base44.entities.CalendarEvent.create({
        title: ev.title,
        description: ev.description || "",
        type: "event",
        date: ev.date,
        start_time: ev.start_time || "",
        end_time: ev.end_time || "",
        location: ev.location || "",
        source_entity: "CampusEvent",
        source_id: ev.id,
      });
      toast({ title: "Added to your calendar" });
    } catch {
      toast({ title: "Couldn't add to calendar", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-3">
      {officer && (
        <button onClick={() => setComposing(!composing)} className="w-full flex items-center justify-center gap-2 p-3 rounded-[16px] bg-primary/10 text-primary spring-tap">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-[13px] font-semibold">Create Event</span>
        </button>
      )}

      {composing && <EventComposer club={club} user={user} onClose={() => setComposing(false)} />}

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-[16px] shimmer" />)}</div>
      ) : (events || []).length === 0 ? (
        <EmptyState icon={Calendar} title="No events yet" description="Club events will appear here once scheduled." />
      ) : (
        (events || []).map((ev) => (
          <div key={ev.id} className="p-3.5 rounded-[18px] bg-card soft-shadow">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-[14px] bg-primary/10 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[14px] font-bold text-primary leading-none">{ev.date ? new Date(ev.date).getDate() : "?"}</span>
                <span className="text-[8px] text-primary uppercase">{ev.date ? new Date(ev.date).toLocaleString("default", { month: "short" }) : ""}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-foreground">{ev.title}</p>
                {ev.description && <p className="text-[12px] text-muted-foreground line-clamp-2 mt-0.5">{ev.description}</p>}
                <div className="flex items-center gap-3 mt-2">
                  {ev.start_time && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-3 h-3" />{ev.start_time}</span>}
                  {ev.location && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="w-3 h-3" />{ev.location}</span>}
                </div>
              </div>
            </div>
            <button onClick={() => addToCalendar(ev)} className="w-full mt-3 py-2 rounded-[12px] bg-muted/60 text-muted-foreground text-[11px] font-semibold flex items-center justify-center gap-1.5 spring-tap">
              <CalendarPlus className="w-3.5 h-3.5" /> Add to Calendar
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function EventComposer({ club, user, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState({ title: "", description: "", date: "", start_time: "", location: "" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim() || !form.date) return;
    await base44.entities.CampusEvent.create({
      ...form,
      type: "club_meeting",
      community_id: club.id,
      status: "upcoming",
      organizer_name: user.full_name,
      organizer_type: "club",
      institution_id: club.institution_id,
    });
    qc.invalidateQueries({ queryKey: ["org-events", club.id] });
    toast({ title: "Event created" });
    onClose();
  };

  return (
    <div className="p-3.5 rounded-[18px] bg-card soft-shadow space-y-3">
      <p className="text-[13px] font-bold text-foreground">Create Event</p>
      <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Event title..." className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[13px] font-semibold focus:outline-none focus:border-primary/40" />
      <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Description..." rows={2} className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40 resize-none" />
      <div className="flex gap-2">
        <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="flex-1 px-3 py-2.5 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40" />
        <input type="time" value={form.start_time} onChange={(e) => set("start_time", e.target.value)} className="px-3 py-2.5 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40" />
      </div>
      <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Location..." className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40" />
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-[12px] bg-muted text-muted-foreground text-[13px] font-semibold spring-tap">Cancel</button>
        <button onClick={submit} className="flex-1 py-2.5 rounded-[12px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">Create</button>
      </div>
    </div>
  );
}