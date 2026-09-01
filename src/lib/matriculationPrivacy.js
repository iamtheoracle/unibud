/**
 * Matriculation Number privacy and permissions utility.
 *
 * Controls who can view full matriculation numbers based on:
 * - Viewer's platform role
 * - Student's privacy setting
 * - Whether viewer and student share the same university
 * - Whether the viewer IS the student
 */

export const STAFF_ROLES = [
  "lecturer",
  "department_admin",
  "faculty_admin",
  "university_admin",
  "operator",
  "senior_operator",
  "moderator",
  "compliance_officer",
  "platform_admin",
  "super_admin",
  "operations_staff",
  "executive",
  "oracle",
];

export const AUTHORIZED_MATRIC_ROLES = [
  "department_admin",
  "faculty_admin",
  "university_admin",
  "operator",
  "senior_operator",
  "moderator",
  "compliance_officer",
  "platform_admin",
  "super_admin",
  "operations_staff",
  "executive",
  "oracle",
];

export const MATRIC_PRIVACY_LEVELS = [
  {
    value: "public",
    label: "University Peers",
    description: "Students in your university can see your matric number",
  },
  {
    value: "university_only",
    label: "Staff & Connections",
    description: "Only authorized staff and your connections can see it",
  },
  {
    value: "connections_only",
    label: "Connections Only",
    description: "Only people you've connected with can see it",
  },
  {
    value: "private",
    label: "Private",
    description: "Only you and authorized staff can see it",
  },
];

/**
 * Determines whether a viewer can see a student's full matriculation number.
 *
 * @param {object} params
 * @param {string} params.viewerId - The viewer's user ID
 * @param {string} params.viewerRole - The viewer's platform role
 * @param {string} params.viewerUniversity - The viewer's university
 * @param {string} params.studentId - The student's user ID
 * @param {string} params.studentUniversity - The student's university
 * @param {string} params.studentPrivacy - The student's matric_privacy setting
 * @param {boolean} params.isConnected - Whether viewer and student are connected
 * @returns {boolean}
 */
export function canViewMatricNumber({
  viewerId,
  viewerRole,
  viewerUniversity,
  studentId,
  studentUniversity,
  studentPrivacy = "university_only",
  isConnected = false,
}) {
  // Student can always see their own matric number
  if (viewerId && studentId && viewerId === studentId) return true;

  // Authorized staff can always see matric numbers
  if (AUTHORIZED_MATRIC_ROLES.includes(viewerRole)) return true;

  // Lecturers can see matric numbers within their university
  if (viewerRole === "lecturer" && viewerUniversity && viewerUniversity === studentUniversity) {
    return true;
  }

  // Apply student's privacy settings
  switch (studentPrivacy) {
    case "public":
      // Visible to anyone in the same university
      return viewerUniversity && viewerUniversity === studentUniversity;

    case "university_only":
      // Visible to staff (handled above) and connections in same university
      return isConnected && viewerUniversity && viewerUniversity === studentUniversity;

    case "connections_only":
      // Visible only to connections
      return isConnected;

    case "private":
      // Visible only to self and authorized staff (handled above)
      return false;

    default:
      return false;
  }
}

/**
 * Masks a matriculation number for display when the viewer doesn't have permission.
 * Shows the first 3 characters and last 2 characters, masking the middle.
 *
 * @param {string} matric - The full matriculation number
 * @returns {string} The masked matriculation number
 */
export function maskMatricNumber(matric) {
  if (!matric) return "";
  if (matric.length <= 6) return "••••";
  const start = matric.substring(0, 3);
  const end = matric.substring(matric.length - 2);
  return start + "••••" + end;
}

/**
 * Detects whether a text string contains a matriculation number pattern.
 * Matric numbers typically contain forward slashes and digits, e.g. CSC/2026/01452
 *
 * @param {string} text - The text to analyze
 * @returns {{ isMatric: boolean, extracted: string|null }}
 */
export function detectMatricNumber(text) {
  if (!text) return { isMatric: false, extracted: null };

  // Look for patterns like: CSC/2026/01452, ENG/2025/001, MED/2024/00001
  const matricRegex = /([A-Za-z]{2,}[\/\-]\d{2,4}[\/\-]\d{2,})/g;
  const match = matricRegex.exec(text);

  if (match) {
    return { isMatric: true, extracted: match[1] };
  }

  // Also detect patterns like "matric number XXX" or "matriculation XXX"
  const keywordRegex = /(?:matric(?:ulation)?\s*(?:number|no\.?)?\s*)([A-Za-z0-9\/\-]{5,})/i;
  const kwMatch = keywordRegex.exec(text);
  if (kwMatch) {
    return { isMatric: true, extracted: kwMatch[1] };
  }

  return { isMatric: false, extracted: null };
}