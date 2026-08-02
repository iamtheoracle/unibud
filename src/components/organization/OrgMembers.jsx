import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { ClipboardCheck, Check, X, Clock, Plus, Calendar } from "lucide-react";
import { ROLE_META, MEETING_TYPES, isOfficer, timeAgo } from "./orgConstants";
import EmptyState from "@/components/ui/EmptyState";

export default function OrgMembers({ club, user }) {
  const officer = isOfficer(club.members, user?.id);
  const [recording, setRecording] = useState(false);

  return (
    <div className="space-y-4">
      {/* Roster */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Roster · {club.members_count || 0}</span>
          {officer && (
            <button onClick={() => setRecording(!recording)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold spring-tap">
              <ClipboardCheck className="w-3.5 h-3.5" /> Record Attendance
            </button>
          )}
        </div>
        {(club.members || []).map((m) => <MemberRow key={m.user_id} member={m} />)}
      </div>

      {recording && <AttendanceComposer club={club} user={user} onClose={() => setRecording(false)} />}

      {/* Attendance History */}
      <AttendanceHistory club={club} />
    </div>
  );
}

function MemberRow({ member }) {
  const role = ROLE_META[member.role] || ROLE_META.member;
  return (
    <div className="flex items-center gap-3 p-3 rounded-[16px] bg-card soft-shadow">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-[13px] font-bold text-primary">
        {(member.name || "?")[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-foreground truncate">{member.name}</p>
        <p className="text-[10px] text-muted-foreground">Joined {timeAgo(member.joined_at)}</p>
      </div>
      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${role.bg} ${role.color}`}>{role.label}</span>
    </div>
  );
}

function AttendanceComposer({ club, user, onClose }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState("general");
  const [statuses, setStatuses] = useState({});

  const members = club.members || [];
  const toggle = (uid, status) => setStatuses((s) => ({ ...s, [uid]: s[uid] === status ? "present" : status }));

  const submit = async () => {
    if (!title.trim()) return;
    const attendees = members.map((m) => ({
      user_id: m.user_id,
      name: m.name,
      image: m.image || "",
      status: statuses[m.user_id] || "present",
      check_in_time: statuses[m.user_id] === "absent" ? "" : new Date().toISOString(),
    }));
    await base44.entities.ClubAttendance.create({
      club_id: club.id,
      club_name: club.name,
      meeting_title: title.trim(),
      meeting_date: date,
      meeting_type: type,
      attendees,
      total_present: attendees.filter((a) => a.status === "present").length,
      total_absent: attendees.filter((a) => a.status === "absent").length,
      recorded_by_name: user.full_name,
      recorded_by_id: user.id,
      institution_id: club.institution_id,
    });
    qc.invalidateQueries({ queryKey: ["org-attendance", club.id] });
    toast({ title: "Attendance recorded", description: `${attendees.filter((a) => a.status === "present").length} present` });
    onClose();
  };

  return (
    <div className="p-3.5 rounded-[18px] bg-card soft-shadow space-y-3">
      <p className="text-[13px] font-bold text-foreground">Record Attendance</p>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title..." className="w-full px-3 py-2.5 rounded-[12px] bg-background border border-border text-[13px] focus:outline-none focus:border-primary/40" />
      <div className="flex gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 px-3 py-2.5 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="flex-1 px-3 py-2.5 rounded-[12px] bg-background border border-border text-[12px] focus:outline-none focus:border-primary/40">
          {Object.entries(MEETING_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {members.map((m) => {
          const st = statuses[m.user_id] || "present";
          return (
            <div key={m.user_id} className="flex items-center gap-2 p-2 rounded-[12px] bg-background">
              <span className="text-[12px] text-foreground flex-1 truncate">{m.name}</span>
              <button onClick={() => toggle(m.user_id, "present")} className={`w-7 h-7 rounded-full flex items-center justify-center spring-tap ${st === "present" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}><Check className="w-3.5 h-3.5" /></button>
              <button onClick={() => toggle(m.user_id, "absent")} className={`w-7 h-7 rounded-full flex items-center justify-center spring-tap ${st === "absent" ? "bg-error/20 text-error" : "bg-muted text-muted-foreground"}`}><X className="w-3.5 h-3.5" /></button>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button onClick={onClose} className="flex-1 py-2.5 rounded-[12px] bg-muted text-muted-foreground text-[13px] font-semibold spring-tap">Cancel</button>
        <button onClick={submit} className="flex-1 py-2.5 rounded-[12px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap">Save</button>
      </div>
    </div>
  );
}

function AttendanceHistory({ club }) {
  const { data: records } = useQuery({
    queryKey: ["org-attendance", club.id],
    queryFn: () => base44.entities.ClubAttendance.filter({ club_id: club.id }, "-meeting_date", 10),
  });
  if (!records || records.length === 0) return null;

  return (
    <div className="space-y-2">
      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide px-1">Attendance History</span>
      {records.map((r) => {
        const meta = MEETING_TYPES[r.meeting_type] || MEETING_TYPES.general;
        const rate = r.total_present + r.total_absent > 0 ? Math.round((r.total_present / (r.total_present + r.total_absent)) * 100) : 0;
        return (
          <div key={r.id} className="flex items-center gap-3 p-3 rounded-[16px] bg-card soft-shadow">
            <div className="w-10 h-10 rounded-[12px] bg-primary/10 flex items-center justify-center">
              <ClipboardCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-foreground truncate">{r.meeting_title}</p>
              <p className="text-[10px] text-muted-foreground">{r.meeting_date} · <span className={meta.color}>{meta.label}</span></p>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-bold text-foreground">{rate}%</p>
              <p className="text-[10px] text-muted-foreground">{r.total_present}/{r.total_present + r.total_absent}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}