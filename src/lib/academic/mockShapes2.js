/**
 * UNIBUD Academic — second batch of entity-shaped mock entries.
 *
 * Mirrors Project / Note / StudySession / OfficeHoursSlot /
 * OfficeHoursBooking / CalendarEvent / CampusEvent schemas so the
 * auto-replace fallback pattern works with zero rendering changes.
 * Tagged `__mock: true` so read-only display avoids mutating the DB.
 */
import { UNIBUD_STUDENTS } from "@/lib/mock/contentRegistry";

const dateFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
};
const isoDaysAgo = (n, hour = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};
const portrait = (id) => `https://images.unsplash.com/photo-${id}?w=200&q=80`;

const LECTURERS = [
  { id: "lec-sani", name: "Dr. Ibrahim Sani", avatar: portrait("1560250097-0b93528c311a") },
  { id: "lec-adebayo", name: "Dr. Adebayo Ogundimu", avatar: portrait("1506794778202-cad84cf45f1d") },
  { id: "lec-nkechi", name: "Dr. Nkechi Eze", avatar: portrait("1544005313-94ddf0286df2") },
];
const student = (i) => UNIBUD_STUDENTS[i % UNIBUD_STUDENTS.length];

// ─── Project-shaped mock ────────────────────────────────────────────────────
export const PROJECT_MOCK_ENTRIES = [
  {
    id: "mock-pr-1", __mock: true,
    title: "Smart Campus Navigation App",
    supervisor: "Dr. Adebayo Ogundimu",
    deadline: dateFromNow(21),
    status: "in_progress",
    team_members: ["Adaeze Okafor", "Chidi Eze"],
    notes: "A mobile app that helps freshers find lecture halls, libraries and offices using indoor mapping and QR landmarks.",
    references: ["IndoorNav: A Survey (IEEE 2024)", "Google Indoor Maps API v3"],
    files: [],
    milestones: [
      { title: "Requirements & user research", done: true },
      { title: "Wireframes & prototype", done: true },
      { title: "Indoor mapping MVP", done: false },
      { title: "QR landmark integration", done: false },
    ],
  },
  {
    id: "mock-pr-2", __mock: true,
    title: "Malaria Drug-Discovery ML Model",
    supervisor: "Dr. Ibrahim Sani",
    deadline: dateFromNow(35),
    status: "planning",
    team_members: ["Fatima Yusuf"],
    notes: "Train a classifier on the compound library to predict anti-malarial activity and shortlist candidates for lab testing.",
    references: ["ChEMBL bioactivity dataset", "DeepChem molecular fingerprints"],
    files: [],
    milestones: [
      { title: "Dataset curation", done: false },
      { title: "Feature engineering", done: false },
      { title: "Model training & validation", done: false },
    ],
  },
  {
    id: "mock-pr-3", __mock: true,
    title: "Campus Ride-Sharing Platform",
    supervisor: "Dr. Adebayo Ogundimu",
    deadline: dateFromNow(14),
    status: "review",
    team_members: ["Samuel Adesanya", "Grace Effiong"],
    notes: "A peer-to-peer ride-matching service for students commuting between campus gates and hostels.",
    references: ["Ride-matching algorithms (Transportation Research 2023)"],
    files: [],
    milestones: [
      { title: "Market survey", done: true },
      { title: "Matching algorithm", done: true },
      { title: "Backend API", done: true },
      { title: "Mobile client", done: true },
      { title: "Pilot launch", done: false },
    ],
  },
];

// ─── Note-shaped mock ────────────────────────────────────────────────────────
export const NOTE_MOCK_ENTRIES = [
  { id: "mock-nt-1", __mock: true, title: "Binary Search Trees — rotations", note_type: "text", course_code: "CSC301", content: "Left rotation rebalances when the right subtree is heavier. Zig-zig: single rotation. Zig-zag: double rotation. Always re-check invariants after rebalancing.", tags: ["trees", "rotations"], created_date: isoDaysAgo(1, 10) },
  { id: "mock-nt-2", __mock: true, title: "CPU Scheduling comparison", note_type: "text", course_code: "CSC305", content: "FCFS is simple but suffers convoy effect. SJF minimises average wait time but needs prediction. Round-Robin is fair; quantum too small = overhead, too large = FCFS.", tags: ["scheduling"], created_date: isoDaysAgo(2, 14) },
  { id: "mock-nt-3", __mock: true, title: "ER Modelling lecture — whiteboard scan", note_type: "scanned", course_code: "CSC307", content: "", file_url: "", tags: ["erd", "dbms"], created_date: isoDaysAgo(3, 9) },
  { id: "mock-nt-4", __mock: true, title: "Eigenvalues intuition", note_type: "voice", course_code: "MTH201", content: "Eigenvalues scale eigenvectors without changing direction. Useful for PCA and stability analysis of systems.", tags: ["linear-algebra"], created_date: isoDaysAgo(4, 8) },
  { id: "mock-nt-5", __mock: true, title: "Dynamic Programming patterns", note_type: "text", course_code: "CSC303", content: "Top-down = memoisation, bottom-up = tabulation. Identify overlapping subproblems + optimal substructure first.", tags: ["dp", "algorithms"], created_date: isoDaysAgo(5, 16) },
  { id: "mock-nt-6", __mock: true, title: "Argumentative essay structure", note_type: "text", course_code: "GST111", content: "Hook → claim → evidence → counter-argument → rebuttal → conclusion. Always cite with MLA in-text format.", tags: ["writing"], created_date: isoDaysAgo(6, 11) },
];

// ─── StudySession-shaped mock ────────────────────────────────────────────────
export const STUDY_SESSION_MOCK_ENTRIES = [
  { id: "mock-ss-1", __mock: true, subject: "Data Structures", goal: "Master AVL rotations", session_date: dateFromNow(-1), started_at: isoDaysAgo(1, 9), ended_at: isoDaysAgo(1, 9.5), duration_minutes: 30, planned_duration_minutes: 25, productivity_score: 4, status: "completed", bud_feedback: "Great focus — your morning sessions are your strongest." },
  { id: "mock-ss-2", __mock: true, subject: "Operating Systems", goal: "Deadlock avoidance", session_date: dateFromNow(-2), started_at: isoDaysAgo(2, 20), ended_at: isoDaysAgo(2, 20.75), duration_minutes: 45, planned_duration_minutes: 45, productivity_score: 3, status: "completed" },
  { id: "mock-ss-3", __mock: true, subject: "Linear Algebra", goal: "Eigenvalue problems", session_date: dateFromNow(-3), started_at: isoDaysAgo(3, 8), ended_at: isoDaysAgo(3, 8.5), duration_minutes: 30, planned_duration_minutes: 25, productivity_score: 5, status: "completed", bud_feedback: "You're sharpest at 8 AM — keep protecting this slot." },
  { id: "mock-ss-4", __mock: true, subject: "DBMS", goal: "Normalise to 3NF", session_date: dateFromNow(-4), started_at: isoDaysAgo(4, 15), ended_at: isoDaysAgo(4, 16), duration_minutes: 60, planned_duration_minutes: 60, productivity_score: 4, status: "completed" },
  { id: "mock-ss-5", __mock: true, subject: "Algorithms", goal: "DP problem set", session_date: dateFromNow(-6), started_at: isoDaysAgo(6, 21), ended_at: isoDaysAgo(6, 21.5), duration_minutes: 30, planned_duration_minutes: 25, productivity_score: 2, status: "completed", bud_feedback: "Late nights drain your retention — try an earlier slot tomorrow." },
  { id: "mock-ss-6", __mock: true, subject: "Data Structures", goal: "Graph traversal", session_date: dateFromNow(-8), started_at: isoDaysAgo(8, 9), ended_at: isoDaysAgo(8, 9.5), duration_minutes: 30, planned_duration_minutes: 25, productivity_score: 4, status: "completed" },
  { id: "mock-ss-7", __mock: true, subject: "Operating Systems", goal: "Memory management", session_date: dateFromNow(-10), started_at: isoDaysAgo(10, 14), ended_at: isoDaysAgo(10, 14.75), duration_minutes: 45, planned_duration_minutes: 45, productivity_score: 3, status: "completed" },
];

// ─── OfficeHoursSlot-shaped mock ────────────────────────────────────────────
export const OFFICE_HOURS_SLOT_MOCK = [
  { id: "mock-oh-1", __mock: true, lecturer_id: LECTURERS[0].id, lecturer_name: LECTURERS[0].name, lecturer_image: LECTURERS[0].avatar, course_code: "PHY201", title: "Quantum Mechanics — problem clinic", date: dateFromNow(2), start_time: "10:00", end_time: "11:30", location: "Physics Lab 3", is_virtual: false, capacity: 0, notes: "Bring your assignment 2 attempts.", status: "open" },
  { id: "mock-oh-2", __mock: true, lecturer_id: LECTURERS[1].id, lecturer_name: LECTURERS[1].name, lecturer_image: LECTURERS[1].avatar, course_code: "CSC301", title: "Data Structures — one-on-one", date: dateFromNow(3), start_time: "14:00", end_time: "15:00", location: "Google Meet", is_virtual: true, capacity: 1, notes: "Video link sent on booking.", status: "open" },
  { id: "mock-oh-3", __mock: true, lecturer_id: LECTURERS[2].id, lecturer_name: LECTURERS[2].name, lecturer_image: LECTURERS[2].avatar, course_code: "MTH201", title: "Linear Algebra revision", date: dateFromNow(5), start_time: "09:00", end_time: "10:00", location: "Maths Seminar Room", is_virtual: false, capacity: 5, notes: "Group session — matrices & eigenvalues.", status: "open" },
  { id: "mock-oh-4", __mock: true, lecturer_id: LECTURERS[1].id, lecturer_name: LECTURERS[1].name, lecturer_image: LECTURERS[1].avatar, course_code: "CSC307", title: "DBMS project consultation", date: dateFromNow(7), start_time: "16:00", end_time: "17:00", location: "CS Building Rm 204", is_virtual: false, capacity: 1, notes: "", status: "open" },
  { id: "mock-oh-5", __mock: true, lecturer_id: LECTURERS[0].id, lecturer_name: LECTURERS[0].name, lecturer_image: LECTURERS[0].avatar, course_code: "PHY201", title: "Lab report feedback", date: dateFromNow(9), start_time: "12:00", end_time: "13:00", location: "Zoom", is_virtual: true, capacity: 0, notes: "Open group feedback session.", status: "open" },
];

// ─── OfficeHoursBooking-shaped mock (drives capacity counts) ─────────────────
export const OFFICE_HOURS_BOOKING_MOCK = [
  { id: "mock-ohb-1", __mock: true, slot_id: "mock-oh-2", lecturer_id: LECTURERS[1].id, student_id: student(1).id, student_name: student(1).full_name, student_image: student(1).avatar_url, course_code: "CSC301", topic: "Stuck on AVL rotations", notes: "", status: "confirmed" },
  { id: "mock-ohb-2", __mock: true, slot_id: "mock-oh-3", lecturer_id: LECTURERS[2].id, student_id: student(3).id, student_name: student(3).full_name, student_image: student(3).avatar_url, course_code: "MTH201", topic: "Eigenvalue intuition", notes: "", status: "confirmed" },
  { id: "mock-ohb-3", __mock: true, slot_id: "mock-oh-3", lecturer_id: LECTURERS[2].id, student_id: student(5).id, student_name: student(5).full_name, student_image: student(5).avatar_url, course_code: "MTH201", topic: "Matrix inverse methods", notes: "", status: "confirmed" },
];

// ─── CalendarEvent-shaped mock ──────────────────────────────────────────────
export const CALENDAR_EVENT_MOCK_ENTRIES = [
  { id: "mock-ce-1", __mock: true, date: dateFromNow(1), title: "Library study group — DSA", type: "Study", start_time: "16:00" },
  { id: "mock-ce-2", __mock: true, date: dateFromNow(4), title: "CSC305 midterm revision", type: "Reminder", start_time: "09:00" },
  { id: "mock-ce-3", __mock: true, date: dateFromNow(6), title: "Faculty of Science town hall", type: "Event", start_time: "13:00" },
  { id: "mock-ce-4", __mock: true, date: dateFromNow(10), title: "Scholarship application deadline", type: "Deadline", start_time: "23:59" },
];

// ─── CampusEvent-shaped mock ─────────────────────────────────────────────────
export const CAMPUS_EVENT_MOCK_ENTRIES = [
  { id: "mock-cpe-1", __mock: true, date: dateFromNow(3), title: "Inter-Faculty Football Finals", type: "Sports" },
  { id: "mock-cpe-2", __mock: true, date: dateFromNow(7), title: "Career Fair — Tech & Finance", type: "Career" },
  { id: "mock-cpe-3", __mock: true, date: dateFromNow(12), title: "Drama Society: Half of a Yellow Sun", type: "Arts" },
];