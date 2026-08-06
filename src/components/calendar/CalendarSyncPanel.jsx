import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarCheck, Upload, Plus, RefreshCw, Check, AlertCircle } from "lucide-react";
import { importIcsFile, syncToGoogleCalendar, createManualTimetableEntry } from "@/lib/academic/calendarSync";

const EASE = [0.16, 1, 0.3, 1];

export default function CalendarSyncPanel() {
  const [mode, setMode] = useState(null);
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);

  const handleIcsUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMode("ics");
    setStatus("working");
    setMessage("Parsing calendar file…");
    try {
      const result = await importIcsFile(file);
      setStatus("done");
      setMessage(`Imported ${result.imported} event${result.imported !== 1 ? "s" : ""}${result.skipped ? ` · ${result.skipped} skipped` : ""}`);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Failed to import calendar");
    }
    e.target.value = "";
  };

  const handleGoogleSync = async () => {
    setMode("google");
    setStatus("working");
    setMessage("Syncing with Google Calendar…");
    try {
      const result = await syncToGoogleCalendar();
      setStatus("done");
      setMessage(`Synced ${result.created || 0} new, ${result.updated || 0} updated`);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.error || err.message || "Google Calendar sync failed");
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-4 premium-shadow mb-4">
      <div className="flex items-center gap-1.5 mb-3">
        <CalendarCheck className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Calendar Sync</span>
      </div>

      <div className="space-y-2">
        <SyncOption icon={Upload} label="Import .ics file" desc="Upload your university calendar feed" onClick={() => fileRef.current?.click()} />
        <SyncOption icon={RefreshCw} label="Sync Google Calendar" desc="Two-way sync with your Google account" onClick={handleGoogleSync} />
        <SyncOption icon={Plus} label="Add class manually" desc="Enter timetable entries by hand" onClick={() => { setMode("manual"); setStatus(null); }} />
      </div>

      <input ref={fileRef} type="file" accept=".ics,text/calendar" className="hidden" onChange={handleIcsUpload} />

      <AnimatePresence>
        {status && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="mt-3 overflow-hidden"
          >
            <div className={`flex items-center gap-2 p-3 rounded-xl text-[13px] ${
              status === "working" ? "bg-muted/30 text-muted-foreground" :
              status === "done" ? "bg-success/10 text-success" :
              "bg-destructive/10 text-destructive"
            }`}>
              {status === "working" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {status === "done" && <Check className="w-3.5 h-3.5" />}
              {status === "error" && <AlertCircle className="w-3.5 h-3.5" />}
              <span>{message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mode === "manual" && !status && (
          <ManualEntryForm
            onSubmit={async (entry) => {
              setStatus("working");
              setMessage("Adding entry…");
              try {
                await createManualTimetableEntry(entry);
                setStatus("done");
                setMessage("Class added to timetable");
              } catch (err) {
                setStatus("error");
                setMessage(err.message || "Failed to add entry");
              }
            }}
            onCancel={() => setMode(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function SyncOption({ icon: Icon, label, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/20 spring-tap hover:bg-muted/40 transition-colors text-left"
    >
      <Icon className="w-4 h-4 text-primary shrink-0" strokeWidth={2} />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
      </div>
    </button>
  );
}

function ManualEntryForm({ onSubmit, onCancel }) {
  const [entry, setEntry] = useState({
    course_code: "", course_title: "", day: "Monday",
    start_time: "08:00", end_time: "09:00", location: "", type: "lecture",
  });

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: EASE }}
      className="mt-3 overflow-hidden space-y-2"
    >
      <div className="grid grid-cols-2 gap-2">
        <input className="oracle-input" placeholder="Course code" value={entry.course_code} onChange={(e) => setEntry({ ...entry, course_code: e.target.value })} />
        <input className="oracle-input" placeholder="Course title" value={entry.course_title} onChange={(e) => setEntry({ ...entry, course_title: e.target.value })} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <select className="oracle-input" value={entry.day} onChange={(e) => setEntry({ ...entry, day: e.target.value })}>
          {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d) => <option key={d}>{d}</option>)}
        </select>
        <input className="oracle-input" type="time" value={entry.start_time} onChange={(e) => setEntry({ ...entry, start_time: e.target.value })} />
        <input className="oracle-input" type="time" value={entry.end_time} onChange={(e) => setEntry({ ...entry, end_time: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input className="oracle-input" placeholder="Location" value={entry.location} onChange={(e) => setEntry({ ...entry, location: e.target.value })} />
        <select className="oracle-input" value={entry.type} onChange={(e) => setEntry({ ...entry, type: e.target.value })}>
          {["lecture","lab","tutorial","seminar"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSubmit(entry)} disabled={!entry.course_code || !entry.course_title} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-[13px] font-medium spring-tap disabled:opacity-40">Add to timetable</button>
        <button onClick={onCancel} className="px-4 py-2.5 rounded-xl bg-muted/30 text-muted-foreground text-[13px] spring-tap">Cancel</button>
      </div>
    </motion.div>
  );
}