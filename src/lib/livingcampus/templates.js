/**
 * Living Campus Content Templates
 *
 * Rich template pool with variable substitution for maximum variety.
 * Combined with persona randomization, produces near-infinite unique content.
 */

export const VARIABLES = {
  course_codes: ["CSC 301", "MEE 202", "CHM 201", "ECO 101", "MTH 101", "MTH 201", "CSC 401", "EEE 301", "BIO 201", "LAW 101", "ACC 201", "PSY 101", "ARC 201", "PHM 301"],
  subjects: ["Data Structures", "Thermodynamics", "Organic Chemistry", "Microeconomics", "Calculus", "Linear Algebra", "Software Engineering", "Circuit Analysis", "Human Anatomy", "Constitutional Law", "Financial Accounting", "Abnormal Psychology", "Building Design", "Pharmacology"],
  topics: ["binary trees", "entropy", "functional groups", "supply and demand", "integration", "matrices", "REST APIs", "Ohm's Law", "cell mitosis", "jurisdiction", "double entry bookkeeping", "cognitive dissonance", "load-bearing walls", "drug interactions"],
  locations: ["Main Library", "Engineering Block", "Science Complex", "Student Center", "Cafeteria", "Lecture Hall A", "Computer Lab", "Main Auditorium", "New Faculty Building", "Science Block", "Law Annex"],
  prices: ["2,000", "3,500", "5,000", "7,500", "10,000", "12,000", "15,000", "20,000", "25,000"],
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template) {
  return template
    .replace(/{course_code}/g, pick(VARIABLES.course_codes))
    .replace(/{subject}/g, pick(VARIABLES.subjects))
    .replace(/{topic}/g, pick(VARIABLES.topics))
    .replace(/{location}/g, pick(VARIABLES.locations))
    .replace(/{price}/g, pick(VARIABLES.prices));
}

// ── Social Posts (student life) ──
export const SOCIAL_POST_TEMPLATES = [
  "The queue at the cafeteria today is longer than my thesis 😭",
  "Just found out my 8 AM class was moved to 7 AM. Why though? 😩",
  "Shoutout to the library security guard who always saves my seat 🙏",
  "Three group projects due next week. Send help. 🆘",
  "The campus WiFi and I are in a toxic relationship 💔",
  "Pro tip: the quiet study room on the 3rd floor is empty after 6 PM",
  "Nobody talks about how expensive printing is on campus fr 😤",
  "Just saw a squirrel steal someone's lunch on the quad 😂",
  "The AC in the main lecture hall is either Arctic or Sahara, no in-between",
  "How do people study with music? I just end up dancing 💃",
  "Found the best jollof rice spot on campus and I'm not telling anyone 🍚",
  "Group project update: I'm doing 80% of the work and we all know it",
  "The power just went out mid-presentation. Peak university experience ⚡",
  "Friendly reminder to drink water! Your brain needs it 💧",
  "Just got lost trying to find the {location}. How is this campus so big?",
  "Exam season mood: running on caffeine and sheer willpower ☕",
  "Why do lecturers love 7 AM classes? Who hurt them? 😭",
  "The new study tables in the library are actually so nice ✨",
  "Ran into my crush at the cafeteria and dropped my tray. Classic. 🫠",
  "Shoutout to everyone pulling an all-nighter tonight. We got this 💪",
  "Registration portal is down again. Naturally, on the deadline day 🙃",
  "Just realized I've been sitting in the wrong class for 20 minutes 😅",
  "The campus shuttle driver is my favorite person today. Saved me a 20-min walk 🚌",
  "Why is the library always freezing? I came to study, not to hibernate 🥶",
  "Best feeling: finding out a class is canceled. Worst feeling: it was the one you actually studied for 🫠",
];

// ── Academic Posts ──
export const ACADEMIC_POST_TEMPLATES = [
  "Study group for {course_code} tomorrow at {location}. DM if interested!",
  "Can someone explain {topic}? The textbook makes zero sense 😩",
  "Just finished my {course_code} lab report. 15 pages later...",
  "Reminder: {course_code} midterm is next week! Start prepping.",
  "Best study snacks for all-nighters? I'm running on jollof and hope 🍚",
  "Does anyone have past questions for {course_code}? Would really appreciate it 🙏",
  "Just understood {topic} after 3 hours. My brain feels like mush but we move 🧠",
  "{course_code} assignment due tonight and I haven't started. Send prayers 🤲",
  "Formed a study group for {subject} and it's honestly the best decision I've made this semester",
  "The lecturer for {course_code} is actually so good. Finally understanding {topic}!",
  "Office hours saved my life today. Go to office hours, people!",
  "How are people already done with the {course_code} assignment? It was released yesterday 😭",
];

// ── Achievement Posts ──
export const ACHIEVEMENT_TEMPLATES = [
  "Just got my {course_code} results back — A! Hard work pays off 💪",
  "Won the departmental debate competition! So grateful 🏆",
  "Finally finished my research project. Defending next week! 📚",
  "Got selected for the internship program! Dreams do come true ✨",
  "My team won the hackathon this weekend! 48 hours well spent 🚀",
  "Passed my {course_code} oral exam. The relief is unimaginable 😮‍💨",
  "Just got my scholarship approved! Tuition covered for the semester 🎉",
  "Submitted my final year project proposal. The journey begins! 🎓",
];

// ── Announcements (lecturer/admin) ──
export const ANNOUNCEMENT_TEMPLATES = [
  "Reminder: Assignment 3 for {course_code} is due this Friday at 11:59 PM. Late submissions will be penalized.",
  "Office hours moved to 2 PM today in my office. Sorry for the late notice.",
  "The {course_code} lecture tomorrow is canceled. Use the time to review past topics.",
  "Grades for Quiz 1 are now available on the portal. Check your scores.",
  "Please note: the {course_code} exam has been rescheduled to next Wednesday. Venue remains the same.",
  "For students repeating {course_code}, additional tutorial sessions will hold every Wednesday at the {location}.",
  "All {course_code} students should check their email for updated course materials.",
  "Project groups for {course_code} have been posted outside my office. Check your group number.",
];

// ── Event Templates ──
export const EVENT_TEMPLATES = [
  { title: "Tech Talk: AI in Healthcare", type: "academic", location: "Main Auditorium", description: "Join us for an insightful talk on how AI is transforming healthcare in Africa." },
  { title: "Career Fair 2024", type: "career", location: "Student Center", description: "Meet recruiters from top companies. Bring your CV!" },
  { title: "Inter-Departmental Football Tournament", type: "sports", location: "Sports Complex", description: "Sign up your department team by Friday!" },
  { title: "Cultural Night: Celebrating Diversity", type: "cultural", location: "Main Auditorium", description: "Experience food, music, and art from across the continent." },
  { title: "Entrepreneurship Workshop", type: "workshop", location: "Business School", description: "Learn how to turn your idea into a startup. Free for all students." },
  { title: "Debate Championship Finals", type: "academic", location: "Law Annex", description: "Watch the top debaters battle it out for the championship trophy." },
  { title: "Free Health Check-Up", type: "wellness", location: "Medical Center", description: "Free blood pressure, glucose, and BMI screening for all students." },
  { title: "Photography Exhibition", type: "cultural", location: "Library Gallery", description: "Student photographers showcase their best work this semester." },
  { title: "Hackathon: Build for Africa", type: "academic", location: "Computer Lab", description: "48-hour hackathon focused on building solutions for African challenges." },
  { title: "Alumni Meet & Greet", type: "social", location: "Student Center", description: "Network with successful alumni from your department." },
];

// ── Marketplace Templates ──
export const MARKETPLACE_TEMPLATES = [
  { title: "{course_code} Textbook (Good Condition)", price: 5000, category: "books", description: "Barely used. All pages intact. Great for this semester." },
  { title: "Scientific Calculator", price: 3500, category: "electronics", description: "Casio fx-991EX. Perfect working condition." },
  { title: "Engineering Drawing Set", price: 2000, category: "supplies", description: "Complete set with ruler, compass, and protractors." },
  { title: "Used Laptop (HP EliteBook)", price: 120000, category: "electronics", description: "8GB RAM, 256GB SSD. Perfect for coding and assignments." },
  { title: "Lab Coat (Size M)", price: 2500, category: "supplies", description: "Clean, barely used. Great for science labs." },
  { title: "Roommate Needed (Off-Campus)", price: 0, category: "housing", description: "Looking for a roommate to split rent. Close to campus!" },
  { title: "Past Questions Pack ({course_code})", price: 1000, category: "books", description: "5 years of past questions with solutions. Lifesaver!" },
  { title: "Phone Charger (Type-C)", price: 1500, category: "electronics", description: "Brand new, never used. Fast charging." },
];

// ── Comment Templates ──
export const COMMENT_TEMPLATES = [
  "Same here! 😅",
  "This is so relatable",
  "Thanks for sharing!",
  "Where exactly? I might join",
  "Lol same",
  "Good luck! 🙌",
  "I needed this today 🙏",
  "Facts! 💯",
  "I feel attacked 😂",
  "Drop the location please 🙏",
  "You're not alone in this 😭",
  "This made my day 😊",
  "Congrats! 🎉",
  "We're all struggling together 🤝",
  "Big mood 💀",
];

export function getRandomSocialPost() {
  return fillTemplate(pick(SOCIAL_POST_TEMPLATES));
}
export function getRandomAcademicPost() {
  return fillTemplate(pick(ACADEMIC_POST_TEMPLATES));
}
export function getRandomAchievementPost() {
  return fillTemplate(pick(ACHIEVEMENT_TEMPLATES));
}
export function getRandomAnnouncement() {
  return fillTemplate(pick(ANNOUNCEMENT_TEMPLATES));
}
export function getRandomEvent() {
  const evt = pick(EVENT_TEMPLATES);
  const persona = ["Tech Society", "Drama Society", "Entrepreneurship Hub", "Student Affairs Office"][Math.floor(Math.random() * 4)];
  return { ...evt, author: persona };
}
export function getRandomMarketplaceListing() {
  const listing = pick(MARKETPLACE_TEMPLATES);
  return {
    ...listing,
    title: fillTemplate(listing.title),
  };
}
export function getRandomComment() {
  return pick(COMMENT_TEMPLATES);
}