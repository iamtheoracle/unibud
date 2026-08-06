/**
 * UNIBUD Academic — real entity-backed API service.
 *
 * All methods query real base44 entities (Course, TimetableEntry, Assignment,
 * Exam, StudentGrade, AttendanceRecord, StudySession, CalendarEvent).
 * When no data exists, returns empty values so consumers show Bud empty states.
 * No orbit-generated data. No fabrication. No mock.
 */
import { base44 } from "@/api/base44Client";

function toMin(hm) {
  if (!hm) return 0;
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function classStatus(start, end) {
  if (!start || !end) return "upcoming";
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const s = toMin(start);
  const e = toMin(end);
  if (cur < s) return "upcoming";
  if (cur >= s && cur <= e) return "now";
  return "done";
}

export const academicApi = {
  async getStudent() {
    const user = await base44.auth.me();
    const data = user?.data || {};
    return {
      full_name: user?.full_name || "",
      university: data.university || "",
      department: data.department || "",
      level: data.level || "",
      matriculation_number: data.matriculation_number || "",
    };
  },

  async getCourses() {
    return await base44.entities.Course.list() || [];
  },

  async getTodaySchedule() {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = dayNames[new Date().getDay()];
    const slots = await base44.entities.TimetableEntry.filter({ day: today }) || [];
    return slots.map((s) => ({
      ...s,
      code: s.course_code,
      title: s.course_title,
      status: classStatus(s.start_time, s.end_time),
    }));
  },

  async getUpcomingDeadlines() {
    const assignments = await base44.entities.Assignment.list("-due_date", 20) || [];
    return assignments.map((a) => ({
      ...a,
      code: a.course_code,
      dueDate: a.due_date,
      dueInDays: a.due_date ? Math.round((new Date(a.due_date) - new Date()) / 86400000) : null,
    }));
  },

  async getExams() {
    const exams = await base44.entities.Exam.list("date", 20) || [];
    return exams.map((e) => ({
      ...e,
      code: e.course_code,
      date: e.date,
      inDays: e.date ? Math.round((new Date(e.date) - new Date()) / 86400000) : null,
    }));
  },

  async getGpa() {
    const grades = await base44.entities.StudentGrade.list() || [];
    if (!grades.length) return null;
    const totalPoints = grades.reduce((sum, g) => sum + (g.grade_point || 0) * (g.credit_units || 1), 0);
    const totalCredits = grades.reduce((sum, g) => sum + (g.credit_units || 1), 0);
    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    return {
      scale: 5.0,
      current: gpa,
      lastSemesterGrades: grades.map((g) => ({
        courseId: g.course_id,
        code: g.course_code,
        title: g.course_title,
        grade: g.grade,
        point: g.grade_point,
      })),
    };
  },

  async getAttendance() {
    const records = await base44.entities.AttendanceRecord.list() || [];
    if (!records.length) return { overall: 0, perCourse: [] };
    const overall = records.reduce((sum, r) => sum + (r.attendance_rate || 0), 0) / records.length;
    return {
      overall: Math.round(overall),
      perCourse: records.map((r) => ({
        courseId: r.course_id,
        pct: r.attendance_rate,
        course: { code: r.course_code, title: r.course_title },
      })),
    };
  },

  async getStudyStats() {
    const sessions = await base44.entities.StudySession.list("-created_date", 50) || [];
    if (!sessions.length) return { streakDays: 0, weekStudyHours: 0, focusSessions: 0, avgSessionMin: 0 };
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const weekSessions = sessions.filter((s) => new Date(s.created_date) >= weekAgo);
    const totalMin = weekSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    return {
      streakDays: 0,
      weekStudyHours: totalMin / 60,
      focusSessions: weekSessions.length,
      avgSessionMin: weekSessions.length > 0 ? totalMin / weekSessions.length : 0,
    };
  },

  async getAcademicCalendar() {
    return await base44.entities.CalendarEvent.list("date", 20) || [];
  },
};