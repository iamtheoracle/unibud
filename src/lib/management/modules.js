import {
  LayoutDashboard, GraduationCap, Briefcase, BookOpen, UserPlus, FileCheck,
  Wallet, Megaphone, FileBarChart, TrendingUp, CheckSquare,
} from "lucide-react";

export const MANAGEMENT_MODULES = [
  { id: "dashboard", label: "Dashboard", group: "Overview", icon: LayoutDashboard, kind: "section", desc: "Institution overview, academic statistics, population, finance, attendance, examinations, admissions, library, hostel, health, notifications, announcements and calendar." },
  { id: "students", label: "Student Management", group: "Operations", icon: GraduationCap, kind: "entity", entity: "StudentRecord", desc: "Student records, registration, academic progress, attendance, disciplinary records, graduation and alumni." },
  { id: "staff", label: "Staff Management", group: "Operations", icon: Briefcase, kind: "entity", entity: "Staff", desc: "Lecturers, non-academic staff, employment, departments, workload, leave and performance." },
  { id: "academic", label: "Academic Management", group: "Operations", icon: BookOpen, kind: "entity", entity: "Course", desc: "Faculties, schools, colleges, departments, programmes, courses, semesters, sessions, timetables and examination periods." },
  { id: "admissions", label: "Admission Management", group: "Operations", icon: UserPlus, kind: "entity", entity: "Admission", desc: "Applications, screening, offers, acceptance, enrollment and waiting lists." },
  { id: "examination", label: "Examination Management", group: "Operations", icon: FileCheck, kind: "entity", entity: "ExamPaper", desc: "Examination timetables, centres, invigilators, results, grade approval, senate approval and transcript requests." },
  { id: "finance", label: "Finance Management", group: "Business", icon: Wallet, kind: "entity", entity: "Fee", desc: "Tuition, fees, scholarships, discounts, refund requests, financial reports and revenue analytics. Service abstractions only." },
  { id: "communication", label: "Communication", group: "Business", icon: Megaphone, kind: "section", desc: "Announcements, circulars, broadcast messages, internal messaging and emergency alerts." },
  { id: "reporting", label: "Reporting", group: "Business", icon: FileBarChart, kind: "section", desc: "Academic, student, finance, attendance, HR, admission and custom reports — PDF, Excel, CSV." },
  { id: "analytics", label: "Analytics", group: "Business", icon: TrendingUp, kind: "section", desc: "Student success, enrollment, revenue, attendance and performance trends." },
  { id: "tasks", label: "Task Management", group: "Productivity", icon: CheckSquare, kind: "entity", entity: "ManagementTask", desc: "Approvals, reviews, assignments, follow-ups and deadlines." },
];

export const moduleById = (id) => MANAGEMENT_MODULES.find((m) => m.id === id);