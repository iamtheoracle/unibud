/**
 * UNIBUD Academic — mock API service.
 *
 * Returns realistic academic data with simulated latency. Structured so a
 * real base44 entity-backed implementation can drop in later without changing
 * the hook signatures. Every method is async and returns plain JSON.
 */
import {
  ACADEMIC_STUDENT,
  ACADEMIC_COURSES_MOCK,
  ACADEMIC_TIMETABLE_MOCK,
  ACADEMIC_ASSIGNMENTS_MOCK,
  ACADEMIC_EXAMS_MOCK,
  ACADEMIC_GPA_MOCK,
  ACADEMIC_ATTENDANCE_MOCK,
  ACADEMIC_STATS_MOCK,
  ACADEMIC_CALENDAR_MOCK,
} from "./mockData";

const LATENCY = 350;
const wait = (ms = LATENCY) => new Promise((r) => setTimeout(r, ms));

const courseById = (id) => ACADEMIC_COURSES_MOCK.find((c) => c.id === id);

function daysFromNowISO(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

/** "HH:MM" today -> minutes since midnight. */
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
    await wait(120);
    return ACADEMIC_STUDENT;
  },

  async getCourses() {
    await wait();
    return ACADEMIC_COURSES_MOCK;
  },

  async getTodaySchedule() {
    await wait();
    const day = new Date().getDay();
    const slots = ACADEMIC_TIMETABLE_MOCK[day] || [];
    return slots.map((s) => {
      const course = courseById(s.courseId);
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
    await wait();
    const assignments = ACADEMIC_ASSIGNMENTS_MOCK.map((a) => {
      const course = courseById(a.courseId);
      return {
        ...a,
        course,
        code: course?.code,
        color: course?.color,
        dueDate: daysFromNowISO(a.dueInDays),
        dueInDays: a.dueInDays,
      };
    });
    // Overdue first, then nearest due first.
    return assignments.sort((a, b) => a.dueInDays - b.dueInDays);
  },

  async getExams() {
    await wait();
    return ACADEMIC_EXAMS_MOCK.map((e) => {
      const course = courseById(e.courseId);
      return {
        ...e,
        course,
        code: course?.code,
        color: course?.color,
        date: daysFromNowISO(e.inDays),
        inDays: e.inDays,
      };
    }).sort((a, b) => a.inDays - b.inDays);
  },

  async getGpa() {
    await wait();
    return ACADEMIC_GPA_MOCK;
  },

  async getAttendance() {
    await wait(260);
    return {
      ...ACADEMIC_ATTENDANCE_MOCK,
      perCourse: ACADEMIC_ATTENDANCE_MOCK.perCourse.map((p) => ({
        ...p,
        course: courseById(p.courseId),
      })),
    };
  },

  async getStudyStats() {
    await wait(260);
    return ACADEMIC_STATS_MOCK;
  },

  async getAcademicCalendar() {
    await wait(260);
    return ACADEMIC_CALENDAR_MOCK;
  },
};