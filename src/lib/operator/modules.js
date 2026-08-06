import {
  LayoutDashboard, CheckSquare, GraduationCap, UserPlus, FileCheck, Wallet,
  LifeBuoy, FolderOpen, Bell, TrendingUp, Search,
} from "lucide-react";

export const OPERATOR_MODULES = [
  { id: "dashboard", label: "Dashboard", group: "Overview", icon: LayoutDashboard, desc: "Assigned tasks, today's work, pending approvals, priority items, notifications, calendar, performance summary and recently completed tasks." },
  { id: "search", label: "Global Search", group: "Overview", icon: Search, desc: "Search across students, staff, applications, tasks, documents and tickets." },
  { id: "tasks", label: "Task Center", group: "Work", icon: CheckSquare, desc: "My tasks, assigned tasks, due today, overdue, completed and archived — with status, priority, assignee, due date, attachments and activity timeline." },
  { id: "performance", label: "Performance", group: "Work", icon: TrendingUp, desc: "Tasks completed, average completion time, accuracy, pending tasks and daily productivity." },
  { id: "notifications", label: "Notifications", group: "Work", icon: Bell, desc: "Task assignments, deadline alerts, escalations, approval requests and system messages." },
  { id: "students", label: "Student Operations", group: "Operations", icon: GraduationCap, desc: "Verify applications, approve registrations, update records, upload documents, student notes and status changes." },
  { id: "admissions", label: "Admission Operations", group: "Operations", icon: UserPlus, desc: "Review applications, verify documents, screening results, admission decisions and enrollment processing." },
  { id: "examination", label: "Examination Operations", group: "Operations", icon: FileCheck, desc: "Examination papers, candidate verification, attendance capture, result upload, script tracking and grade processing." },
  { id: "finance", label: "Finance Operations", group: "Operations", icon: Wallet, desc: "Verify payments, fee adjustments, scholarship processing and refund requests. Uses existing payment services only." },
  { id: "support", label: "Support Desk", group: "Operations", icon: LifeBuoy, desc: "Student and staff tickets, issue assignment, escalation, resolution tracking and satisfaction rating." },
  { id: "documents", label: "Document Center", group: "Operations", icon: FolderOpen, desc: "Upload, review, approval, archive and search institution documents." },
];

export const moduleById = (id) => OPERATOR_MODULES.find((m) => m.id === id);