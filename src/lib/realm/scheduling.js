/**
 * Scheduling Service — calendar events, office-hour booking, calendar sync.
 * Reuses the CalendarEvent / OfficeHoursBooking entities and the
 * googleCalendarSync backend function. Thin platform facade over
 * existing domain entities — no new scheduling logic.
 */
export function schedulingService(base44) {
  return {
    listEvents: (...rest) => base44.entities.CalendarEvent.list(...rest),
    createEvent: (data) => base44.entities.CalendarEvent.create(data),
    updateEvent: (id, data) => base44.entities.CalendarEvent.update(id, data),
    deleteEvent: (id) => base44.entities.CalendarEvent.delete(id),

    bookOfficeHours: (slotId, data) =>
      base44.entities.OfficeHoursBooking.create({ slot_id: slotId, ...data }),
    cancelBooking: (id) => base44.entities.OfficeHoursBooking.delete(id),

    syncGoogleCalendar: (payload) =>
      base44.functions?.googleCalendarSync?.(payload || {}),
  };
}