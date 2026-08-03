import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { performSync, getSyncRecord, defaultPrefs } from '../../shared/googleCalendarSyncHelpers.ts';

/**
 * Google Calendar Sync — One-way push from UNIBUD to Google Calendar
 *
 * Actions: list_calendars, full_sync, background_sync, get_status
 */

const GOOGLE_CAL_API = 'https://www.googleapis.com/calendar/v3';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;
    const appHost = `https://${req.headers.get('host') || 'app.unibud.com'}`;

    // ─── list_calendars ───
    if (action === 'list_calendars') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
      const res = await fetch(`${GOOGLE_CAL_API}/users/me/calendarList`, { headers: { 'Authorization': `Bearer ${accessToken}` } });
      if (!res.ok) return Response.json({ error: `Google API: ${res.status}` }, { status: 502 });
      const data = await res.json();
      const calendars = (data.items || []).map((c: any) => ({ id: c.id, summary: c.summary || c.id, primary: c.primary || false }));
      const syncRec = await getSyncRecord(base44, user.id);
      if (syncRec) await base44.asServiceRole.entities.AcademicCalendarSync.update(syncRec.id, { available_calendars: calendars });
      return Response.json({ calendars });
    }

    // ─── background_sync (workflow) ───
    if (action === 'background_sync') {
      const result = await performSync(base44, null, appHost);
      return Response.json({ status: 'success', ...result });
    }

    // ─── full_sync (user-initiated) ───
    if (action === 'full_sync') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const result = await performSync(base44, user.id, appHost);
      return Response.json({ status: 'success', ...result });
    }

    // ─── get_status ───
    if (action === 'get_status') {
      const user = await base44.auth.me();
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      const syncRec = await getSyncRecord(base44, user.id);
      if (!syncRec) return Response.json({ connected: false });
      return Response.json({
        connected: syncRec.sync_status === 'active' || syncRec.sync_status === 'syncing',
        sync_status: syncRec.sync_status,
        last_synced_at: syncRec.last_synced_at,
        last_sync_result: syncRec.last_sync_result,
        sync_preferences: syncRec.sync_preferences || defaultPrefs(),
        reminder_minutes: syncRec.reminder_minutes ?? 30,
        google_calendar_id: syncRec.google_calendar_id || 'primary',
        available_calendars: syncRec.available_calendars || [],
        conflict_log: (syncRec.conflict_log || []).slice(0, 10),
        auto_sync: syncRec.auto_sync ?? true,
        last_error: syncRec.last_error,
      });
    }

    return Response.json({ error: 'Unknown action. Use full_sync, background_sync, list_calendars, or get_status.' }, { status: 400 });
  } catch (error) {
    console.error('[googleCalendarSync] Fatal:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});