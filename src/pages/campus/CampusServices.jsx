import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Wrench, Bus, Plus, Clock, MapPin, Send } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";
const EASE = [0.16, 1, 0.3, 1];

const TABS = [
  { key: "bookings", label: "Bookings", icon: Calendar },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
  { key: "shuttle", label: "Shuttle", icon: Bus },
];

const BOOKING_TYPES = [
  { value: "study_room", label: "Study Room" },
  { value: "equipment", label: "Equipment" },
  { value: "laboratory", label: "Laboratory" },
  { value: "studio", label: "Studio" },
  { value: "sports_facility", label: "Sports" },
];

const SHUTTLE_ROUTES = [
  { route: "Campus Loop A", stops: ["Main Gate", "Library", "Science Block", "Engineering", "Hostels"], schedule: "7:00 AM – 9:00 PM", frequency: "Every 15 min" },
  { route: "Campus Loop B", stops: ["Second Gate", "Medical Centre", "Arts Block", "Business School", "Hostels"], schedule: "8:00 AM – 8:00 PM", frequency: "Every 20 min" },
  { route: "Town Shuttle", stops: ["Main Gate", "Shopping Mall", "Market", "Bus Terminal"], schedule: "9:00 AM – 7:00 PM", frequency: "Every 30 min" },
];

export default function CampusServices() {
  const [tab, setTab] = React.useState("bookings");

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-40 safe-area-pt">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/home" className="w-10 h-10 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM }} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: CREAM }}>Campus Services</h1>
          <p className="text-[13px]" style={{ color: CREAM_MUTED }}>Bookings, maintenance & transport</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} className="flex-1 flex flex-col items-center justify-center gap-1.5 h-[56px] rounded-[14px] spring-tap" style={{ background: active ? "rgba(255,138,42,0.15)" : "rgba(44,33,26,0.4)", border: active ? "1px solid rgba(255,138,42,0.3)" : "1px solid rgba(255,255,255,0.05)" }}>
              <Icon className="w-[17px] h-[17px]" strokeWidth={2} style={{ color: active ? ORANGE : CREAM_MUTED }} />
              <span className="text-[11px] font-semibold" style={{ color: active ? ORANGE : CREAM_MUTED }}>{t.label}</span>
            </button>
          );
        })}
      </div>

      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }}>
        {tab === "bookings" && <BookingsTab />}
        {tab === "maintenance" && <MaintenanceTab />}
        {tab === "shuttle" && <ShuttleTab />}
      </motion.div>
    </div>
  );
}

function BookingsTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ booking_type: "study_room", resource_name: "", date: "", start_time: "", end_time: "", location: "", purpose: "" });

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["campus-bookings"],
    queryFn: () => base44.entities.CampusBooking.filter({}, "-date", 50),
    staleTime: 30000,
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.CampusBooking.create({ ...data, booking_code: `BK-${Date.now().toString().slice(-6)}`, status: "pending" }),
    onSuccess: () => { qc.invalidateQueries(["campus-bookings"]); toast({ title: "Booking requested ✓" }); setForm({ booking_type: "study_room", resource_name: "", date: "", start_time: "", end_time: "", location: "", purpose: "" }); setShowForm(false); },
    onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  if (showForm) return <BookingForm form={form} setForm={setForm} onSubmit={() => createMut.mutate(form)} loading={createMut.isPending} onClose={() => setShowForm(false)} />;

  return (
    <div>
      <button onClick={() => setShowForm(true)} className="w-full h-12 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-[14px] mb-4 spring-tap" style={{ background: ORANGE, color: "#1a1208" }}>
        <Plus className="w-4 h-4" /> New Booking
      </button>
      {isLoading ? <SkeletonList /> : !bookings?.length ? <Empty label="No bookings yet" icon={Calendar} /> : (
        <div className="flex flex-col gap-3">
          {bookings.map((b, i) => (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, ease: EASE }} className="glass-card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold truncate" style={{ color: CREAM }}>{b.resource_name}</p>
                  <p className="text-[12px] capitalize" style={{ color: CREAM_MUTED }}>{b.booking_type.replace(/_/g, " ")}</p>
                </div>
                <StatusPill status={b.status} />
              </div>
              <div className="flex items-center gap-3 text-[12px]" style={{ color: CREAM_MUTED }}>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {b.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {b.start_time}–{b.end_time}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function BookingForm({ form, setForm, onSubmit, loading, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
      <button onClick={onClose} className="flex items-center gap-2 text-[13px] spring-tap" style={{ color: ORANGE }}><ArrowLeft className="w-4 h-4" /> Back</button>
      <select value={form.booking_type} onChange={(e) => setForm({ ...form, booking_type: e.target.value })} className="h-12 px-4 rounded-[14px] text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }}>
        {BOOKING_TYPES.map((t) => <option key={t.value} value={t.value} style={{ color: "#000" }}>{t.label}</option>)}
      </select>
      <input value={form.resource_name} onChange={(e) => setForm({ ...form, resource_name: e.target.value })} placeholder="Resource name (e.g. Library Room 2A)" className="h-12 px-4 rounded-[14px] text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
      <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location / Building" className="h-12 px-4 rounded-[14px] text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="h-12 px-4 rounded-[14px] text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
        <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className="h-12 px-4 rounded-[14px] text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
      </div>
      <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} placeholder="End time" className="h-12 px-4 rounded-[14px] text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
      <textarea value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="Purpose of booking…" rows={3} className="px-4 py-3 rounded-[14px] text-[14px] outline-none resize-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
      <button onClick={onSubmit} disabled={loading || !form.resource_name || !form.date || !form.start_time} className="h-12 rounded-[14px] font-semibold text-[14px] flex items-center justify-center gap-2 spring-tap disabled:opacity-40" style={{ background: ORANGE, color: "#1a1208" }}>
        <Send className="w-4 h-4" /> {loading ? "Requesting…" : "Request Booking"}
      </button>
    </motion.div>
  );
}

function MaintenanceTab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState({ category: "electrical", location: "", description: "", urgency: "medium" });

  const { data: requests, isLoading } = useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: () => base44.entities.MaintenanceRequest.filter({}, "-created_date", 50),
    staleTime: 30000,
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.MaintenanceRequest.create(data),
    onSuccess: () => { qc.invalidateQueries(["maintenance-requests"]); toast({ title: "Request submitted ✓" }); setForm({ category: "electrical", location: "", description: "", urgency: "medium" }); setShowForm(false); },
    onError: (e) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const CATEGORIES = [
    { value: "electrical", label: "Electrical" }, { value: "plumbing", label: "Plumbing" },
    { value: "furniture", label: "Furniture" }, { value: "internet", label: "Internet" },
    { value: "cleaning", label: "Cleaning" }, { value: "hvac", label: "AC/Cooling" }, { value: "other", label: "Other" },
  ];

  if (showForm) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
        <button onClick={() => setShowForm(false)} className="flex items-center gap-2 text-[13px] spring-tap" style={{ color: ORANGE }}><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => <button key={c.value} onClick={() => setForm({ ...form, category: c.value })} className="px-3 py-1.5 rounded-full text-[12px] font-medium spring-tap" style={{ background: form.category === c.value ? "rgba(255,138,42,0.2)" : "rgba(255,255,255,0.05)", color: form.category === c.value ? ORANGE : CREAM_MUTED, border: form.category === c.value ? "1px solid rgba(255,138,42,0.3)" : "1px solid transparent" }}>{c.label}</button>)}
        </div>
        <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location (Building / Room)" className="h-12 px-4 rounded-[14px] text-[14px] outline-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue…" rows={4} className="px-4 py-3 rounded-[14px] text-[14px] outline-none resize-none" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)", color: CREAM }} />
        <div className="flex gap-2">
          {[{ k: "low", l: "Low" }, { k: "medium", l: "Medium" }, { k: "high", l: "High" }, { k: "urgent", l: "Urgent" }].map((u) => <button key={u.k} onClick={() => setForm({ ...form, urgency: u.k })} className="flex-1 h-11 rounded-[12px] text-[13px] font-semibold spring-tap" style={form.urgency === u.k ? { background: ORANGE, color: "#1a1208" } : { background: "rgba(255,255,255,0.05)", color: CREAM_MUTED }}>{u.l}</button>)}
        </div>
        <button onClick={() => createMut.mutate(form)} disabled={!form.location || !form.description} className="h-12 rounded-[14px] font-semibold text-[14px] flex items-center justify-center gap-2 spring-tap disabled:opacity-40" style={{ background: ORANGE, color: "#1a1208" }}>
          <Send className="w-4 h-4" /> {createMut.isPending ? "Submitting…" : "Submit Request"}
        </button>
      </motion.div>
    );
  }

  return (
    <div>
      <button onClick={() => setShowForm(true)} className="w-full h-12 rounded-[14px] flex items-center justify-center gap-2 font-semibold text-[14px] mb-4 spring-tap" style={{ background: ORANGE, color: "#1a1208" }}>
        <Plus className="w-4 h-4" /> Report Issue
      </button>
      {isLoading ? <SkeletonList /> : !requests?.length ? <Empty label="No maintenance requests" icon={Wrench} /> : (
        <div className="flex flex-col gap-3">
          {requests.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, ease: EASE }} className="glass-card p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold capitalize" style={{ color: CREAM }}>{r.category}</p>
                  <p className="text-[12px] flex items-center gap-1 truncate" style={{ color: CREAM_MUTED }}><MapPin className="w-3 h-3" /> {r.location}</p>
                </div>
                <StatusPill status={r.status} />
              </div>
              <p className="text-[12px] line-clamp-2" style={{ color: CREAM_MUTED }}>{r.description}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShuttleTab() {
  return (
    <div className="flex flex-col gap-3">
      {SHUTTLE_ROUTES.map((route, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, ease: EASE }} className="glass-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full grid place-items-center shrink-0" style={{ background: "rgba(255,138,42,0.12)" }}><Bus className="w-5 h-5" style={{ color: ORANGE }} /></div>
            <div className="flex-1">
              <p className="text-[14px] font-semibold" style={{ color: CREAM }}>{route.route}</p>
              <p className="text-[12px]" style={{ color: CREAM_MUTED }}>{route.frequency}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {route.stops.map((stop, idx) => (
              <span key={idx} className="text-[11px] px-2 py-1 rounded-full" style={{ background: "rgba(255,255,255,0.05)", color: CREAM_MUTED }}>{stop}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[12px]" style={{ color: CREAM_MUTED }}>
            <Clock className="w-3 h-3" /> {route.schedule}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function StatusPill({ status }) {
  const colors = { pending: "rgba(59,130,246,0.15)", confirmed: "rgba(34,197,94,0.15)", checked_in: "rgba(168,85,247,0.15)", completed: "rgba(100,116,139,0.15)", cancelled: "rgba(239,68,68,0.15)", rejected: "rgba(239,68,68,0.15)", submitted: "rgba(59,130,246,0.15)", assigned: "rgba(245,158,11,0.15)", in_progress: "rgba(245,158,11,0.15)", resolved: "rgba(34,197,94,0.15)", closed: "rgba(100,116,139,0.15)" };
  const text = { pending: "#3B82F6", confirmed: "#22C55E", checked_in: "#A855F7", completed: "#64748B", cancelled: "#EF4444", rejected: "#EF4444", submitted: "#3B82F6", assigned: "#F59E0B", in_progress: "#F59E0B", resolved: "#22C55E", closed: "#64748B" };
  return <span className="text-[10px] font-bold px-2 py-1 rounded-full capitalize shrink-0" style={{ background: colors[status] || "rgba(255,255,255,0.05)", color: text[status] || CREAM_MUTED }}>{(status || "").replace(/_/g, " ")}</span>;
}

function SkeletonList() {
  return <div className="flex flex-col gap-3">{[...Array(4)].map((_, i) => <div key={i} className="glass-card p-4 h-16 shimmer" />)}</div>;
}

function Empty({ label, icon: Icon }) {
  return <div className="flex flex-col items-center py-16"><Icon className="w-8 h-8 mb-3" style={{ color: CREAM_MUTED }} /><p className="text-[14px]" style={{ color: CREAM_MUTED }}>{label}</p></div>;
}