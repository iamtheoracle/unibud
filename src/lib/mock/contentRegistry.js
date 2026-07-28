/**
 * UNIBUD Mock Content Registry — the single source of production-quality mock
 * people, avatars, campus imagery, and brand connectors for every screen.
 *
 * People are realistic UNIBUD students with diverse Nigerian names matched to
 * real Nigerian universities. Avatars use reliable Unsplash portrait URLs;
 * campus imagery uses ethnicity-neutral building/campus shots. This is clearly
 * test data — swap to real uploads/entities later with no UI change.
 */

const portrait = (id) => `https://images.unsplash.com/photo-${id}?w=200&q=80`;
const campus = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

export const CAMPUS_IMAGERY = {
  library: campus("1523050854058-8df90110c9f1"),
  lectureHall: campus("1541339905197-e6b5be8be9a7"),
  campusAerial: campus("1562774053-701939ab4e5a"),
  graduation: campus("1523050854058-8df90110c9f1"),
  lab: campus("1581091226825-a6a2a8a02a89"),
  stadium: campus("1527490087278-9c75be0b8052"),
  arts: campus("1503095396549-807759245b35"),
  tech: campus("1518770660439-4636190af475"),
};

// Diverse Nigerian students across real universities (Yoruba, Igbo, Hausa,
// Edo, Akwa Ibom, Calabar, etc.) so every screen reads as authentically UNIBUD.
export const UNIBUD_STUDENTS = [
  { id: "u1", full_name: "Adaeze Okafor", university: "University of Benin", department: "Computer Science", level: 300, avatar_url: portrait("1494790108377-be9c29b29330"), bio: "Building things that matter.", followers: 312, following: 184, posts: 47, is_verified: true },
  { id: "u2", full_name: "Tunde Balogun", university: "University of Lagos", department: "Mass Communication", level: 200, avatar_url: portrait("1507003211169-0a1dd7228f2d"), bio: "Campus radio host 🎙️", followers: 132, following: 210, posts: 18, is_verified: false },
  { id: "u3", full_name: "Fatima Yusuf", university: "Ahmadu Bello University", department: "Medicine & Surgery", level: 500, avatar_url: portrait("1544005313-94ddf0286df2"), bio: "Future surgeon. Coffee-powered.", followers: 540, following: 120, posts: 64, is_verified: true },
  { id: "u4", full_name: "Chidi Eze", university: "University of Nigeria, Nsukka", department: "Electrical Engineering", level: 300, avatar_url: portrait("1500648767791-00dcc994a43e"), bio: "Power systems & renewables ⚡", followers: 208, following: 91, posts: 23, is_verified: false },
  { id: "u5", full_name: "Bisi Adeyemi", university: "Obafemi Awolowo University", department: "Law", level: 400, avatar_url: portrait("1438761681033-6461ffad8d80"), bio: "Justice advocate | Moot Court 2025", followers: 421, following: 143, posts: 38, is_verified: false },
  { id: "u6", full_name: "Ngozi Okoro", university: "University of Port Harcourt", department: "Pharmacy", level: 200, avatar_url: portrait("1534528741775-53994a69daeb"), bio: "Aspiring pharmacologist 💊", followers: 176, following: 88, posts: 12, is_verified: false },
  { id: "u7", full_name: "Aisha Mohammed", university: "Bayero University Kano", department: "Architecture", level: 400, avatar_url: portrait("1502685104226-ee3235fefb82"), bio: "Designing for the Sahel 🏛️", followers: 289, following: 102, posts: 29, is_verified: true },
  { id: "u8", full_name: "Emeka Obi", university: "University of Ibadan", department: "Economics", level: 300, avatar_url: portrait("1506794778202-cad84cf45f1d"), bio: "Markets, money & policy.", followers: 154, following: 67, posts: 21, is_verified: false },
  { id: "u9", full_name: "Grace Effiong", university: "University of Benin", department: "Accounting", level: 200, avatar_url: portrait("1524504488940-b1c1722653e1"), bio: "Future CPA. Numbers are honest.", followers: 98, following: 140, posts: 9, is_verified: false },
  { id: "u10", full_name: "Samuel Adesanya", university: "University of Lagos", department: "Civil Engineering", level: 500, avatar_url: portrait("1488161628813-04466f872be2"), bio: "Bridges & roads. Final year grind.", followers: 203, following: 54, posts: 31, is_verified: false },
  { id: "u11", full_name: "Dr. Ibrahim Sani", university: "University of Benin", department: "Physics", level: null, role: "lecturer", avatar_url: portrait("1560250097-0b93528c311a"), bio: "Quantum mechanics. Office hours Thursdays.", followers: 1200, following: 40, posts: 12, is_verified: true },
  { id: "u12", full_name: "Yetunde Williams", university: "University of Calabar", department: "Sociology", level: 100, avatar_url: portrait("1517841905240-472988babdf9"), bio: "People-watcher & first-year explorer.", followers: 64, following: 230, posts: 7, is_verified: false },
];

const byId = new Map(UNIBUD_STUDENTS.map((s) => [s.id, s]));

export function getStudent(id) { return byId.get(id) || null; }
export function randomStudent(seed = 0) { return UNIBUD_STUDENTS[seed % UNIBUD_STUDENTS.length]; }

// Initials fallback avatar helper for screens that prefer a non-photo avatar.
export function initialsOf(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Official brand connectors (where third-party brands are supported) ──────
// Brand mark = a tiny inline SVG path data so any screen can render the official
// glyph without an icon dependency. Colors are official brand values.
export const BRAND_CONNECTORS = [
  {
    key: "instagram", label: "Instagram", color: "#E4405F",
    svg: "M12 2.2c3.2 0 3.6 0 4.8.07 1.17.05 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.43.37 1.06.42 2.23.06 1.0.07 1.6.07 4.8s0 3.6-.07 4.8c-.05 1.17-.25 1.8-.42 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.17-1.06.37-2.23.42-1.2.06-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.17-.05-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.43-.37-1.06-.42-2.23C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.05-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.17 1.06-.37 2.23-.42C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.14 0-3.5 0-4.74.07-.9.04-1.38.2-1.7.3-.43.17-.74.37-1.06.7-.32.32-.52.62-.7 1.05-.1.32-.26.8-.3 1.7C3.2 8.5 3.2 8.86 3.2 12s0 3.5.07 4.74c.04.9.2 1.38.3 1.7.17.43.37.74.7 1.06.32.32.62.52 1.05.7.32.1.8.26 1.7.3 1.24.07 1.6.07 4.74.07s3.5 0 4.74-.07c.9-.04 1.38-.2 1.7-.3.43-.17.74-.37 1.06-.7.32-.32.52-.62.7-1.05.1-.32.26-.8.3-1.7.07-1.24.07-1.6.07-4.74s0-3.5-.07-4.74c-.04-.9-.2-1.38-.3-1.7a2.8 2.8 0 0 0-.7-1.06 2.8 2.8 0 0 0-1.05-.7c-.32-.1-.8-.26-1.7-.3C15.5 4 15.14 4 12 4Zm0 3.06A4.94 4.94 0 1 1 12 16.94 4.94 4.94 0 0 1 12 7.06Zm0 8.14A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Zm5.15-8.34a1.15 1.15 0 1 1-2.3 0 1.15 1.15 0 0 1 2.3 0Z",
  },
  {
    key: "x", label: "X", color: "#000000",
    svg: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z",
  },
  {
    key: "linkedin", label: "LinkedIn", color: "#0A66C2",
    svg: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.74v20.52C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.74V1.74C24 .78 23.2 0 22.22 0Z",
  },
  {
    key: "github", label: "GitHub", color: "#181717",
    svg: "M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48l-.01-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85l-.01 2.74c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10Z",
  },
  {
    key: "youtube", label: "YouTube", color: "#FF0000",
    svg: "M23.5 6.2a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.92 24 12 24 12s0-3.92-.5-5.8ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z",
  },
  {
    key: "tiktok", label: "TikTok", color: "#000000",
    svg: "M16.6 5.82a4.28 4.28 0 0 1-1.06-2.82h-3.3v13.16a2.6 2.6 0 0 1-2.6 2.43 2.6 2.6 0 0 1 0-5.2c.27 0 .53.04.78.12v-3.4a6.04 6.04 0 0 0-.78-.05A6.04 6.04 0 1 0 15.66 16V9.2a7.6 7.6 0 0 0 4.35 1.37V7.27a4.28 4.28 0 0 1-3.4-1.45Z",
  },
];

export function getBrand(key) { return BRAND_CONNECTORS.find((b) => b.key === key) || null; }