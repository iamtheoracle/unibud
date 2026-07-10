export const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Morocco",
  "United Kingdom", "United States", "Canada", "Australia",
  "Germany", "France", "Netherlands", "Sweden",
  "United Arab Emirates", "India", "China", "Japan",
  "Brazil", "Jamaica",
];

export const UNIVERSITIES = [
  { name: "University of Benin", short: "UNIBEN", country: "Nigeria", accent: "#0B6E4F", campuses: ["Main Campus", "UGES", "Ekehuan Campus"], matric_format: { pattern: "UNIBEN/{year}/{number}", example: "UNIBEN/2026/123456", description: "Prefix / Admission Year / 6-digit serial", segments: ["UNIBEN", "year", "serial_6"] } },
  { name: "University of Lagos", short: "UNILAG", country: "Nigeria", accent: "#003399", campuses: ["Akoka Campus", "Idi Araba Campus"], matric_format: { pattern: "UNILAG/{year}/{number}", example: "UNILAG/2026/008921", description: "Prefix / Admission Year / 6-digit serial", segments: ["UNILAG", "year", "serial_6"] } },
  { name: "University of Ibadan", short: "UI", country: "Nigeria", accent: "#002060", campuses: ["Main Campus"], matric_format: { pattern: "UI/{year}/{number}", example: "UI/2026/001234", description: "Prefix / Admission Year / 6-digit serial", segments: ["UI", "year", "serial_6"] } },
  { name: "Obafemi Awolowo University", short: "OAU", country: "Nigeria", accent: "#006633", campuses: ["Ile-Ife Campus"], matric_format: { pattern: "OAU/{year}/{number}", example: "OAU/2026/019874", description: "Prefix / Admission Year / 6-digit serial", segments: ["OAU", "year", "serial_6"] } },
  { name: "Covenant University", short: "CU", country: "Nigeria", accent: "#1B3A6B", campuses: ["Ota Campus"], matric_format: { pattern: "CU/{year}/{number}", example: "CU/2026/000123", description: "Prefix / Admission Year / 6-digit serial", segments: ["CU", "year", "serial_6"] } },
  { name: "Ahmadu Bello University", short: "ABU", country: "Nigeria", accent: "#006A4E", campuses: ["Zaria Campus"], matric_format: { pattern: "ABU/{year}/{number}", example: "ABU/2026/001234", description: "Prefix / Admission Year / 6-digit serial", segments: ["ABU", "year", "serial_6"] } },
  { name: "University of Nigeria, Nsukka", short: "UNN", country: "Nigeria", accent: "#009A44", campuses: ["Nsukka Campus", "Enugu Campus"], matric_format: { pattern: "UNN/{year}/{number}", example: "UNN/2026/001234", description: "Prefix / Admission Year / 6-digit serial", segments: ["UNN", "year", "serial_6"] } },
  { name: "Federal University of Technology, Akure", short: "FUTA", country: "Nigeria", accent: "#006400", campuses: ["Akure Campus"], matric_format: { pattern: "FUTA/{year}/{number}", example: "FUTA/2026/001234", description: "Prefix / Admission Year / 6-digit serial", segments: ["FUTA", "year", "serial_6"] } },
  { name: "Lagos State University", short: "LASU", country: "Nigeria", accent: "#0033A0", campuses: ["Ojo Campus", "Epe Campus"], matric_format: { pattern: "LASU/{year}/{number}", example: "LASU/2027/004512", description: "Prefix / Admission Year / 6-digit serial", segments: ["LASU", "year", "serial_6"] } },
  { name: "University of Port Harcourt", short: "UNIPORT", country: "Nigeria", accent: "#003D7A", campuses: ["Choba Campus"], matric_format: { pattern: "UNIPORT/{year}/{number}", example: "UNIPORT/2026/001234", description: "Prefix / Admission Year / 6-digit serial", segments: ["UNIPORT", "year", "serial_6"] } },
  { name: "University of Ghana", short: "UG", country: "Ghana", accent: "#003B5C", campuses: ["Legon Campus"], matric_format: { pattern: "UG/{year}/{number}", example: "UG/2026/10902345", description: "Prefix / Admission Year / 8-digit serial", segments: ["UG", "year", "serial_8"] } },
  { name: "Kwame Nkrumah University of Science and Technology", short: "KNUST", country: "Ghana", accent: "#0066B3", campuses: ["Kumasi Campus"], matric_format: { pattern: "KNUST/{year}/{number}", example: "KNUST/2026/012345", description: "Prefix / Admission Year / 6-digit serial", segments: ["KNUST", "year", "serial_6"] } },
  { name: "Ashesi University", short: "AU", country: "Ghana", accent: "#1A237E", campuses: ["Berekuso Campus"], matric_format: { pattern: "AU/{year}/{number}", example: "AU/2026/000123", description: "Prefix / Admission Year / 6-digit serial", segments: ["AU", "year", "serial_6"] } },
  { name: "University of Nairobi", short: "UoN", country: "Kenya", accent: "#5C2D91", campuses: ["Main Campus", "Chiromo Campus"], matric_format: { pattern: "UoN/{year}/{number}", example: "UoN/2026/01/123456", description: "Prefix / Year / Campus Code / 6-digit serial", segments: ["UoN", "year", "campus", "serial_6"] } },
  { name: "Strathmore University", short: "SU", country: "Kenya", accent: "#0066B3", campuses: ["Nairobi Campus"], matric_format: { pattern: "SU/{year}/{number}", example: "SU/2026/001234", description: "Prefix / Admission Year / 6-digit serial", segments: ["SU", "year", "serial_6"] } },
  { name: "University of Cape Town", short: "UCT", country: "South Africa", accent: "#003B5C", campuses: ["Rondebosch Campus"], matric_format: { pattern: "UCT/{year}/{number}", example: "UCT/2026/0123456", description: "Prefix / Admission Year / 7-digit serial", segments: ["UCT", "year", "serial_7"] } },
  { name: "University of the Witwatersrand", short: "Wits", country: "South Africa", accent: "#003B5C", campuses: ["Braamfontein Campus"], matric_format: { pattern: "Wits/{year}/{number}", example: "Wits/2026/0012345", description: "Prefix / Admission Year / 7-digit serial", segments: ["Wits", "year", "serial_7"] } },
  { name: "Stellenbosch University", short: "SU", country: "South Africa", accent: "#7A0010", campuses: ["Stellenbosch Campus"], matric_format: { pattern: "SU/{year}/{number}", example: "SU/2026/001234", description: "Prefix / Admission Year / 6-digit serial", segments: ["SU", "year", "serial_6"] } },
  { name: "University of Oxford", short: "Oxford", country: "United Kingdom", accent: "#002147", campuses: ["Oxford"], matric_format: { pattern: "{college}/{year}/{number}", example: "BRAS/2026/0123", description: "College Code / Year / 4-digit serial", segments: ["college", "year", "serial_4"] } },
  { name: "University of Cambridge", short: "Cambridge", country: "United Kingdom", accent: "#003B71", campuses: ["Cambridge"], matric_format: { pattern: "{college}/{year}/{number}", example: "TRN/2026/0123", description: "College Code / Year / 4-digit serial", segments: ["college", "year", "serial_4"] } },
  { name: "Imperial College London", short: "Imperial", country: "United Kingdom", accent: "#003E74", campuses: ["South Kensington"], matric_format: { pattern: "ICL/{year}/{number}", example: "ICL/2026/012345", description: "Prefix / Admission Year / 6-digit serial", segments: ["ICL", "year", "serial_6"] } },
  { name: "Harvard University", short: "Harvard", country: "United States", accent: "#A51C30", campuses: ["Cambridge"], matric_format: { pattern: "{number}", example: "81234567", description: "8-digit HUID", segments: ["serial_8"] } },
  { name: "Massachusetts Institute of Technology", short: "MIT", country: "United States", accent: "#8A1B1B", campuses: ["Cambridge"], matric_format: { pattern: "{number}", example: "912345678", description: "9-digit MIT ID", segments: ["serial_9"] } },
  { name: "Stanford University", short: "Stanford", country: "United States", accent: "#8C1515", campuses: ["Stanford"], matric_format: { pattern: "{number}", example: "06123456", description: "8-digit Stanford ID", segments: ["serial_8"] } },
  { name: "Yale University", short: "Yale", country: "United States", accent: "#0F4D92", campuses: ["New Haven"], matric_format: { pattern: "{number}", example: "B012345", description: "7-character Yale NetID", segments: ["serial_7"] } },
  { name: "University of Toronto", short: "UofT", country: "Canada", accent: "#002A5C", campuses: ["St. George", "Mississauga", "Scarborough"], matric_format: { pattern: "{number}", example: "1001234567", description: "10-digit student number", segments: ["serial_10"] } },
  { name: "University of British Columbia", short: "UBC", country: "Canada", accent: "#002145", campuses: ["Vancouver", "Okanagan"], matric_format: { pattern: "{number}", example: "01234567", description: "8-digit student number", segments: ["serial_8"] } },
  { name: "McGill University", short: "McGill", country: "Canada", accent: "#ED1B2D", campuses: ["Downtown", "Macdonald"], matric_format: { pattern: "{number}", example: "26123456", description: "9-digit McGill ID", segments: ["serial_9"] } },
  { name: "University of Melbourne", short: "UniMelb", country: "Australia", accent: "#003F7D", campuses: ["Parkville"], matric_format: { pattern: "{number}", example: "0123456", description: "7-digit student ID", segments: ["serial_7"] } },
  { name: "University of New South Wales", short: "UNSW", country: "Australia", accent: "#00549E", campuses: ["Kensington"], matric_format: { pattern: "z{number}", example: "z5234567", description: "Lowercase z + 7-digit number", segments: ["prefix_z", "serial_7"] } },
];

// Universities with official integration support
// Each entry lists the connection methods available for that university
export const INTEGRATION_SUPPORT = {
  "University of Benin": ["matriculation_number", "student_email"],
  "University of Lagos": ["matriculation_number", "student_email"],
  "University of Ibadan": ["matriculation_number", "student_email"],
  "Obafemi Awolowo University": ["matriculation_number", "student_email"],
  "Covenant University": ["matriculation_number", "student_email", "student_portal"],
  "Ahmadu Bello University": ["matriculation_number", "student_email"],
  "University of Nigeria, Nsukka": ["matriculation_number", "student_email"],
  "Federal University of Technology, Akure": ["matriculation_number", "student_email"],
  "Lagos State University": ["matriculation_number", "student_email"],
  "University of Port Harcourt": ["matriculation_number", "student_email"],
  "University of Ghana": ["student_email", "student_portal"],
  "Kwame Nkrumah University of Science and Technology": ["student_email"],
  "Ashesi University": ["student_email", "student_portal"],
  "University of Nairobi": ["student_email"],
  "University of Cape Town": ["student_email", "student_portal"],
  "University of the Witwatersrand": ["student_email", "student_portal"],
  "University of Oxford": ["student_email", "official_login"],
  "University of Cambridge": ["student_email", "official_login"],
  "Imperial College London": ["student_email", "official_login"],
  "Harvard University": ["student_email", "official_login"],
  "Massachusetts Institute of Technology": ["student_email", "official_login"],
  "Stanford University": ["student_email", "official_login"],
  "Yale University": ["student_email", "official_login"],
  "University of Toronto": ["student_email", "official_login"],
  "University of British Columbia": ["student_email", "official_login"],
  "McGill University": ["student_email", "official_login"],
  "University of Melbourne": ["student_email", "official_login"],
  "University of New South Wales": ["student_email", "official_login"],
};

export function getUniversityIntegrations(uniName) {
  return INTEGRATION_SUPPORT[uniName] || [];
}

export function hasIntegrationSupport(uniName) {
  const methods = INTEGRATION_SUPPORT[uniName] || [];
  return methods.length > 0 && !methods.every((m) => m === "manual");
}

export const LEVELS = [
  "100 Level", "200 Level", "300 Level", "400 Level", "500 Level", "600 Level",
  "Year 1", "Year 2", "Year 3", "Year 4", "Year 5",
  "Postgraduate",
];

// Get matriculation number format for a given university
export function getMatricFormat(uniName) {
  const uni = UNIVERSITIES.find((u) => u.name === uniName);
  return uni?.matric_format || null;
}

// Validate a matriculation number against a university's format
export function validateMatricNumber(matricNumber, uniName) {
  const format = getMatricFormat(uniName);
  if (!format) return { valid: true, message: "No format defined for this university" };

  const parts = matricNumber.split("/").filter(Boolean);
  const expectedSegments = format.segments || [];

  // Basic structural check: number of segments should match
  if (parts.length !== expectedSegments.length) {
    return {
      valid: false,
      message: `Expected ${expectedSegments.length} segment(s) separated by "/". Example: ${format.example}`,
    };
  }

  // Check each segment type
  for (let i = 0; i < expectedSegments.length; i++) {
    const seg = expectedSegments[i];
    const val = parts[i];

    if (seg === "year") {
      const year = parseInt(val, 10);
      if (isNaN(year) || year < 2000 || year > 2100) {
        return { valid: false, message: `Segment ${i + 1} should be a valid year (e.g., 2026)` };
      }
    } else if (seg.startsWith("serial_")) {
      const len = parseInt(seg.split("_")[1], 10);
      if (!/^\d+$/.test(val) || val.length !== len) {
        return { valid: false, message: `Segment ${i + 1} should be exactly ${len} digits` };
      }
    } else if (seg === "campus") {
      if (!val || val.length < 2) {
        return { valid: false, message: `Segment ${i + 1} should be a campus code` };
      }
    } else if (seg === "college") {
      if (!val || val.length < 3) {
        return { valid: false, message: `Segment ${i + 1} should be a college code (3+ letters)` };
      }
    } else if (seg === "prefix_z") {
      if (val !== "z") {
        return { valid: false, message: `Segment ${i + 1} should be lowercase 'z'` };
      }
    }
    // Fixed prefixes (like "UNIBEN") are checked case-insensitively
    else {
      if (val.toUpperCase() !== seg.toUpperCase()) {
        return { valid: false, message: `Segment ${i + 1} should be "${seg}"` };
      }
    }
  }

  return { valid: true, message: "Valid format" };
}

// Generate a matric number placeholder based on university format
export function getMatricPlaceholder(uniName) {
  const format = getMatricFormat(uniName);
  if (!format) return "e.g., CSC/2026/01452";
  return `e.g., ${format.example}`;
}