/**
 * UNIBUD Multi-Tenancy — Institution roles & permissions manifest.
 * Granular, per-institution access. Platform "role" (on the User entity)
 * carries the institution role; RLS + UI gating enforce it per tenant.
 */

export const INSTITUTION_TYPES = [
  "University", "Private University", "Polytechnic", "College of Education",
  "Monotechnic", "Nursing School", "Health Technology School", "Medical College",
  "Law School", "Technical College", "Vocational School", "Professional Training Institute",
  "Research Institute", "Examination Body", "Examination Center",
  "Independent Learning Center", "Online Academy", "Corporate Training Organization",
];

export const INSTITUTION_ROLES = [
  { key: "institution_owner", label: "Institution Owner", manages: ["*"] },
  { key: "university_admin", label: "Institution Administrator", manages: ["users", "branding", "academic", "analytics", "billing", "moderation", "integrations", "api_keys", "audit"] },
  { key: "registrar", label: "Registrar", manages: ["academic", "students", "records", "calendar"] },
  { key: "dean", label: "Dean", manages: ["faculty", "departments", "courses", "staff"] },
  { key: "head_of_department", label: "Head of Department", manages: ["department", "courses", "lecturers", "students"] },
  { key: "lecturer", label: "Lecturer", manages: ["courses", "materials", "grades", "classes"] },
  { key: "teaching_assistant", label: "Teaching Assistant", manages: ["classes", "materials"] },
  { key: "staff", label: "Staff", manages: ["announcements", "support"] },
  { key: "student", label: "Student", manages: [] },
  { key: "alumni", label: "Alumni", manages: [] },
  { key: "guest", label: "Guest", manages: [] },
];

export const ADMIN_ROLES = ["institution_owner", "university_admin", "registrar", "dean", "head_of_department"];
export const isAdminRole = (role) => ADMIN_ROLES.includes(role);

/** Modular integrations an institution may connect (optional). */
export const INTEGRATION_CATEGORIES = [
  "Student Information System (SIS)", "Learning Management System (LMS)",
  "Library System", "Email Provider", "Identity Provider", "Payment Provider",
  "Calendar Service", "Cloud Storage",
];