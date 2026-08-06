export const EXAM_TYPES = [
  { key: "institution", label: "Institution Exams", category: "school", accent: "#7FD8FF" },
  { key: "practice", label: "Practice Tests", category: "school", accent: "#A78BFA" },
  { key: "jamb", label: "JAMB", category: "nigeria", accent: "#34D399" },
  { key: "waec", label: "WAEC", category: "nigeria", accent: "#FBBF24" },
  { key: "neco", label: "NECO", category: "nigeria", accent: "#F472B6" },
  { key: "nabteb", label: "NABTEB", category: "nigeria", accent: "#60A5FA" },
  { key: "ijmb", label: "IJMB", category: "nigeria", accent: "#F87171" },
  { key: "jupeb", label: "JUPEB", category: "nigeria", accent: "#22D3EE" },
  { key: "ielts", label: "IELTS", category: "international", accent: "#818CF8" },
  { key: "toefl", label: "TOEFL", category: "international", accent: "#2DD4BF" },
  { key: "sat", label: "SAT", category: "international", accent: "#FB923C" },
  { key: "gre", label: "GRE", category: "international", accent: "#C084FC" },
  { key: "gmat", label: "GMAT", category: "international", accent: "#E879F9" },
  { key: "certification", label: "Professional Certifications", category: "professional", accent: "#4ADE80" },
];

export const examTypeLabel = (k) => EXAM_TYPES.find((t) => t.key === k)?.label || k;
export const examTypeAccent = (k) => EXAM_TYPES.find((t) => t.key === k)?.accent || "#7FD8FF";

export const CATEGORIES = [
  { key: "school", label: "School & Practice" },
  { key: "nigeria", label: "Nigerian Examinations" },
  { key: "international", label: "International Exams" },
  { key: "professional", label: "Professional" },
];