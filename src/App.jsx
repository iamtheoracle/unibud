import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { PlatformProvider } from '@/lib/platform/PlatformProvider';
import { DemoModeProvider } from '@/lib/DemoModeContext';
import { ExperienceProvider } from '@/lib/ExperienceContext';
import ScrollToTop from './components/ScrollToTop';
import AppShell from '@/components/layout/AppShell';
import RouteLoading from '@/components/RouteLoading';
import PageNotFound from '@/lib/PageNotFound';

// Milestone 1 — Foundation
const Splash = lazy(() => import("@/pages/Splash"));
const Welcome = lazy(() => import("@/pages/Welcome"));
const Register = lazy(() => import("@/pages/Register"));
const Login = lazy(() => import("@/pages/Login"));
const MeetBud = lazy(() => import("@/pages/MeetBud"));
const ModeSelector = lazy(() => import("@/pages/ModeSelector"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));

// Milestone 2 — Student Home (Campus)
const Home = lazy(() => import("@/pages/Home"));
const BudHome = lazy(() => import("@/pages/bud/BudHome"));
const SocialHub = lazy(() => import("@/pages/social/SocialHub"));
const Me = lazy(() => import("@/pages/Me"));

// Social Ecosystem
const Quad = lazy(() => import("@/pages/Quad"));
const Connect = lazy(() => import("@/pages/Connect"));
const Services = lazy(() => import("@/pages/Services"));
const Shorts = lazy(() => import("@/pages/Shorts"));
const Podcasts = lazy(() => import("@/pages/podcasts/Podcasts"));
const PodcastShow = lazy(() => import("@/pages/podcasts/PodcastShow"));
const CreatorStudio = lazy(() => import("@/pages/creator/CreatorStudio"));
const Messages = lazy(() => import("@/pages/Messages"));
const Communities = lazy(() => import("@/pages/Communities"));
const CommunityDetail = lazy(() => import("@/pages/CommunityDetail"));
const Clubs = lazy(() => import("@/pages/Clubs"));
const Marketplace = lazy(() => import("@/pages/Marketplace"));
const LostFound = lazy(() => import("@/pages/LostFound"));
const Discover = lazy(() => import("@/pages/Discover"));
const Lens = lazy(() => import("@/pages/Lens"));
const Square = lazy(() => import("@/pages/Square"));
const CampusHub = lazy(() => import("@/pages/campus/CampusHub"));
const AcademicHub = lazy(() => import("@/pages/academics/AcademicHub"));
const Results = lazy(() => import("@/pages/academics/Results"));
const SummaryReport = lazy(() => import("@/pages/academics/SummaryReport"));
const CommunicationHub = lazy(() => import("@/pages/communication/CommunicationHub"));
const SmartAttendance = lazy(() => import("@/pages/attendance/SmartAttendance"));
const Following = lazy(() => import("@/pages/discovery/Following"));
const Friends = lazy(() => import("@/pages/social/Friends"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const CampusEvents = lazy(() => import("@/pages/CampusEvents"));
const StudyGroups = lazy(() => import("@/pages/StudyGroups"));
const StudyGroupDetail = lazy(() => import("@/pages/StudyGroupDetail"));
const Mentorship = lazy(() => import("@/pages/Mentorship"));
const MentorProfile = lazy(() => import("@/pages/MentorProfile"));

// Professional Hub
const Opportunities = lazy(() => import("@/pages/Opportunities"));
const Scholarships = lazy(() => import("@/pages/Scholarships"));
const ResearchHub = lazy(() => import("@/pages/ResearchHub"));
const CareerHub = lazy(() => import("@/pages/CareerHub"));
const Companies = lazy(() => import("@/pages/Companies"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const CVBuilder = lazy(() => import("@/pages/CVBuilder"));
const Challenges = lazy(() => import("@/pages/Challenges"));
const StudentGovernment = lazy(() => import("@/pages/StudentGovernment"));
const StudentSupport = lazy(() => import("@/pages/StudentSupport"));

// Milestone 5 — Academic Management
const Courses = lazy(() => import("@/pages/academics/Courses"));
const CourseSpace = lazy(() => import("@/pages/academics/CourseSpace"));
const UnifiedAgenda = lazy(() => import("@/pages/academics/UnifiedAgenda"));
const Weather = lazy(() => import("@/pages/Weather"));
const AcademicTimeline = lazy(() => import("@/pages/identity/AcademicTimeline"));
const Timetable = lazy(() => import("@/pages/academics/Timetable"));
const Calendar = lazy(() => import("@/pages/academics/Calendar"));
const Assignments = lazy(() => import("@/pages/academics/Assignments"));
const Projects = lazy(() => import("@/pages/academics/Projects"));
const Exams = lazy(() => import("@/pages/academics/Exams"));
const Attendance = lazy(() => import("@/pages/academics/Attendance"));
const Notes = lazy(() => import("@/pages/academics/Notes"));
const OfficeHours = lazy(() => import("@/pages/academics/OfficeHours"));
const StudySessions = lazy(() => import("@/pages/academics/StudySessions"));

// Milestone 6 — Study Suite
const StudySuite = lazy(() => import("@/pages/study/StudySuite"));
const StudyHome = lazy(() => import("@/pages/study/StudyHome"));
const StudyPlanner = lazy(() => import("@/pages/study/StudyPlanner"));
const LearningPaths = lazy(() => import("@/pages/study/LearningPaths"));
const AssignmentAssistant = lazy(() => import("@/pages/study/AssignmentAssistant"));
const ProjectAssistant = lazy(() => import("@/pages/study/ProjectAssistant"));
const SmartNotes = lazy(() => import("@/pages/study/SmartNotes"));
const ResearchAssistant = lazy(() => import("@/pages/study/ResearchAssistant"));
const ExamPreparation = lazy(() => import("@/pages/study/ExamPreparation"));
const Flashcards = lazy(() => import("@/pages/study/Flashcards"));
const PracticeTests = lazy(() => import("@/pages/study/PracticeTests"));
const CitationManager = lazy(() => import("@/pages/study/CitationManager"));
const DocumentLibrary = lazy(() => import("@/pages/study/DocumentLibrary"));

// Milestone 8 — Multi-tenancy
const InstitutionOnboarding = lazy(() => import("@/pages/institution/InstitutionOnboarding"));
const UniversityDirectory = lazy(() => import("@/pages/onboarding/UniversityDirectory"));

// Conversational Onboarding + Bud Recast
const OnboardingConversation = lazy(() => import("@/pages/onboarding/OnboardingConversation"));
const OnboardingSecurity = lazy(() => import("@/pages/onboarding/OnboardingSecurity"));
const OnboardingPreparing = lazy(() => import("@/pages/onboarding/OnboardingPreparing"));
const Recast = lazy(() => import("@/pages/recast/Recast"));
const InstitutionPortal = lazy(() => import("@/pages/institution/InstitutionPortal"));

// Milestone 9 — Lecturer & Parent Portals
const LecturerPortal = lazy(() => import("@/pages/lecturer/LecturerPortal"));
const ParentPortal = lazy(() => import("@/pages/parent/ParentPortal"));

// Examination Platform
const ExamHub = lazy(() => import("@/pages/exam/ExamHub"));
const ExamStart = lazy(() => import("@/pages/exam/ExamStart"));
const ExamTaker = lazy(() => import("@/pages/exam/ExamTaker"));
const ExamResult = lazy(() => import("@/pages/exam/ExamResult"));
const ExamAnalytics = lazy(() => import("@/pages/exam/ExamAnalytics"));
const ExamCoach = lazy(() => import("@/pages/exam/ExamCoach"));
const ExamAuthor = lazy(() => import("@/pages/exam/ExamAuthor"));

// Milestone 39 — Smart Classroom
const LiveClassroom = lazy(() => import("@/pages/classroom/LiveClassroom"));

// Milestone 40 — Smart Notifications
const SmartNotifications = lazy(() => import("@/pages/notifications/SmartNotifications"));
const BudNotificationPreferences = lazy(() => import("@/pages/notifications/BudNotificationPreferences"));

// Milestone 42 — Unified Knowledge & File Intelligence
const KnowledgeHub = lazy(() => import("@/pages/knowledge/KnowledgeHub"));

// Milestone 44 — Smart Collaboration & Productivity
const CollaborationHub = lazy(() => import("@/pages/collaboration/CollaborationHub"));
const WorkspaceDetail = lazy(() => import("@/pages/collaboration/WorkspaceDetail"));

// Milestone 45 — Spark Task Management
const TaskHub = lazy(() => import("@/pages/tasks/TaskHub"));
const TaskDetail = lazy(() => import("@/pages/tasks/TaskDetail"));

// Oracle — Platform Operating Center
const Oracle = lazy(() => import("@/pages/oracle/Oracle"));

// Management — Institution Operational Headquarters
const Management = lazy(() => import("@/pages/management/Management"));

// Operator — Execution Workspace
const Operator = lazy(() => import("@/pages/operator/Operator"));

// Financial Platform
const Finance = lazy(() => import("@/pages/finance/Finance"));

// Wallet — Premium Digital Banking
const Wallet = lazy(() => import("@/pages/wallet/Wallet"));

// Architect — No-code Platform Builder (via Oracle)
const Architect = lazy(() => import("@/pages/architect/Architect"));

// Automation Engine
const AutomationCenter = lazy(() => import("@/pages/automation/AutomationCenter"));
const WorkflowBuilder = lazy(() => import("@/pages/automation/WorkflowBuilder"));

// Identity & Security
const SecurityCenter = lazy(() => import("@/pages/SecurityCenter"));

// Milestone 34 — Intelligent Admin Platform
const AdminHub = lazy(() => import("@/pages/admin/AdminHub"));

// Legal & Info — public standalone routes
const Privacy = lazy(() => import("@/pages/legal/Privacy"));
const Terms = lazy(() => import("@/pages/legal/Terms"));
const About = lazy(() => import("@/pages/legal/About"));

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PlatformProvider>
        <QueryClientProvider client={queryClientInstance}>
          <DemoModeProvider>
          <ExperienceProvider>
            <Router>
              <ScrollToTop />
              <Suspense fallback={<RouteLoading />}>
                <Routes>
                  <Route path="/" element={<Splash />} />
                  <Route path="/welcome" element={<Welcome />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/meet-bud" element={<MeetBud />} />
                  <Route path="/mode-select" element={<ModeSelector />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/onboarding/conversation" element={<OnboardingConversation />} />
                  <Route path="/onboarding/security" element={<OnboardingSecurity />} />
                  <Route path="/onboarding/preparing" element={<OnboardingPreparing />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/about" element={<About />} />
                  <Route element={<AppShell />}>
                    <Route path="/home" element={<Home />} />
                    <Route path="/bud" element={<BudHome />} />
                    <Route path="/social" element={<SocialHub />} />
                    <Route path="/quad" element={<Quad />} />
                    <Route path="/connect" element={<Connect />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/me" element={<Me />} />
                    <Route path="/shorts" element={<Shorts />} />
<Route path="/podcasts" element={<Podcasts />} />
<Route path="/podcasts/:showId" element={<PodcastShow />} />
<Route path="/creator-studio" element={<CreatorStudio />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/messages/:conversationId" element={<Messages />} />
                    <Route path="/communities" element={<Communities />} />
                    <Route path="/community/:communityId" element={<CommunityDetail />} />
                    <Route path="/clubs" element={<Clubs />} />
                    <Route path="/marketplace" element={<Marketplace />} />
                    <Route path="/lost-found" element={<LostFound />} />
                    <Route path="/discover" element={<Discover />} />
                    <Route path="/lens" element={<Lens />} />
                    <Route path="/square" element={<Square />} />
                    <Route path="/campus" element={<CampusHub />} />
                    <Route path="/academics" element={<AcademicHub />} />
                    <Route path="/academics/results" element={<Results />} />
                    <Route path="/academics/report" element={<SummaryReport />} />
                    <Route path="/communication" element={<CommunicationHub />} />
                    <Route path="/smart-attendance" element={<SmartAttendance />} />
                    <Route path="/classroom/:classId" element={<LiveClassroom />} />
                    <Route path="/smart-notifications" element={<SmartNotifications />} />
                    <Route path="/bud/notifications" element={<BudNotificationPreferences />} />
                    <Route path="/knowledge" element={<KnowledgeHub />} />
                    <Route path="/recast" element={<Recast />} />
                    <Route path="/collaboration" element={<CollaborationHub />} />
                    <Route path="/collaboration/:workspaceId" element={<WorkspaceDetail />} />
                    <Route path="/tasks" element={<TaskHub />} />
                    <Route path="/tasks/:taskId" element={<TaskDetail />} />
                    <Route path="/following" element={<Following />} />
                    <Route path="/friends" element={<Friends />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/events" element={<CampusEvents />} />
                    <Route path="/study-groups" element={<StudyGroups />} />
                    <Route path="/study-groups/:groupId" element={<StudyGroupDetail />} />
                    <Route path="/mentorship" element={<Mentorship />} />
                    <Route path="/mentor/:mentorId" element={<MentorProfile />} />
                    <Route path="/opportunities" element={<Opportunities />} />
                    <Route path="/scholarships" element={<Scholarships />} />
                    <Route path="/research" element={<ResearchHub />} />
                    <Route path="/career" element={<CareerHub />} />
                    <Route path="/companies" element={<Companies />} />
                    <Route path="/portfolio" element={<Portfolio />} />
                    <Route path="/cv-builder" element={<CVBuilder />} />
                    <Route path="/challenges" element={<Challenges />} />
                    <Route path="/student-government" element={<StudentGovernment />} />
                    <Route path="/student-support" element={<StudentSupport />} />
                    <Route path="/courses" element={<Courses />} />
<Route path="/course/:courseId" element={<CourseSpace />} />
<Route path="/agenda" element={<UnifiedAgenda />} />
<Route path="/weather" element={<Weather />} />
                    <Route path="/academic-timeline" element={<AcademicTimeline />} />
                    <Route path="/timetable" element={<Timetable />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/assignments" element={<Assignments />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/exams" element={<Exams />} />
                    <Route path="/attendance" element={<Attendance />} />
<Route path="/office-hours" element={<OfficeHours />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/study-sessions" element={<StudySessions />} />
                    <Route path="/study" element={<StudyHome />} />
                    <Route path="/study/suite" element={<StudySuite />} />
                    <Route path="/study/planner" element={<StudyPlanner />} />
                    <Route path="/study/paths" element={<LearningPaths />} />
                    <Route path="/study/assignment" element={<AssignmentAssistant />} />
                    <Route path="/study/project" element={<ProjectAssistant />} />
                    <Route path="/study/notes" element={<SmartNotes />} />
                    <Route path="/study/research" element={<ResearchAssistant />} />
                    <Route path="/study/exams" element={<ExamPreparation />} />
                    <Route path="/study/flashcards" element={<Flashcards />} />
                    <Route path="/study/practice" element={<PracticeTests />} />
                    <Route path="/study/citations" element={<CitationManager />} />
                    <Route path="/study/library" element={<DocumentLibrary />} />
                    <Route path="/institution/onboard" element={<InstitutionOnboarding />} />
                  <Route path="/onboarding/university" element={<UniversityDirectory />} />
                    <Route path="/institution/console" element={<InstitutionPortal />} />
                    <Route path="/lecturer/portal" element={<LecturerPortal />} />
                    <Route path="/parent/portal" element={<ParentPortal />} />
                    <Route path="/exam" element={<ExamHub />} />
                    <Route path="/exam/start/:paperId" element={<ExamStart />} />
                    <Route path="/exam/take/:attemptId" element={<ExamTaker />} />
                    <Route path="/exam/result/:attemptId" element={<ExamResult />} />
                    <Route path="/exam/analytics" element={<ExamAnalytics />} />
                    <Route path="/exam/coach" element={<ExamCoach />} />
                    <Route path="/exam/author" element={<ExamAuthor />} />
                    <Route path="/oracle" element={<Oracle />} />
                    <Route path="/management" element={<Management />} />
                    <Route path="/operator" element={<Operator />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/architect" element={<Architect />} />
                    <Route path="/automation" element={<AutomationCenter />} />
                    <Route path="/automation/builder" element={<WorkflowBuilder />} />
                    <Route path="/automation/builder/:id" element={<WorkflowBuilder />} />
                    <Route path="/security" element={<SecurityCenter />} />
                                      <Route path="/admin" element={<AdminHub />} />
                  </Route>
                  <Route path="*" element={<PageNotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
            </Router>
          </ExperienceProvider>
          </DemoModeProvider>
        </QueryClientProvider>
        </PlatformProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App