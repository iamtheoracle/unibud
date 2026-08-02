/**
 * UNIBUD Academic — Orbit-powered API service.
 *
 * Blank by default. When data is requested, Orbit browses the web to build
 * a realistic academic profile for the student's university and program.
 * The Orbit generation is cached and shared across all consumers.
 */
import { getOrbitData } from "./orbitPopulate";

const courseById = (courses, id) => (courses || []).find((c) => c.id === id);

function daysFromNowISO(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function toMin(hm) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function classStatus(start, end) {
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
    const data = await getOrbitData();
    return data.student || {};
  },

  async getCourses() {
    const data = await getOrbitData();
    return data.courses || [];
  },

  async getTodaySchedule() {
    const data = await getOrbitData();
    const day = new Date().getDay();
    const slots = (data.timetableSlots || []).filter((s) => s.day === day);
    return slots.map((s) => {
      const course = courseById(data.courses, s.courseId);
      return {
        ...s,
        course,
        code: course?.code,
        title: course?.title,
        color: course?.color,
        status: classStatus(s.start, s.end),
      };
    });
  },

  async getUpcomingDeadlines() {
    const data = await getOrbitData();
    return (data.assignments || [])
      .map((a) => {
        const course = courseById(data.courses, a.courseId);
        return {
          ...a,
          course,
          code: course?.code,
          color: course?.color,
          dueDate: daysFromNowISO(a.dueInDays),
          dueInDays: a.dueInDays,
        };
      })
      .sort((a, b) => a.dueInDays - b.dueInDays);
  },

  async getExams() {
    const data = await getOrbitData();
    return (data.exams || [])
      .map((e) => {
        const course = courseById(data.courses, e.courseId);
        return {
          ...e,
          course,
          code: course?.code,
          color: course?.color,
          date: daysFromNowISO(e.inDays),
          inDays: e.inDays,
        };
      })
      .sort((a, b) => a.inDays - b.inDays);
  },

  async getGpa() {
    const data = await getOrbitData();
    return data.gpa || null;
  },

  async getAttendance() {
    const data = await getOrbitData();
    const attendance = data.attendance || { overall: 0, perCourse: [] };
    return {
      ...attendance,
      perCourse: (attendance.perCourse || []).map((p) => ({
        ...p,
        course: courseById(data.courses, p.courseId),
      })),
    };
  },

  async getStudyStats() {
    const data = await getOrbitData();
    return data.stats || { streakDays: 0, weekStudyHours: 0, focusSessions: 0, avgSessionMin: 0 };
  },

  async getAcademicCalendar() {
    const data = await getOrbitData();
    return data.calendar || [];
  },
};