/**
 * Calendar Sync Service — manages academic calendar synchronization.
 *
 * Supports:
 *   - .ics file import (parsed client-side, duplicates avoided via source_id)
 *   - Google Calendar two-way sync (via existing googleCalendarSync function)
 *   - Manual timetable entry
 *
 * All sync requires explicit user authorization. Google Calendar sync uses
 * the authorized googlecalendar connector.
 */
import { base44 } from "@/api/base44Client";

/**
 * Import events from an .ics file. Parses the iCalendar format client-side
 * and creates CalendarEvent records, skipping duplicates by source_id.
 */
export async function importIcsFile(file) {
  const text = await file.text();
  const events = parseICS(text);
  if (events.length === 0) return { imported: 0, skipped: 0 };

  const existing = await base44.entities.CalendarEvent.filter(
    { source_entity: "ics_import" },
    "-created_date",
    500
  );
  const existingIds = new Set((existing || []).map((e) => e.source_id).filter(Boolean));
  const newEvents = events.filter((e) => !existingIds.has(e.uid));

  if (newEvents.length === 0) return { imported: 0, skipped: events.length };

  const created = await base44.entities.CalendarEvent.bulkCreate(
    newEvents.map((e) => ({
      title: e.summary || "Imported Event",
      description: e.description || "",
      type: e.type,
      date: e.date,
      start_time: e.startTime || "",
      end_time: e.endTime || "",
      location: e.location || "",
      source_entity: "ics_import",
      source_id: e.uid || "",
    }))
  );

  return { imported: created.length, skipped: events.length - newEvents.length };
}

/**
 * Pull upcoming events from Google Calendar.
 */
export async function fetchGoogleCalendarEvents() {
  const res = await base44.functions.invoke("googleCalendarSync", { action: "fetch" });
  return res.data;
}

/**
 * Push local CalendarEvents to Google Calendar.
 */
export async function syncToGoogleCalendar() {
  const res = await base44.functions.invoke("googleCalendarSync", { action: "sync" });
  return res.data;
}

/**
 * Create a manual timetable entry.
 */
export async function createManualTimetableEntry(entry) {
  return await base44.entities.TimetableEntry.create(entry);
}

// ─── .ics parser (RFC 5545 subset) ───

function parseICS(content) {
  const events = [];
  const unfolded = content.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "BEGIN:VEVENT") {
      current = {};
    } else if (trimmed === "END:VEVENT") {
      if (current && current.date) events.push(current);
      current = null;
    } else if (current) {
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx === -1) continue;
      const key = trimmed.substring(0, colonIdx).split(";")[0].toUpperCase();
      const value = trimmed.substring(colonIdx + 1);

      switch (key) {
        case "SUMMARY": current.summary = unescapeICS(value); break;
        case "DESCRIPTION": current.description = unescapeICS(value); break;
        case "LOCATION": current.location = unescapeICS(value); break;
        case "UID": current.uid = value; break;
        case "DTSTART": Object.assign(current, parseICSDate(value)); break;
        case "DTEND": { const p = parseICSDate(value); if (p.time) current.endTime = p.time; break; }
        default: break;
      }
    }
  }

  for (const e of events) {
    const s = (e.summary || "").toLowerCase();
    if (s.includes("exam") || s.includes("test") || s.includes("quiz")) e.type = "exam";
    else if (s.includes("assignment") || s.includes("deadline") || s.includes("due") || s.includes("submit")) e.type = "deadline";
    else if (s.includes("lab")) e.type = "class";
    else if (s.includes("lecture") || s.includes("tutorial") || s.includes("seminar") || s.includes("class")) e.type = "class";
    else e.type = "event";
  }

  return events;
}

function parseICSDate(value) {
  const cleaned = value.replace(/^VALUE=DATE:/i, "");
  const year = cleaned.substring(0, 4);
  const month = cleaned.substring(4, 6);
  const day = cleaned.substring(6, 8);
  const date = `${year}-${month}-${day}`;

  let time = "";
  if (cleaned.length >= 15 && cleaned.charAt(8) === "T") {
    time = `${cleaned.substring(9, 11)}:${cleaned.substring(11, 13)}`;
  }

  return { date, time };
}

function unescapeICS(value) {
  return value.replace(/\\n/g, "\n").replace(/\\,/g, ",").replace(/\\;/g, ";").replace(/\\\\/g, "\\");
}