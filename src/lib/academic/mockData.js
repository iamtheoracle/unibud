/**
 * UNIBUD Academic — realistic mock data for the Academic ecosystem.
 *
 * Used by the academic API service until real institution integrations are
 * connected. All temporal data uses relative offsets computed at read time so
 * the dataset always feels current. Data reflects a 300-level Computer Science
 * student at a Nigerian university (UNIBUD's primary context).
 */

export const ACADEMIC_STUDENT = {
  full_name: "Adaeze Okonkwo",
  matriculation_number: "CSC/UNILAG/2023/0147",
  university: "University of Lagos",
  faculty: "Faculty of Science",
  department: "Computer Science",
  level: 300,
  semester: "First Semester",
  session: "2025/2026",
  preferred_study_time: "evening",
};

// 6 first-semester courses. color = HSL channels for themed accents.
export const ACADEMIC_COURSES_MOCK = [
  { id: "csc301", code: "CSC 301", title: "Data Structures & Algorithms", credits: 3, lecturer: "Dr. Adebayo Ogundimu", color: "221 83% 50%" },
  { id: "csc303", code: "CSC 303", title: "Computer Architecture", credits: 3, lecturer: "Dr. Funmilayo Eze", color: "173 75% 38%" },
  { id: "mth201", code: "MTH 201", title: "Mathematical Methods I", credits: 3, lecturer: "Prof. Chinedu Obi", color: "198 88% 42%" },
  { id: "gst111", code: "GST 111", title: "Communication in English", credits: 2, lecturer: "Mr. Tunde Bakare", color: "46 70% 50%" },
  { id: "csc305", code: "CSC 305", title: "Operating Systems", credits: 3, lecturer: "Dr. Ngozi Adichie", color: "280 60% 55%" },
  { id: "csc307", code: "CSC 307", title: "Database Systems", credits: 3, lecturer: "Dr. Ibrahim Sani", color: "0 70% 55%" },
];

// Weekly timetable keyed by weekday index (0=Sun … 6=Sat).
export const ACADEMIC_TIMETABLE_MOCK = {
  1: [
    { courseId: "csc301", start: "08:00", end: "10:00", room: "Hall A" },
    { courseId: "mth201", start: "10:00", end: "12:00", room: "Math Theatre" },
    { courseId: "csc305", start: "14:00", end: "16:00", room: "Lab 2" },
  ],
  2: [
    { courseId: "csc303", start: "08:00", end: "10:00", room: "Hall B" },
    { courseId: "gst111", start: "12:00", end: "14:00", room: "Auditorium" },
  ],
  3: [
    { courseId: "csc301", start: "08:00", end: "10:00", room: "Hall A" },
    { courseId: "csc307", start: "10:00", end: "12:00", room: "Lab 1" },
    { courseId: "mth201", start: "14:00", end: "16:00", room: "Math Theatre" },
  ],
  4: [
    { courseId: "csc305", start: "08:00", end: "10:00", room: "Lab 2" },
    { courseId: "csc307", start: "10:00", end: "12:00", room: "Lab 1" },
  ],
  5: [
    { courseId: "csc303", start: "10:00", end: "12:00", room: "Hall B" },
    { courseId: "gst111", start: "14:00", end: "16:00", room: "Auditorium" },
  ],
};

// Assignments — dueInDays is relative to "now"; negative = overdue.
export const ACADEMIC_ASSIGNMENTS_MOCK = [
  { id: "a1", courseId: "csc301", title: "Implement a Red-Black Tree", dueInDays: 3, status: "pending", weight: 10 },
  { id: "a2", courseId: "csc305", title: "Process Scheduling Simulation (Lab 3)", dueInDays: 1, status: "in_progress", weight: 15 },
  { id: "a3", courseId: "csc307", title: "ER Diagram for Student Records DB", dueInDays: 5, status: "pending", weight: 10 },
  { id: "a4", courseId: "mth201", title: "Problem Set 4 — Linear Algebra", dueInDays: 6, status: "pending", weight: 5 },
  { id: "a5", courseId: "csc303", title: "MIPS Assembly Exercise", dueInDays: -1, status: "overdue", weight: 10 },
  { id: "a6", courseId: "gst111", title: "Argumentative Essay Draft", dueInDays: 2, status: "pending", weight: 10 },
];

// Exams — inDays is relative to "now".
export const ACADEMIC_EXAMS_MOCK = [
  { id: "e1", courseId: "mth201", title: "MTH 201 CA Test", inDays: 7, time: "08:00", venue: "Math Theatre", topics: ["Matrices", "Vector Spaces"] },
  { id: "e2", courseId: "csc301", title: "CSC 301 Mid-Semester Test", inDays: 9, time: "10:00", venue: "Hall A", topics: ["Trees", "Graphs", "Sorting"] },
  { id: "e3", courseId: "csc305", title: "CSC 305 Mid-Semester Test", inDays: 12, time: "14:00", venue: "Lab 2", topics: ["Process Management", "Scheduling", "Deadlocks"] },
  { id: "e4", courseId: "csc307", title: "CSC 307 Mid-Semester Test", inDays: 14, time: "10:00", venue: "Lab 1", topics: ["ER Modeling", "Normalization", "SQL"] },
];

// GPA on the Nigerian 5.0 scale.
export const ACADEMIC_GPA_MOCK = {
  scale: 5.0,
  current: 4.42,
  projected: 4.55,
  previous: 4.38,
  lastSemesterGrades: [
    { courseId: "csc201", code: "CSC 201", title: "Discrete Mathematics", grade: "A", point: 5.0 },
    { courseId: "csc203", code: "CSC 203", title: "Object-Oriented Programming", grade: "A", point: 5.0 },
    { courseId: "mth102", code: "MTH 102", title: "Calculus II", grade: "B", point: 4.0 },
    { courseId: "gst102", code: "GST 102", title: "Nigerian Peoples & Culture", grade: "B", point: 4.0 },
    { courseId: "phy103", code: "PHY 103", title: "General Physics III", grade: "C", point: 3.0 },
  ],
};

export const ACADEMIC_ATTENDANCE_MOCK = {
  overall: 87,
  perCourse: [
    { courseId: "csc301", pct: 92 },
    { courseId: "csc303", pct: 85 },
    { courseId: "mth201", pct: 78 },
    { courseId: "gst111", pct: 95 },
    { courseId: "csc305", pct: 88 },
    { courseId: "csc307", pct: 82 },
  ],
};

export const ACADEMIC_STATS_MOCK = {
  streakDays: 12,
  weekStudyHours: 18.5,
  focusSessions: 23,
  avgSessionMin: 48,
};

export const ACADEMIC_CALENDAR_MOCK = [
  { label: "Lectures Begin", date: "2026-01-06", type: "milestone" },
  { label: "Course Registration Deadline", date: "2026-01-17", type: "deadline" },
  { label: "Mid-Semester Tests", date: "2026-03-10", type: "exam" },
  { label: "Last Day of Lectures", date: "2026-04-24", type: "milestone" },
  { label: "Final Examinations Begin", date: "2026-05-04", type: "exam" },
  { label: "Convocation", date: "2026-06-14", type: "milestone" },
];