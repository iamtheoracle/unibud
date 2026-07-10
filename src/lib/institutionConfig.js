/**
 * UNIBUD Institution Configuration System
 *
 * Supports universities, polytechnics, colleges of education, technical institutes,
 * higher colleges, community colleges, and other accredited higher education institutions worldwide.
 *
 * Each institution can configure its own academic structure, terminology, traditions,
 * student identifier types, and academic processes.
 */

// ─── Institution Types ──────────────────────────────────────────────────────
export const INSTITUTION_TYPES = [
  { value: "university", label: "University", short: "Univ", description: "Degree-granting research and teaching university" },
  { value: "polytechnic", label: "Polytechnic", short: "Poly", description: "Technical and vocational-focused higher education" },
  { value: "college_of_education", label: "College of Education", short: "CoE", description: "Teacher training and education-focused institution" },
  { value: "technical_institute", label: "Technical Institute", short: "Tech Inst", description: "Specialized technical and engineering institute" },
  { value: "higher_college", label: "Higher College", short: "College", description: "Degree-granting college offering diplomas and degrees" },
  { value: "community_college", label: "Community College", short: "CC", description: "Two-year college offering associate degrees and certificates" },
  { value: "other", label: "Other Accredited Institution", short: "Inst", description: "Any other accredited higher education institution" },
];

export function getInstitutionType(value) {
  return INSTITUTION_TYPES.find((t) => t.value === value) || INSTITUTION_TYPES[0];
}

// ─── Student Identifier Types ─────────────────────────────────────────────────
export const IDENTIFIER_TYPES = [
  { value: "admission_number", label: "Admission Number", short: "Admission No.", permanent: false, description: "Issued at admission, may be temporary" },
  { value: "application_number", label: "Application Number", short: "App No.", permanent: false, description: "Issued during the application process" },
  { value: "registration_number", label: "Registration Number", short: "Reg No.", permanent: false, description: "Issued at course registration" },
  { value: "student_number", label: "Student Number", short: "Student No.", permanent: true, description: "Permanent student number issued immediately" },
  { value: "matriculation_number", label: "Matriculation Number", short: "Matric No.", permanent: true, description: "Issued at matriculation ceremony (may be weeks after lectures start)" },
  { value: "student_id", label: "Student ID", short: "Student ID", permanent: true, description: "Official student identification number" },
  { value: "temporary_student_id", label: "Temporary Student ID", short: "Temp ID", permanent: false, description: "Temporary identifier before permanent one is issued" },
  { value: "email", label: "Email Verification", short: "Email", permanent: false, description: "Verified via institutional email address" },
  { value: "institution_specific", label: "Institution-Specific Identifier", short: "Custom", permanent: false, description: "Custom identifier type defined by the institution" },
];

export function getIdentifierType(value) {
  return IDENTIFIER_TYPES.find((t) => t.value === value) || IDENTIFIER_TYPES[5];
}

// ─── Verification Statuses ──────────────────────────────────────────────────
export const VERIFICATION_STATUSES = [
  {
    value: "verified",
    label: "Verified Institution",
    color: "success",
    bg: "bg-success/10",
    text: "text-success",
    description: "This institution has officially joined UNIBUD and manages its own data. All institution information is verified and authoritative.",
  },
  {
    value: "community_supported",
    label: "Community Supported",
    color: "info",
    bg: "bg-info/10",
    text: "text-info",
    description: "Students from this institution are active on UNIBUD. The institution has not yet officially joined, so information is community-sourced.",
  },
  {
    value: "awaiting_verification",
    label: "Awaiting Verification",
    color: "warning",
    bg: "bg-warning/10",
    text: "text-warning",
    description: "This institution has been invited to join UNIBUD and is in the onboarding process.",
  },
  {
    value: "not_onboarded",
    label: "Not Yet Onboarded",
    color: "muted",
    bg: "bg-muted",
    text: "text-muted-foreground",
    description: "This institution has not yet joined UNIBUD. Student experience is fully available — institution data is community-sourced.",
  },
];

export function getVerificationStatus(value) {
  return VERIFICATION_STATUSES.find((s) => s.value === value) || VERIFICATION_STATUSES[3];
}

// ─── Data Sources ────────────────────────────────────────────────────────────
export const DATA_SOURCES = [
  { value: "verified_institution", label: "Verified Institution", description: "Officially provided and approved by the institution" },
  { value: "official_sync", label: "Official Synchronization", description: "Synced from the institution's official systems" },
  { value: "public_info", label: "Public Information", description: "Sourced from publicly available information — not yet verified by the institution" },
  { value: "student_contributions", label: "Student Contributions", description: "Provided by students of the institution" },
  { value: "community_reports", label: "Community Reports", description: "Reported by the UNIBUD community" },
];

export function getDataSource(value) {
  return DATA_SOURCES.find((s) => s.value === value);
}

// ─── Matriculation Timing ────────────────────────────────────────────────────
export const MATRICULATION_TIMING = [
  { value: "before_lectures", label: "Before Lectures Begin", description: "Matriculation happens before the first lecture" },
  { value: "at_enrollment", label: "At Enrollment", description: "Matriculation happens during enrollment/registration" },
  { value: "first_semester", label: "First Semester", description: "Matriculation happens during the first semester" },
  { value: "weeks_after_start", label: "Weeks After Lectures Start", description: "Matriculation happens weeks or months after lectures have started" },
  { value: "second_semester", label: "Second Semester", description: "Matriculation happens in the second semester" },
  { value: "not_applicable", label: "Not Applicable", description: "This institution does not use matriculation numbers" },
];

// ─── Features ────────────────────────────────────────────────────────────────
// Features that REQUIRE institution verification — only unlock when institution officially joins
export const VERIFICATION_GATED_FEATURES = [
  "Official university announcements",
  "Official grades synchronization",
  "Official attendance tracking",
  "Official course registration",
  "Official transcript integration",
  "Official timetable synchronization",
  "Official student verification",
  "Official staff management",
  "Official administrative workflows",
];

// Features available to ALL students regardless of institution verification status
export const UNIVERSAL_FEATURES = [
  "Bud (Oracle+)",
  "Academics",
  "Study Groups",
  "Connect",
  "Quad",
  "Messaging",
  "Communities",
  "Live Classes",
  "Online Learning",
  "Recorded Lessons",
  "Library",
  "Research",
  "Career Centre",
  "Scholarships",
  "Marketplace",
  "Lost & Found",
  "Mentorship",
  "Events",
  "Calendar",
  "Study Planner",
  "Flashcards",
  "Exam Preparation",
  "Productivity Tools",
  "Student Portfolio",
  "Achievements",
  "Future Student Experience",
  "Professional Networking",
];

// ─── Academic Structure Units ────────────────────────────────────────────────
// Different institutions use different organizational unit names
export const ORG_UNIT_TYPES = [
  { value: "faculty", label: "Faculty", plural: "Faculties" },
  { value: "school", label: "School", plural: "Schools" },
  { value: "college", label: "College", plural: "Colleges" },
  { value: "institute", label: "Institute", plural: "Institutes" },
  { value: "division", label: "Division", plural: "Divisions" },
  { value: "department", label: "Department", plural: "Departments" },
  { value: "programme", label: "Programme", plural: "Programmes" },
  { value: "program", label: "Program", plural: "Programs" },
  { value: "course", label: "Course", plural: "Courses" },
  { value: "module", label: "Module", plural: "Modules" },
  { value: "level", label: "Level", plural: "Levels" },
  { value: "year", label: "Year", plural: "Years" },
];

// Term types — institutions use semesters, terms, trimesters, or quarters
export const TERM_TYPES = [
  { value: "semester", label: "Semester", plural: "Semesters" },
  { value: "term", label: "Term", plural: "Terms" },
  { value: "trimester", label: "Trimester", plural: "Trimesters" },
  { value: "quarter", label: "Quarter", plural: "Quarters" },
  { value: "session", label: "Session", plural: "Sessions" },
];

// Credit system types
export const CREDIT_SYSTEMS = [
  { value: "credit_units", label: "Credit Units (CU)", description: "Nigerian/west African credit unit system" },
  { value: "semester_hours", label: "Semester Hours (SH)", description: "Credit hours per semester (US system)" },
  { value: "ects", label: "ECTS Credits", description: "European Credit Transfer and Accumulation System" },
  { value: "module_credits", label: "Module Credits", description: "Modular credit system (UK/European)" },
  { value: "not_applicable", label: "Not Applicable", description: "No formal credit system" },
];

// ─── Outreach Status ─────────────────────────────────────────────────────────
export const OUTREACH_STATUSES = [
  { value: "pending", label: "Pending", color: "muted", description: "Invitation drafted but not yet sent" },
  { value: "sent", label: "Sent", color: "info", description: "Invitation email sent, awaiting response" },
  { value: "responded", label: "Responded", color: "warning", description: "Institution has responded, in discussion" },
  { value: "accepted", label: "Accepted", color: "success", description: "Institution has accepted and is onboarded" },
  { value: "declined", label: "Declined", color: "error", description: "Institution has declined the invitation" },
  { value: "expired", label: "Expired", color: "muted", description: "Invitation has expired without response" },
];

export function getOutreachStatus(value) {
  return OUTREACH_STATUSES.find((s) => s.value === value) || OUTREACH_STATUSES[0];
}