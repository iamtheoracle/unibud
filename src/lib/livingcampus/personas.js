/**
 * Living Campus Persona Registry
 *
 * Diverse, realistic university personas that generate authentic activity.
 * Each persona has a name, role, department, and interests to ensure
 * generated content feels genuine and varied.
 */

export const PERSONAS = [
  // ── Students ──
  { name: "Adaeze Okonkwo", role: "student", department: "Computer Science", handle: "CS · 300 Level", interests: ["coding", "AI", "startups"], avatar: null },
  { name: "Tunde Bello", role: "student", department: "Mechanical Engineering", handle: "ME · 200 Level", interests: ["robotics", "football"], avatar: null },
  { name: "Fatima Ibrahim", role: "student", department: "Biochemistry", handle: "BCH · 400 Level", interests: ["research", "medicine"], avatar: null },
  { name: "Emeka Nwosu", role: "student", department: "Electrical Engineering", handle: "EEE · 300 Level", interests: ["IoT", "music"], avatar: null },
  { name: "Zainab Mohammed", role: "student", department: "Law", handle: "LAW · 500 Level", interests: ["human rights", "debate"], avatar: null },
  { name: "Daniel Okafor", role: "student", department: "Mass Communication", handle: "MC · 200 Level", interests: ["photography", "film"], avatar: null },
  { name: "Blessing Eze", role: "student", department: "Economics", handle: "ECO · 300 Level", interests: ["finance", "data"], avatar: null },
  { name: "Yusuf Adamu", role: "student", department: "Architecture", handle: "ARC · 400 Level", interests: ["design", "sustainability"], avatar: null },
  { name: "Chioma Obi", role: "student", department: "Pharmacy", handle: "PHM · 500 Level", interests: ["healthcare", "research"], avatar: null },
  { name: "Kunle Adeyemi", role: "student", department: "Civil Engineering", handle: "CVE · 200 Level", interests: ["construction", "gaming"], avatar: null },
  { name: "Aisha Sani", role: "student", department: "Microbiology", handle: "MCB · 300 Level", interests: ["biotech", "cooking"], avatar: null },
  { name: "Peter Okon", role: "student", department: "Political Science", handle: "PLS · 400 Level", interests: ["governance", "writing"], avatar: null },

  // ── Lecturers ──
  { name: "Dr. Adebayo Johnson", role: "lecturer", department: "Computer Science", handle: "CS Dept · Lecturer", interests: ["machine learning", "research"], avatar: null },
  { name: "Prof. Ngozi Eze", role: "lecturer", department: "Mathematics", handle: "MTH Dept · Professor", interests: ["statistics", "education"], avatar: null },
  { name: "Dr. Ibrahim Musa", role: "lecturer", department: "Mechanical Engineering", handle: "ME Dept · Lecturer", interests: ["renewable energy", "design"], avatar: null },
  { name: "Dr. Sarah Oluwafemi", role: "lecturer", department: "Biochemistry", handle: "BCH Dept · Lecturer", interests: ["molecular biology", "mentoring"], avatar: null },
  { name: "Prof. Chidi Okafor", role: "lecturer", department: "Law", handle: "LAW Dept · Professor", interests: ["constitutional law", "justice"], avatar: null },

  // ── Admins ──
  { name: "Student Affairs Office", role: "admin", department: "Administration", handle: "Student Affairs", interests: ["welfare", "policy"], avatar: null },
  { name: "Registrar's Office", role: "admin", department: "Administration", handle: "Registrar", interests: ["registration", "records"], avatar: null },
  { name: "Library Services", role: "admin", department: "Library", handle: "Library Admin", interests: ["resources", "access"], avatar: null },

  // ── Clubs ──
  { name: "Tech Society", role: "club", department: "Student Clubs", handle: "Official Club", interests: ["technology", "innovation"], avatar: null },
  { name: "Debate Club", role: "club", department: "Student Clubs", handle: "Official Club", interests: ["public speaking", "current affairs"], avatar: null },
  { name: "Drama Society", role: "club", department: "Student Clubs", handle: "Official Club", interests: ["theatre", "performance"], avatar: null },
  { name: "Entrepreneurship Hub", role: "club", department: "Student Clubs", handle: "Official Club", interests: ["business", "startups"], avatar: null },
  { name: "Red Cross Society", role: "club", department: "Student Clubs", handle: "Official Club", interests: ["health", "volunteerism"], avatar: null },
  { name: "Football Club", role: "club", department: "Sports", handle: "Official Club", interests: ["sports", "fitness"], avatar: null },
  { name: "Music Society", role: "club", department: "Student Clubs", handle: "Official Club", interests: ["music", "performance"], avatar: null },
  { name: "Photography Club", role: "club", department: "Student Clubs", handle: "Official Club", interests: ["photography", "creativity"], avatar: null },
  { name: "Environment Club", role: "club", department: "Student Clubs", handle: "Official Club", interests: ["sustainability", "nature"], avatar: null },
];

export function getRandomPersona(roleFilter = null) {
  const filtered = roleFilter ? PERSONAS.filter((p) => p.role === roleFilter) : PERSONAS;
  return filtered[Math.floor(Math.random() * filtered.length)] || PERSONAS[0];
}

export function getRandomPersonas(count, roleFilter = null) {
  const pool = roleFilter ? PERSONAS.filter((p) => p.role === roleFilter) : PERSONAS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}