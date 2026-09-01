// Future Student configuration — education levels, exam statuses, and guided pathways

export const EDUCATION_LEVELS = [
  {
    value: "secondary_school",
    label: "Secondary School Student",
    short: "SS Student",
    description: "Currently in secondary school, exploring university options",
    icon: "School",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    value: "waec_candidate",
    label: "WAEC Candidate",
    short: "WAEC",
    description: "Preparing for or registered for WAEC examinations",
    icon: "FileText",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    value: "neco_candidate",
    label: "NECO Candidate",
    short: "NECO",
    description: "Preparing for or registered for NECO examinations",
    icon: "ClipboardCheck",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    value: "jamb_candidate",
    label: "JAMB Candidate",
    short: "JAMB",
    description: "Preparing for or registered for JAMB/UTME",
    icon: "PenTool",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    value: "a_level",
    label: "A-Level Student",
    short: "A-Level",
    description: "Enrolled in A-Level, IJMB, or foundation programme",
    icon: "BookOpen",
    color: "text-purple",
    bg: "bg-purple/10",
  },
  {
    value: "transfer",
    label: "Transfer Student",
    short: "Transfer",
    description: "Transferring from another university or institution",
    icon: "ArrowLeftRight",
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    value: "direct_entry",
    label: "Direct Entry Applicant",
    short: "Direct Entry",
    description: "Applying via direct entry with prior qualifications",
    icon: "LogIn",
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

export const EXAM_STATUSES = [
  { value: "preparing", label: "Preparing", description: "Studying for upcoming exams" },
  { value: "registered", label: "Registered", description: "Exam registration confirmed" },
  { value: "completed", label: "Completed", description: "Exams written, awaiting results" },
  { value: "awaiting_result", label: "Awaiting Results", description: "Results pending" },
  { value: "admitted", label: "Admitted", description: "Offered admission — ready to transition" },
];

// Recommended next steps based on education level
export function getNextSteps(educationLevel, examStatus) {
  const steps = [];

  if (educationLevel === "secondary_school") {
    steps.push(
      "Explore universities and find the ones that match your interests",
      "Learn about different faculties and departments",
      "Start building strong study habits early",
      "Connect with student mentors who can share their university experience",
    );
  }

  if (educationLevel === "waec_candidate" || educationLevel === "neco_candidate") {
    steps.push(
      "Focus on your O-Level subjects — they determine your eligibility",
      "Practice with past WAEC/NECO questions",
      "Take mock examinations to build confidence",
      "Research subject combinations required for your target course",
    );
  }

  if (educationLevel === "jamb_candidate") {
    steps.push(
      "Study consistently for JAMB using practice questions and mock exams",
      "Understand the JAMB subject combination for your chosen course",
      "Set a target JAMB score based on your university's cut-off",
      "Prepare for post-UTME screening where applicable",
    );
  }

  if (educationLevel === "a_level") {
    steps.push(
      "Focus on your A-Level subjects relevant to your target degree",
      "Understand IJMB/JUPEB direct entry requirements",
      "Research universities that accept your programme",
      "Connect with mentors in your target department",
    );
  }

  if (educationLevel === "transfer") {
    steps.push(
      "Gather your transcripts and academic records",
      "Research transfer policies at your target universities",
      "Understand credit transfer and course equivalences",
      "Connect with students who have transferred before",
    );
  }

  if (educationLevel === "direct_entry") {
    steps.push(
      "Verify your qualifications meet direct entry requirements",
      "Prepare your application documents",
      "Research universities offering your programme at 200L entry",
      "Connect with mentors who entered via direct entry",
    );
  }

  if (examStatus === "awaiting_result") {
    steps.push("Explore scholarship opportunities you can apply for once results are out");
    steps.push("Research campus life and traditions at your target universities");
  }

  if (examStatus === "admitted") {
    steps.push("Set up your matriculation number once you receive it");
    steps.push("Transition your account to a full student account");
    steps.push("Start exploring campus communities and study groups");
  }

  return steps;
}

// Pre-university content categories available to future students
export const FUTURE_STUDENT_CATEGORIES = [
  {
    id: "prep_courses",
    label: "Preparation Courses",
    description: "University-readiness courses to get you ahead",
    icon: "GraduationCap",
    color: "text-primary",
    bg: "bg-primary/10",
    available: true,
  },
  {
    id: "live_classes",
    label: "Live Online Classes",
    description: "Join live revision and prep classes",
    icon: "Video",
    color: "text-purple",
    bg: "bg-purple/10",
    available: true,
  },
  {
    id: "recorded_lessons",
    label: "Recorded Lessons",
    description: "Learn at your own pace with recorded content",
    icon: "PlayCircle",
    color: "text-info",
    bg: "bg-info/10",
    available: true,
  },
  {
    id: "practice_questions",
    label: "Practice Questions",
    description: "Test your knowledge with past questions",
    icon: "FileQuestion",
    color: "text-success",
    bg: "bg-success/10",
    available: true,
  },
  {
    id: "mock_exams",
    label: "Mock Examinations",
    description: "Simulate real exam conditions",
    icon: "ClipboardCheck",
    color: "text-warning",
    bg: "bg-warning/10",
    available: true,
  },
  {
    id: "study_groups",
    label: "Study Groups",
    description: "Study with peers preparing for the same exams",
    icon: "Users",
    color: "text-info",
    bg: "bg-info/10",
    available: true,
  },
  {
    id: "communities",
    label: "Discussion Communities",
    description: "Ask questions and share with fellow future students",
    icon: "MessageCircle",
    color: "text-primary",
    bg: "bg-primary/10",
    available: true,
  },
  {
    id: "mentorship",
    label: "Mentorship",
    description: "Learn from verified university students",
    icon: "HeartHandshake",
    color: "text-error",
    bg: "bg-error/10",
    available: true,
  },
  {
    id: "career_exploration",
    label: "Career Exploration",
    description: "Discover paths before you choose",
    icon: "Compass",
    color: "text-success",
    bg: "bg-success/10",
    available: true,
  },
  {
    id: "scholarships",
    label: "Scholarship Opportunities",
    description: "Find funding for your education",
    icon: "Award",
    color: "text-warning",
    bg: "bg-warning/10",
    available: true,
  },
  {
    id: "admission_guides",
    label: "Admission Guides",
    description: "Step-by-step guides to university admission",
    icon: "BookMarked",
    color: "text-info",
    bg: "bg-info/10",
    available: true,
  },
  {
    id: "campus_tours",
    label: "Campus Tours",
    description: "Explore campuses virtually before you arrive",
    icon: "MapPin",
    color: "text-purple",
    bg: "bg-purple/10",
    available: true,
  },
  {
    id: "university_comparison",
    label: "University Comparisons",
    description: "Compare universities side by side",
    icon: "Columns3",
    color: "text-primary",
    bg: "bg-primary/10",
    available: true,
  },
  {
    id: "faculty_info",
    label: "Faculty & Department Info",
    description: "Understand what each faculty offers",
    icon: "Building2",
    color: "text-info",
    bg: "bg-info/10",
    available: true,
  },
  {
    id: "student_stories",
    label: "Student Stories",
    description: "Real experiences from current students",
    icon: "Star",
    color: "text-warning",
    bg: "bg-warning/10",
    available: true,
  },
  {
    id: "campus_traditions",
    label: "Campus Traditions",
    description: "Discover the culture that makes each university unique",
    icon: "Sparkles",
    color: "text-purple",
    bg: "bg-purple/10",
    available: true,
  },
  {
    id: "study_habits",
    label: "Study Habits",
    description: "Build the habits that lead to success",
    icon: "Brain",
    color: "text-success",
    bg: "bg-success/10",
    available: true,
  },
  {
    id: "time_management",
    label: "Time Management",
    description: "Master your schedule before university",
    icon: "Clock",
    color: "text-info",
    bg: "bg-info/10",
    available: true,
  },
  {
    id: "survival_tips",
    label: "University Survival Tips",
    description: "Everything they don't tell you about uni life",
    icon: "Lightbulb",
    color: "text-warning",
    bg: "bg-warning/10",
    available: true,
  },
];

export function getEducationLevel(value) {
  return EDUCATION_LEVELS.find((e) => e.value === value);
}

export function getExamStatus(value) {
  return EXAM_STATUSES.find((e) => e.value === value);
}

export function isFutureStudent(user) {
  return user?.user_type === "future_student";
}