export const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Morocco",
  "United Kingdom", "United States", "Canada", "Australia",
  "Germany", "France", "Netherlands", "Sweden",
  "United Arab Emirates", "India", "China", "Japan",
  "Brazil", "Jamaica",
];

export const UNIVERSITIES = [
  { name: "University of Benin", short: "UNIBEN", country: "Nigeria", accent: "#0B6E4F", campuses: ["Main Campus", "UGES", "Ekehuan Campus"] },
  { name: "University of Lagos", short: "UNILAG", country: "Nigeria", accent: "#003399", campuses: ["Akoka Campus", "Idi Araba Campus"] },
  { name: "University of Ibadan", short: "UI", country: "Nigeria", accent: "#002060", campuses: ["Main Campus"] },
  { name: "Obafemi Awolowo University", short: "OAU", country: "Nigeria", accent: "#006633", campuses: ["Ile-Ife Campus"] },
  { name: "Covenant University", short: "CU", country: "Nigeria", accent: "#1B3A6B", campuses: ["Ota Campus"] },
  { name: "Ahmadu Bello University", short: "ABU", country: "Nigeria", accent: "#006A4E", campuses: ["Zaria Campus"] },
  { name: "University of Nigeria, Nsukka", short: "UNN", country: "Nigeria", accent: "#009A44", campuses: ["Nsukka Campus", "Enugu Campus"] },
  { name: "Federal University of Technology, Akure", short: "FUTA", country: "Nigeria", accent: "#006400", campuses: ["Akure Campus"] },
  { name: "Lagos State University", short: "LASU", country: "Nigeria", accent: "#0033A0", campuses: ["Ojo Campus", "Epe Campus"] },
  { name: "University of Port Harcourt", short: "UNIPORT", country: "Nigeria", accent: "#003D7A", campuses: ["Choba Campus"] },
  { name: "University of Ghana", short: "UG", country: "Ghana", accent: "#003B5C", campuses: ["Legon Campus"] },
  { name: "Kwame Nkrumah University of Science and Technology", short: "KNUST", country: "Ghana", accent: "#0066B3", campuses: ["Kumasi Campus"] },
  { name: "Ashesi University", short: "AU", country: "Ghana", accent: "#1A237E", campuses: ["Berekuso Campus"] },
  { name: "University of Nairobi", short: "UoN", country: "Kenya", accent: "#5C2D91", campuses: ["Main Campus", "Chiromo Campus"] },
  { name: "Strathmore University", short: "SU", country: "Kenya", accent: "#0066B3", campuses: ["Nairobi Campus"] },
  { name: "University of Cape Town", short: "UCT", country: "South Africa", accent: "#003B5C", campuses: ["Rondebosch Campus"] },
  { name: "University of the Witwatersrand", short: "Wits", country: "South Africa", accent: "#003B5C", campuses: ["Braamfontein Campus"] },
  { name: "Stellenbosch University", short: "SU", country: "South Africa", accent: "#7A0010", campuses: ["Stellenbosch Campus"] },
  { name: "University of Oxford", short: "Oxford", country: "United Kingdom", accent: "#002147", campuses: ["Oxford"] },
  { name: "University of Cambridge", short: "Cambridge", country: "United Kingdom", accent: "#003B71", campuses: ["Cambridge"] },
  { name: "Imperial College London", short: "Imperial", country: "United Kingdom", accent: "#003E74", campuses: ["South Kensington"] },
  { name: "Harvard University", short: "Harvard", country: "United States", accent: "#A51C30", campuses: ["Cambridge"] },
  { name: "Massachusetts Institute of Technology", short: "MIT", country: "United States", accent: "#8A1B1B", campuses: ["Cambridge"] },
  { name: "Stanford University", short: "Stanford", country: "United States", accent: "#8C1515", campuses: ["Stanford"] },
  { name: "Yale University", short: "Yale", country: "United States", accent: "#0F4D92", campuses: ["New Haven"] },
  { name: "University of Toronto", short: "UofT", country: "Canada", accent: "#002A5C", campuses: ["St. George", "Mississauga", "Scarborough"] },
  { name: "University of British Columbia", short: "UBC", country: "Canada", accent: "#002145", campuses: ["Vancouver", "Okanagan"] },
  { name: "McGill University", short: "McGill", country: "Canada", accent: "#ED1B2D", campuses: ["Downtown", "Macdonald"] },
  { name: "University of Melbourne", short: "UniMelb", country: "Australia", accent: "#003F7D", campuses: ["Parkville"] },
  { name: "University of New South Wales", short: "UNSW", country: "Australia", accent: "#00549E", campuses: ["Kensington"] },
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