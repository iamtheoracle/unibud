/**
 * Google Calendar Sync Helpers — shared sync logic
 * Extracted to keep entry.ts under bundler limits.
 */

const GOOGLE_CAL_API = 'https://www.googleapis.com/calendar/v3';

const COLOR_MAP: Record<string, string> = {
  exam: '11', assignment: '6', class: '9', study_session: '10',
  deadline: '5', event: '7', mentorship: '3', tradition: '1', presentation: '4',
};

const DEEP_LINK_MAP: Record<string, string> = {
  exam: '/exams', assignment: '/assignments', class: '/timetable',
  study_session: '/study-sessions', deadline: '/projects', event: '/events',
  mentorship: '/office-hours', presentation: '/projects', tradition: '/events',
};

export function defaultPrefs() {
  return { classes: true, assignments: true, exams: true, presentations: true, timetable: true, academic_events: true, study_sessions: false };
}

export async function getSyncRecord(base44: any, userId: string | null) {
  const filter: any = { source_type: 'google_calendar' };
  if (userId) filter.created_by_id = userId;
  const records = await base44.asServiceRole.entities.AcademicCalendarSync.filter(filter, '-created_date', 5);
  return records && records.length > 0 ? records[0] : null;
}

async function withRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); } catch (e) {
      if (i === retries - 1) throw e;
      console.warn(`[gcalSync] Retry ${i + 1}/${retries}:`, e.message);
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

export async function performSync(base44: any, userId: string | null, appHost: string) {
  const syncRec = await getSyncRecord(base44, userId);
  const prefs = syncRec?.sync_preferences || defaultPrefs();
  const reminderMinutes = syncRec?.reminder_minutes ?? 30;
  const calendarId = syncRec?.google_calendar_id || 'primary';

  if (syncRec && syncRec.sync_status === 'paused') {
    return { skipped: true, message: 'Sync is paused' };
  }

  if (syncRec) {
    await base44.asServiceRole.entities.AcademicCalendarSync.update(syncRec.id, { sync_status: 'syncing', last_error: null });
  }

  try {
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    const normalizeResult = await withRetry(() => normalizeAcademicEvents(base44, userId, prefs));
    const pushResult = await withRetry(() => pushToGoogle(base44, authHeader, calendarId, reminderMinutes, appHost));
    const deleteResult = await withRetry(() => deleteOrphanedEvents(base44, authHeader, calendarId));

    const conflicts = pushResult.conflicts;
    const totalErrors = [...normalizeResult.errors, ...pushResult.errors, ...deleteResult.errors];

    if (syncRec) {
      const newConflicts = conflicts.map((c: any) => ({
        timestamp: new Date().toISOString(), event_title: c.title,
        source_entity: c.source_entity, source_id: c.source_id, message: c.message,
      }));
      const existingLog = syncRec.conflict_log || [];
      await base44.asServiceRole.entities.AcademicCalendarSync.update(syncRec.id, {
        last_synced_at: new Date().toISOString(),
        sync_status: totalErrors.length > 5 ? 'error' : 'active',
        last_error: totalErrors.length > 5 ? `${totalErrors.length} errors during sync` : null,
        events_imported: normalizeResult.created + pushResult.created + pushResult.updated,
        last_sync_result: {
          normalized: normalizeResult.created,
          pushed: { created: pushResult.created, updated: pushResult.updated },
          deleted: deleteResult.deleted, conflicts: conflicts.length, errors: totalErrors.slice(0, 5),
        },
        conflict_log: [...newConflicts, ...existingLog].slice(0, 50),
      });

      if (conflicts.length > 0 && syncRec.created_by_id) {
        try {
          await base44.asServiceRole.entities.Notification.create({
            title: 'Calendar sync conflict', type: 'system', category: 'system',
            message: `${conflicts.length} event(s) had conflicts. UNIBUD versions were kept.`,
            user_id: syncRec.created_by_id, priority: 'normal',
            link: '/settings/calendar-sync', icon: 'AlertCircle', source: 'google_calendar_sync',
          });
        } catch (e) { console.error('[gcalSync] Notification failed:', e.message); }
      }
    }

    return {
      normalized: normalizeResult.created,
      pushed: { created: pushResult.created, updated: pushResult.updated },
      deleted: deleteResult.deleted, conflicts: conflicts.length, errors: totalErrors.slice(0, 10),
    };
  } catch (error) {
    if (syncRec) {
      await base44.asServiceRole.entities.AcademicCalendarSync.update(syncRec.id, { sync_status: 'error', last_error: error.message });
    }
    throw error;
  }
}

async function normalizeAcademicEvents(base44: any, userId: string | null, prefs: any) {
  let created = 0, skipped = 0;
  const errors: string[] = [];
  const today = new Date().toISOString().split('T')[0];

  async function findExisting(srcEntity: string, srcId: string) {
    const r = await base44.asServiceRole.entities.CalendarEvent.filter({ source_entity: srcEntity, source_id: srcId }, '-created_date', 1);
    return r && r.length > 0 ? r[0] : null;
  }

  async function upsert(item: any) {
    try {
      const ex = await findExisting(item.source_entity, item.source_id);
      if (ex) {
        const needs = ex.title !== item.title || ex.date !== item.date || ex.start_time !== (item.start_time || '') || ex.end_time !== (item.end_time || '') || ex.location !== (item.location || '');
        if (needs) {
          await base44.asServiceRole.entities.CalendarEvent.update(ex.id, item);
          created++;
        } else { skipped++; }
      } else {
        await base44.asServiceRole.entities.CalendarEvent.create(item);
        created++;
      }
    } catch (e) { errors.push(`${item.source_entity}:${item.source_id} - ${e.message}`); skipped++; }
  }

  if (prefs.assignments) {
    try {
      const items = await base44.asServiceRole.entities.Assignment.filter({ due_date: { $gte: today } }, 'due_date', 100);
      for (const a of items || []) await upsert({ source_entity: 'assignment', source_id: a.id, title: `📋 ${a.title || a.course_code || 'Assignment Due'}`, date: a.due_date, type: 'assignment', description: a.description || '' });
    } catch (e) { errors.push(`Assignments: ${e.message}`); }
  }

  if (prefs.exams) {
    try {
      const items = await base44.asServiceRole.entities.ExamSchedule.filter({ date: { $gte: today }, status: { $ne: 'cancelled' } }, 'date', 100);
      for (const ex of items || []) await upsert({ source_entity: 'exam', source_id: ex.id, title: `📝 ${ex.title || ex.course_code || 'Exam'} — ${ex.type || 'final'}`, date: ex.date, start_time: ex.start_time || '', end_time: ex.end_time || '', location: ex.venue || ex.location || '', type: 'exam', description: ex.instructions || '' });
    } catch (e) { errors.push(`Exams: ${e.message}`); }
  }

  if (prefs.classes || prefs.timetable) {
    try {
      const items = await base44.asServiceRole.entities.TimetableEntry.list('day', 100);
      const dayMap: any = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
      const now = new Date();
      for (const t of items || []) {
        const dayNum = dayMap[t.day] ?? 1;
        const d = new Date(now);
        d.setDate(now.getDate() + ((dayNum - now.getDay() + 7) % 7));
        await upsert({ source_entity: 'timetable', source_id: t.id, title: `🎓 ${t.course_code}: ${t.type || 'Lecture'}`, date: d.toISOString().split('T')[0], start_time: t.start_time || '', end_time: t.end_time || '', location: t.location || '', type: 'class', description: `${t.course_title || ''}${t.lecturer ? ` · ${t.lecturer}` : ''}` });
      }
    } catch (e) { errors.push(`Timetable: ${e.message}`); }
  }

  if (prefs.academic_events) {
    try {
      const items = await base44.asServiceRole.entities.AcademicCalendarEvent.filter({ start_date: { $gte: today } }, 'start_date', 100);
      for (const ev of items || []) await upsert({ source_entity: 'academic_event', source_id: ev.id, title: `📅 ${ev.title}`, date: ev.start_date, type: 'event', location: ev.location || '', description: ev.description || ev.notes || '' });
    } catch (e) { errors.push(`AcademicEvents: ${e.message}`); }

    try {
      const items = await base44.asServiceRole.entities.CampusEvent.filter({ date: { $gte: today }, status: { $ne: 'cancelled' } }, 'date', 100);
      for (const ev of items || []) await upsert({ source_entity: 'campus_event', source_id: ev.id, title: `🎉 ${ev.title}`, date: ev.date, start_time: ev.start_time || '', end_time: ev.end_time || '', location: ev.location || '', type: 'event', description: ev.description || '' });
    } catch (e) { errors.push(`CampusEvents: ${e.message}`); }
  }

  if (prefs.study_sessions) {
    try {
      const items = await base44.asServiceRole.entities.StudySession.filter({ date: { $gte: today } }, 'date', 100);
      for (const s of items || []) await upsert({ source_entity: 'study_session', source_id: s.id, title: `📚 ${s.title || s.subject || 'Study Session'}`, date: s.date, start_time: s.start_time || '', end_time: s.end_time || '', location: s.location || '', type: 'study_session' });
    } catch (e) { errors.push(`StudySessions: ${e.message}`); }
  }

  if (prefs.presentations) {
    try {
      const items = await base44.asServiceRole.entities.Project.filter({ due_date: { $gte: today } }, 'due_date', 100);
      for (const p of items || []) await upsert({ source_entity: 'project', source_id: p.id, title: `🎯 ${p.title || 'Project Deadline'}`, date: p.due_date, type: 'deadline', description: p.description || '' });
    } catch (e) { errors.push(`Projects: ${e.message}`); }
  }

  return { created, skipped, errors };
}

async function pushToGoogle(base44: any, authHeader: any, calendarId: string, reminderMinutes: number, appHost: string) {
  const today = new Date().toISOString().split('T')[0];
  const events = await base44.asServiceRole.entities.CalendarEvent.filter({ date: { $gte: today } }, 'date', 250);
  let created = 0, updated = 0;
  const errors: any[] = [], conflicts: any[] = [];
  const calUrl = `${GOOGLE_CAL_API}/calendars/${encodeURIComponent(calendarId)}/events`;

  for (const evt of events || []) {
    try {
      const gEvent = buildGoogleEvent(evt, reminderMinutes, appHost);
      if (evt.google_event_id) {
        const res = await fetch(`${calUrl}/${evt.google_event_id}`, { method: 'PUT', headers: authHeader, body: JSON.stringify(gEvent) });
        if (res.ok) { updated++; }
        else if (res.status === 404) {
          const cr = await fetch(calUrl, { method: 'POST', headers: authHeader, body: JSON.stringify(gEvent) });
          if (cr.ok) { const d = await cr.json(); await base44.asServiceRole.entities.CalendarEvent.update(evt.id, { google_event_id: d.id }); created++; }
          else { errors.push({ id: evt.id, error: `Recreate ${cr.status}` }); }
        } else if (res.status === 409) {
          conflicts.push({ title: evt.title, source_entity: evt.source_entity, source_id: evt.source_id, message: 'Duplicate in Google Calendar' });
        } else { errors.push({ id: evt.id, error: `Update ${res.status}` }); }
      } else {
        const res = await fetch(calUrl, { method: 'POST', headers: authHeader, body: JSON.stringify(gEvent) });
        if (res.ok) { const d = await res.json(); await base44.asServiceRole.entities.CalendarEvent.update(evt.id, { google_event_id: d.id }); created++; }
        else { errors.push({ id: evt.id, error: `Create ${res.status}` }); }
      }
    } catch (e) { errors.push({ id: evt.id, error: e.message }); }
  }
  return { created, updated, errors: errors.slice(0, 10), conflicts, total: (events || []).length };
}

async function deleteOrphanedEvents(base44: any, authHeader: any, calendarId: string) {
  let deleted = 0;
  const errors: any[] = [];
  try {
    const synced = await base44.asServiceRole.entities.CalendarEvent.filter({ google_event_id: { $exists: true } }, '-created_date', 500);
    const calUrl = `${GOOGLE_CAL_API}/calendars/${encodeURIComponent(calendarId)}/events`;

    for (const evt of synced || []) {
      if (!evt.google_event_id) continue;
      let sourceExists = true;
      try {
        const entityMap: any = {
          assignment: 'Assignment', exam: 'ExamSchedule', timetable: 'TimetableEntry',
          academic_event: 'AcademicCalendarEvent', study_session: 'StudySession',
          project: 'Project', campus_event: 'CampusEvent',
        };
        const entityName = entityMap[evt.source_entity];
        if (entityName) {
          const r = await base44.asServiceRole.entities[entityName].filter({ id: evt.source_id }, '-created_date', 1);
          sourceExists = r && r.length > 0;
        }
      } catch { sourceExists = true; }

      if (!sourceExists) {
        const res = await fetch(`${calUrl}/${evt.google_event_id}`, { method: 'DELETE', headers: authHeader });
        if (res.ok || res.status === 404) { await base44.asServiceRole.entities.CalendarEvent.delete(evt.id); deleted++; }
        else { errors.push({ id: evt.id, error: `Delete ${res.status}` }); }
      }
    }
  } catch (e) { errors.push({ error: e.message }); }
  return { deleted, errors: errors.slice(0, 5) };
}

function buildGoogleEvent(evt: any, reminderMinutes: number, appHost: string) {
  const isAllDay = evt.is_all_day || !evt.start_time;
  const colorId = COLOR_MAP[evt.type] || '8';
  const deepLink = `${appHost}${DEEP_LINK_MAP[evt.type] || '/calendar'}`;
  const sourceLabel = `Synced from UNIBUD · View: ${deepLink}`;
  const fullDescription = evt.description ? `${evt.description}\n\n— ${sourceLabel}` : sourceLabel;
  const reminders = reminderMinutes > 0 ? { useDefault: false, overrides: [{ method: 'popup', minutes: reminderMinutes }] } : { useDefault: false, overrides: [] };
  const extendedProperties = { shared: { unibud_source_entity: evt.source_entity || '', unibud_source_id: evt.source_id || '', unibud_sync: 'true' } };

  if (isAllDay) {
    const endDate = new Date(evt.date + 'T00:00:00');
    endDate.setDate(endDate.getDate() + 1);
    return { summary: evt.title, description: fullDescription, location: evt.location || '', colorId, start: { date: evt.date, timeZone: 'UTC' }, end: { date: endDate.toISOString().split('T')[0], timeZone: 'UTC' }, reminders, extendedProperties, source: { title: 'UNIBUD', url: deepLink } };
  }
  const startDateTime = `${evt.date}T${evt.start_time}:00`;
  const endDateTime = evt.end_time ? `${evt.date}T${evt.end_time}:00` : `${evt.date}T${String(Math.min(23, parseInt(evt.start_time) + 1)).padStart(2, '0')}:00:00`;
  return { summary: evt.title, description: fullDescription, location: evt.location || '', colorId, start: { dateTime: startDateTime, timeZone: 'UTC' }, end: { dateTime: endDateTime, timeZone: 'UTC' }, reminders, extendedProperties, source: { title: 'UNIBUD', url: deepLink } };
}