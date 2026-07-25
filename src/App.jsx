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