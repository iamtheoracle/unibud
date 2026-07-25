import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';
import { DemoModeProvider } from '@/lib/DemoModeContext';
import ScrollToTop from './components/ScrollToTop';

// Sprint 1 — Foundation
import Splash from '@/pages/Splash';
import Welcome from '@/pages/Welcome';
import Register from '@/pages/Register';
import Login from '@/pages/Login';
import MeetBud from '@/pages/MeetBud';

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