import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googlecalendar');
    const authHeader = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    if (action === 'sync') {
      // Push upcoming CalendarEvents to the shared Google Calendar
      const today = new Date().toISOString().split('T')[0];
      const events = await base44.asServiceRole.entities.CalendarEvent.filter({
        date: { $gte: today }
      }, '-date', 200);

      let created = 0;
      let updated = 0;
      let skipped = 0;
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
              // Event was deleted from Google — recreate
              const createRes = await fetch(
                'https://www.googleapis.com/calendar/v3/calendars/primary/events',
                { method: 'POST', headers: authHeader, body: JSON.stringify(gEvent) }
              );
              if (createRes.ok) {
                const data = await createRes.json();
                await base44.asServiceRole.entities.CalendarEvent.update(evt.id, { google_event_id: data.id });
                created++;
              }
            } else { errors.push({ id: evt.id, error: `Update failed: ${res.status}` }); }
          } else {
            const res = await fetch(
              'https://www.googleapis.com/calendar/v3/calendars/primary/events',
              { method: 'POST', headers: authHeader, body: JSON.stringify(gEvent) }
            );
            if (res.ok) {
              const data = await res.json();
              await base44.asServiceRole.entities.CalendarEvent.update(evt.id, { google_event_id: data.id });
              created++;
            } else { errors.push({ id: evt.id, error: `Create failed: ${res.status}` }); }
          }
        } catch (e) {
          errors.push({ id: evt.id, error: e.message });
        }
      }

      return Response.json({ status: 'success', created, updated, skipped, errors: errors.slice(0, 10), total: events.length });
    }

    if (action === 'fetch') {
      // Pull upcoming events from the shared Google Calendar
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=100&orderBy=startTime&singleEvents=true&timeMin=${timeMin}&timeMax=${timeMax}`;

      const res = await fetch(url, { headers: authHeader });
      if (!res.ok) {
        return Response.json({ error: `Google API error: ${res.status}` }, { status: 502 });
      }
      const data = await res.json();
      const items = (data.items || []).map((item) => ({
        google_event_id: item.id,
        title: item.summary || 'Untitled',
        description: item.description || '',
        location: item.location || '',
        start: item.start?.dateTime || item.start?.date || null,
        end: item.end?.dateTime || item.end?.date || null,
        is_all_day: !!item.start?.date,
        html_link: item.htmlLink || ''
      }));

      return Response.json({ events: items, total: items.length });
    }

    if (action === 'sync_single') {
      // Push a single CalendarEvent to Google Calendar
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
          // Recreate
          const createRes = await fetch(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            { method: 'POST', headers: authHeader, body: JSON.stringify(gEvent) }
          );
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

    return Response.json({ error: 'Unknown action. Use sync, fetch, or sync_single.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildGoogleEvent(evt) {
  const isAllDay = evt.is_all_day || !evt.start_time;
  if (isAllDay) {
    const dateStr = evt.date;
    // All-day: end date is the day after start
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
  // Timed event
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