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
import Me from '@/pages/Me';
import Placeholder from '@/pages/Placeholder';

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
                  <Route path="/quad" element={<Placeholder title="Quad" description="Your campus social feed arrives in a future milestone." />} />
                  <Route path="/connect" element={<Placeholder title="Connect" description="Study matching, mentorship, and events arrive in a future milestone." />} />
                  <Route path="/me" element={<Me />} />
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