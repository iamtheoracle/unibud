import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

/* ── Seed Content Definitions ──
   Realistic launch content for the Campus Feed. All content is marked
   is_seed_content=true with seed_batch='launch_v1' so Orbit can identify
   and gradually replace it as real user activity grows. */

const SEED_BATCH = 'launch_v1';

/* ── Authors ── diverse voices across the campus ecosystem */
const AUTHORS = {
  studentUnion: { name: "Student Union Government", handle: "SUG · Official", role: "admin", verified: true, image: "" },
  careerServices: { name: "Career Services Centre", handle: "Division of Student Affairs", role: "admin", verified: true, image: "" },
  library: { name: "University Library", handle: "Main Campus", role: "admin", verified: true, image: "" },
  admissions: { name: "Admissions Office", handle: "Registrar", role: "admin", verified: true, image: "" },
  csDept: { name: "Department of Computer Science", handle: "Faculty of Science", role: "lecturer", verified: true, image: "" },
  engDept: { name: "Faculty of Engineering", handle: "Engineering Block", role: "lecturer", verified: true, image: "" },
  sports: { name: "University Sports Council", handle: "Athletics Division", role: "admin", verified: true, image: "" },
  research: { name: "Office of Research & Development", handle: "Research Grants", role: "admin", verified: true, image: "" },
  devClub: { name: "Developers' Circle", handle: "Student Club · 240 members", role: "club", verified: false, image: "" },
  debateSoc: { name: "Debate Society", handle: "Student Club · 85 members", role: "club", verified: false, image: "" },
  photoClub: { name: "Lens & Light Photography", handle: "Student Club · 120 members", role: "club", verified: false, image: "" },
  student1: { name: "Adaeze Okonkwo", handle: "Computer Science · 300L", role: "student", verified: false, image: "" },
  student2: { name: "Tunde Bello", handle: "Mechanical Engineering · 200L", role: "student", verified: false, image: "" },
  student3: { name: "Fatima Ibrahim", handle: "Mass Communication · 400L", role: "student", verified: false, image: "" },
  student4: { name: "Emeka Nwosu", handle: "Electrical Engineering · 500L", role: "student", verified: false, image: "" },
  student5: { name: "Zainab Yusuf", handle: "Biochemistry · 300L", role: "student", verified: false, image: "" },
  lecturer1: { name: "Dr. Aminu Sadiq", handle: "Computer Science · Faculty", role: "lecturer", verified: true, image: "" },
  lecturer2: { name: "Prof. Grace Eze", handle: "Mathematics · Faculty", role: "lecturer", verified: true, image: "" },
};

function author(a) {
  return { author_name: a.name, author_handle: a.handle, author_role: a.role, is_verified: a.verified, author_image: a.image };
}

const REACTION_TYPES = ['like', 'love', 'celebrate', 'insightful', 'funny'];
function randomReactions(min, max) {
  const total = Math.floor(Math.random() * (max - min + 1)) + min;
  const r = {};
  let remaining = total;
  for (let i = 0; i < REACTION_TYPES.length && remaining > 0; i++) {
    const v = i === REACTION_TYPES.length - 1 ? remaining : Math.floor(Math.random() * (remaining + 1));
    if (v > 0) r[REACTION_TYPES[i]] = v;
    remaining -= v;
  }
  return { reactions: r, likes_count: total };
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

/* ── Post Templates ── covers every major social feature type */

const SEED_POSTS = [
  // ── Announcements (admin) ──
  {
    ...author(AUTHORS.studentUnion),
    type: 'news',
    content: "📚 Welcome back, students! The second semester officially begins Monday, August 10th. Registration opens on the student portal from August 5th–14th. Don't forget to pay your fees before the deadline to avoid late charges. We're excited for what's ahead this semester! 🎓",
    hashtags: ['#BackToCampus', '#Semester2', '#Registration'],
    tags: ['announcement', 'registration'],
    ...randomReactions(45, 120),
    comments_count: 18,
    shares_count: 32,
    is_pinned: true,
  },
  {
    ...author(AUTHORS.admissions),
    type: 'news',
    content: "🎓 The 2026/2027 Post-UTME screening form is now available! Eligible candidates can apply through the admissions portal. Deadline: September 15th. Requirements: minimum score of 200, O'Level results with 5 credits including English and Mathematics. Questions? Visit the admissions office during working hours.",
    hashtags: ['#Admissions', '#PostUTME', '#2026'],
    tags: ['announcement', 'admissions'],
    ...randomReactions(80, 180),
    comments_count: 45,
    shares_count: 67,
  },
  {
    ...author(AUTHORS.library),
    type: 'announcement',
    content: "Quiet study hours extended! The main library will now open from 7:00 AM to 11:00 PM, Monday through Friday, to support your exam preparation. Group study rooms can be booked at the circulation desk or through the library app. Happy studying! 📖",
    hashtags: ['#LibraryHours', '#StudySmart'],
    tags: ['library', 'announcement'],
    ...randomReactions(30, 65),
    comments_count: 8,
    shares_count: 15,
  },

  // ── Academic Discussions & Study Tips ──
  {
    ...author(AUTHORS.lecturer1),
    type: 'discussion',
    content: "A common misconception I see in Data Structures assignments: students confuse a stack's LIFO principle with a queue's FIFO. Remember — a stack is like a stack of plates (last one placed is first removed), while a queue is like a line at the cafeteria (first in, first out). Master this and recursive algorithms will become far more intuitive. Office hours are Wednesdays 2–4 PM if you'd like to discuss further. 🧠",
    hashtags: ['#DataStructures', '#StudyTips', '#CS'],
    tags: ['academic', 'study_tip'],
    ...randomReactions(55, 95),
    comments_count: 22,
    shares_count: 18,
  },
  {
    ...author(AUTHORS.student1),
    type: 'study_resource',
    content: "Sharing my CSC 301 study notes from last semester! Covers Big-O notation, sorting algorithms, trees, and graphs with worked examples. These helped me score an A. Feel free to build on them — knowledge multiplies when shared. Good luck to everyone taking it this semester! 📝✨",
    hashtags: ['#CSC301', '#StudyNotes', '#ShareKnowledge'],
    tags: ['study_resource', 'notes'],
    ...randomReactions(70, 130),
    comments_count: 34,
    shares_count: 48,
  },
  {
    ...author(AUTHORS.lecturer2),
    type: 'discussion',
    content: "REMINDER: The MTH 201 midterm covers chapters 1–5 (limits, continuity, differentiation, applications of derivatives, and integration by substitution). Focus on understanding the geometric interpretation of derivatives — it makes 60% of the exam questions far more approachable. Past papers are available in the departmental office. 💡",
    hashtags: ['#MTH201', '#MidtermPrep'],
    tags: ['academic', 'exam_prep'],
    ...randomReactions(40, 75),
    comments_count: 15,
    shares_count: 28,
  },

  // ── Event Promotions ──
  {
    ...author(AUTHORS.devClub),
    type: 'event',
    content: "🚀 Developers' Circle presents: 'Building Your First Web App with React' — a hands-on workshop for beginners! No prior experience needed. We'll walk through setting up a project, building components, and deploying to the web. Free for all students. Bring your laptop! 💻",
    hashtags: ['#ReactWorkshop', '#LearnToCode', '#DevCircle'],
    tags: ['event', 'workshop'],
    event_data: { title: "React Workshop for Beginners", date: daysFromNow(5), start_time: "15:00", end_time: "17:30", location: "CS Lab 3, Engineering Block", description: "Hands-on React workshop for beginners" },
    ...randomReactions(90, 160),
    comments_count: 28,
    shares_count: 52,
  },
  {
    ...author(AUTHORS.careerServices),
    type: 'event',
    content: "💼 The Annual Career Fair is back! 40+ companies including tech giants, banks, and startups will be on campus to recruit interns and graduates. Bring printed copies of your CV and dress professionally. On-site interviews available for select roles. This is your chance to land that internship! 🎯",
    hashtags: ['#CareerFair', '#Internship', '#JobSearch'],
    tags: ['event', 'career'],
    event_data: { title: "Annual Career Fair 2026", date: daysFromNow(12), start_time: "09:00", end_time: "16:00", location: "Main Auditorium", description: "40+ companies recruiting interns and graduates" },
    ...randomReactions(120, 220),
    comments_count: 56,
    shares_count: 89,
  },
  {
    ...author(AUTHORS.sports),
    type: 'event',
    content: "⚽ The inter-faculty football tournament kicks off this Friday! Faculty of Engineering vs Faculty of Science in the opening match. Come support your faculty! Free entry for all students with valid ID. Refreshments available. Let's fill the stands! 🔥",
    hashtags: ['#InterFaculty', '#Football', '#CampusSports'],
    tags: ['event', 'sports'],
    event_data: { title: "Inter-Faculty Football Tournament", date: daysFromNow(3), start_time: "16:00", end_time: "18:00", location: "University Sports Complex", description: "Engineering vs Science — opening match" },
    ...randomReactions(65, 110),
    comments_count: 30,
    shares_count: 41,
  },

  // ── Internship & Scholarship Opportunities ──
  {
    ...author(AUTHORS.careerServices),
    type: 'news',
    content: "🔔 INTERNSHIP ALERT: A leading fintech company is offering 3-month summer internships in software engineering, data analysis, and product management. Open to 300L and 400L students. Stipend: ₦150,000/month. Apply through the Career Services portal by August 20th. Don't miss this! 💼",
    hashtags: ['#Internship', '#Fintech', '#CareerAlert'],
    tags: ['opportunity', 'internship'],
    ...randomReactions(110, 200),
    comments_count: 65,
    shares_count: 120,
  },
  {
    ...author(AUTHORS.research),
    type: 'news',
    content: "🏆 The Chevron Undergraduate Scholarship is now open for applications! Full tuition coverage + ₦150,000 annual stipend for eligible 200L and 300L students with CGPA ≥ 3.5. Application deadline: August 30th. Visit the Office of Research & Development for the application form and requirements. This could be life-changing! ✨",
    hashtags: ['#Scholarship', '#Chevron', '#FinancialAid'],
    tags: ['opportunity', 'scholarship'],
    ...randomReactions(140, 250),
    comments_count: 78,
    shares_count: 145,
  },

  // ── Research Highlights ──
  {
    ...author(AUTHORS.research),
    type: 'research',
    content: "🔬 Breakthrough from our Biochemistry department! A team led by Dr. Ngozi Adeyemi has published findings on novel antimicrobial compounds derived from local plant extracts. The research, published in the Journal of Ethnopharmacology, could pave the way for new treatments against drug-resistant bacteria. We're proud of our researchers making global impact! 🌍",
    hashtags: ['#Research', '#Biochemistry', '#Innovation'],
    tags: ['research', 'publication'],
    ...randomReactions(85, 150),
    comments_count: 32,
    shares_count: 55,
  },
  {
    ...author(AUTHORS.lecturer1),
    type: 'research',
    content: "Excited to share that our department's AI research lab has been awarded a ₦12 million grant from the Tertiary Education Trust Fund (TETFund) to develop machine learning models for early disease detection. This is a testament to the growing research culture in our institution. Looking forward to involving interested student researchers! 🤖",
    hashtags: ['#AIResearch', '#TETFund', '#MachineLearning'],
    tags: ['research', 'grant'],
    ...randomReactions(60, 100),
    comments_count: 24,
    shares_count: 38,
  },

  // ── Club Recruitment ──
  {
    ...author(AUTHORS.devClub),
    type: 'club_update',
    content: "🎯 Developers' Circle is recruiting! We're looking for passionate students interested in web development, mobile apps, AI, and open source. No coding experience required — we teach from scratch! Benefits: mentorship, hackathon trips, internship referrals, and access to our coding lab. Registration closes Friday. Join us! 💻✨",
    hashtags: ['#DevCircle', '#Recruitment', '#JoinUs'],
    tags: ['club', 'recruitment'],
    ...randomReactions(75, 130),
    comments_count: 42,
    shares_count: 58,
  },
  {
    ...author(AUTHORS.debateSoc),
    type: 'club_update',
    content: "🎙️ The Debate Society is calling all voices! If you love arguing constructively (and winning), this is your home. We compete in national and international tournaments and have produced award-winning debaters. Weekly meetings: Thursdays at 4 PM in Room A201. All levels welcome — from first-timers to seasoned debaters. Come find your voice! 🗣️",
    hashtags: ['#DebateSociety', '#PublicSpeaking', '#JoinTheConversation'],
    tags: ['club', 'recruitment'],
    ...randomReactions(40, 70),
    comments_count: 16,
    shares_count: 22,
  },
  {
    ...author(AUTHORS.photoClub),
    type: 'club_update',
    content: "📸 Lens & Light Photography Club presents our annual exhibition: 'Campus Through Our Eyes' — a showcase of student photography capturing life on campus. Submissions open to all students (club members and non-members). Top 3 entries win prizes! Submit your best campus photo by August 25th. Let your creativity shine! 🌟",
    hashtags: ['#Photography', '#Exhibition', '#CampusLife'],
    tags: ['club', 'event'],
    ...randomReactions(50, 90),
    comments_count: 20,
    shares_count: 30,
  },

  // ── Polls & Questions ──
  {
    ...author(AUTHORS.student2),
    type: 'poll',
    content: "Quick poll for my fellow engineering students: which programming language should I focus on learning this semester alongside my coursework?",
    hashtags: ['#Programming', '#EngineeringStudent', '#Poll'],
    tags: ['poll', 'question'],
    poll_data: {
      question: "Which language should I learn this semester?",
      options: [
        { id: 'opt1', text: 'Python', votes: 47 },
        { id: 'opt2', text: 'JavaScript', votes: 32 },
        { id: 'opt3', text: 'C++', votes: 18 },
        { id: 'opt4', text: 'Java', votes: 15 },
      ],
      expires_at: daysFromNow(3) + "T23:59:59",
    },
    ...randomReactions(60, 100),
    comments_count: 25,
    shares_count: 8,
  },
  {
    ...author(AUTHORS.student3),
    type: 'question',
    content: "Hey everyone! I'm a 400L Mass Communication student looking for a research topic on social media's impact on political engagement among youths in Nigeria. Any suggestions or resources? Would really appreciate pointers from anyone who's done similar research. Thanks in advance! 🙏",
    hashtags: ['#ResearchTopic', '#MassComm', '#HelpNeeded'],
    tags: ['question', 'academic'],
    ...randomReactions(25, 50),
    comments_count: 19,
    shares_count: 5,
  },

  // ── Achievement Celebrations ──
  {
    ...author(AUTHORS.student4),
    type: 'achievement',
    content: "I DID IT! 🎉 Just received confirmation that my team won 2nd place at the National Engineering Innovation Challenge for our solar-powered water purification system! Six months of sleepless nights, but it paid off. Huge thanks to my teammates, our faculty advisor Dr. Okafor, and everyone who believed in us. Never stop innovating! 🏆💡",
    hashtags: ['#Achievement', '#Engineering', '#Innovation', '#Proud'],
    tags: ['achievement', 'celebration'],
    ...randomReactions(180, 280),
    comments_count: 85,
    shares_count: 72,
  },
  {
    ...author(AUTHORS.student5),
    type: 'achievement',
    content: "After 6 months of consistent study sessions and practice tests, I finally scored above 80% in my Biochemistry midterms! 📚 Last semester I barely passed. If you're struggling — keep going. Consistency beats intensity every single time. Your breakthrough is coming. 💪🏾✨",
    hashtags: ['#StudentWin', '#Consistency', '#NeverGiveUp'],
    tags: ['achievement', 'motivation'],
    ...randomReactions(95, 160),
    comments_count: 38,
    shares_count: 45,
  },

  // ── General Student Conversations ──
  {
    ...author(AUTHORS.student1),
    type: 'discussion',
    content: "Unpopular opinion: the cafeteria's jollof rice has genuinely improved this semester. Am I the only one who noticed? Or is it just exam stress making everything taste better? 😅🍚 Either way, I'm not complaining!",
    hashtags: ['#CampusLife', '#FoodTalk', '#UnpopularOpinion'],
    tags: ['discussion', 'casual'],
    ...randomReactions(55, 90),
    comments_count: 42,
    shares_count: 12,
  },
  {
    ...author(AUTHORS.student2),
    type: 'discussion',
    content: "PSA for anyone using the engineering workshop: PLEASE clean up after yourselves. Found soldering iron left on, components scattered everywhere, and someone's project taking up three workbenches. We all share this space. A little consideration goes a long way. 🙏🔧",
    hashtags: ['#PSA', '#EngineeringLife', '#SharedSpaces'],
    tags: ['discussion', 'campus_life'],
    ...randomReactions(35, 65),
    comments_count: 28,
    shares_count: 15,
  },
  {
    ...author(AUTHORS.student3),
    type: 'text',
    content: "That moment when the lecturer says 'the exam will only cover what we discussed in class' but you missed three lectures 😅 Fellow Mass Comm 400L students — anyone willing to share notes from weeks 3-5? I'll trade my Media Law notes (which are very detailed, I promise)! Let's help each other out. 📝🤝",
    hashtags: ['#StudentLife', '#NotesExchange', '#Help'],
    tags: ['discussion', 'academic'],
    ...randomReactions(45, 75),
    comments_count: 31,
    shares_count: 8,
  },

  // ── Campus News ──
  {
    ...author(AUTHORS.studentUnion),
    type: 'news',
    content: "🚌 Good news! The campus shuttle service has been expanded with 5 new buses covering additional routes including the student residential areas off-campus. Service runs 6 AM – 10 PM daily. Show your student ID to ride free. Tag someone who'll benefit from this! 🚏",
    hashtags: ['#CampusShuttle', '#StudentWelfare', '#NewRoutes'],
    tags: ['news', 'campus'],
    ...randomReactions(100, 170),
    comments_count: 50,
    shares_count: 95,
  },
  {
    ...author(AUTHORS.library),
    type: 'news',
    content: "📖 New arrivals! Over 500 new titles have been added to our digital library, including textbooks for Computer Science, Engineering, Medicine, and Law. Access them free through the library portal using your student credentials. E-books can be downloaded for offline reading. Knowledge at your fingertips! 📚",
    hashtags: ['#NewBooks', '#DigitalLibrary', '#ReadMore'],
    tags: ['news', 'library'],
    ...randomReactions(55, 95),
    comments_count: 20,
    shares_count: 35,
  },
];

/* ── Comment Templates ── realistic engagement on seeded posts */
function generateComments(post, count) {
  const studentCommenters = [
    AUTHORS.student1, AUTHORS.student2, AUTHORS.student3, AUTHORS.student4, AUTHORS.student5,
  ];
  const commentTemplates = {
    news: [
      "Thank you for this update! 🙏",
      "This is so helpful, appreciate it.",
      "Great news! Looking forward to it.",
      "About time! Thanks for sharing.",
    ],
    event: [
      "Definitely attending! 🔥",
      "Will be there. Bringing friends too!",
      "This sounds amazing. Can non-members attend?",
      "Count me in! What should I bring?",
    ],
    discussion: [
      "This actually makes so much sense now. Thank you!",
      "Couldn't agree more. I've been struggling with this exact concept.",
      "Saving this for later. Very helpful! 📌",
      "This is why I love this community. Always learning.",
    ],
    study_resource: [
      "You're a lifesaver! Thank you so much! 🙏",
      "Sharing this with my study group immediately.",
      "God bless you for this 🙏",
      "Do you have notes for chapter 6 as well?",
    ],
    achievement: [
      "Congratulations! 🎉 So well deserved!",
      "This is so inspiring! Congrats! 🏆",
      "Making us proud! Keep going! 💪",
      "Amazing achievement! Can I connect with your team?",
    ],
    club_update: [
      "Interested! How do I register?",
      "Is it too late to join? I missed the first meeting.",
      "Finally a club that fits my interests. Signing up!",
      "Do I need any prior experience?",
    ],
    poll: [
      "Python all the way! So versatile.",
      "JavaScript if you're into web dev.",
      "C++ — fundamentals matter most.",
      "Honestly depends on your career goals.",
    ],
    question: [
      "Have you looked into Pew Research Center's data? Very helpful.",
      "I did something similar last year. DM me, I'll share resources!",
      "Check out the journal 'African Media Review' — great stuff.",
      "Have you considered the role of WhatsApp groups in political mobilization?",
    ],
    research: [
      "Incredible work! Proud of our university. 👏",
      "This is the kind of innovation we need. Congratulations!",
      "Would love to get involved in research like this.",
      "Making global impact from our campus. Amazing!",
    ],
  };

  const templates = commentTemplates[post.type] || commentTemplates.news;
  const comments = [];
  const used = new Set();

  for (let i = 0; i < Math.min(count, templates.length); i++) {
    const commenter = studentCommenters[Math.floor(Math.random() * studentCommenters.length)];
    let templateIdx = i;
    if (used.has(templateIdx)) continue;
    used.add(templateIdx);

    comments.push({
      ...author(commenter),
      content: templates[templateIdx],
      is_seed_content: true,
      seed_batch: SEED_BATCH,
      likes_count: Math.floor(Math.random() * 15) + 2,
    });
  }

  return comments;
}

/* ── Opportunities & Scholarships (separate entities) ── */
const SEED_OPPORTUNITIES = [
  {
    title: "Software Engineering Internship — Fintech",
    organization: "PayStack",
    type: "internship",
    description: "3-month summer internship building payment infrastructure. Work with a world-class engineering team on products used by millions. Open to 300L–500L Computer Science and Engineering students.",
    deadline: daysFromNow(18),
    location: "Lagos, Nigeria (Hybrid)",
    amount: "₦150,000/month",
    eligibility: "300L–500L CS/Engineering, CGPA ≥ 3.0",
    link: "https://paystack.com/careers",
    tags: ["internship", "software", "fintech", "summer"],
  },
  {
    title: "Data Analytics Internship",
    organization: "Flutterwave",
    type: "internship",
    description: "Join the analytics team to build dashboards and models that drive business decisions. Hands-on experience with Python, SQL, and modern BI tools.",
    deadline: daysFromNow(20),
    location: "Lagos, Nigeria",
    amount: "₦120,000/month",
    eligibility: "300L+ Statistics, Mathematics, or CS students",
    link: "https://flutterwave.com/careers",
    tags: ["internship", "data", "analytics"],
  },
  {
    title: "Product Management Internship",
    organization: "Kuda Bank",
    type: "internship",
    description: "Learn product management from the ground up at a digital-only bank. Shadow PMs, conduct user research, and ship features.",
    deadline: daysFromNow(15),
    location: "Remote",
    amount: "₦100,000/month",
    eligibility: "400L+ any discipline, strong communication skills",
    link: "https://kuda.com/careers",
    tags: ["internship", "product", "fintech"],
  },
  {
    title: "Campus Ambassador Programme",
    organization: "Microsoft Nigeria",
    type: "volunteering",
    description: "Become a Microsoft Learn Student Ambassador on your campus. Host tech events, build your network, and get exclusive access to Microsoft resources and certification vouchers.",
    deadline: daysFromNow(25),
    location: "Campus-based",
    amount: "Certification vouchers + swag + mentorship",
    eligibility: "All levels, passion for technology",
    link: "https://studentambassadors.microsoft.com",
    tags: ["ambassador", "microsoft", "leadership", "tech"],
  },
];

const SEED_SCHOLARSHIPS = [
  {
    title: "Chevron Undergraduate Scholarship 2026",
    provider: "Chevron Nigeria Limited",
    type: "merit",
    description: "Full tuition coverage plus ₦150,000 annual stipend for outstanding undergraduate students. Renewable annually based on academic performance.",
    amount: "Full tuition + ₦150,000/year",
    eligibility: "200L–300L, CGPA ≥ 3.5, all disciplines",
    level: "undergraduate",
    deadline: daysFromNow(28),
    duration: "Until graduation",
    location: "Nigeria",
    is_international: false,
    fields_of_study: ["All fields"],
    link: "https://chevron.com/scholarships",
    is_featured: true,
    status: "open",
    tags: ["scholarship", "chevron", "full-tuition", "merit"],
  },
  {
    title: "NNPC/SNEPCo National University Scholarship",
    provider: "NNPC/SNEPCo",
    type: "merit",
    description: "Annual scholarship award for Nigerian undergraduates in specified fields. Covers full tuition and provides a generous maintenance allowance.",
    amount: "Full tuition + maintenance allowance",
    eligibility: "200L+, CGPA ≥ 3.2, specified disciplines",
    level: "undergraduate",
    deadline: daysFromNow(30),
    duration: "1 year (renewable)",
    location: "Nigeria",
    is_international: false,
    fields_of_study: ["Engineering", "Computer Science", "Geology", "Medicine", "Economics"],
    link: "https://nnpcgroup.com/scholarships",
    status: "open",
    tags: ["scholarship", "nnpc", "merit", "full-tuition"],
  },
  {
    title: "MasterCard Foundation Scholars Program",
    provider: "MasterCard Foundation",
    type: "need_based",
    description: "Comprehensive scholarship covering tuition, accommodation, books, and stipend for economically disadvantaged but academically talented students.",
    amount: "Full coverage (tuition + accommodation + stipend + books)",
    eligibility: "Demonstrated financial need, academic excellence, leadership potential",
    level: "undergraduate",
    deadline: daysFromNow(45),
    duration: "Full programme",
    location: "Nigeria + study abroad opportunities",
    is_international: true,
    fields_of_study: ["All fields"],
    link: "https://mastercardfdn.org/scholars",
    is_featured: true,
    status: "open",
    tags: ["scholarship", "mastercard", "need-based", "full-coverage"],
  },
];

/* ── Handler ── */

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action } = body;

    // ── seed: populate launch content ──
    if (action === 'seed') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }

      // Check if already seeded
      const existing = await base44.asServiceRole.entities.QuadPost.filter({
        seed_batch: SEED_BATCH,
      });
      if ((existing || []).length > 0) {
        return Response.json({
          status: 'already_seeded',
          message: `Launch content already exists (${existing.length} posts). Use action 'clear' to remove first.`,
        });
      }

      // Create posts
      const postsToCreate = SEED_POSTS.map(p => ({
        ...p,
        draft_status: 'published',
        visibility: 'campus',
        is_seed_content: true,
        seed_batch: SEED_BATCH,
      }));
      const createdPosts = await base44.asServiceRole.entities.QuadPost.bulkCreate(postsToCreate);

      // Create comments on select posts
      let commentCount = 0;
      const postsWithComments = (createdPosts || []).filter(p => p.comments_count > 0);
      for (const post of postsWithComments) {
        const comments = generateComments(post, Math.min(post.comments_count, 4));
        for (const c of comments) {
          await base44.asServiceRole.entities.QuadComment.create({
            ...c,
            post_id: post.id,
          });
          commentCount++;
        }
      }

      // Create opportunities
      let opportunityCount = 0;
      for (const opp of SEED_OPPORTUNITIES) {
        await base44.asServiceRole.entities.Opportunity.create(opp);
        opportunityCount++;
      }

      // Create scholarships
      let scholarshipCount = 0;
      for (const sch of SEED_SCHOLARSHIPS) {
        await base44.asServiceRole.entities.Scholarship.create(sch);
        scholarshipCount++;
      }

      return Response.json({
        status: 'success',
        posts: createdPosts.length,
        comments: commentCount,
        opportunities: opportunityCount,
        scholarships: scholarshipCount,
        batch: SEED_BATCH,
      });
    }

    // ── clear: remove all seed content ──
    if (action === 'clear') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }

      // Delete seed posts
      const seedPosts = await base44.asServiceRole.entities.QuadPost.filter({
        is_seed_content: true,
      });
      let deletedPosts = 0;
      for (const post of seedPosts || []) {
        await base44.asServiceRole.entities.QuadPost.delete(post.id);
        deletedPosts++;
      }

      // Delete seed comments
      const seedComments = await base44.asServiceRole.entities.QuadComment.filter({
        is_seed_content: true,
      });
      let deletedComments = 0;
      for (const comment of seedComments || []) {
        await base44.asServiceRole.entities.QuadComment.delete(comment.id);
        deletedComments++;
      }

      return Response.json({
        status: 'success',
        deletedPosts,
        deletedComments,
      });
    }

    // ── status: check seed content status ──
    if (action === 'status') {
      const seedPosts = await base44.asServiceRole.entities.QuadPost.filter({
        is_seed_content: true,
      });
      const realPosts = await base44.asServiceRole.entities.QuadPost.filter({
        is_seed_content: { $ne: true },
      });

      const totalReal = (realPosts || []).length;
      const totalSeed = (seedPosts || []).length;

      // Determine replacement phase
      let phase = 'seeded';
      if (totalSeed === 0) phase = 'empty';
      else if (totalReal >= 50) phase = 'transitioning';
      else if (totalReal >= 100) phase = 'replaced';
      else if (totalReal >= 20) phase = 'growing';

      return Response.json({
        status: 'success',
        seedPosts: totalSeed,
        realPosts: totalReal,
        phase,
        batch: SEED_BATCH,
      });
    }

    // ── archive: soft-archive seed content as real activity grows ──
    if (action === 'archive') {
      if (user.role !== 'admin') {
        return Response.json({ error: 'Admin only' }, { status: 403 });
      }

      // Check if enough real content exists to warrant archiving
      const realPosts = await base44.asServiceRole.entities.QuadPost.filter({
        is_seed_content: { $ne: true },
      });
      const realCount = (realPosts || []).length;

      if (realCount < 30) {
        return Response.json({
          status: 'insufficient_real_content',
          message: `Need at least 30 real posts before archiving seed content. Currently: ${realCount}`,
        });
      }

      // Archive (delete) oldest seed posts, keeping the most recent ones
      const seedPosts = await base44.asServiceRole.entities.QuadPost.filter({
        is_seed_content: true,
      }, 'created_date', 200);

      // Sort by created_date and archive the oldest half
      const sorted = (seedPosts || []).sort((a, b) => {
        return new Date(a.created_date || 0).getTime() - new Date(b.created_date || 0).getTime();
      });

      const toArchive = sorted.slice(0, Math.floor(sorted.length / 2));
      let archived = 0;
      for (const post of toArchive) {
        // Delete associated comments first
        const comments = await base44.asServiceRole.entities.QuadComment.filter({ post_id: post.id });
        for (const c of comments || []) {
          await base44.asServiceRole.entities.QuadComment.delete(c.id);
        }
        await base44.asServiceRole.entities.QuadPost.delete(post.id);
        archived++;
      }

      return Response.json({
        status: 'success',
        archived,
        remaining: sorted.length - archived,
        realPosts: realCount,
      });
    }

    return Response.json({ error: 'Unknown action. Use seed, clear, status, or archive.' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}