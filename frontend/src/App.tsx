import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import SignUpPage from '@/pages/auth/SignUpPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import FlagsPage from '@/pages/dashboard/FlagsPage'
import FlagDetailsPage from '@/pages/dashboard/FlagDetailsPage'
import ProjectsPage from '@/pages/dashboard/ProjectsPage'
import SegmentsPage from '@/pages/dashboard/SegmentsPage'
import EnvironmentsPage from '@/pages/dashboard/EnvironmentsPage'
import AuditLogPage from '@/pages/dashboard/AuditLogPage'
import SettingsPage from '@/pages/dashboard/SettingsPage'
import ProtectedRoute from '@/components/ProtectedRoute'
import { SessionTimeoutHandler } from '@/components/SessionTimeoutHandler'

export function App() {
  return (
    <BrowserRouter>
      <SessionTimeoutHandler />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* Dashboard Routes - Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard/flags" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/flags"
          element={
            <ProtectedRoute>
              <FlagsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/flags/:id"
          element={
            <ProtectedRoute>
              <FlagDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/segments"
          element={
            <ProtectedRoute>
              <SegmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/environments"
          element={
            <ProtectedRoute>
              <EnvironmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/audit-log"
          element={
            <ProtectedRoute>
              <AuditLogPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
