import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    // ─── Webhook handler for Google Calendar push notifications ───
    // Google sends a POST with X-Goog-Resource-State header and no body.
    // We trigger a pull sync in response.
    const googState = req.headers.get('X-Goog-Resource-State');
    if (googState) {
      console.log('[googleCalendarSync] Webhook received:', googState);
      if (googState === 'sync') {
        return Response.json({ status: 'webhook_acknowledged' });
      }
      // Trigger a background pull — best effort, no auth needed (service role)
      try {
        const base44 = createClientFromRequest(req);
        const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
        await pullFromGoogle(base44, accessToken);
      } catch (e) {
        console.error('[googleCalendarSync] Webhook sync error:', e.message);
      }
      return Response.json({ status: 'synced' });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    // ─── Normalize: create CalendarEvent records from academic entities ───
    if (action === 'normalize') {
      const result = await normalizeAcademicEvents(base44, user);
      return Response.json({ status: 'success', ...result });
    }

    // ─── Full sync: normalize + push to Google + pull from Google ───
    if (action === 'full_sync') {
      const normalizeResult = await normalizeAcademicEvents(base44, user);
      const pushResult = await pushToGoogle(base44, authHeader);
      const pullResult = await pullFromGoogle(base44, accessToken);

      // Update sync record
      try {
        const syncRecords = await base44.asServiceRole.entities.AcademicCalendarSync.filter(
          { source_type: 'google_calendar', sync_status: 'active' },
          '-created_date', 5
        );
        for (const rec of syncRecords) {
          await base44.asServiceRole.entities.AcademicCalendarSync.update(rec.id, {
            last_synced_at: new Date().toISOString(),
            last_sync_result: {
              normalized: normalizeResult.created,
              pushed: pushResult.created + pushResult.updated,
              pulled: pullResult.created + pullResult.updated,
              errors: [...pushResult.errors, ...pullResult.errors].slice(0, 5),
            },
          });
        }
      } catch (e) {
        console.error('[googleCalendarSync] Failed to update sync record:', e.message);
      }

      return Response.json({
        status: 'success',
        normalized: normalizeResult.created,
        pushed: { created: pushResult.created, updated: pushResult.updated },
        pulled: { created: pullResult.created, updated: pullResult.updated },
        conflicts: pullResult.conflicts,
        errors: [...pushResult.errors, ...pullResult.errors].slice(0, 10),
      });
    }

    if (action === 'sync') {
      const result = await pushToGoogle(base44, authHeader);
      return Response.json({ status: 'success', ...result });
    }

    if (action === 'fetch') {
      const result = await pullFromGoogle(base44, accessToken);
      return Response.json({ status: 'success', ...result });
    }

    if (action === 'sync_single') {
      const { event_id } = body;
      if (!event_id) return Response.json({ error: 'event_id required' }, { status: 400 });

      const evt = await base44.asServiceRole.entities.CalendarEvent.get(event_id);
      if (!evt) return Response.json({ error: 'Event not found' }, { status: 404 });

      const gEvent = buildGoogleEvent(evt);
      let googleId = evt.google_event_id;
      let method = 'POST';
      let url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

      if (googleId) {
        method = 'PUT';
        url = `${url}/${googleId}`;
      }

      const res = await fetch(url, { method, headers: authHeader, body: JSON.stringify(gEvent) });
      if (!res.ok) {
        if (res.status === 404 && googleId) {
          const createRes = await fetch(url.replace(`/${googleId}`, ''), { method: 'POST', headers: authHeader, body: JSON.stringify(gEvent) });
          if (createRes.ok) {
            const data = await createRes.json();
            googleId = data.id;
            await base44.asServiceRole.entities.CalendarEvent.update(evt.id, { google_event_id: googleId });
          } else {
            return Response.json({ error: `Failed to recreate: ${createRes.status}` }, { status: 502 });
          }
        } else {
          return Response.json({ error: `Google API error: ${res.status}` }, { status: 502 });
        }
      } else {
        const data = await res.json();
        if (!googleId) {
          googleId = data.id;
          await base44.asServiceRole.entities.CalendarEvent.update(evt.id, { google_event_id: googleId });
        }
      }

      return Response.json({ status: 'success', google_event_id: googleId });
    }

    // ─── Register webhook channel for Google Calendar push notifications ───
    if (action === 'register_webhook') {
      const webhookUrl = body.webhook_url || `https://${req.headers.get('host') || ''}/api/functions/googleCalendarSync`;
      const channelRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events/watch', {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          id: crypto.randomUUID(),
          type: 'web_hook',
          address: webhookUrl,
          params: { ttl: '2592000' }, // 30 days
        }),
      });
      if (!channelRes.ok) {
        const errText = await channelRes.text();
        console.error('[googleCalendarSync] Webhook registration failed:', channelRes.status, errText);
        return Response.json({ error: `Webhook registration failed: ${channelRes.status}` }, { status: 502 });
      }
      const channel = await channelRes.json();
      return Response.json({ status: 'success', channel });
    }

    return Response.json({ error: 'Unknown action. Use sync, fetch, full_sync, normalize, sync_single, or register_webhook.' }, { status: 400 });
  } catch (error) {
    console.error('[googleCalendarSync] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

// ─── Normalize: read from academic entities and create CalendarEvent records ───
async function normalizeAcademicEvents(base44, user) {
  let created = 0;
  let skipped = 0;
  const today = new Date().toISOString().split('T')[0];

  // Helper: check if a CalendarEvent already exists for a source
  async function findExisting(sourceEntity, sourceId) {
    const existing = await base44.asServiceRole.entities.CalendarEvent.filter(
      { source_entity: sourceEntity, source_id: sourceId },
      '-created_date', 1
    );
    return existing && existing.length > 0 ? existing[0] : null;
  }

  // Helper: create or update a CalendarEvent from an academic item
  async function upsertEvent(item) {
    try {
      const existing = await findExisting(item.source_entity, item.source_id);
      if (existing) {
        // Update if details changed (simple comparison)
        const needsUpdate =
          existing.title !== item.title ||
          existing.date !== item.date ||
          existing.start_time !== (item.start_time || '') ||
          existing.end_time !== (item.end_time || '');
        if (needsUpdate) {
          await base44.asServiceRole.entities.CalendarEvent.update(existing.id, {
            title: item.title,
            date: item.date,
            start_time: item.start_time || '',
            end_time: item.end_time || '',
            location: item.location || '',
            type: item.type,
            description: item.description || '',
          });
          created++;
        } else {
          skipped++;
        }
      } else {
        await base44.asServiceRole.entities.CalendarEvent.create({
          title: item.title,
          type: item.type,
          date: item.date,
          start_time: item.start_time || '',
          end_time: item.end_time || '',
          location: item.location || '',
          description: item.description || '',
          source_entity: item.source_entity,
          source_id: item.source_id,
        });
        created++;
      }
    } catch (e) {
      console.error(`[normalize] Failed for ${item.source_entity}:${item.source_id}:`, e.message);
      skipped++;
    }
  }

  // ─── Assignments ───
  try {
    const assignments = await base44.asServiceRole.entities.Assignment.filter(
      { due_date: { $gte: today } },
      'due_date', 100
    );
    for (const a of assignments) {
      await upsertEvent({
        source_entity: 'assignment',
        source_id: a.id,
        title: `Assignment: ${a.title || a.course_code || 'Due'}`,
        date: a.due_date,
        type: 'assignment',
        description: a.description || '',
      });
    }
  } catch (e) { console.error('[normalize] Assignments:', e.message); }

  // ─── Exams ───
  try {
    const exams = await base44.asServiceRole.entities.Exam.filter(
      { date: { $gte: today } },
      'date', 100
    );
    for (const ex of exams) {
      await upsertEvent({
        source_entity: 'exam',
        source_id: ex.id,
        title: `Exam: ${ex.title || ex.course_code || 'Exam'}`,
        date: ex.date,
        start_time: ex.start_time || '',
        end_time: ex.end_time || '',
        location: ex.location || '',
        type: 'exam',
      });
    }
  } catch (e) { console.error('[normalize] Exams:', e.message); }

  // ─── Study Sessions ───
  try {
    const sessions = await base44.asServiceRole.entities.StudySession.filter(
      { date: { $gte: today } },
      'date', 100
    );
    for (const s of sessions) {
      await upsertEvent({
        source_entity: 'study_session',
        source_id: s.id,
        title: `Study: ${s.title || s.subject || 'Study Session'}`,
        date: s.date,
        start_time: s.start_time || '',
        end_time: s.end_time || '',
        location: s.location || '',
        type: 'study_session',
      });
    }
  } catch (e) { console.error('[normalize] StudySessions:', e.message); }

  // ─── Office Hours ───
  try {
    const slots = await base44.asServiceRole.entities.OfficeHoursSlot.filter(
      { date: { $gte: today } },
      'date', 100
    );
    for (const oh of slots) {
      await upsertEvent({
        source_entity: 'office_hours',
        source_id: oh.id,
        title: `Office Hours: ${oh.lecturer_name || oh.course_code || 'Office Hours'}`,
        date: oh.date,
        start_time: oh.start_time || '',
        end_time: oh.end_time || '',
        location: oh.location || '',
        type: 'mentorship',
      });
    }
  } catch (e) { console.error('[normalize] OfficeHours:', e.message); }

  // ─── Project milestones ───
  try {
    const projects = await base44.asServiceRole.entities.Project.filter(
      { due_date: { $gte: today } },
      'due_date', 100
    );
    for (const p of projects) {
      await upsertEvent({
        source_entity: 'project',
        source_id: p.id,
        title: `Project: ${p.title || 'Project Deadline'}`,
        date: p.due_date,
        type: 'deadline',
        description: p.description || '',
      });
    }
  } catch (e) { console.error('[normalize] Projects:', e.message); }

  // ─── Campus Events ───
  try {
    const events = await base44.asServiceRole.entities.CampusEvent.filter(
      { date: { $gte: today }, status: { $ne: 'cancelled' } },
      'date', 100
    );
    for (const ev of events) {
      await upsertEvent({
        source_entity: 'campus_event',
        source_id: ev.id,
        title: ev.title,
        date: ev.date,
        start_time: ev.start_time || '',
        end_time: ev.end_time || '',
        location: ev.location || '',
        type: 'event',
        description: ev.description || '',
      });
    }
  } catch (e) { console.error('[normalize] CampusEvents:', e.message); }

  return { created, skipped };
}

// ─── Push: send CalendarEvents to Google Calendar ───
async function pushToGoogle(base44, authHeader) {
  const today = new Date().toISOString().split('T')[0];
  const events = await base44.asServiceRole.entities.CalendarEvent.filter(
    { date: { $gte: today } },
    'date', 250
  );

  let created = 0;
  let updated = 0;
  const errors = [];

  for (const evt of events) {
    try {
      const gEvent = buildGoogleEvent(evt);
      if (evt.google_event_id) {
        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events/${evt.google_event_id}`,
          { method: 'PUT', headers: authHeader, body: JSON.stringify(gEvent) }
        );
        if (res.ok) { updated++; }
        else if (res.status === 404) {
          const createRes = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            { method: 'POST', headers: authHeader, body: JSON.stringify(gEvent) }
          );
          if (createRes.ok) {
            const data = await createRes.json();
            await base44.asServiceRole.entities.CalendarEvent.update(evt.id, { google_event_id: data.id });
            created++;
          }
        } else { errors.push({ id: evt.id, error: `Update ${res.status}` }); }
      } else {
        const res = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          { method: 'POST', headers: authHeader, body: JSON.stringify(gEvent) }
        );
        if (res.ok) {
          const data = await res.json();
          await base44.asServiceRole.entities.CalendarEvent.update(evt.id, { google_event_id: data.id });
          created++;
        } else { errors.push({ id: evt.id, error: `Create ${res.status}` }); }
      }
    } catch (e) {
      errors.push({ id: evt.id, error: e.message });
    }
  }

  return { created, updated, errors: errors.slice(0, 10), total: events.length };
}

// ─── Pull: fetch from Google Calendar and create/update CalendarEvent records ───
async function pullFromGoogle(base44, accessToken) {
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=250&orderBy=startTime&singleEvents=true&timeMin=${timeMin}&timeMax=${timeMax}`;

  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}` } });
  if (!res.ok) {
    console.error('[pullFromGoogle] API error:', res.status);
    return { created: 0, updated: 0, conflicts: 0, errors: [`Google API ${res.status}`] };
  }
  const data = await res.json();

  let created = 0;
  let updated = 0;
  let conflicts = 0;
  const errors = [];

  for (const item of (data.items || [])) {
    try {
      // Check if we already have this Google event
      const existing = await base44.asServiceRole.entities.CalendarEvent.filter(
        { google_event_id: item.id },
        '-created_date', 1
      );

      const isAllDay = !!item.start?.date;
      const dateStr = item.start?.dateTime?.split('T')[0] || item.start?.date || '';
      if (!dateStr) continue;

      const startMatch = item.start?.dateTime?.match(/T(\d{2}:\d{2})/);
      const endMatch = item.end?.dateTime?.match(/T(\d{2}:\d{2})/);
      const startTime = startMatch ? startMatch[1] : '';
      const endTime = endMatch ? endMatch[1] : '';

      if (existing && existing.length > 0) {
        const evt = existing[0];
        // Conflict detection: if local was updated after last sync AND Google event changed
        const localUpdated = evt.updated_date ? new Date(evt.updated_date) : new Date(0);
        const googleUpdated = item.updated ? new Date(item.updated) : new Date(0);

        const needsUpdate =
          evt.title !== (item.summary || 'Untitled') ||
          evt.date !== dateStr ||
          evt.start_time !== startTime;

        if (needsUpdate) {
          // Simple conflict: if both updated recently, count as conflict but prefer Google
          if (googleUpdated > localUpdated && localUpdated > new Date(Date.now() - 300000)) {
            conflicts++;
          }
          await base44.asServiceRole.entities.CalendarEvent.update(evt.id, {
            title: item.summary || 'Untitled',
            date: dateStr,
            start_time: startTime,
            end_time: endTime,
            location: item.location || '',
            description: item.description || '',
            is_all_day: isAllDay,
          });
          updated++;
        }
      } else {
        // Create new event from Google
        await base44.asServiceRole.entities.CalendarEvent.create({
          title: item.summary || 'Untitled',
          type: 'event',
          date: dateStr,
          start_time: startTime,
          end_time: endTime,
          location: item.location || '',
          description: item.description || '',
          is_all_day: isAllDay,
          google_event_id: item.id,
          source_entity: 'google_calendar',
          source_id: item.id,
        });
        created++;
      }
    } catch (e) {
      errors.push(e.message);
    }
  }

  return { created, updated, conflicts, errors: errors.slice(0, 5) };
}

function buildGoogleEvent(evt) {
  const isAllDay = evt.is_all_day || !evt.start_time;
  if (isAllDay) {
    const dateStr = evt.date;
    const endDate = new Date(dateStr + 'T00:00:00');
    endDate.setDate(endDate.getDate() + 1);
    return {
      summary: evt.title,
      description: evt.description || '',
      location: evt.location || '',
      start: { date: dateStr, timeZone: 'UTC' },
      end: { date: endDate.toISOString().split('T')[0], timeZone: 'UTC' }
    };
  }
  const startDateTime = `${evt.date}T${evt.start_time}:00`;
  const endDateTime = evt.end_time
    ? `${evt.date}T${evt.end_time}:00`
    : `${evt.date}T${padHour(parseInt(evt.start_time) + 1)}:00:00`;
  return {
    summary: evt.title,
    description: evt.description || '',
    location: evt.location || '',
    start: { dateTime: startDateTime, timeZone: 'UTC' },
    end: { dateTime: endDateTime, timeZone: 'UTC' }
  };
}

function padHour(h) {
  if (h >= 24) h = 23;
  return String(h).padStart(2, '0');
}