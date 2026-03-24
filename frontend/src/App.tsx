import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './theme'
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

export default function App() {
  return (
    <ThemeProvider>
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
          <Route path="settings" element={<SettingsPage />} />
          <Route path="staff/:id" element={<StaffDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  )
}
