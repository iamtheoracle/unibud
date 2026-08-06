import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Calendar, Upload, Link2, Type, Check, X, Loader2 } from "lucide-react";
import { parseICS } from "@/lib/academic/calendarSync";

const EASE = [0.16, 1, 0.3, 1];

const SOURCE_TYPES = [
  { key: "ics_url", label: "ICS Feed URL", desc: "Paste your university calendar .ics link", icon: Link2 },
  { key: "ics_upload", label: "Upload .ics File", desc: "Import an iCalendar file from your device", icon: Upload },
  { key: "manual", label: "Manual Entry", desc: "Add timetable entries by hand", icon: Type },
  { key: "google", label: "Google Calendar", desc: "Sync from your connected Google Calendar", icon: Calendar },
];

/**
 * Import wizard sheet — handles .ics URL, .ics file upload, and manual entry.
 * On confirm, calls onConfirm with the source type and parsed data.
 */
export default function ICSImportWizard({ open, onClose, onConfirm }) {
  const [step, setStep] = useState("select"); // select → input → preview → saving
  const [sourceType, setSourceType] = useState(null);
  const [icsUrl, setIcsUrl] = useState("");
  const [icsContent, setIcsContent] = useState("");
  const [parsedEvents, setParsedEvents] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Manual entry form state
  const [manualEntries, setManualEntries] = useState([
    { course_code: "", course_title: "", day: "Monday", start_time: "", end_time: "", location: "" },
  ]);

  function reset() {
    setStep("select");
    setSourceType(null);
    setIcsUrl("");
    setIcsContent("");
    setParsedEvents([]);
    setError(null);
    setLoading(false);
    setManualEntries([{ course_code: "", course_title: "", day: "Monday", start_time: "", end_time: "", location: "" }]);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const text = await file.text();
      setIcsContent(text);
      const result = await parseICS({ icsContent: text });
      setParsedEvents(result.events || []);
      setStep("preview");
    } catch (err) {
      setError(err.message || "Failed to parse .ics file");
    } finally {
      setLoading(false);
    }
  }

  async function handleUrlFetch() {
    if (!icsUrl.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const result = await parseICS({ icsUrl: icsUrl.trim() });
      setParsedEvents(result.events || []);
      setIcsContent(result.ics_content || "");
      setStep("preview");
    } catch (err) {
      setError(err.message || "Failed to fetch .ics feed");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (sourceType === "manual") {
      const valid = manualEntries.filter((e) => e.course_code && e.start_time && e.end_time);
      onConfirm({ sourceType: "manual", sourceName: "Manual Timetable", manualEntries: valid });
    } else if (sourceType === "google") {
      onConfirm({ sourceType: "google", sourceName: "Google Calendar" });
    } else {
      onConfirm({
        sourceType,
        sourceName: sourceType === "ics_url" ? "ICS Feed" : "ICS Upload",
        icsUrl: sourceType === "ics_url" ? icsUrl : null,
        icsContent,
        eventCount: parsedEvents.length,
      });
    }
    handleClose();
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.4, ease: EASE }}
          className="w-full max-w-[520px] bg-card border-t border-border rounded-t-3xl max-h-[85vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-[17px] font-bold text-foreground">Add Calendar Source</h2>
            <button onClick={handleClose} className="p-1 text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-5">
            {/* Step: Select source type */}
            {step === "select" && (
              <div className="space-y-3">
                {SOURCE_TYPES.map((src) => {
                  const Icon = src.icon;
                  return (
                    <button
                      key={src.key}
                      onClick={() => {
                        setSourceType(src.key);
                        if (src.key === "google") {
                          setStep("preview");
                        } else if (src.key === "manual") {
                          setStep("input");
                        } else {
                          setStep("input");
                        }
                      }}
                      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border hover:border-primary/30 spring-tap text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-foreground">{src.label}</p>
                        <p className="text-[12px] text-muted-foreground mt-0.5">{src.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step: Input */}
            {step === "input" && sourceType === "ics_url" && (
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-medium text-foreground mb-2 block">Calendar Feed URL</label>
                  <input
                    type="url"
                    value={icsUrl}
                    onChange={(e) => setIcsUrl(e.target.value)}
                    placeholder="https://university.edu/calendar.ics"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40"
                  />
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Find your university's calendar export link in your LMS or student portal.
                  </p>
                </div>
                {error && <p className="text-[13px] text-destructive">{error}</p>}
                <button
                  onClick={handleUrlFetch}
                  disabled={!icsUrl.trim() || loading}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-[14px] disabled:opacity-40 spring-tap flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link className="w-4 h-4" />}
                  {loading ? "Fetching…" : "Fetch & Preview"}
                </button>
              </div>
            )}

            {step === "input" && sourceType === "ics_upload" && (
              <div className="space-y-4">
                <label className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-border hover:border-primary/30 cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-[14px] font-medium text-foreground">
                    {loading ? "Parsing…" : "Tap to select .ics file"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">iCalendar format (.ics)</span>
                  <input
                    type="file"
                    accept=".ics,text/calendar"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                {error && <p className="text-[13px] text-destructive">{error}</p>}
              </div>
            )}

            {step === "input" && sourceType === "manual" && (
              <div className="space-y-4">
                <p className="text-[13px] text-muted-foreground">Add your weekly class schedule manually.</p>
                {manualEntries.map((entry, i) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary/50 border border-border space-y-3">
                    <div className="flex gap-2">
                      <input
                        placeholder="Course code (CSC 301)"
                        value={entry.course_code}
                        onChange={(e) => {
                          const next = [...manualEntries];
                          next[i] = { ...next[i], course_code: e.target.value };
                          setManualEntries(next);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-[13px] text-foreground"
                      />
                      <select
                        value={entry.day}
                        onChange={(e) => {
                          const next = [...manualEntries];
                          next[i] = { ...next[i], day: e.target.value };
                          setManualEntries(next);
                        }}
                        className="px-3 py-2 rounded-lg bg-background border border-border text-[13px] text-foreground"
                      >
                        {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      placeholder="Course title"
                      value={entry.course_title}
                      onChange={(e) => {
                        const next = [...manualEntries];
                        next[i] = { ...next[i], course_title: e.target.value };
                        setManualEntries(next);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-[13px] text-foreground"
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        placeholder="Start"
                        value={entry.start_time}
                        onChange={(e) => {
                          const next = [...manualEntries];
                          next[i] = { ...next[i], start_time: e.target.value };
                          setManualEntries(next);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-[13px] text-foreground"
                      />
                      <input
                        type="time"
                        placeholder="End"
                        value={entry.end_time}
                        onChange={(e) => {
                          const next = [...manualEntries];
                          next[i] = { ...next[i], end_time: e.target.value };
                          setManualEntries(next);
                        }}
                        className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-[13px] text-foreground"
                      />
                    </div>
                    <input
                      placeholder="Location (optional)"
                      value={entry.location}
                      onChange={(e) => {
                        const next = [...manualEntries];
                        next[i] = { ...next[i], location: e.target.value };
                        setManualEntries(next);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-[13px] text-foreground"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setManualEntries([...manualEntries, { course_code: "", course_title: "", day: "Monday", start_time: "", end_time: "", location: "" }])}
                  className="text-[13px] font-medium text-primary spring-tap"
                >
                  + Add another class
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!manualEntries.some((e) => e.course_code && e.start_time && e.end_time)}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-[14px] disabled:opacity-40 spring-tap"
                >
                  Save Manual Timetable
                </button>
              </div>
            )}

            {/* Step: Preview */}
            {step === "preview" && (
              <div className="space-y-4">
                {sourceType === "google" ? (
                  <div className="p-4 rounded-xl bg-secondary/50 border border-border">
                    <p className="text-[14px] font-medium text-foreground">Google Calendar Sync</p>
                    <p className="text-[12px] text-muted-foreground mt-1">
                      Your Google Calendar is already connected. Events will be imported with authorization.
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-[13px] text-muted-foreground">
                      {parsedEvents.length} event{parsedEvents.length !== 1 ? "s" : ""} found
                    </p>
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {parsedEvents.slice(0, 50).map((ev, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-foreground truncate">{ev.title}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {ev.date}{ev.start_time ? ` · ${ev.start_time}` : ""}{ev.location ? ` · ${ev.location}` : ""}
                            </p>
                          </div>
                          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{ev.type}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <button
                  onClick={handleConfirm}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-[14px] spring-tap flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirm & Import
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}