import {
  Sparkles, FileText, HelpCircle, Timer, Layers, CalendarClock,
  Users, HeartHandshake, ClipboardList, Search, MapPin, Compass,
  FlaskConical, Briefcase, ShoppingBag, Languages, ScanLine, Upload,
  Mic, Brain, BookOpen, CalendarPlus, TrendingUp, MessageCircle,
  GraduationCap, Target, Award, BarChart3, Video, PenLine, Tag,
  Bookmark, Megaphone, UserPlus, Activity, Heart, Lightbulb,
  PlayCircle, ClipboardCheck, FileBarChart, Newspaper,
} from "lucide-react";

export const UNIVERSAL_QUICK_ACTIONS = [
  { label: "Summarize", type: "summarize", icon: FileText },
  { label: "Study With Me", prompt: "Start a 25-minute Pomodoro focus session with me. Keep me motivated and on track.", icon: Timer },
  { label: "Flashcards", prompt: "Help me create flashcards for what I'm currently studying. What topic are we covering?", icon: Layers },
  { label: "Voice Chat", type: "voice", icon: Mic },
];

const SCREEN_CONTEXTS = [
  {
    match: "/",
    exact: true,
    name: "Campus",
    description: "the campus home dashboard with today's schedule, announcements, weather, and academic overview",
    actions: [
      { label: "Organize Semester", prompt: "Help me organize my semester. Look at my timetable, assignments, exams, CGPA, opportunities, campus events, and study groups — then give me a complete personalized action plan.", icon: CalendarClock },
      { label: "Today's Classes", prompt: "What classes do I have today? Give me a quick overview of my schedule.", icon: CalendarClock },
      { label: "Campus Events", prompt: "What campus events are happening today or this week?", icon: CalendarPlus },
      { label: "My Timetable", prompt: "Show me my full timetable for this week.", icon: CalendarClock },
    ],
    suggestedPrompts: [
      "Help me organize my semester",
      "What should I focus on today?",
      "How's my academic progress?",
    ],
  },
  {
    match: "/campus",
    name: "Campus",
    description: "the academic workspace with today's timetable, assignment deadlines, GPA trends, upcoming exams, study streaks, research opportunities, and academic recommendations",
    actions: [
      { label: "Organize Semester", prompt: "Help me organize my semester. Look at my timetable, assignments, exams, CGPA, opportunities, campus events, and study groups — then give me a complete personalized action plan.", icon: CalendarClock },
      { label: "Overdue Assignments", prompt: "What assignments are overdue? Help me prioritize and catch up.", icon: ClipboardList },
      { label: "GPA Insights", prompt: "How is my GPA trending? What can I do to improve it?", icon: TrendingUp },
      { label: "Exam Prep", prompt: "Help me prepare for my upcoming exams. Create a revision plan.", icon: Brain },
    ],
    suggestedPrompts: [
      "Help me organize my semester",
      "What should I focus on today?",
      "Any overdue assignments?",
    ],
  },
  {
    match: "/square",
    name: "Square",
    description: "the social workspace with feed, stories, communities, live streams, podcasts, events, and creator content",
    actions: [
      { label: "Summarize Feed", prompt: "Summarize what's trending on the Square right now.", icon: FileText },
      { label: "Recommend Communities", prompt: "Recommend communities I should join based on my interests.", icon: Users },
      { label: "Create a Post", prompt: "Help me write an engaging post for the Square. What should I share?", icon: PenLine },
      { label: "Trending Topics", prompt: "What are the trending topics on campus right now?", icon: TrendingUp },
    ],
    suggestedPrompts: [
      "What's trending on campus?",
      "Help me write a post",
      "Which communities should I join?",
    ],
  },
  {
    match: "/quad",
    name: "Quad",
    description: "the campus social feed where students share posts, stories, and discussions",
    actions: [
      { label: "Summarize Feed", prompt: "Summarize what's trending on the Quad right now.", icon: FileText },
      { label: "Create a Post", prompt: "Help me write an engaging post for the Quad. What should I share?", icon: PenLine },
      { label: "Trending Topics", prompt: "What are the trending topics on campus right now?", icon: TrendingUp },
      { label: "Find Communities", prompt: "Recommend communities I should join based on my interests.", icon: Users },
    ],
    suggestedPrompts: [
      "What's trending on campus?",
      "Help me write a post",
      "Which communities should I join?",
    ],
  },
  {
    match: "/connect",
    name: "Connect",
    description: "the communication workspace with messages, calls, team collaboration, study groups, and presence",
    actions: [
      { label: "Summarize Chats", prompt: "Summarize my recent conversations and highlight what needs my attention.", icon: FileText },
      { label: "Draft Reply", prompt: "Help me draft a reply to my most recent conversation.", icon: PenLine },
      { label: "Unread Priorities", prompt: "Which unread messages are most important right now?", icon: ClipboardList },
      { label: "Find Study Group", prompt: "Find study groups that match my courses and schedule.", icon: Users },
    ],
    suggestedPrompts: [
      "Summarize my conversations",
      "What needs my attention?",
      "Find me a study group",
    ],
  },
  {
    match: "/library",
    name: "Library",
    description: "the digital library with books, journals, lecture notes, and past questions",
    actions: [
      { label: "Search Books", prompt: "Help me find books and resources for my courses.", icon: Search },
      { label: "Summarize PDF", prompt: "I have a PDF I'd like you to summarize. Let me upload it.", icon: Upload },
      { label: "Recommend Reading", prompt: "Recommend reading materials based on my courses and interests.", icon: BookOpen },
      { label: "Cite Sources", prompt: "Help me generate citations for my assignment in APA format.", icon: ClipboardList },
    ],
    suggestedPrompts: [
      "Find books for my courses",
      "Summarize a PDF for me",
      "Help me cite my sources",
    ],
  },
  {
    match: "/live",
    name: "Live",
    description: "live and recorded classes, lectures, and study sessions",
    actions: [
      { label: "Join Class", prompt: "What live classes are happening now or coming up soon?", icon: Video },
      { label: "Summarize Lecture", prompt: "Summarize the key points from my last lecture.", icon: FileText },
      { label: "Revision Questions", prompt: "Create revision questions from my recent lectures.", icon: Brain },
      { label: "Take Notes", prompt: "Help me take organized notes for my current class.", icon: PenLine },
    ],
    suggestedPrompts: [
      "Summarize my last lecture",
      "Create revision questions",
      "What classes are live now?",
    ],
  },
  {
    match: "/me",
    name: "Me",
    description: "your profile, academic progress, achievements, and personal settings",
    actions: [
      { label: "Update Profile", prompt: "Help me update my profile information. What should I add?", icon: UserPlus },
      { label: "My Achievements", prompt: "Review my achievements and suggest new goals to aim for.", icon: Award },
      { label: "Academic Insights", prompt: "Give me insights into my academic performance and trends.", icon: BarChart3 },
      { label: "Recommend Goals", prompt: "What goals should I set for this semester based on my progress?", icon: Target },
    ],
    suggestedPrompts: [
      "How am I doing academically?",
      "What goals should I set?",
      "Review my achievements",
    ],
  },
  {
    match: "/academics/report",
    name: "Academics Summary Report",
    description: "the Academics Summary Report — a full semester report of GPA, study streaks, attendance, assignment completion, goals, deadlines, strengths and areas needing improvement, all computed from the student's real academic records",
    actions: [
      { label: "What improved my GPA?", prompt: "Based on my Academics Summary Report, what improved my GPA this semester?", icon: TrendingUp },
      { label: "Why streak reset", prompt: "Based on my report, why did my study streak reset?", icon: Timer },
      { label: "What to study next", prompt: "Based on my report, what should I study next?", icon: Brain },
      { label: "Reach 4.5 GPA", prompt: "Based on my report, how can I reach a 4.5 GPA?", icon: Target },
    ],
    suggestedPrompts: [
      "What improved my GPA?",
      "What should I study next?",
      "How can I reach a 4.5 GPA?",
    ],
  },
  {
    match: "/academics",
    name: "Academics",
    description: "your academic dashboard with courses, assignments, grades, and study goals",
    actions: [
      { label: "Organize Semester", prompt: "Help me organize my semester. Look at my timetable, assignments, exams, CGPA, opportunities, campus events, and study groups — then give me a complete personalized action plan.", icon: CalendarClock },
      { label: "Check Assignments", prompt: "What assignments are due soon? Help me prioritize.", icon: ClipboardList },
      { label: "Exam Prep", prompt: "Help me prepare for my upcoming exams. Create a revision plan.", icon: Brain },
      { label: "Track Grades", prompt: "Help me track my grades and project my GPA.", icon: BarChart3 },
    ],
    suggestedPrompts: [
      "Help me organize my semester",
      "What's due this week?",
      "How's my GPA trending?",
    ],
  },
  {
    match: "/marketplace",
    name: "Marketplace",
    description: "the campus marketplace for buying, selling, and finding items",
    actions: [
      { label: "Search Listings", prompt: "Help me find items on the campus marketplace.", icon: Search },
      { label: "Sell an Item", prompt: "Help me create a listing to sell an item. What should I include?", icon: Tag },
      { label: "Saved Items", prompt: "What items have I saved on the marketplace?", icon: Bookmark },
      { label: "Price Guide", prompt: "What's a fair price for my item on the campus marketplace?", icon: ShoppingBag },
    ],
    suggestedPrompts: [
      "Help me sell something",
      "Find textbooks for sale",
      "What's a fair price?",
    ],
  },
  {
    match: "/calendar",
    name: "Calendar",
    description: "your calendar with classes, exams, deadlines, and events",
    actions: [
      { label: "View Timetable", prompt: "Show me my timetable for this week.", icon: CalendarClock },
      { label: "Upcoming Deadlines", prompt: "What deadlines do I have coming up? Help me prioritize.", icon: ClipboardList },
      { label: "Exam Schedule", prompt: "When are my exams scheduled? Help me plan revision.", icon: Brain },
      { label: "Add Event", prompt: "Help me add an event to my calendar.", icon: CalendarPlus },
    ],
    suggestedPrompts: [
      "What's on my calendar today?",
      "When is my next exam?",
      "What deadlines are coming up?",
    ],
  },
  {
    match: "/mentorship",
    name: "Mentorship",
    description: "discover mentors, schedule sessions, and track your mentoring relationships",
    actions: [
      { label: "Find Mentor", prompt: "Find mentors that match my goals and interests.", icon: HeartHandshake },
      { label: "Schedule Session", prompt: "Help me schedule a mentoring session.", icon: CalendarPlus },
      { label: "Mentor Advice", prompt: "What questions should I ask my mentor in our next session?", icon: HelpCircle },
      { label: "Career Guidance", prompt: "Give me career guidance based on my profile and goals.", icon: Briefcase },
    ],
    suggestedPrompts: [
      "Find me a mentor",
      "What should I ask my mentor?",
      "Help me prepare for a mentoring session",
    ],
  },
  {
    match: "/study-groups",
    name: "Study Groups",
    description: "discover and join study groups, or create your own",
    actions: [
      { label: "Find Study Group", prompt: "Find study groups that match my courses and schedule.", icon: Users },
      { label: "Create Group", prompt: "Help me create a study group for my course.", icon: UserPlus },
      { label: "Study Session", prompt: "Start a focus study session with me. Keep me on track.", icon: Timer },
      { label: "Group Tasks", prompt: "What tasks does my study group have? Help me organize them.", icon: ClipboardList },
    ],
    suggestedPrompts: [
      "Find a study group",
      "Start a study session",
      "Help me organize my group",
    ],
  },
  {
    match: "/scholarships",
    name: "Scholarships",
    description: "discover scholarships, grants, and funding opportunities",
    actions: [
      { label: "Find Scholarships", prompt: "Find scholarships I'm eligible for based on my profile.", icon: Compass },
      { label: "Track Applications", prompt: "Help me track my scholarship applications and deadlines.", icon: ClipboardList },
      { label: "Application Help", prompt: "Help me write a strong scholarship application essay.", icon: PenLine },
      { label: "Deadlines", prompt: "What scholarship deadlines are coming up soon?", icon: CalendarClock },
    ],
    suggestedPrompts: [
      "What scholarships am I eligible for?",
      "Help me with my application",
      "What deadlines are coming up?",
    ],
  },
  {
    match: "/research",
    name: "Research",
    description: "discover research projects, publications, and collaboration opportunities",
    actions: [
      { label: "Find Papers", prompt: "Help me find research papers relevant to my field of study.", icon: Search },
      { label: "Citation Help", prompt: "Help me manage my citations and references.", icon: ClipboardList },
      { label: "Project Ideas", prompt: "Suggest research project ideas based on my interests.", icon: Lightbulb },
      { label: "Writing Help", prompt: "Help me improve my academic writing.", icon: PenLine },
    ],
    suggestedPrompts: [
      "Find relevant research papers",
      "Help me with citations",
      "Suggest research topics",
    ],
  },
  {
    match: "/career",
    name: "Career Hub",
    description: "career opportunities, CV building, interview prep, and professional development",
    actions: [
      { label: "Review CV", prompt: "Review my CV and suggest improvements.", icon: FileText },
      { label: "Interview Prep", prompt: "Help me prepare for a job interview. Practice some questions.", icon: HelpCircle },
      { label: "Find Jobs", prompt: "Find job opportunities matching my profile and goals.", icon: Briefcase },
      { label: "Career Plan", prompt: "Help me plan my career path step by step.", icon: Target },
    ],
    suggestedPrompts: [
      "Review my CV",
      "Practice interview questions",
      "What jobs match my profile?",
    ],
  },
  {
    match: "/events",
    name: "Campus Events",
    description: "discover and RSVP to campus events, fairs, workshops, and gatherings",
    actions: [
      { label: "Today's Events", prompt: "What campus events are happening today?", icon: CalendarPlus },
      { label: "This Week", prompt: "What events are happening this week?", icon: CalendarClock },
      { label: "Recommend", prompt: "Which events should I attend based on my interests?", icon: ClipboardCheck },
      { label: "Directions", prompt: "How do I get to today's event venue?", icon: MapPin },
    ],
    suggestedPrompts: [
      "What events are on today?",
      "Which events should I attend?",
      "How do I get to the venue?",
    ],
  },
  {
    match: "/notifications",
    name: "Notifications",
    description: "your notification center with alerts, reminders, and updates",
    actions: [
      { label: "Summarize", prompt: "Summarize my recent notifications and tell me what's most important.", icon: FileText },
      { label: "Priority", prompt: "Which notifications should I prioritize right now?", icon: ClipboardList },
      { label: "Deadlines", prompt: "What deadlines are coming up from my notifications?", icon: CalendarClock },
      { label: "Dismiss Old", prompt: "Which notifications can I safely dismiss?", icon: HelpCircle },
    ],
    suggestedPrompts: [
      "What did I miss?",
      "What's most important?",
      "Any urgent deadlines?",
    ],
  },
  {
    match: "/wellbeing",
    name: "Wellbeing",
    description: "your wellness hub with mood tracking, journaling, and mental health support",
    actions: [
      { label: "Wellness Check", prompt: "Give me a quick wellness check-in. How am I doing?", icon: Heart },
      { label: "Journal", prompt: "Help me write a journal entry about how I'm feeling today.", icon: PenLine },
      { label: "Stress Relief", prompt: "I'm feeling stressed. Help me manage it with some techniques.", icon: Heart },
      { label: "Resources", prompt: "What wellness resources are available to me on campus?", icon: Lightbulb },
    ],
    suggestedPrompts: [
      "I'm feeling overwhelmed",
      "Help me manage stress",
      "What wellness resources do I have?",
    ],
  },
  {
    match: "/communities",
    name: "Communities",
    description: "discover and join campus communities, departments, and interest groups",
    actions: [
      { label: "Recommend", prompt: "Recommend communities I should join based on my interests.", icon: Users },
      { label: "My Communities", prompt: "What communities am I a part of?", icon: MessageCircle },
      { label: "Create", prompt: "Help me create a new community. What should I set up?", icon: UserPlus },
      { label: "Trending", prompt: "What communities are trending on campus right now?", icon: TrendingUp },
    ],
    suggestedPrompts: [
      "Which communities should I join?",
      "What's trending in communities?",
      "Help me create a community",
    ],
  },
  {
    match: "/clubs",
    name: "Clubs",
    description: "discover and join student clubs and societies",
    actions: [
      { label: "Recommend Clubs", prompt: "Recommend clubs I should join based on my interests.", icon: Users },
      { label: "My Clubs", prompt: "What clubs am I a member of?", icon: MessageCircle },
      { label: "Recruiting", prompt: "Which clubs are currently recruiting new members?", icon: UserPlus },
      { label: "Start a Club", prompt: "How do I start a new club on campus?", icon: Lightbulb },
    ],
    suggestedPrompts: [
      "Which clubs should I join?",
      "What clubs are recruiting?",
      "How do I start a club?",
    ],
  },
  {
    match: "/assignments",
    name: "Assignments",
    description: "your assignments tracker with deadlines and submission status",
    actions: [
      { label: "What's Due", prompt: "What assignments are due soon? Help me prioritize.", icon: ClipboardList },
      { label: "Plan Workload", prompt: "Help me balance my assignment workload across courses.", icon: CalendarClock },
      { label: "Start Assignment", prompt: "Help me get started on my next assignment.", icon: PenLine },
      { label: "Check Progress", prompt: "How am I progressing on my assignments?", icon: BarChart3 },
    ],
    suggestedPrompts: [
      "What's due this week?",
      "Help me balance my workload",
      "Where should I start?",
    ],
  },
  {
    match: "/discover",
    name: "Discover",
    description: "discover campus activities, opportunities, and trending content",
    actions: [
      { label: "Trending", prompt: "What's trending on campus right now?", icon: TrendingUp },
      { label: "Opportunities", prompt: "What opportunities should I explore?", icon: Compass },
      { label: "Events", prompt: "What campus events should I attend?", icon: CalendarPlus },
      { label: "Explore", prompt: "Help me discover new things to get involved in.", icon: Sparkles },
    ],
    suggestedPrompts: [
      "What's trending?",
      "What opportunities are available?",
      "What should I get involved in?",
    ],
  },
  {
    match: "/shorts",
    name: "Shorts",
    description: "short educational videos from campus creators",
    actions: [
      { label: "Summarize", prompt: "Summarize the key points from the short video I'm watching.", icon: FileText },
      { label: "Explain Topic", prompt: "Explain the topic covered in this video in more detail.", icon: HelpCircle },
      { label: "Flashcards", prompt: "Create flashcards from the concepts in this video.", icon: Layers },
      { label: "Related", prompt: "Find more content related to what I'm watching.", icon: Search },
    ],
    suggestedPrompts: [
      "Summarize this video",
      "Explain this topic more",
      "Create flashcards from this",
    ],
  },
  {
    match: "/portal",
    name: "Operations Portal",
    description: "the administrative operations center for managing your university or platform",
    actions: [
      { label: "Dashboard Summary", prompt: "Give me a summary of what's happening across the platform right now.", icon: Activity },
      { label: "Announcements", prompt: "Help me draft an announcement for students.", icon: Megaphone },
      { label: "Reports", prompt: "What reports should I review today?", icon: FileBarChart },
      { label: "System Health", prompt: "How is the system performing? Any issues to address?", icon: Activity },
    ],
    suggestedPrompts: [
      "Give me a platform overview",
      "Help me draft an announcement",
      "What needs my attention today?",
    ],
  },
];

const DEFAULT_CONTEXT = {
  name: "UNIBUD",
  description: "the UNIBUD platform",
  actions: [
    { label: "Organize Semester", prompt: "Help me organize my semester. Look at my timetable, assignments, exams, CGPA, opportunities, campus events, and study groups — then give me a complete personalized action plan.", icon: CalendarClock },
    { label: "Study With Me", prompt: "Start a 25-minute Pomodoro focus session with me.", icon: Timer },
    { label: "Build Study Plan", prompt: "Build me a study plan for this week.", icon: CalendarClock },
    { label: "Find Opportunities", prompt: "Find scholarships and internships I might be eligible for.", icon: Compass },
  ],
  suggestedPrompts: [
    "Help me organize my semester",
    "What should I focus on today?",
    "Find me opportunities",
  ],
};

export function getScreenContext(pathname) {
  for (const ctx of SCREEN_CONTEXTS) {
    if (ctx.exact) {
      if (pathname === ctx.match) return ctx;
    } else {
      if (pathname.startsWith(ctx.match)) return ctx;
    }
  }
  return DEFAULT_CONTEXT;
}