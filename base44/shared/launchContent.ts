/* ── Launch Content Engine ──
   Shared procedural content generation for seed scaling and live simulation.
   Used by both seedCampusFeed (bulk) and launchSimulation (incremental). */

export const SIM_AUTHORS = {
  student1: { name: "Adaeze Okonkwo", handle: "Computer Science · 300L", role: "student", verified: false },
  student2: { name: "Tunde Bello", handle: "Mechanical Engineering · 200L", role: "student", verified: false },
  student3: { name: "Fatima Ibrahim", handle: "Mass Communication · 400L", role: "student", verified: false },
  student4: { name: "Emeka Nwosu", handle: "Electrical Engineering · 500L", role: "student", verified: false },
  student5: { name: "Zainab Yusuf", handle: "Biochemistry · 300L", role: "student", verified: false },
  student6: { name: "Kunle Adebayo", handle: "Architecture · 400L", role: "student", verified: false },
  student7: { name: "Aisha Mohammed", handle: "Law · 500L", role: "student", verified: false },
  student8: { name: "David Okafor", handle: "Civil Engineering · 300L", role: "student", verified: false },
  student9: { name: "Blessing Eze", handle: "Economics · 200L", role: "student", verified: false },
  student10: { name: "Yusuf Aliyu", handle: "Medicine · 400L", role: "student", verified: false },
  student11: { name: "Chioma Obi", handle: "Microbiology · 200L", role: "student", verified: false },
  student12: { name: "Daniel Eyo", handle: "Chemical Engineering · 500L", role: "student", verified: false },
  student13: { name: "Ngozi Eze", handle: "Pharmacy · 300L", role: "student", verified: false },
  student14: { name: "Ibrahim Suleiman", handle: "Accounting · 400L", role: "student", verified: false },
  student15: { name: "Grace Adewale", handle: "Sociology · 200L", role: "student", verified: false },
  student16: { name: "Samuel Okon", handle: "Petroleum Engineering · 500L", role: "student", verified: false },
  student17: { name: "Halima Bello", handle: "Political Science · 300L", role: "student", verified: false },
  student18: { name: "Chukwuemeka Okafor", handle: "Mechanical Engineering · 400L", role: "student", verified: false },
  lecturer1: { name: "Dr. Aminu Sadiq", handle: "Computer Science · Faculty", role: "lecturer", verified: true },
  lecturer2: { name: "Prof. Grace Eze", handle: "Mathematics · Faculty", role: "lecturer", verified: true },
  lecturer3: { name: "Dr. Bola Adeyemi", handle: "Physics · Faculty", role: "lecturer", verified: true },
  devClub: { name: "Developers' Circle", handle: "Student Club · 240 members", role: "club", verified: false },
  debateSoc: { name: "Debate Society", handle: "Student Club · 85 members", role: "club", verified: false },
  photoClub: { name: "Lens & Light Photography", handle: "Student Club · 120 members", role: "club", verified: false },
  volunteerClub: { name: "Volunteers for Change", handle: "Student Club · 130 members", role: "club", verified: false },
  sug: { name: "Student Union Government", handle: "SUG · Official", role: "admin", verified: true },
  csDept: { name: "Department of Computer Science", handle: "Faculty of Science", role: "lecturer", verified: true },
};

export const POST_TEMPLATES = [
  // Academic
  { content: "Just finished my study session for {course}. {feeling} Anyone else grinding tonight? 📚", tags: ["#StudyLife","#StudentHustle"], type: "text", cats: ["academic","study"] },
  { content: "Reminder: {course} assignment is due this Friday! Don't forget to submit on time. 📝", tags: ["#Assignment","#Reminder"], type: "news", cats: ["academic","reminder"] },
  { content: "Pro tip: When studying for {course}, focus on understanding the concepts, not memorizing. It makes a huge difference in the exam! 🧠", tags: ["#StudyTips","#AcademicSuccess"], type: "discussion", cats: ["academic","study_tip"] },
  { content: "How is everyone finding {course} this semester? I'm enjoying it but the workload is no joke 😅", tags: ["#CourseDiscussion","#StudentLife"], type: "discussion", cats: ["academic","discussion"] },
  { content: "Study group at the library for {course} tomorrow {time}! All welcome. Let's crush this together 📚💪", tags: ["#StudyGroup","#LibraryLife"], type: "discussion", cats: ["academic","study_group"] },
  { content: "Just got my {course} test results back! {result} 🎉 Hard work pays off. Don't give up if you didn't do well — keep pushing!", tags: ["#TestResults","#AcademicJourney"], type: "achievement", cats: ["academic","achievement"] },
  { content: "Does anyone have good notes for {course}? Missed the last lecture and trying to catch up. Happy to share my other notes! 📝", tags: ["#NotesExchange","#HelpNeeded"], type: "question", cats: ["academic","question"] },
  { content: "Office hours with {lecturer} really helped clarify things today. Don't be afraid to ask questions — that's what they're there for! 🚪", tags: ["#OfficeHours","#AcademicTips"], type: "discussion", cats: ["academic","office_hours"] },

  // Campus life
  { content: "The cafeteria {food_item} today was actually really good! {food_reaction} 🍚 Who else tried it?", tags: ["#CampusEats","#FoodReview"], type: "discussion", cats: ["campus_life","food"] },
  { content: "NEPA just took the light again 😅 #CampusStruggles. Good thing I charged my power bank this morning!", tags: ["#NEPA","#CampusLife","#PowerStruggles"], type: "text", cats: ["campus_life","funny"] },
  { content: "Found the best study spot on campus: {study_spot}. Quiet, good Wi-Fi, and power outlets. You're welcome! 🤫📚", tags: ["#StudySpot","#HiddenGem","#CampusLife"], type: "text", cats: ["campus_life","study"] },
  { content: "Campus at {time_of_day} is {vibes_description}. Take a moment to appreciate it 📸", tags: ["#CampusLife","#Moments"], type: "text", cats: ["campus_life","photography"] },
  { content: "Roommate appreciation post: {roommate_compliment} 🤝 Hostel life is better with good roommates!", tags: ["#HostelLife","#RoommateLove"], type: "text", cats: ["campus_life","hostel"] },
  { content: "When the lecturer says 'the exam covers everything' but you've been absent for 3 classes 💀😂 #Relatable", tags: ["#ExamSeason","#Memes","#StudentStruggles"], type: "text", cats: ["campus_life","funny"] },
  { content: "Final year countdown: {days} days to graduation! 🎓 It's been an incredible journey. Cherish every moment, underclassmen!", tags: ["#FinalYear","#GraduationCountdown"], type: "text", cats: ["campus_life","graduation"] },

  // Social
  { content: "Shoutout to {club_name} for an amazing event today! {event_reaction} 🎉 This is what campus life is all about.", tags: ["#CampusLife","#Community","#Shoutout"], type: "text", cats: ["campus_life","community"] },
  { content: "Just met {number} new people at the networking event! Sometimes you just need to show up. 🤝✨", tags: ["#Networking","#CampusLife","#ShowUp"], type: "text", cats: ["campus_life","networking"] },
  { content: "Poll: What's the best food spot on campus? 🍜 Vote below!", tags: ["#CampusEats","#Poll","#Foodie"], type: "poll", cats: ["campus_life","food"] },
  { content: "Weekend plans: {weekend_plan}. What's everyone else up to? 🎉", tags: ["#WeekendVibes","#CampusLife"], type: "text", cats: ["campus_life","social"] },
  { content: "The sunset at the sports complex today was unreal 🌅 Had to stop and take it in. Moments like these make campus life special.", tags: ["#Sunset","#CampusBeauty","#Moments"], type: "text", cats: ["campus_life","photography"] },

  // Motivation & reflections
  { content: "Started the day at 6 AM with a study session. {motivation_quote} 💪 Keep pushing, everyone!", tags: ["#MorningGrind","#Motivation","#Consistency"], type: "text", cats: ["academic","motivation"] },
  { content: "Reminder: Your CGPA doesn't define your worth. Take care of yourself first. Mental health > grades. 💙", tags: ["#MentalHealth","#SelfCare","#Reminder"], type: "discussion", cats: ["academic","wellbeing"] },
  { content: "One year ago I was struggling with {struggle}. Today I {overcame}. Never give up on yourself. 🌟", tags: ["#Growth","#NeverGiveUp","#Motivation"], type: "text", cats: ["student","motivation"] },
  { content: "To every student feeling overwhelmed right now: Take a deep breath. You've survived 100% of your bad days. You've got this. 💪✨", tags: ["#Motivation","#StudentLife","#KeepGoing"], type: "text", cats: ["student","motivation"] },

  // Club updates
  { content: "{club_name} meeting this {day} at {time}! {meeting_detail} See you there! 🔥", tags: ["#ClubMeeting","#CampusLife"], type: "club_update", cats: ["club","meeting"] },
  { content: "New members welcome at {club_name}! No experience needed — just passion. DM to join! 🤝", tags: ["#JoinUs","#CampusClubs","#GetInvolved"], type: "club_update", cats: ["club","recruitment"] },

  // Questions
  { content: "Quick question: {question_content} Any advice would be appreciated! 🙏", tags: ["#NeedAdvice","#StudentCommunity"], type: "question", cats: ["student","question"] },
  { content: "Looking for a study partner for {course}! I study best with accountability. DM if interested! 📚🤝", tags: ["#StudyPartner","#Accountability"], type: "question", cats: ["student","study"] },
];

export const COMMENT_TEMPLATES = [
  "This is so helpful! Thank you for sharing 🙏",
  "Couldn't agree more! 💯",
  "Saving this for later 📌",
  "This is exactly what I needed to hear today!",
  "Spot on! Well said 👏",
  "Thanks for the reminder! ✅",
  "This made my day 😊",
  "100% agree. Everyone needs to see this!",
  "You're a lifesaver! 🙏",
  "Following this! Very interested",
  "Great point! Never thought about it that way",
  "This is gold! 🌟",
  "Needed to hear this today 💙",
  "I'm screenshotting this 😂📸",
  "So relatable! 😅",
  "Count me in! 🔥",
  "Definitely attending! 🎉",
  "This is why I love this campus community 🤝",
  "Appreciate you sharing this! 📚",
  "Bookmarked! Will definitely use this ✅",
  "Wow, this is inspiring! 🚀",
  "Thank you! This helped a lot",
  "I feel seen right now 😂",
  "This deserves more likes! 👍",
  "Sharing with my study group right now 📚",
];

export const NOTIFICATION_TEMPLATES = [
  { title: "New post from Adaeze Okonkwo", message: "Just finished my study session! Anyone else grinding tonight? 📚", type: "social", category: "social", priority: "low", link: "/quad" },
  { title: "Someone liked your post", message: "Your post about the campus sunset is getting attention! 🌅", type: "social", category: "social", priority: "low", link: "/quad" },
  { title: "New comment on your post", message: "Tunde Bello replied: 'This is so helpful! 🙏'", type: "comment", category: "social", priority: "normal", link: "/quad" },
  { title: "New message from Fatima Ibrahim", message: "Did you get the notes I sent? 📎", type: "message", category: "social", priority: "normal", link: "/messages" },
  { title: "Assignment reminder", message: "CSC 301 Assignment 2 is due in 3 days. Don't forget! 📝", type: "reminder", category: "assignment", priority: "high", link: "/assignments" },
  { title: "New event: Cultural Festival", message: "Cultural Festival 2026 is coming August 22nd! 🎭🇳🇬", type: "social", category: "campus", priority: "normal", link: "/events" },
  { title: "New story from Kunle", message: "Kunle posted: 'Golden hour at the sports complex 🌅'", type: "social", category: "social", priority: "low", link: "/social" },
  { title: "Club update: Developers' Circle", message: "React Workshop this Friday! Are you coming? 💻", type: "social", category: "community", priority: "normal", link: "/clubs" },
  { title: "Bud suggestion", message: "You have a free hour at 3 PM. Perfect time to review your CSC 301 notes! 📚", type: "bud", category: "bud", priority: "normal", link: "/bud" },
  { title: "New follower", message: "David Okafor started following you! 🤝", type: "social", category: "social", priority: "low", link: "/me" },
  { title: "Trending on campus", message: "The Career Fair is generating buzz! 847 students interested 🎯", type: "social", category: "campus", priority: "normal", link: "/events" },
  { title: "Scholarship deadline approaching", message: "MTN Foundation Scholarship closes August 30th! Apply now 🎓", type: "opportunity", category: "opportunity", priority: "high", link: "/scholarships" },
  { title: "Study group invitation", message: "You've been invited to join 'PHY 203 Exam Prep' 📚", type: "social", category: "study_group", priority: "normal", link: "/study-groups" },
  { title: "Achievement unlocked! 🎉", message: "You've studied 5 days in a row. Keep the streak going! 🔥", type: "achievement", category: "achievement", priority: "normal", link: "/me" },
  { title: "New marketplace listing", message: "New item: Scientific Calculator — Casio fx-991EX for ₦5,000", type: "social", category: "marketplace", priority: "low", link: "/marketplace" },
];

export const STORY_TEMPLATES = [
  { type: 'photo', content: "Library grind never stops 📚✨", hashtags: ["#StudyLife","#LibraryVibes"] },
  { type: 'photo', content: "Campus sunset is unreal today 🌅", hashtags: ["#CampusBeauty","#Sunset"] },
  { type: 'text', content: "When the lecturer says 'read chapters 1-12' 💀😂", hashtags: ["#Relatable","#ExamSeason"] },
  { type: 'photo', content: "Best jollof on campus? I think so 😋", hashtags: ["#CampusEats","#Foodie"] },
  { type: 'achievement', content: "Dean's List! CGPA 4.82 🌟 Hard work pays off!", hashtags: ["#DeansList","#AcademicExcellence"] },
  { type: 'study_session', content: "6 AM study gang! Who else is up? ☀️📚", hashtags: ["#6AMGang","#StudySession"] },
  { type: 'campus_moment', content: "Campus at night is magical ✨", hashtags: ["#CampusLife","#NightVibes"] },
  { type: 'photo', content: "Got the internship! 🎉 Never give up! 💻", hashtags: ["#Internship","#SuccessStory"] },
  { type: 'text', content: "Final year is humbling. But we move! 💪🎓", hashtags: ["#FinalYear","#GraduationCountdown"] },
  { type: 'photo', content: "Workshop life 🔧 Building something amazing", hashtags: ["#EngineeringLife","#BuildMode"] },
];

const FILL_DATA = {
  course: ["CSC 301","MTH 201","PHY 203","EEE 301","BIO 201","LAW 501","MEC 302","ECO 201","CHM 101","GST 201"],
  feeling: ["Feeling productive!","Brain is fried but we push.","Making good progress.","Finally understanding the concepts."],
  time: ["4 PM","6 AM","after class","evening","tomorrow morning","this weekend"],
  result: ["Scored 85%!","Got an A!","Passed with flying colors!","Above the class average!"],
  food_item: ["jollof rice","amala","suya","spaghetti","indomie"],
  food_reaction: ["Best I've had this semester","Honestly better than expected","10/10 would recommend","Chef's kiss"],
  study_spot: ["top floor of the old library","engineering block rooftop","the quiet corner in Science Block","the new study pods in the ICT building"],
  time_of_day: ["sunrise","golden hour","midnight","early morning"],
  vibes_description: ["peaceful in a way you can't describe","absolutely stunning","my favorite place","electric with student energy"],
  roommate_compliment: ["always has my back","makes the best midnight snacks","is the perfect study buddy","keeps the room clean and spirits high"],
  days: ["47","30","15","90","60"],
  club_name: ["Developers' Circle","Debate Society","Lens & Light Photography","Volunteers for Change","Music Society","Drama Club"],
  day: ["Friday","Wednesday","Thursday","Saturday"],
  meeting_detail: ["We'll be building a React app from scratch!","New members orientation!","Planning our next big event.","Workshop and project updates."],
  question_content: ["What's the best way to prepare for comprehensive exams?","Has anyone taken the CSC 415 elective? Is it worth it?","Where can I find past questions for MTH 201?","How do I join the entrepreneurship hub?"],
  lecturer: ["Dr. Sadiq","Prof. Eze","Dr. Adeyemi","Dr. Oduya"],
  number: ["3","5","2","4"],
  event_reaction: ["So well organized!","Learned so much!","Met incredible people!","Had a blast!"],
  weekend_plan: ["catching up on assignments","attending the career fair prep session","studying at the library","volunteering at the community outreach","preparing for midterms"],
  struggle: ["balancing academics and social life","time management","a difficult course","imposter syndrome"],
  overcame: ["made the Dean's List","finally understand the material","passed with flying colors","found my confidence"],
  motivation_quote: ["The early bird catches the worm","Discipline beats motivation","Small steps every day lead to big results","Your future self will thank you for the effort today"],
};

const IMG = (q: string) => `https://images.unsplash.com/${q}?w=600`;
export const STORY_IMAGES = [
  IMG('photo-1495616811223-4d98c6e9c869'), IMG('photo-1517649763962-0c623066013b'),
  IMG('photo-1456513080510-7bf3a84b82f8'), IMG('photo-1492684223066-81342ee5ff30'),
  IMG('photo-1523050854058-8df90110c9f1'), IMG('photo-1571263836787-6254c3a8a4f5'),
  IMG('photo-1488190211105-8b0e65b80b7e'), IMG('photo-1452587925148-ce544e77ee70'),
  IMG('photo-1503095396549-807759245b35'), IMG('photo-1431540015161-0bf868a2d407'),
  IMG('photo-1488521787991-ed7bbaae773c'), IMG('photo-1517466787929-bc90951d0974'),
  IMG('photo-1485827404703-89b55fcc595e'), IMG('photo-1521587760476-6c12a4b040da'),
];

const REACTION_TYPES = ['like', 'love', 'celebrate', 'insightful', 'funny'];

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[randInt(0, arr.length - 1)]; }

function fillTemplate(str: string): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => {
    const options = (FILL_DATA as any)[key];
    return options ? pick(options) : `{${key}}`;
  });
}

export function distributeReactions(total: number): Record<string, number> {
  const r: Record<string, number> = {}; let remaining = total;
  for (let i = 0; i < REACTION_TYPES.length && remaining > 0; i++) {
    const v = i === REACTION_TYPES.length - 1 ? remaining : Math.floor(Math.random() * (remaining + 1));
    if (v > 0) r[REACTION_TYPES[i]] = v;
    remaining -= v;
  }
  return r;
}

export function authorFields(key: string) {
  const a = (SIM_AUTHORS as any)[key] || SIM_AUTHORS.student1;
  return { author_name: a.name, author_handle: a.handle, author_role: a.role, is_verified: a.verified, author_image: a.image || '' };
}

export function generatePost(): any {
  const authorKeys = Object.keys(SIM_AUTHORS);
  const template = pick(POST_TEMPLATES);
  const content = fillTemplate(template.content);
  const likes = randInt(15, 180);
  const comments = Math.floor(likes * (0.15 + Math.random() * 0.2));
  const shares = Math.floor(likes * (0.05 + Math.random() * 0.1));
  return {
    ...authorFields(pick(authorKeys)),
    type: template.type,
    content,
    hashtags: template.tags,
    tags: template.cats,
    likes_count: likes,
    comments_count: comments,
    shares_count: shares,
    reactions: distributeReactions(likes),
    draft_status: 'published',
    visibility: 'campus',
    is_seed_content: true,
    seed_batch: 'launch_v1',
  };
}

export function generateComment(post: any): any {
  const studentKeys = ['student1','student2','student3','student4','student5','student6','student7','student8','student9','student10','student11','student12','student13','student14','student15'];
  return {
    ...authorFields(pick(studentKeys)),
    post_id: post.id,
    content: pick(COMMENT_TEMPLATES),
    likes_count: randInt(1, 20),
    is_seed_content: true,
    seed_batch: 'launch_v1',
  };
}

export function generateStory(): any {
  const studentKeys = ['student1','student2','student3','student4','student5','student6','student7','student8','student9','student10','student11','student12'];
  const template = pick(STORY_TEMPLATES);
  const post: any = {
    ...authorFields(pick(studentKeys)),
    ...template,
    views_count: randInt(50, 600),
    replies_count: randInt(3, 30),
    reactions: distributeReactions(randInt(10, 100)),
    status: 'active',
    university: 'University of Lagos',
    is_seed_content: true,
    seed_batch: 'launch_v1',
  };
  if (template.type === 'photo' || template.type === 'achievement' || template.type === 'study_session' || template.type === 'campus_moment') {
    post.media_url = pick(STORY_IMAGES);
  }
  if (template.type === 'text') {
    post.background_color = 'linear-gradient(135deg, #1a1a2e, #16213e)';
  }
  return post;
}

export function generateNotification(): any {
  return { ...pick(NOTIFICATION_TEMPLATES), is_read: Math.random() > 0.4, is_seed_content: true, seed_batch: 'launch_v1' };
}