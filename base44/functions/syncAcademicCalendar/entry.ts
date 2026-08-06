import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/* ── ICS Parser ── parses iCalendar (.ics) VEVENT blocks into plain objects */

function parseICS(icsContent) {
  // Unfold continuation lines (lines starting with space/tab are continuations)
  const unfolded = icsContent.replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '');
  const lines = unfolded.split(/\r?\n/);
  const events = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === 'BEGIN:VEVENT') {
      current = {};
    } else if (trimmed === 'END:VEVENT') {
      if (current) events.push(current);
      current = null;
    } else if (current) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;
      const keyPart = trimmed.substring(0, colonIdx);
      const value = trimmed.substring(colonIdx + 1);
      const key = keyPart.split(';')[0];
      current[key] = value;
    }
  }

  return events.map(e => ({
    uid: e.UID || `${e.SUMMARY || 'event'}-${e.DTSTART || Date.now()}`,
    title: e.SUMMARY || 'Untitled Event',
    description: e.DESCRIPTION || '',
    dtstart: e.DTSTART || null,
    dtend: e.DTEND || null,
    location: e.LOCATION || '',
  }));
}

function parseICSDate(dateStr) {
  if (!dateStr) return null;
  // All-day: YYYYMMDD (8 chars, no T)
  if (dateStr.length === 8 && !dateStr.includes('T')) {
    return {
      date: `${dateStr.substring(0,4)}-${dateStr.substring(4,6)}-${dateStr.substring(6,8)}`,
      time: null,
      isAllDay: true,
    };
  }
  // DateTime: YYYYMMDDTHHMMSS[Z]
  if (dateStr.includes('T')) {
    const datePart = dateStr.substring(0, 8);
    const timePart = dateStr.substring(9, 15);
    if (datePart.length < 8 || timePart.length < 6) return null;
    return {
      date: `${datePart.substring(0,4)}-${datePart.substring(4,6)}-${datePart.substring(6,8)}`,
      time: `${timePart.substring(0,2)}:${timePart.substring(2,4)}`,
      isAllDay: false,
    };
  }
  return null;
}

function categorizeEvent(title, description) {
  const lower = (title + ' ' + (description || '')).toLowerCase();
  if (lower.includes('exam') || lower.includes('midterm') || lower.includes('final')) return 'exam';
  if (lower.includes('quiz')) return 'assignment';
  if (lower.includes('assignment') || lower.includes('homework') || lower.includes('project') || lower.includes('essay') || lower.includes('due')) return 'deadline';
  if (lower.includes('lab') || lower.includes('laboratory') || lower.includes('lecture') || lower.includes('tutorial') || lower.includes('seminar') || lower.includes('class')) return 'class';
  return 'event';
}

/* ── Sync Logic ── shared between user-initiated and scheduled syncs */

async function doSync(client, connection, ownerId) {
  let icsContent = connection.ics_content;

  // If URL-based, fetch fresh content
  if (connection.source_url && connection.source_type !== 'manual' && connection.source_type !== 'google_calendar') {
    try {
      const response = await fetch(connection.source_url, {
        headers: { 'Accept': 'text/calendar, text/plain, */*' },
      });
      if (response.ok) {
        icsContent = await response.text();
      }
    } catch (fetchErr) {
      if (!icsContent) {
        await client.entities.AcademicCalendarSync.update(connection.id, {
          sync_status: 'error',
          last_error: `Failed to fetch: ${fetchErr.message}`,
        });
        return { error: `Failed to fetch .ics feed: ${fetchErr.message}` };
      }
    }
  }

  if (!icsContent) {
    return { error: 'No .ics content available to sync' };
  }

  const parsed = parseICS(icsContent);

  // Deduplication: get existing events for this sync source
  const existing = await client.entities.CalendarEvent.filter({
    sync_source_id: connection.id,
  });
  const existingByUid = new Map(
    (existing || []).filter(e => e.source_id).map(e => [e.source_id, e])
  );

  let created = 0, updated = 0, skipped = 0;

  for (const e of parsed) {
    const start = parseICSDate(e.dtstart);
    if (!start) { skipped++; continue; }
    const end = parseICSDate(e.dtend);

    const eventData = {
      title: e.title,
      description: e.description,
      type: categorizeEvent(e.title, e.description),
      source_entity: 'academic_sync',
      source_id: e.uid,
      sync_source_id: connection.id,
      ...(ownerId ? { sync_user_id: ownerId } : {}),
      date: start.date,
      start_time: start.time || '',
      end_time: end?.time || '',
      location: e.location,
      is_all_day: start.isAllDay,
    };

    const existingEvent = existingByUid.get(e.uid);
    if (existingEvent) {
      await client.entities.CalendarEvent.update(existingEvent.id, eventData);
      updated++;
    } else {
      await client.entities.CalendarEvent.create(eventData);
      created++;
    }
  }

  // Detect deletions: events in DB but not in the fresh feed
  const freshUids = new Set(parsed.map(e => e.uid));
  let deleted = 0;
  for (const existingEvent of (existing || [])) {
    if (existingEvent.source_id && !freshUids.has(existingEvent.source_id)) {
      await client.entities.CalendarEvent.delete(existingEvent.id);
      deleted++;
    }
  }

  await client.entities.AcademicCalendarSync.update(connection.id, {
    last_synced_at: new Date().toISOString(),
    sync_status: 'active',
    last_error: null,
    events_imported: created + updated,
    last_sync_result: { created, updated, skipped, deleted, total: parsed.length },
  });

  return { created, updated, skipped, deleted, total: parsed.length };
}

/* ── Handler ── */

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    // ── parse_ics: preview .ics content or URL ──
    if (action === 'parse_ics') {
      let icsContent = body.ics_content;

      if (!icsContent && body.ics_url) {
        const response = await fetch(body.ics_url, {
          headers: { 'Accept': 'text/calendar, text/plain, */*' },
        });
        if (!response.ok) {
          return Response.json({ error: `Failed to fetch .ics feed: ${response.status}` }, { status: 502 });
        }
        icsContent = await response.text();
      }

      if (!icsContent) {
        return Response.json({ error: 'No .ics content or URL provided' }, { status: 400 });
      }

      const parsed = parseICS(icsContent);
      const events = parsed.map(e => {
        const start = parseICSDate(e.dtstart);
        const end = parseICSDate(e.dtend);
        return {
          uid: e.uid,
          title: e.title,
          description: e.description,
          date: start?.date || null,
          start_time: start?.time || null,
          end_time: end?.time || null,
          is_all_day: start?.isAllDay || false,
          location: e.location,
          type: categorizeEvent(e.title, e.description),
        };
      }).filter(e => e.date);

      return Response.json({ events, count: events.length, ics_content: icsContent });
    }

    // ── sync: sync a specific connection ──
    if (action === 'sync') {
      const { sync_id } = body;
      const connection = await base44.entities.AcademicCalendarSync.get(sync_id);
      if (!connection) return Response.json({ error: 'Sync connection not found' }, { status: 404 });
      if (!connection.authorized) return Response.json({ error: 'Sync not authorized by user' }, { status: 403 });

      const result = await doSync(base44, connection);
      return Response.json({ status: result.error ? 'error' : 'success', ...result });
    }

    // ── sync_all: admin scheduled sync for all active connections ──
    if (action === 'sync_all') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }

      const connections = await base44.asServiceRole.entities.AcademicCalendarSync.filter({
        sync_status: 'active',
        auto_sync: true,
        authorized: true,
      });

      const results = [];
      for (const conn of connections || []) {
        try {
          const result = await doSync(base44.asServiceRole, conn, conn.created_by_id);
          results.push({ id: conn.id, name: conn.source_name, ...result });
        } catch (e) {
          await base44.asServiceRole.entities.AcademicCalendarSync.update(conn.id, {
            sync_status: 'error',
            last_error: e.message,
          });
          results.push({ id: conn.id, name: conn.source_name, error: e.message });
        }
      }

      return Response.json({ synced: results.length, results });
    }

    return Response.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}