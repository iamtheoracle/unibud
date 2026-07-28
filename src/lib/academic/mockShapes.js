/**
 * UNIBUD Academic — entity-shaped mock entries for screen fallbacks.
 *
 * Mirrors the real TimetableEntry / Assignment / Exam / StudentGrade /
 * AttendanceRecord schemas so screens can use the auto-replace fallback pattern
 * with zero rendering changes. Tagged with `__mock: true` so read-only display
 * avoids mutating the real database.
 */
import { ACADEMIC_COURSES_MOCK, ACADEMIC_TIMETABLE_MOCK, ACADEMIC_ASSIGNMENTS_MOCK } from "./mockData";

const DAY_NAMES = { 1: "Monday", 2: "Tuesday", 3: "Wednesday", 4: "Thursday", 5: "Friday", 6: "Saturday" };
const courseById = (id) => ACADEMIC_COURSES_MOCK.find((c) => c.id === id);

function dateFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

// ─── TimetableEntry-shaped mock ──────────────────────────────────────────────
export const TIMETABLE_MOCK_ENTRIES = Object.entries(ACADEMIC_TIMETABLE_MOCK).flatMap(([dayIdx, slots]) =>
  slots.map((s, i) => {
    const c = courseById(s.courseId);
    return {
      id: `mock-tt-${dayIdx}-${i}`,
      __mock: true,
      day: DAY_NAMES[dayIdx] || "Monday",
      course_code: c?.code || s.courseId,
      course_title: c?.title || "",
      start_time: s.start,
      end_time: s.end,
      location: s.room,
      lecturer: c?.lecturer || "",
      type: s.room?.startsWith("Lab") ? "lab" : "lecture",
      color: c?.color ? `hsl(${c.color})` : "#7FD8FF",
    };
  })
);

// ─── Assignment-shaped mock ───────────────────────────────────────────────────
function isoFromDays(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}
const SUBMISSION_TYPE = { a1: "file", a2: "file", a3: "online", a4: "online", a5: "file", a6: "online" };
const INSTRUCTIONS = {
  a1: "Implement insert/delete with rebalancing. Submit source + test cases on the LMS.",
  a2: "Simulate Round-Robin & FCFS. Include a short report comparing average wait times.",
  a3: "Design a normalized schema (3NF) for a student records system. Submit ER diagram + SQL DDL.",
  a4: "Solve problems 1–6 from the course handout. Show all working.",
  a5: "Write a MIPS program that sorts an array. Submit the .asm file.",
  a6: "800–1000 words on a topical issue. MLA referencing, double-spaced.",
};

export const ASSIGNMENT_MOCK_ENTRIES = ACADEMIC_ASSIGNMENTS_MOCK.map((a) => {
  const c = courseById(a.courseId);
  const days = a.dueInDays;
  const priority = days < 0 ? "high" : days <= 1 ? "high" : days <= 3 ? "medium" : "low";
  const status = a.status === "overdue" ? "late" : a.status;
  return {
    id: `mock-as-${a.id}`,
    __mock: true,
    title: a.title,
    course_code: c?.code || a.courseId,
    course_title: c?.title || "",
    due_date: isoFromDays(days),
    status,
    priority,
    submission_type: SUBMISSION_TYPE[a.id] || "file",
    description: INSTRUCTIONS[a.id] || "",
    attachments: [],
    weight: a.weight,
  };
}).sort((a, b) => (a.due_date || "").localeCompare(b.due_date || ""));

// ─── Exam-shaped mock (300L second-semester finals window) ────────────────────
export const EXAM_MOCK_ENTRIES = [
  { id: "mock-ex-mth201", __mock: true, title: "Linear Algebra Quiz", course_code: "MTH201", course_title: "Linear Algebra I", type: "quiz", date: dateFromNow(8), start_time: "08:00", duration_minutes: 45, location: "Maths Hall 2", seat_number: "M-14", status: "upcoming", topics: ["Matrices", "Determinants", "Eigenvalues"], revision_progress: 30, confidence: 2 },
  { id: "mock-ex-csc305", __mock: true, title: "Operating Systems Final", course_code: "CSC305", course_title: "Operating Systems", type: "final", date: dateFromNow(11), start_time: "10:00", duration_minutes: 120, location: "Examination Hall C", seat_number: "C-208", status: "upcoming", topics: ["Process Scheduling", "Memory Management", "Deadlocks", "File Systems"], revision_progress: 70, confidence: 4 },
  { id: "mock-ex-csc307", __mock: true, title: "Database Management Final", course_code: "CSC307", course_title: "Database Management Systems", type: "final", date: dateFromNow(13), start_time: "14:00", duration_minutes: 120, location: "Examination Hall A", seat_number: "A-072", status: "upcoming", topics: ["SQL", "Normalization", "ER Modelling", "Transactions"], revision_progress: 55, confidence: 4 },
  { id: "mock-ex-csc301", __mock: true, title: "Data Structures Final", course_code: "CSC301", course_title: "Data Structures", type: "final", date: dateFromNow(15), start_time: "09:00", duration_minutes: 120, location: "Examination Hall E", seat_number: "E-031", status: "upcoming", topics: ["Trees", "Graphs", "Hashing", "Sorting"], revision_progress: 45, confidence: 3 },
  { id: "mock-ex-csc303", __mock: true, title: "Algorithms Practical", course_code: "CSC303", course_title: "Data Structures & Algorithms", type: "practical", date: dateFromNow(18), start_time: "08:00", duration_minutes: 180, location: "Computer Lab 2", seat_number: "L-19", status: "upcoming", topics: ["Dynamic Programming", "Greedy", "Graph Algorithms"], revision_progress: 60, confidence: 3 },
  { id: "mock-ex-gst111", __mock: true, title: "Communication Oral Defence", course_code: "GST111", course_title: "Communication in English", type: "oral", date: dateFromNow(21), start_time: "11:00", duration_minutes: 30, location: "Room 104, Arts Block", seat_number: "", status: "upcoming", topics: ["Argumentation", "Referencing", "Public Speaking"], revision_progress: 20, confidence: 3 },
];

// ─── StudentGrade-shaped mock (two completed semesters) ───────────────────────
const grade = (course_code, course_title, semester, assessment_type, score, weight) => ({
  id: `mock-sg-${course_code}-${semester.replace(/\W/g, "")}-${assessment_type}`,
  __mock: true,
  course_code,
  course_title,
  semester,
  assessment_type,
  score,
  max_score: 100,
  weight,
});

export const STUDENTGRADE_MOCK_ENTRIES = [
  grade("CSC301", "Data Structures", "First Semester 2024/2025", "exam", 72, 10),
  grade("CSC305", "Operating Systems", "First Semester 2024/2025", "exam", 68, 10),
  grade("CSC307", "Database Management Systems", "First Semester 2024/2025", "exam", 82, 10),
  grade("MTH201", "Linear Algebra I", "First Semester 2024/2025", "exam", 64, 10),
  grade("GST111", "Communication in English", "First Semester 2024/2025", "exam", 78, 5),

  grade("CSC303", "Data Structures & Algorithms", "Second Semester 2024/2025", "exam", 81, 10),
  grade("CSC311", "Software Engineering", "Second Semester 2024/2025", "exam", 74, 10),
  grade("CSC314", "Compiler Construction", "Second Semester 2024/2025", "exam", 66, 10),
  grade("MTH211", "Discrete Mathematics", "Second Semester 2024/2025", "exam", 67, 10),
  grade("GST121", "Use of Library & Study Skills", "Second Semester 2024/2025", "exam", 77, 5),
];

// ─── AttendanceRecord-shaped mock (current semester attendance) ───────────────
const ATTENDANCE_COURSES = [
  { code: "CSC301", title: "Data Structures" },
  { code: "CSC305", title: "Operating Systems" },
  { code: "CSC303", title: "Data Structures & Algorithms" },
  { code: "CSC307", title: "Database Management Systems" },
  { code: "MTH201", title: "Linear Algebra I" },
  { code: "GST111", title: "Communication in English" },
];
const ATTENDANCE_PATTERNS = {
  CSC301: ["present", "present", "present", "absent", "present", "present", "present", "present", "excused", "present"],
  CSC305: ["present", "present", "present", "present", "present", "absent", "present", "present", "present", "present"],
  CSC303: ["present", "present", "present", "present", "excused", "present", "present", "present", "present", "present"],
  CSC307: ["present", "present", "absent", "present", "present", "present", "present", "present", "present", "present"],
  MTH201: ["present", "absent", "present", "present", "present", "present", "present", "present", "present", "excused"],
  GST111: ["present", "present", "present", "present", "present", "present", "present", "present", "present", "present"],
};

function attDates(n) {
  const out = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    const x = new Date(d);
    x.setDate(d.getDate() - i * 7);
    out.push(x.toISOString().split("T")[0]);
  }
  return out;
}

export const ATTENDANCE_RECORD_MOCK_ENTRIES = ATTENDANCE_COURSES.flatMap((c) => {
  const pattern = ATTENDANCE_PATTERNS[c.code];
  const dates = attDates(pattern.length);
  return pattern.map((status, i) => ({
    id: `mock-att-${c.code}-${i}`,
    __mock: true,
    course_code: c.code,
    course_title: c.title,
    date: dates[i],
    status,
  }));
});

// ─── Course-shaped mock (entity-shaped for the Courses catalog + CourseSpace) ─
const COURSE_META = {
  csc301: { description: "Foundational data structures — arrays, linked lists, stacks, queues, trees, graphs and hashing — with algorithmic analysis and complexity.", schedule: "Mon & Wed · 08:00–10:00", location: "Hall A", grade: "A" },
  csc303: { description: "Computer organisation, instruction sets, memory hierarchy, pipelining and input/output systems.", schedule: "Tue & Fri · 10:00–12:00", location: "Hall B", grade: "B" },
  mth201: { description: "Linear algebra, vector spaces, matrices, eigenvalues and differential equations for engineering.", schedule: "Mon & Wed · 10:00–12:00", location: "Math Theatre", grade: "A" },
  gst111: { description: "Academic writing, argumentation, oral communication and study skills for university success.", schedule: "Tue & Fri · 12:00–14:00", location: "Auditorium", grade: "B" },
  csc305: { description: "Process management, scheduling, concurrency, memory, file systems and distributed systems.", schedule: "Mon & Thu · 14:00–16:00", location: "Lab 2", grade: "A" },
  csc307: { description: "Relational model, SQL, normalisation, transactions, indexing and database application design.", schedule: "Wed & Thu · 10:00–12:00", location: "Lab 1", grade: "B" },
};
const COURSE_PROGRESS = { csc301: 62, csc303: 48, mth201: 71, gst111: 80, csc305: 55, csc307: 67 };
const COURSE_DEPT = { mth201: "Mathematics", gst111: "General Studies" };

export const COURSE_MOCK_ENTRIES = ACADEMIC_COURSES_MOCK.map((c, i) => {
  const meta = COURSE_META[c.id] || {};
  return {
    id: `mock-course-${c.id}`,
    __mock: true,
    code: c.code,
    title: c.title,
    lecturer: c.lecturer,
    credits: c.credits,
    semester: "First Semester",
    faculty: "Faculty of Science",
    department: COURSE_DEPT[c.id] || "Computer Science",
    grade: meta.grade || "",
    color: c.color ? `hsl(${c.color})` : "#7FD8FF",
    pinned: i < 2,
    progress: COURSE_PROGRESS[c.id] || 0,
    status: "active",
    description: meta.description || "",
    schedule: meta.schedule || "",
    location: meta.location || "",
  };
});

export function getMockCourseById(id) {
  return COURSE_MOCK_ENTRIES.find((c) => c.id === id) || null;
}