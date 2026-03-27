import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './theme'
import { AuthProvider } from './contexts/AuthContext'
import { FeatureFlagProvider } from './contexts/FeatureFlagContext'
import PrivateRoute from './components/layout/PrivateRoute'
import AppLayout from './components/layout/AppLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import StudentDetailPage from './pages/StudentDetailPage'
import StudentFormPage from './pages/StudentFormPage'
import GuardiansPage from './pages/GuardiansPage'
import GuardianDetailPage from './pages/GuardianDetailPage'
import GuardianFormPage from './pages/GuardianFormPage'
import LessonsPage from './pages/LessonsPage'
import LessonDetailPage from './pages/LessonDetailPage'
import LessonFormPage from './pages/LessonFormPage'
import ExamResultsPage from './pages/ExamResultsPage'
import InvoicesPage from './pages/InvoicesPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import InvoiceFormPage from './pages/InvoiceFormPage'
import AnnouncementsPage from './pages/AnnouncementsPage'
import AnnouncementFormPage from './pages/AnnouncementFormPage'
import SettingsPage from './pages/SettingsPage'
import StaffDetailPage from './pages/StaffDetailPage'
import MessagesPage from './pages/MessagesPage'
import MessageThreadPage from './pages/MessageThreadPage'
import StudentPortalPage from './pages/portal/StudentPortalPage'
import GuardianPortalPage from './pages/portal/GuardianPortalPage'
import SalesPage from './pages/SalesPage'
import ProspectsPage from './pages/ProspectsPage'
import LessonPacksPage from './pages/LessonPacksPage'
import SalaryPage from './pages/SalaryPage'
import AbsenceRequestsPage from './pages/AbsenceRequestsPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FeatureFlagProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <AppLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                {/* Staff routes */}
                <Route path="students" element={<StudentsPage />} />
                <Route path="students/new" element={<StudentFormPage />} />
                <Route path="students/:id" element={<StudentDetailPage />} />
                <Route path="students/:id/edit" element={<StudentFormPage />} />
                <Route path="guardians" element={<GuardiansPage />} />
                <Route path="guardians/new" element={<GuardianFormPage />} />
                <Route path="guardians/:id" element={<GuardianDetailPage />} />
                <Route path="guardians/:id/edit" element={<GuardianFormPage />} />
                <Route path="lessons" element={<LessonsPage />} />
                <Route path="lessons/new" element={<LessonFormPage />} />
                <Route path="lessons/:id" element={<LessonDetailPage />} />
                <Route path="lessons/:id/edit" element={<LessonFormPage />} />
                <Route path="exam-results" element={<ExamResultsPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="invoices/new" element={<InvoiceFormPage />} />
                <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="announcements/new" element={<AnnouncementFormPage />} />
                <Route path="announcements/:id/edit" element={<AnnouncementFormPage />} />
                <Route path="settings" element={
                  <PrivateRoute roles={['ADMIN', 'PRINCIPAL']}>
                    <SettingsPage />
                  </PrivateRoute>
                } />
                <Route path="staff/:id" element={<StaffDetailPage />} />
                {/* Messages - all authenticated users */}
                <Route path="messages" element={<MessagesPage />} />
                <Route path="messages/:id" element={<MessageThreadPage />} />
                {/* New features */}
                <Route path="prospects" element={<ProspectsPage />} />
                <Route path="lesson-packs" element={<LessonPacksPage />} />
                <Route path="sales" element={<SalesPage />} />
                <Route path="salary" element={<SalaryPage />} />
                <Route path="absence-requests" element={<AbsenceRequestsPage />} />
                {/* Portals */}
                <Route path="portal/student" element={
                  <PrivateRoute roles={['STUDENT']}>
                    <StudentPortalPage />
                  </PrivateRoute>
                } />
                <Route path="portal/guardian" element={
                  <PrivateRoute roles={['GUARDIAN']}>
                    <GuardianPortalPage />
                  </PrivateRoute>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </FeatureFlagProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
