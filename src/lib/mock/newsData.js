/**
 * UNIBUD News — production-quality mock news content across the categories the
 * platform surfaces. Realistic, UNIBUD-relevant headlines, sources, and campus
 * imagery. Consumed by News surfaces until a real news/feed API is connected.
 */
import {
  Newspaper, Megaphone, Cpu, BrainCircuit, FlaskConical, Briefcase,
  Trophy, Volleyball, Sparkles, Clapperboard, GraduationCap, Microscope,
  MapPin, Globe,
} from "lucide-react";

const cover = (id) => `https://images.unsplash.com/photo-${id}?w=600&q=80`;
const minsAgo = (m) => new Date(Date.now() - m * 60000).toISOString();

export const NEWS_CATEGORIES = [
  { key: "campus", label: "Campus News", icon: Newspaper, color: "221 83% 50%" },
  { key: "announcements", label: "University Announcements", icon: Megaphone, color: "0 70% 55%" },
  { key: "technology", label: "Technology", icon: Cpu, color: "280 60% 55%" },
  { key: "ai", label: "AI", icon: BrainCircuit, color: "198 88% 42%" },
  { key: "science", label: "Science", icon: FlaskConical, color: "173 75% 38%" },
  { key: "business", label: "Business", icon: Briefcase, color: "215 16% 45%" },
  { key: "sports", label: "Sports", icon: Trophy, color: "46 70% 50%" },
  { key: "football", label: "Football", icon: Volleyball, color: "0 78% 52%" },
  { key: "anime", label: "Anime", icon: Sparkles, color: "320 70% 55%" },
  { key: "entertainment", label: "Entertainment", icon: Clapperboard, color: "280 65% 58%" },
  { key: "scholarships", label: "Scholarships", icon: GraduationCap, color: "198 92% 48%" },
  { key: "research", label: "Research", icon: Microscope, color: "173 75% 42%" },
  { key: "local", label: "Local News", icon: MapPin, color: "215 22% 55%" },
  { key: "global", label: "Global News", icon: Globe, color: "222 70% 40%" },
];

export const NEWS_ITEMS = [
  { id: "n1", category: "campus", title: "UNIBEN Senate Approves New E-Learning Centre for Faculty of Science", summary: "The 24-seat smart classroom will host hybrid lectures and AI-assisted tutoring from next semester.", source: "UNIBUD Campus Wire", cover_url: cover("1523050854058-8df90110c9f1"), created_date: minsAgo(34) },
  { id: "n2", category: "announcements", title: "Second Semester Registration Closes Friday — Complete Course Forms Now", summary: "Late registration attracts a ₦5,000 penalty. The portal is open 24/7 until 11:59 PM on Friday.", source: "Office of the Registrar", cover_url: cover("1541339905197-e6b5be8be9a7"), created_date: minsAgo(80) },
  { id: "n3", category: "technology", title: "UNIBUD Students Launch Open-Source Attendance App for Lecturers", summary: "The app uses QR codes and offline sync, already piloted across three faculties with 1,200 students.", source: "UNIBUD Tech Circle", cover_url: cover("1518770660439-4636190af475"), created_date: minsAgo(140) },
  { id: "n4", category: "ai", title: "Faculty of Engineering Partners with Microsoft to Pilot AI Tutoring Assistant", summary: "The assistant, named 'Spark', helps students debug code and prepare for exams within a sandboxed environment.", source: "Faculty of Engineering", cover_url: cover("1581091226825-a6a2a8a02a89"), created_date: minsAgo(220) },
  { id: "n5", category: "science", title: "UNIBEN Biochemists Patent New Anti-Malarial Compound from Local Plant", summary: "Early trials show a 60% reduction in parasite load. Clinical trials with NIPRD begin in Q1 2027.", source: "UNIBUD Research Desk", cover_url: cover("1532187863146-1710f1ce8a1c"), created_date: minsAgo(300) },
  { id: "n6", category: "business", title: "Student-Led Fintech Wins ₦2.5M at UNILAG Entrepreneurship Pitch Night", summary: "CampusPay, a wallet for student stipends and fee instalments, beat 14 finalists to the grand prize.", source: "UNILAG Enterprise Hub", cover_url: cover("1556761175-b413da4baf72"), created_date: minsAgo(400) },
  { id: "n7", category: "sports", title: "UNIBUD Inter-Faculty Athletics Meet Set for August 14", summary: "Over 600 athletes across 12 faculties will compete in track and field events at the Main Bowl.", source: "NUGA Sports", cover_url: cover("1527490087278-9c75be0b8052"), created_date: minsAgo(520) },
  { id: "n8", category: "football", title: "UNIBEN Cardinals Clinch NUGA Football Qualifier in Dramatic Fashion", summary: "A 90th-minute free kick sent the Cardinals through to the national semifinals in front of a packed home crowd.", source: "NUGA Sports", cover_url: cover("1551958219-acbc608c6377"), created_date: minsAgo(640) },
  { id: "n9", category: "anime", title: "Campus Anime Society Hosts 'Nigerian Otaku Fest' This Weekend", summary: "Cosplay contests, manga swaps, and a screening of the latest seasonal hit — free entry with student ID.", source: "UNIBUD Social Desk", cover_url: cover("1578632767114-0e9e1e3a3a3a"), created_date: minsAgo(780) },
  { id: "n10", category: "entertainment", title: "Drama Society's Stage Adaptation of 'Half of a Yellow Sun' Sold Out", summary: "All three nights of the adaptation sold out within 48 hours; an encore is being considered for next month.", source: "UNIBUD Arts Wire", cover_url: cover("1503095396549-807759245b35"), created_date: minsAgo(900) },
  { id: "n11", category: "scholarships", title: "NNPC/Chevron Scholarship 2026 Opens for 200-Level Students", summary: "Applications close September 30. Eligible students must hold a CGPA of 3.50 or above.", source: "Chevron Nigeria", cover_url: cover("1523050854058-8df90110c9f1"), created_date: minsAgo(1100) },
  { id: "n12", category: "research", title: "OAU Researchers Map Groundwater Quality Across Southwest Nigeria", summary: "The two-year study identifies safe aquifers and recommends low-cost filtration for rural campuses.", source: "OAU Research Bulletin", cover_url: cover("1581091226825-a6a2a8a02a89"), created_date: minsAgo(1300) },
  { id: "n13", category: "local", title: "Benin City: Edo State Approves Free Bus Rides for Students During Exams", summary: "The 'Read & Ride' scheme runs for three weeks covering all 18 UNIBUD shuttle routes.", source: "Edo State Bulletin", cover_url: cover("1562774053-701939ab4e5a"), created_date: minsAgo(1500) },
  { id: "n14", category: "global", title: "Nigerian Students Among Winners at Global Huawei ICT Competition", summary: "A team from ABU and UNILAG placed in the top five across the network and cloud tracks in Shenzhen.", source: "Huawei ICT Academy", cover_url: cover("1518770660439-4636190af475"), created_date: minsAgo(1800) },
];

export function newsByCategory(key) {
  return NEWS_ITEMS.filter((n) => n.category === key);
}

export function categoryByKey(key) {
  return NEWS_CATEGORIES.find((c) => c.key === key) || null;
}