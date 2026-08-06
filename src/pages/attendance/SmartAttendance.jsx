import React, { useState } from "react";
import { motion } from "framer-motion";
import { QrCode, KeyRound, Clock, CheckCircle2, XCircle, AlertTriangle, Play, StopCircle, Users } from "lucide-react";
import { useSmartAttendance } from "@/lib/attendance/useSmartAttendance";

export default function SmartAttendance() {
  const s = useSmartAttendance();
  const isLecturer = s.user?.role === "admin" || s.user?.data?.is_lecturer;

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <header className="mb-5">
        <h1 className="font-heading font-extrabold text-[28px] text-foreground tracking-tight">Smart Attendance</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Check into live classes with a code, track your record, and spot attendance risks early.</p>
      </header>

      <Analytics rate={s.rate} present={s.present} absent={s.absent} excused={s.excused} total={s.total} />

      {isLecturer && <LecturerLauncher
        start={s.startSession}
        pending={s.startSessionPending}
        active={s.activeSessions.filter((x) => x.created_by_id === s.user?.id)}
        onClose={s.closeSession}
      />}

      <StudentCheckIn
        sessions={s.activeSessions}
        onCheckIn={s.checkIn}
        onCheckByCode={s.checkInByCode}
        checkingIn={s.checkingIn}
        alreadyCheckedIn={s.alreadyCheckedIn}
      />

      <History records={s.myRecords} />
    </div>
  );
}

function Analytics({ rate, present, absent, excused, total }) {
  const risk = total > 0 && rate < 70;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[24px] p-5 glass-card mb-5"
    >
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="34" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(rate / 100) * 213.6} 213.6`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[18px] font-extrabold text-foreground">{rate}%</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-foreground">Attendance rate</p>
          <p className="text-[11px] text-muted-foreground">{total} classes recorded</p>
          {risk && (
            <p className="flex items-center gap-1 text-[11px] text-warning font-semibold mt-1">
              <AlertTriangle className="w-3 h-3" /> Low attendance — Bud can help you catch up.
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Stat icon={CheckCircle2} label="Present" value={present} tone="success" />
        <Stat icon={XCircle} label="Absent" value={absent} tone="error" />
        <Stat icon={Clock} label="Excused" value={excused} tone="information" />
      </div>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value, tone }) {
  const toneClass = {
    success: "bg-success/10 text-success",
    error: "bg-error/10 text-error",
    information: "bg-information/10 text-information",
  }[tone];
  return (
    <div className={`rounded-[14px] p-2.5 flex items-center gap-2 ${toneClass}`}>
      <Icon className="w-3.5 h-3.5" />
      <div>
        <p className="text-[14px] font-bold leading-none">{value}</p>
        <p className="text-[10px] opacity-80 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function LecturerLauncher({ start, pending, active, onClose }) {
  const [open, setOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [location, setLocation] = useState("");

  const submit = () => {
    if (!courseCode.trim()) return;
    start({ courseCode: courseCode.trim(), courseTitle: courseTitle.trim(), durationMinutes: duration, location: location.trim() });
    setOpen(false);
    setCourseCode(""); setCourseTitle(""); setLocation("");
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[14px] font-bold text-foreground flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> Lecturer tools</h2>
        <button onClick={() => setOpen((v) => !v)} className="text-[12px] font-semibold text-primary spring-tap">
          {open ? "Cancel" : "Start session"}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-[20px] p-4 glass-card space-y-2.5"
        >
          <Field label="Course code" value={courseCode} onChange={setCourseCode} placeholder="CSC 401" />
          <Field label="Course title" value={courseTitle} onChange={setCourseTitle} placeholder="Software Engineering" />
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Duration (min)" value={duration} onChange={(v) => setDuration(Number(v))} type="number" />
            <Field label="Location" value={location} onChange={setLocation} placeholder="LT2" />
          </div>
          <button onClick={submit} disabled={pending} className="w-full py-2.5 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap disabled:opacity-50 flex items-center justify-center gap-1.5">
            <Play className="w-3.5 h-3.5" /> Open session
          </button>
        </motion.div>
      )}

      {active.map((a) => {
        const minsLeft = Math.max(0, Math.round((new Date(a.expires_at).getTime() - Date.now()) / 60000));
        return (
          <div key={a.id} className="rounded-[20px] p-4 glass-card mt-2.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[12px] text-muted-foreground">{a.course_code}{a.course_title ? ` · ${a.course_title}` : ""}</p>
                <p className="text-[10px] text-muted-foreground">{minsLeft} min left</p>
              </div>
              <button onClick={() => onClose(a.id)} className="text-[11px] font-semibold text-error px-3 py-1.5 rounded-full bg-error/8 spring-tap flex items-center gap-1">
                <StopCircle className="w-3 h-3" /> Close
              </button>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-24 h-24 rounded-[16px] bg-primary/8 flex items-center justify-center">
                <QrCode className="w-12 h-12 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Check-in code</p>
                <p className="text-[28px] font-extrabold text-foreground tracking-[0.2em] leading-none">{a.code}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StudentCheckIn({ sessions, onCheckIn, onCheckByCode, checkingIn, alreadyCheckedIn }) {
  const [code, setCode] = useState("");

  return (
    <div className="mb-5">
      <h2 className="text-[14px] font-bold text-foreground mb-2">Check in</h2>

      <div className="rounded-[20px] p-4 glass-card mb-2.5">
        <p className="text-[11px] text-muted-foreground mb-2 flex items-center gap-1"><KeyRound className="w-3 h-3" /> Enter the code your lecturer shared</p>
        <div className="flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="flex-1 h-11 rounded-[14px] bg-muted/40 border border-border px-3 text-[16px] font-bold tracking-[0.2em] text-foreground outline-none focus:border-primary/50"
            maxLength={6}
          />
          <button
            onClick={() => { onCheckByCode(code); setCode(""); }}
            disabled={checkingIn || code.length < 4}
            className="px-4 rounded-[14px] bg-primary text-primary-foreground text-[13px] font-semibold spring-tap disabled:opacity-50"
          >
            Check in
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p className="text-[12px] text-muted-foreground text-center py-6">No live sessions right now. Ask your lecturer to open one.</p>
      ) : (
        <div className="space-y-2.5">
          {sessions.map((sess) => {
            const done = alreadyCheckedIn(sess.course_code);
            return (
              <div key={sess.id} className="rounded-[18px] p-3.5 glass-card flex items-center gap-3">
                <div className="w-12 h-12 rounded-[14px] bg-primary/8 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground truncate">{sess.course_title || sess.course_code}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{sess.course_code} · {sess.lecturer_name || "Lecturer"}</p>
                </div>
                {done ? (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
                    <CheckCircle2 className="w-3.5 h-3.5" /> In
                  </span>
                ) : (
                  <button
                    onClick={() => onCheckIn(sess)}
                    disabled={checkingIn}
                    className="text-[12px] font-semibold text-primary-foreground px-3.5 py-1.5 rounded-full bg-primary spring-tap disabled:opacity-50"
                  >
                    Check in
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function History({ records }) {
  if (records.length === 0) return null;
  const tone = {
    present: { icon: CheckCircle2, cls: "text-success" },
    absent: { icon: XCircle, cls: "text-error" },
    excused: { icon: Clock, cls: "text-information" },
  };
  return (
    <div>
      <h2 className="text-[14px] font-bold text-foreground mb-2">Recent attendance</h2>
      <div className="space-y-2">
        {records.slice(0, 12).map((r) => {
          const t = tone[r.status] || tone.present;
          const Icon = t.icon;
          return (
            <div key={r.id} className="rounded-[16px] p-3 glass-card flex items-center gap-3">
              <Icon className={`w-4 h-4 ${t.cls}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-foreground truncate">{r.course_title || r.course_code}</p>
                <p className="text-[10px] text-muted-foreground">{r.date}{r.note ? ` · ${r.note}` : ""}</p>
              </div>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">{r.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label className="text-[11px] font-semibold text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full h-10 rounded-[12px] bg-muted/40 border border-border px-3 text-[13px] text-foreground outline-none focus:border-primary/50"
      />
    </div>
  );
}