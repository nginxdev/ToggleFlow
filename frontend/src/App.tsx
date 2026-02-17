import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import FlagsPage from '@/pages/dashboard/FlagsPage'
import FlagDetailsPage from '@/pages/dashboard/FlagDetailsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/flags" replace />} />
        <Route path="/dashboard/flags" element={<FlagsPage />} />
        <Route path="/dashboard/flags/:id" element={<FlagDetailsPage />} />
        <Route path="/dashboard/segments" element={<FlagsPage />} /> {/* Placeholder */}
        <Route path="/dashboard/environments" element={<FlagsPage />} /> {/* Placeholder */}
        <Route path="/dashboard/audit-log" element={<FlagsPage />} /> {/* Placeholder */}
        <Route path="/dashboard/settings" element={<FlagsPage />} /> {/* Placeholder */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
