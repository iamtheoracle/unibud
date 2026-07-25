import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { DemoModeProvider } from '@/lib/DemoModeContext';
import ScrollToTop from './components/ScrollToTop';

// Milestone 1 — Foundation
import Splash from '@/pages/Splash';
import Welcome from '@/pages/Welcome';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import MeetBud from '@/pages/MeetBud';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

// Milestone 2 — Student Home (Campus)
import AppShell from '@/components/layout/AppShell';
import Home from '@/pages/Home';
import BudHome from '@/pages/bud/BudHome';
import SocialHub from '@/pages/social/SocialHub';
import Me from '@/pages/Me';

// Social Ecosystem
import Quad from '@/pages/Quad';
import Connect from '@/pages/Connect';
import Shorts from '@/pages/Shorts';
import Messages from '@/pages/Messages';
import Communities from '@/pages/Communities';
import CommunityDetail from '@/pages/CommunityDetail';
import Clubs from '@/pages/Clubs';
import Marketplace from '@/pages/Marketplace';
import LostFound from '@/pages/LostFound';
import Discover from '@/pages/Discover';
import Notifications from '@/pages/Notifications';
import CampusEvents from '@/pages/CampusEvents';
import StudyGroups from '@/pages/StudyGroups';
import StudyGroupDetail from '@/pages/StudyGroupDetail';
import Mentorship from '@/pages/Mentorship';
import MentorProfile from '@/pages/MentorProfile';

// Professional Hub
import Opportunities from '@/pages/Opportunities';
import Scholarships from '@/pages/Scholarships';
import ResearchHub from '@/pages/ResearchHub';
import CareerHub from '@/pages/CareerHub';
import Companies from '@/pages/Companies';
import Portfolio from '@/pages/Portfolio';
import CVBuilder from '@/pages/CVBuilder';
import Challenges from '@/pages/Challenges';
import StudentGovernment from '@/pages/StudentGovernment';
import StudentSupport from '@/pages/StudentSupport';

// Milestone 5 — Academic Management
import Courses from '@/pages/academics/Courses';
import Timetable from '@/pages/academics/Timetable';
import Calendar from '@/pages/academics/Calendar';
import Assignments from '@/pages/academics/Assignments';
import Projects from '@/pages/academics/Projects';
import Exams from '@/pages/academics/Exams';
import Attendance from '@/pages/academics/Attendance';
import Notes from '@/pages/academics/Notes';
import StudySessions from '@/pages/academics/StudySessions';

// Milestone 6 — Study Suite
import StudySuite from '@/pages/study/StudySuite';
import AssignmentAssistant from '@/pages/study/AssignmentAssistant';
import ProjectAssistant from '@/pages/study/ProjectAssistant';
import SmartNotes from '@/pages/study/SmartNotes';
import ResearchAssistant from '@/pages/study/ResearchAssistant';
import ExamPreparation from '@/pages/study/ExamPreparation';
import Flashcards from '@/pages/study/Flashcards';
import PracticeTests from '@/pages/study/PracticeTests';
import CitationManager from '@/pages/study/CitationManager';
import DocumentLibrary from '@/pages/study/DocumentLibrary';

// Milestone 8 — Multi-tenancy
import InstitutionOnboarding from '@/pages/institution/InstitutionOnboarding';
import InstitutionPortal from '@/pages/institution/InstitutionPortal';

// Milestone 9 — Lecturer Portal
import LecturerPortal from '@/pages/lecturer/LecturerPortal';

// Milestone 9 — Parent Portal
import ParentPortal from '@/pages/parent/ParentPortal';

// Examination Platform
import ExamHub from '@/pages/exam/ExamHub';
import ExamStart from '@/pages/exam/ExamStart';
import ExamTaker from '@/pages/exam/ExamTaker';
import ExamResult from '@/pages/exam/ExamResult';
import ExamAnalytics from '@/pages/exam/ExamAnalytics';
import ExamCoach from '@/pages/exam/ExamCoach';
import ExamAuthor from '@/pages/exam/ExamAuthor';

// Oracle — Platform Operating Center
import Oracle from '@/pages/oracle/Oracle';

// Management — Institution Operational Headquarters
import Management from '@/pages/management/Management';

// Operator — Execution Workspace
import Operator from '@/pages/operator/Operator';

// Financial Platform
import Finance from '@/pages/finance/Finance';

// Architect — No-code Platform Builder (via Oracle)
import Architect from '@/pages/architect/Architect';

// Automation Engine
import AutomationCenter from '@/pages/automation/AutomationCenter';
import WorkflowBuilder from '@/pages/automation/WorkflowBuilder';

// Identity & Security
import SecurityCenter from '@/pages/SecurityCenter';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <DemoModeProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Splash />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/meet-bud" element={<MeetBud />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route element={<AppShell />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/bud" element={<BudHome />} />
                  <Route path="/social" element={<SocialHub />} />
                  <Route path="/quad" element={<Quad />} />
                  <Route path="/connect" element={<Connect />} />
                  <Route path="/me" element={<Me />} />
                  <Route path="/shorts" element={<Shorts />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/messages/:conversationId" element={<Messages />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/community/:communityId" element={<CommunityDetail />} />
                  <Route path="/clubs" element={<Clubs />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/lost-found" element={<LostFound />} />
                  <Route path="/discover" element={<Discover />} />
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
                  <Route path="/timetable" element={<Timetable />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/projects" element={<Projects />} />
                  <Route path="/exams" element={<Exams />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/study-sessions" element={<StudySessions />} />
                  <Route path="/study" element={<StudySuite />} />
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
                  <Route path="/architect" element={<Architect />} />
                  <Route path="/automation" element={<AutomationCenter />} />
                  <Route path="/automation/builder" element={<WorkflowBuilder />} />
                  <Route path="/automation/builder/:id" element={<WorkflowBuilder />} />
                  <Route path="/security" element={<SecurityCenter />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <Toaster />
            </Router>
          </DemoModeProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App