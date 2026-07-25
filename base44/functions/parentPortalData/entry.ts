import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

/**
 * parentPortalData — returns a consenting student's aggregated academic data
 * to their approved guardian. Verifies an approved ConsentLink before reading
 * anything. All reads use the service role; access is impossible without consent.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const guardian = await base44.auth.me();
    if (!guardian) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const studentId = body.student_id;
    if (!studentId) return Response.json({ error: "student_id required" }, { status: 400 });

    const links = await base44.asServiceRole.entities.ConsentLink.filter({ guardian_id: guardian.id, student_id: studentId, status: "approved" });
    if (!links || links.length === 0) return Response.json({ error: "No approved consent for this student" }, { status: 403 });

    const student = await base44.asServiceRole.entities.User.get(studentId).catch(() => ({}));
    const institutionId = student.institution_id || (student.data && student.data.institution_id) || "";

    const [profileRes, coursesRes, assignmentsRes, examsRes, attendanceRes, sessionsRes] = await Promise.all([
      base44.asServiceRole.entities.StudentRecord.filter({ created_by_id: studentId }).catch(() => []),
      base44.asServiceRole.entities.Course.filter({ created_by_id: studentId }).catch(() => []),
      base44.asServiceRole.entities.Assignment.filter({ created_by_id: studentId }).catch(() => []),
      base44.asServiceRole.entities.Exam.filter({ created_by_id: studentId }).catch(() => []),
      base44.asServiceRole.entities.AttendanceRecord.filter({ created_by_id: studentId }).catch(() => []),
      base44.asServiceRole.entities.StudySession.filter({ created_by_id: studentId }).catch(() => []),
    ]);

    const profile = Array.isArray(profileRes) ? profileRes[0] : null;
    let grades = [];
    if (profile && profile.matriculation_number) {
      grades = await base44.asServiceRole.entities.StudentGrade.filter({ student_identifier: profile.matriculation_number }).catch(() => []);
    }

    let notices = [];
    if (institutionId) {
      notices = await base44.asServiceRole.entities.StaffAnnouncement.filter({ institution_id: institutionId }).catch(() => []);
    }

    const sessions = Array.isArray(sessionsRes) ? sessionsRes : [];
    const studyMinutes = sessions.reduce((s, x) => s + (Number(x.duration_minutes) || Number(x.duration) || 0), 0);

    return Response.json({
      student: { id: studentId, full_name: student.full_name || (profile && profile.full_name) || "", email: student.email || "", institution_id: institutionId },
      profile,
      courses: Array.isArray(coursesRes) ? coursesRes : [],
      assignments: Array.isArray(assignmentsRes) ? assignmentsRes : [],
      exams: Array.isArray(examsRes) ? examsRes : [],
      attendance: Array.isArray(attendanceRes) ? attendanceRes : [],
      grades: Array.isArray(grades) ? grades : [],
      studyMinutes,
      studySessions: sessions.length,
      notices: Array.isArray(notices) ? notices : [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});