import axios from 'axios'
import type {
  Staff, Guardian, Student, Subject, Course, StudentCourse,
  Lesson, Attendance, ExamType, ExamResult,
  Invoice, Payment, Announcement, DashboardSummary
} from './types'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const login = (username: string, password: string) =>
  api.post<{ token: string; username: string; role: string; fullName: string }>('/auth/login', { username, password })

export const getMe = () =>
  api.get<Staff>('/auth/me')

// Staff
export const getStaff = () => api.get<Staff[]>('/staff')
export const createStaff = (data: Partial<Staff> & { password: string }) => api.post<Staff>('/staff', data)
export const updateStaff = (id: number, data: Partial<Staff> & { password?: string }) => api.put<Staff>(`/staff/${id}`, data)
export const deleteStaff = (id: number) => api.delete(`/staff/${id}`)

// Guardians
export const getGuardians = (name?: string) =>
  api.get<Guardian[]>('/guardians', { params: name ? { name } : {} })
export const getGuardian = (id: number) => api.get<Guardian>(`/guardians/${id}`)
export const getGuardianStudents = (id: number) => api.get<Student[]>(`/guardians/${id}/students`)
export const createGuardian = (data: Partial<Guardian>) => api.post<Guardian>('/guardians', data)
export const updateGuardian = (id: number, data: Partial<Guardian>) => api.put<Guardian>(`/guardians/${id}`, data)
export const deleteGuardian = (id: number) => api.delete(`/guardians/${id}`)

// Students
export const getStudents = (params?: { name?: string; grade?: string; status?: string }) =>
  api.get<Student[]>('/students', { params })
export const getStudent = (id: number) => api.get<Student>(`/students/${id}`)
export const createStudent = (data: Partial<Student>) => api.post<Student>('/students', data)
export const updateStudent = (id: number, data: Partial<Student>) => api.put<Student>(`/students/${id}`, data)
export const deleteStudent = (id: number) => api.delete(`/students/${id}`)
export const getStudentCourses = (id: number) => api.get<StudentCourse[]>(`/students/${id}/courses`)
export const enrollStudentCourse = (id: number, courseId: number) =>
  api.post<StudentCourse>(`/students/${id}/courses`, { courseId })
export const unenrollStudentCourse = (studentId: number, studentCourseId: number) =>
  api.delete(`/students/${studentId}/courses/${studentCourseId}`)
export const getStudentAttendances = (id: number) => api.get<Attendance[]>(`/students/${id}/attendances`)
export const getStudentExamResults = (id: number) => api.get<ExamResult[]>(`/students/${id}/exam-results`)
export const getStudentInvoices = (id: number) => api.get<Invoice[]>(`/students/${id}/invoices`)

// Subjects
export const getSubjects = () => api.get<Subject[]>('/subjects')
export const createSubject = (data: Partial<Subject>) => api.post<Subject>('/subjects', data)
export const updateSubject = (id: number, data: Partial<Subject>) => api.put<Subject>(`/subjects/${id}`, data)
export const deleteSubject = (id: number) => api.delete(`/subjects/${id}`)

// Courses
export const getCourses = (activeOnly = false) =>
  api.get<Course[]>('/courses', { params: { activeOnly } })
export const getCourse = (id: number) => api.get<Course>(`/courses/${id}`)
export const createCourse = (data: Partial<Course>) => api.post<Course>('/courses', data)
export const updateCourse = (id: number, data: Partial<Course>) => api.put<Course>(`/courses/${id}`, data)
export const deleteCourse = (id: number) => api.delete(`/courses/${id}`)

// Lessons
export const getLessons = (from: string, to: string, courseId?: number) =>
  api.get<Lesson[]>('/lessons', { params: { from, to, ...(courseId ? { courseId } : {}) } })
export const getLesson = (id: number) => api.get<Lesson>(`/lessons/${id}`)
export const createLesson = (data: Partial<Lesson>) => api.post<Lesson>('/lessons', data)
export const updateLesson = (id: number, data: Partial<Lesson>) => api.put<Lesson>(`/lessons/${id}`, data)
export const deleteLesson = (id: number) => api.delete(`/lessons/${id}`)
export const getLessonAttendances = (id: number) => api.get<Attendance[]>(`/lessons/${id}/attendances`)
export const updateAttendances = (id: number, attendances: { studentId: number; status: string; note?: string }[]) =>
  api.put<Attendance[]>(`/lessons/${id}/attendances`, { attendances })

// Exam Results
export const getExamResults = (params?: { studentId?: number; subjectId?: number }) =>
  api.get<ExamResult[]>('/exam-results', { params })
export const createExamResult = (data: Partial<ExamResult>) => api.post<ExamResult>('/exam-results', data)
export const updateExamResult = (id: number, data: Partial<ExamResult>) => api.put<ExamResult>(`/exam-results/${id}`, data)
export const deleteExamResult = (id: number) => api.delete(`/exam-results/${id}`)
export const getExamTypes = () => api.get<ExamType[]>('/exam-results/exam-types')

// Invoices
export const getInvoices = (params?: { month?: string; status?: string; studentId?: number }) =>
  api.get<Invoice[]>('/invoices', { params })
export const getInvoice = (id: number) => api.get<Invoice>(`/invoices/${id}`)
export const createInvoice = (data: object) => api.post<Invoice>('/invoices', data)
export const updateInvoice = (id: number, data: object) => api.put<Invoice>(`/invoices/${id}`, data)
export const updateInvoiceStatus = (id: number, status: string) =>
  api.patch(`/invoices/${id}/status`, { status })
export const getInvoicePayments = (id: number) => api.get<Payment[]>(`/invoices/${id}/payments`)
export const addPayment = (id: number, data: Partial<Payment>) =>
  api.post<Payment>(`/invoices/${id}/payments`, data)
export const deletePayment = (id: number) => api.delete(`/payments/${id}`)

// Announcements
export const getAnnouncements = () => api.get<Announcement[]>('/announcements')
export const getAnnouncement = (id: number) => api.get<Announcement>(`/announcements/${id}`)
export const createAnnouncement = (data: Partial<Announcement>) => api.post<Announcement>('/announcements', data)
export const updateAnnouncement = (id: number, data: Partial<Announcement>) =>
  api.put<Announcement>(`/announcements/${id}`, data)
export const deleteAnnouncement = (id: number) => api.delete(`/announcements/${id}`)

// Dashboard
export const getDashboardSummary = () => api.get<DashboardSummary>('/dashboard/summary')
export const getTodayLessons = () => api.get<Lesson[]>('/dashboard/today-lessons')
export const getUnpaidInvoices = () => api.get<Invoice[]>('/dashboard/unpaid-invoices')
