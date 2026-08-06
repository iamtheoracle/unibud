import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * getUniversityProfileOfficial — Bud's official source for student briefings.
 *
 * Aggregates verified institutional data across all domains:
 *   • Active announcements (published, not expired)
 *   • Active emergency notices
 *   • Upcoming academic calendar events
 *   • Upcoming exam schedules
 *   • Faculties & departments count
 *   • Course catalog summary
 *
 * This is the single endpoint Bud calls to ground its briefings in
 * institution-published, verified information — never speculation.
 *
 * Body: { institution_id?: string }
 * If institution_id is omitted, resolves from the calling user's data.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Resolve institution_id — prefer body, then user's data
    let institutionId = body.institution_id;

    if (!institutionId) {
      try {
        const user = await base44.asServiceRole.auth.me();
        institutionId = user?.data?.institution_id || user?.institution_id;
      } catch {
        // No authenticated user — return empty
      }
    }

    if (!institutionId) {
      return Response.json({
        status: "ok",
        institution: null,
        message: "No institution context available.",
        announcements: [],
        emergencies: [],
        calendar_events: [],
        exams: [],
        stats: { faculties: 0, departments: 0, courses: 0 }
      });
    }

    // Fetch institution record
    let institution = null;
    try {
      institution = await base44.asServiceRole.entities.Institution.get(institutionId);
    } catch {
      // Institution may not exist in the entity collection
    }

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    // ── Parallel fetch across all official domains ──
    const [
      announcementsRaw,
      emergencies,
      calendarEvents,
      exams,
      faculties,
      departments,
      courseCount
    ] = await Promise.all([
      // Active published announcements (not expired, not draft)
      base44.asServiceRole.entities.StaffAnnouncement.filter({
        institution_id: institutionId,
        status: "published"
      }, "-created_date", 50).catch(() => []),

      // Active emergency notices
      base44.asServiceRole.entities.EmergencyNotice.filter({
        institution_id: institutionId,
        status: "active"
      }, "-created_date", 20).catch(() => []),

      // Academic calendar events (upcoming + recent)
      base44.asServiceRole.entities.AcademicCalendarEvent.filter({
        institution_id: institutionId
      }, "start_date", 50).catch(() => []),

      // Exam schedules (upcoming)
      base44.asServiceRole.entities.ExamSchedule.filter({
        institution_id: institutionId,
        status: "scheduled"
      }, "date", 50).catch(() => []),

      // Faculties
      base44.asServiceRole.entities.Faculty.filter({
        institution_id: institutionId,
        is_active: true
      }, "sort_order", 100).catch(() => []),

      // Departments
      base44.asServiceRole.entities.Department.filter({
        institution_id: institutionId,
        is_active: true
      }, "sort_order", 200).catch(() => []),

      // Course catalog count
      base44.asServiceRole.entities.CourseCatalogEntry.filter({
        institution_id: institutionId,
        is_active: true
      }, "-created_date", 1).catch(() => [])
    ]);

    // Filter announcements: exclude expired
    const announcements = (announcementsRaw || []).filter((a) => {
      if (!a.expires_at) return true;
      return new Date(a.expires_at) > now;
    });

    // Split calendar events: upcoming vs past
    const upcomingCalendar = (calendarEvents || []).filter((e) =>
      (e.end_date || e.start_date) >= todayStr
    );
    const recentCalendar = (calendarEvents || []).filter((e) =>
      (e.end_date || e.start_date) < todayStr
    ).slice(0, 5);

    // Filter exams: upcoming only
    const upcomingExams = (exams || []).filter((e) => e.date >= todayStr);

    return Response.json({
      status: "ok",
      institution: institution ? {
        id: institution.id,
        name: institution.name,
        short_name: institution.short_name,
        type: institution.type,
        motto: institution.motto,
        description: institution.description,
        logo_url: institution.logo_url,
        banner_url: institution.banner_url,
        is_verified: institution.is_verified,
        verification_status: institution.verification_status,
        website: institution.website,
        city: institution.city,
        country: institution.country,
        accent_color: institution.accent_color,
        estimated_student_count: institution.estimated_student_count
      } : null,
      announcements: announcements.slice(0, 20).map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        audience: a.audience,
        target_name: a.target_name,
        priority: a.priority,
        pinned: a.pinned,
        author_name: a.author_name,
        link_url: a.link_url,
        created_date: a.created_date,
        expires_at: a.expires_at
      })),
      emergencies: (emergencies || []).map((e) => ({
        id: e.id,
        title: e.title,
        message: e.message,
        severity: e.severity,
        category: e.category,
        location: e.location,
        instructions: e.instructions,
        contact_info: e.contact_info,
        status: e.status,
        issued_by_name: e.issued_by_name,
        created_date: e.created_date,
        end_time: e.end_time
      })),
      calendar_events: {
        upcoming: upcomingCalendar.slice(0, 15),
        recent: recentCalendar
      },
      exams: upcomingExams.slice(0, 20).map((e) => ({
        id: e.id,
        title: e.title,
        course_code: e.course_code,
        course_title: e.course_title,
        type: e.type,
        date: e.date,
        start_time: e.start_time,
        end_time: e.end_time,
        venue: e.venue,
        location: e.location,
        faculty_name: e.faculty_name,
        department_name: e.department_name,
        instructions: e.instructions,
        academic_session: e.academic_session,
        semester: e.semester
      })),
      stats: {
        faculties: (faculties || []).length,
        departments: (departments || []).length,
        courses: courseCount?.length || 0,
        active_announcements: announcements.length,
        active_emergencies: (emergencies || []).filter((e) => e.status === "active").length,
        upcoming_exams: upcomingExams.length,
        upcoming_calendar_events: upcomingCalendar.length
      },
      fetched_at: now.toISOString()
    });
  } catch (error) {
    console.error("[getUniversityProfileOfficial] Error:", error);
    return Response.json({
      status: "error",
      message: error.message || "Failed to fetch university profile data.",
      announcements: [],
      emergencies: [],
      calendar_events: { upcoming: [], recent: [] },
      exams: [],
      stats: {}
    }, { status: 500 });
  }
});