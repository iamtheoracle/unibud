import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { FeatureFlagProvider } from '@/lib/FeatureFlagContext';
import { DemoModeProvider } from '@/lib/DemoModeContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { BudPanelProvider } from '@/lib/BudPanelContext';

// Auth pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import UniversityStaffLogin from '@/pages/UniversityStaffLogin';
import PlatformStaffLogin from '@/pages/PlatformStaffLogin';

// App pages
import AppLayout from '@/components/layout/AppLayout';
import Home from '@/pages/Home';
import Academics from '@/pages/Academics';
import Quad from '@/pages/Quad';
import Connect from '@/pages/Connect';
import Messages from '@/pages/Messages';
import Bud from '@/pages/Bud';
import Marketplace from '@/pages/Marketplace';
import Opportunities from '@/pages/Opportunities';
import Me from '@/pages/Me';
import Notifications from '@/pages/Notifications';
import BudMemory from '@/pages/BudMemory';
import ConnectedAccounts from '@/pages/ConnectedAccounts';
import Welcome from '@/pages/Welcome';
import UniversitySelection from '@/pages/UniversitySelection';
import UniversityConnect from '@/pages/UniversityConnect';
import StudentProfile from '@/pages/StudentProfile';
import FutureStudentOnboarding from '@/pages/FutureStudentOnboarding';
import LearningPreferences from '@/pages/onboarding/LearningPreferences';
import AcademicGoals from '@/pages/onboarding/AcademicGoals';
import StudySchedule from '@/pages/onboarding/StudySchedule';
import Interests from '@/pages/onboarding/Interests';
import MeetBud from '@/pages/onboarding/MeetBud';
import PreparingCampus from '@/pages/onboarding/PreparingCampus';
import LiveHome from '@/pages/LiveHome';
import LiveClass from '@/pages/LiveClass';
import Library from '@/pages/Library';
import PdfReader from '@/pages/PdfReader';
import Assignments from '@/pages/Assignments';
import Challenges from '@/pages/Challenges';
import Discover from '@/pages/Discover';
import Communities from '@/pages/Communities';
import CommunityDetail from '@/pages/CommunityDetail';
import CampusEvents from '@/pages/CampusEvents';
import LostFound from '@/pages/LostFound';
import Clubs from '@/pages/Clubs';
import StudentSupport from '@/pages/StudentSupport';
import StudentGovernment from '@/pages/StudentGovernment';
import Mentorship from '@/pages/Mentorship';
import MentorProfile from '@/pages/MentorProfile';
import StudyGroups from '@/pages/StudyGroups';
import StudyGroupDetail from '@/pages/StudyGroupDetail';
import FYPHub from '@/pages/FYPHub';
import CampusTraditions from '@/pages/CampusTraditions';
import CampusTraditionsCalendar from '@/pages/CampusTraditionsCalendar';
import Celebrations from '@/pages/Celebrations';
import StudentAchievements from '@/pages/StudentAchievements';
import SplashScreen from '@/components/onboarding/SplashScreen';
import UnibudMark from '@/components/brand/UnibudMark';
import StudySession from '@/pages/StudySession';
import AcademicAnalytics from '@/pages/AcademicAnalytics';
import Wellbeing from '@/pages/Wellbeing';
import Calendar from '@/pages/Calendar';
import Shorts from '@/pages/Shorts';
import HighlightDetail from '@/pages/HighlightDetail';
import CareerHub from '@/pages/CareerHub';
import Scholarships from '@/pages/Scholarships';
import ResearchHub from '@/pages/ResearchHub';
import Portfolio from '@/pages/Portfolio';
import Companies from '@/pages/Companies';
import CVBuilder from '@/pages/CVBuilder';
import Agents from '@/pages/Agents';

// Portal imports
import PortalLayout from '@/components/portal/PortalLayout';
import PortalDashboard from '@/pages/portal/PortalDashboard';
import ModuleControl from '@/pages/portal/oracle/ModuleControl';
import UserManagement from '@/pages/portal/oracle/UserManagement';
import AuditLogs from '@/pages/portal/oracle/AuditLogs';
import SystemHealth from '@/pages/portal/oracle/SystemHealth';
import SecurityCenter from '@/pages/portal/oracle/SecurityCenter';
import SupportCenter from '@/pages/portal/SupportCenter';
import Universities from '@/pages/portal/Universities';
import Analytics from '@/pages/portal/Analytics';
import Reports from '@/pages/portal/Reports';
import Content from '@/pages/portal/Content';
import BudConfig from '@/pages/portal/BudConfig';
import PortalSettings from '@/pages/portal/PortalSettings';
import Maintenance from '@/pages/portal/Maintenance';
import Faculties from '@/pages/portal/Faculties';
import Departments from '@/pages/portal/Departments';
import Lecturers from '@/pages/portal/Lecturers';
import PortalCourses from '@/pages/portal/PortalCourses';
import AcademicCalendar from '@/pages/portal/AcademicCalendar';
import PortalAnnouncements from '@/pages/portal/PortalAnnouncements';
import Classes from '@/pages/portal/Classes';
import PortalLive from '@/pages/portal/PortalLive';
import PortalAssignments from '@/pages/portal/PortalAssignments';
import Attendance from '@/pages/portal/Attendance';
import Grades from '@/pages/portal/Grades';
import Materials from '@/pages/portal/Materials';
import Recordings from '@/pages/portal/Recordings';
import PortalStudyGroups from '@/pages/portal/PortalStudyGroups';
import OracleDashboard from '@/pages/portal/oracle/OracleDashboard';
import Approvals from '@/pages/portal/Approvals';
import FeatureFlags from '@/pages/portal/FeatureFlags';
import PortalNotifications from '@/pages/portal/PortalNotifications';
import PortalMarketplace from '@/pages/portal/PortalMarketplace';
import PortalEvents from '@/pages/portal/PortalEvents';
import PlatformInvitations from '@/pages/portal/PlatformInvitations';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center premium-shadow animate-pulse">
            <UnibudMark className="w-6 h-6 text-primary" />
          </div>
          <p className="text-[13px] font-medium text-muted-foreground">Loading UNIBUD...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/university-staff-login" element={<UniversityStaffLogin />} />
      <Route path="/platform-staff-login" element={<PlatformStaffLogin />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/welcome" replace />} />}>
        <Route path="/university-selection" element={<UniversitySelection />} />
        <Route path="/university-connect" element={<UniversityConnect />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/future-student-onboarding" element={<FutureStudentOnboarding />} />
        <Route path="/onboarding/learning-preferences" element={<LearningPreferences />} />
        <Route path="/onboarding/academic-goals" element={<AcademicGoals />} />
        <Route path="/onboarding/study-schedule" element={<StudySchedule />} />
        <Route path="/onboarding/interests" element={<Interests />} />
        <Route path="/onboarding/meet-bud" element={<MeetBud />} />
        <Route path="/onboarding/preparing-campus" element={<PreparingCampus />} />
        <Route path="/live/class/:classId" element={<LiveClass />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<LiveHome />} />
          <Route path="/academics" element={<Academics />} />
          <Route path="/quad" element={<Quad />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:conversationId" element={<Messages />} />
          <Route path="/bud" element={<Bud />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/read/:resourceId" element={<PdfReader />} />
          <Route path="/assignments" element={<Assignments />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/me" element={<Me />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/bud-memory" element={<BudMemory />} />
          <Route path="/connected-accounts" element={<ConnectedAccounts />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/:communityId" element={<CommunityDetail />} />
          <Route path="/events" element={<CampusEvents />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/clubs" element={<Clubs />} />
          <Route path="/student-support" element={<StudentSupport />} />
          <Route path="/student-government" element={<StudentGovernment />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/mentor/:mentorId" element={<MentorProfile />} />
          <Route path="/study-groups" element={<StudyGroups />} />
          <Route path="/study-groups/:groupId" element={<StudyGroupDetail />} />
          <Route path="/fyp-hub" element={<FYPHub />} />
          <Route path="/campus-traditions" element={<CampusTraditions />} />
          <Route path="/traditions-calendar" element={<CampusTraditionsCalendar />} />
          <Route path="/celebrations" element={<Celebrations />} />
          <Route path="/achievements" element={<StudentAchievements />} />
          <Route path="/study-session" element={<StudySession />} />
          <Route path="/academic-analytics" element={<AcademicAnalytics />} />
          <Route path="/wellbeing" element={<Wellbeing />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/highlight/:highlightId" element={<HighlightDetail />} />
          <Route path="/career" element={<CareerHub />} />
          <Route path="/scholarships" element={<Scholarships />} />
          <Route path="/research" element={<ResearchHub />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/cv-builder" element={<CVBuilder />} />
          <Route path="/agents" element={<Agents />} />
        </Route>
        <Route path="/portal" element={<PortalLayout />}>
          <Route index element={<PortalDashboard />} />
          <Route path="modules" element={<ModuleControl />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="system-health" element={<SystemHealth />} />
          <Route path="security" element={<SecurityCenter />} />
          <Route path="support" element={<SupportCenter />} />
          <Route path="universities" element={<Universities />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="content" element={<Content />} />
          <Route path="bud-config" element={<BudConfig />} />
          <Route path="settings" element={<PortalSettings />} />
          <Route path="maintenance" element={<Maintenance />} />
          <Route path="faculties" element={<Faculties />} />
          <Route path="departments" element={<Departments />} />
          <Route path="lecturers" element={<Lecturers />} />
          <Route path="courses" element={<PortalCourses />} />
          <Route path="calendar" element={<AcademicCalendar />} />
          <Route path="announcements" element={<PortalAnnouncements />} />
          <Route path="classes" element={<Classes />} />
          <Route path="live" element={<PortalLive />} />
          <Route path="assignments" element={<PortalAssignments />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="grades" element={<Grades />} />
          <Route path="materials" element={<Materials />} />
          <Route path="recordings" element={<Recordings />} />
          <Route path="study-groups" element={<PortalStudyGroups />} />
          <Route path="oracle" element={<OracleDashboard />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="feature-flags" element={<FeatureFlags />} />
          <Route path="notifications" element={<PortalNotifications />} />
          <Route path="marketplace" element={<PortalMarketplace />} />
          <Route path="events" element={<PortalEvents />} />
          <Route path="invitations" element={<PlatformInvitations />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <FeatureFlagProvider>
            <DemoModeProvider>
            <Router>
              <BudPanelProvider>
                <ScrollToTop />
                <AuthenticatedApp />
                <SplashScreen />
              </BudPanelProvider>
            </Router>
            <Toaster />
        </DemoModeProvider>
          </FeatureFlagProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App