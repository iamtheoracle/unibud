/**
 * Nigerian Academic Programmes Directory
 * Grouped by faculty → department. Used by CourseSelector for browsing,
 * and by courseNormalizer for canonical-name resolution.
 *
 * Each course: { name, faculty, department }
 */

export const FACULTIES = [
  {
    faculty: "Engineering",
    departments: [
      { department: "Civil Engineering", courses: ["Civil Engineering"] },
      { department: "Electrical/Electronics Engineering", courses: ["Electrical Engineering", "Electronics Engineering", "Electrical & Electronics Engineering"] },
      { department: "Mechanical Engineering", courses: ["Mechanical Engineering"] },
      { department: "Chemical Engineering", courses: ["Chemical Engineering", "Petrochemical Engineering"] },
      { department: "Computer Engineering", courses: ["Computer Engineering"] },
      { department: "Petroleum Engineering", courses: ["Petroleum Engineering", "Gas Engineering"] },
      { department: "Mechatronics Engineering", courses: ["Mechatronics Engineering"] },
      { department: "Agricultural Engineering", courses: ["Agricultural Engineering"] },
      { department: "Materials & Metallurgical Engineering", courses: ["Metallurgical Engineering", "Materials Engineering"] },
      { department: "Industrial & Production Engineering", courses: ["Industrial Engineering", "Production Engineering"] },
    ],
  },
  {
    faculty: "Science",
    departments: [
      { department: "Computer Science", courses: ["Computer Science"] },
      { department: "Mathematics", courses: ["Mathematics", "Industrial Mathematics"] },
      { department: "Statistics", courses: ["Statistics"] },
      { department: "Physics", courses: ["Physics", "Industrial Physics"] },
      { department: "Chemistry", courses: ["Chemistry", "Industrial Chemistry", "Pure Chemistry"] },
      { department: "Biochemistry", courses: ["Biochemistry"] },
      { department: "Microbiology", courses: ["Microbiology", "Industrial Microbiology"] },
      { department: "Biology", courses: ["Biology", "Plant Biology", "Zoology", "Botany"] },
      { department: "Geology", courses: ["Geology", "Applied Geology", "Geophysics"] },
      { department: "Environmental Science", courses: ["Environmental Science", "Environmental Management"] },
    ],
  },
  {
    faculty: "Technology & Computing",
    departments: [
      { department: "Information Technology", courses: ["Information Technology"] },
      { department: "Software Engineering", courses: ["Software Engineering"] },
      { department: "Cyber Security", courses: ["Cyber Security", "Cybersecurity"] },
      { department: "Data Science", courses: ["Data Science"] },
      { department: "Computer Technology", courses: ["Computer Technology"] },
    ],
  },
  {
    faculty: "Medicine & Health Sciences",
    departments: [
      { department: "Medicine & Surgery", courses: ["Medicine & Surgery", "Medicine"] },
      { department: "Nursing Sciences", courses: ["Nursing", "Nursing Sciences"] },
      { department: "Pharmacy", courses: ["Pharmacy", "Pharmacology"] },
      { department: "Medical Laboratory Science", courses: ["Medical Laboratory Science"] },
      { department: "Physiotherapy", courses: ["Physiotherapy"] },
      { department: "Radiography", courses: ["Radiography", "Radiography & Radiation Science"] },
      { department: "Anatomy", courses: ["Anatomy"] },
      { department: "Physiology", courses: ["Physiology"] },
      { department: "Public Health", courses: ["Public Health"] },
    ],
  },
  {
    faculty: "Social Sciences",
    departments: [
      { department: "Economics", courses: ["Economics"] },
      { department: "Political Science", courses: ["Political Science"] },
      { department: "Sociology", courses: ["Sociology", "Sociology & Anthropology"] },
      { department: "Psychology", courses: ["Psychology"] },
      { department: "Geography", courses: ["Geography", "Geography & Planning"] },
      { department: "Mass Communication", courses: ["Mass Communication"] },
      { department: "Criminology & Security Studies", courses: ["Criminology", "Criminology & Security Studies"] },
      { department: "Social Work", courses: ["Social Work"] },
    ],
  },
  {
    faculty: "Management Sciences",
    departments: [
      { department: "Accounting", courses: ["Accounting", "Accountancy"] },
      { department: "Business Administration", courses: ["Business Administration", "Business Management"] },
      { department: "Marketing", courses: ["Marketing"] },
      { department: "Finance", courses: ["Finance", "Banking & Finance"] },
      { department: "Insurance", courses: ["Insurance", "Actuarial Science"] },
      { department: "Entrepreneurship", courses: ["Entrepreneurship", "Entrepreneurship Studies"] },
      { department: "Public Administration", courses: ["Public Administration"] },
    ],
  },
  {
    faculty: "Arts & Humanities",
    departments: [
      { department: "English & Literary Studies", courses: ["English", "English & Literary Studies"] },
      { department: "History & International Studies", courses: ["History", "History & International Studies"] },
      { department: "Linguistics", courses: ["Linguistics", "Linguistics & African Languages"] },
      { department: "Philosophy", courses: ["Philosophy"] },
      { department: "Religious Studies", courses: ["Religious Studies", "Religion & African Culture"] },
      { department: "Theatre Arts", courses: ["Theatre Arts", "Performing Arts"] },
      { department: "Languages", courses: ["French", "French & International Relations", "Arabic"] },
    ],
  },
  {
    faculty: "Education",
    departments: [
      { department: "Education", courses: ["Education", "Educational Administration"] },
      { department: "Science Education", courses: ["Science Education", "Mathematics Education", "Computer Science Education"] },
      { department: "Arts Education", courses: ["English Education", "History Education"] },
      { department: "Guidance & Counselling", courses: ["Guidance & Counselling"] },
      { department: "Physical & Health Education", courses: ["Physical Education", "Health Education"] },
      { department: "Educational Foundation", courses: ["Educational Foundation"] },
    ],
  },
  {
    faculty: "Law",
    departments: [{ department: "Law", courses: ["Law", "Common & Islamic Law"] }],
  },
  {
    faculty: "Environmental Sciences",
    departments: [
      { department: "Architecture", courses: ["Architecture"] },
      { department: "Building", courses: ["Building"] },
      { department: "Estate Management", courses: ["Estate Management"] },
      { department: "Urban & Regional Planning", courses: ["Urban & Regional Planning"] },
      { department: "Quantity Surveying", courses: ["Quantity Surveying"] },
      { department: "Surveying & Geoinformatics", courses: ["Surveying & Geoinformatics"] },
    ],
  },
  {
    faculty: "Agriculture",
    departments: [
      { department: "Agriculture", courses: ["Agriculture", "Agricultural Science"] },
      { department: "Agronomy", courses: ["Agronomy", "Crop Science"] },
      { department: "Animal Science", courses: ["Animal Science"] },
      { department: "Soil Science", courses: ["Soil Science"] },
      { department: "Agricultural Economics", courses: ["Agricultural Economics", "Agribusiness"] },
      { department: "Food Science & Technology", courses: ["Food Science & Technology", "Food Technology"] },
    ],
  },
];

export const ALL_COURSES = FACULTIES.flatMap((f) =>
  f.departments.flatMap((d) =>
    d.courses.map((c) => ({ name: c, faculty: f.faculty, department: d.department }))
  )
);

export function searchCourses(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ALL_COURSES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.faculty.toLowerCase().includes(q)
  );
}

export function getCoursesByFaculty() {
  return FACULTIES.map((f) => ({
    faculty: f.faculty,
    courses: f.departments.flatMap((d) =>
      d.courses.map((c) => ({ name: c, faculty: f.faculty, department: d.department }))
    ),
  }));
}