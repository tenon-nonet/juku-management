import axios from 'axios'
import type {
  Staff, Guardian, Student, Subject, Course, StudentCourse,
  Lesson, Attendance, ExamType, ExamResult,
  Invoice, Payment, Announcement, DashboardSummary,
  FeatureFlag, MessageThread, Message, TargetSchool, GradeImportResult,
  Prospect, LessonPack, StudentLessonPack, SalaryRecord, SalaryRule,
  ConsultationRecord, AbsenceRequest, SalesAnalytics, Task
} from './types'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auth
export const login = (username: string, password: string) =>
  api.post<{ token: string; username: string; role: string; fullName: string; userId: number | null; userType: string }>('/auth/login', { username, password })

export const getMe = () =>
  api.get<Staff>('/auth/me')

// Staff
export const getStaff = () => api.get<Staff[]>('/staff')
export const getStaffById = (id: number) => api.get<Staff>(`/staff/${id}`)
export const getTeacherStudents = (id: number) => api.get<Student[]>(`/staff/${id}/students`)
export const getTeacherLessons = (id: number) => api.get<Lesson[]>(`/staff/${id}/lessons`)
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
export const getLessons = (from: string, to: string, params?: { courseId?: number; teacherId?: number; studentId?: number }) =>
  api.get<Lesson[]>('/lessons', { params: { from, to, ...params } })
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
export const updateInvoiceStatus = (id: number, status: string) =>
  api.patch(`/invoices/${id}/status`, { status })
export const getInvoicePayments = (id: number) => api.get<Payment[]>(`/invoices/${id}/payments`)
export const addPayment = (id: number, data: Partial<Payment>) =>
  api.post<Payment>(`/invoices/${id}/payments`, data)

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

// Feature Flags
export const getFeatureFlags = () => api.get<FeatureFlag[]>('/feature-flags')
export const updateFeatureFlag = (featureKey: string, enabled: boolean) =>
  api.patch(`/feature-flags/${featureKey}`, { enabled })

// Messages
export const getMessageThreads = () => api.get<MessageThread[]>('/messages/threads')
export const getMessageThread = (id: number) => api.get<MessageThread>(`/messages/threads/${id}`)
export const createMessageThread = (data: { subject: string; category?: string; studentId?: number }) =>
  api.post<MessageThread>('/messages/threads', data)
export const getMessages = (threadId: number) => api.get<Message[]>(`/messages/threads/${threadId}/messages`)
export const sendMessage = (threadId: number, content: string) =>
  api.post<Message>(`/messages/threads/${threadId}/messages`, { content })
export const getUnreadMessageCount = () => api.get<{ count: number }>('/messages/unread-count')

// Target Schools
export const getTargetSchools = (params?: { type?: string; name?: string }) =>
  api.get<TargetSchool[]>('/target-schools', { params })
export const createTargetSchool = (data: Partial<TargetSchool>) => api.post<TargetSchool>('/target-schools', data)
export const updateTargetSchool = (id: number, data: Partial<TargetSchool>) => api.put<TargetSchool>(`/target-schools/${id}`, data)
export const deleteTargetSchool = (id: number) => api.delete(`/target-schools/${id}`)

// Grade Analysis
export const importExamResultsCsv = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post<GradeImportResult>('/exam-results/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
export const getStudentGradeTrend = (studentId: number, subjectId?: number) =>
  api.get<any[]>(`/exam-results/analysis/trend/${studentId}`, { params: subjectId ? { subjectId } : {} })
export const getSchoolDistribution = (schoolName: string, examName: string) =>
  api.get<any>('/exam-results/analysis/distribution', { params: { schoolName, examName } })
export const getExamNames = (studentId?: number) =>
  api.get<string[]>('/exam-results/exam-names', { params: studentId ? { studentId } : {} })

// Acceptance Records
export const getAcceptanceRecords = (params?: { schoolId?: number; studentId?: number }) =>
  api.get('/acceptance-records', { params })
export const createAcceptanceRecord = (data: object) => api.post('/acceptance-records', data)
export const deleteAcceptanceRecord = (id: number) => api.delete(`/acceptance-records/${id}`)

// Prospects（体験生・見込み客）
export const getProspects = (params?: { status?: string; name?: string }) =>
  api.get<Prospect[]>('/prospects', { params })
export const getProspectStats = () => api.get<Record<string, number>>('/prospects/stats')
export const getProspect = (id: number) => api.get<Prospect>(`/prospects/${id}`)
export const createProspect = (data: Partial<Prospect>) => api.post<Prospect>('/prospects', data)
export const updateProspect = (id: number, data: Partial<Prospect>) => api.put<Prospect>(`/prospects/${id}`, data)
export const deleteProspect = (id: number) => api.delete(`/prospects/${id}`)

// Lesson Packs（特別授業パック）
export const getLessonPacks = (activeOnly = false) =>
  api.get<LessonPack[]>('/lesson-packs', { params: { activeOnly } })
export const getLessonPack = (id: number) => api.get<LessonPack>(`/lesson-packs/${id}`)
export const createLessonPack = (data: Partial<LessonPack>) => api.post<LessonPack>('/lesson-packs', data)
export const updateLessonPack = (id: number, data: Partial<LessonPack>) => api.put<LessonPack>(`/lesson-packs/${id}`, data)
export const deleteLessonPack = (id: number) => api.delete(`/lesson-packs/${id}`)
export const assignLessonPack = (packId: number, studentId: number, sessions?: number) =>
  api.post<StudentLessonPack>(`/lesson-packs/${packId}/assign`, { studentId, sessions })
export const getStudentLessonPacks = (studentId: number) =>
  api.get<StudentLessonPack[]>(`/lesson-packs/student/${studentId}`)

// Salary（給与管理）
export const getSalaryMonths = () => api.get<string[]>('/salary/months')
export const getSalaryByMonth = (month: string) => api.get<SalaryRecord[]>('/salary', { params: { month } })
export const getSalaryByStaff = (staffId: number) => api.get<SalaryRecord[]>(`/salary/staff/${staffId}`)
export const calculateSalary = (month: string) => api.post<SalaryRecord[]>('/salary/calculate', { month })
export const updateSalaryRecord = (id: number, data: { status?: string; adjustment?: number; note?: string }) =>
  api.patch<SalaryRecord>(`/salary/${id}`, data)
export const getSalaryRules = (staffId: number) => api.get<SalaryRule[]>(`/salary/rules/${staffId}`)
export const saveSalaryRule = (data: Partial<SalaryRule> & { staffId: number }) =>
  api.post('/salary/rules', data)

// Sales Analytics（売上分析）
export const getSalesAnalytics = (months = 12) =>
  api.get<SalesAnalytics>('/sales/analytics', { params: { months } })
export const bulkGenerateInvoices = (month: string) =>
  api.post<Invoice[]>('/sales/invoices/bulk-generate', { month })

// Consultations（面談記録）
export const getConsultations = (studentId: number) =>
  api.get<ConsultationRecord[]>(`/consultations/student/${studentId}`)
export const createConsultation = (data: Partial<ConsultationRecord>) =>
  api.post<ConsultationRecord>('/consultations', data)
export const updateConsultation = (id: number, data: Partial<ConsultationRecord>) =>
  api.put<ConsultationRecord>(`/consultations/${id}`, data)
export const deleteConsultation = (id: number) => api.delete(`/consultations/${id}`)

// Next Year Plan（来年度計画）
export const getNextYearPlan = (year: number) => api.get(`/next-year-plan/${year}`)
export const saveNextYearPlan = (data: object) => api.post('/next-year-plan', data)

// Tasks（タスク管理）
export const getTasks = (status?: string) =>
  api.get<Task[]>('/tasks', { params: status ? { status } : {} })
export const createTask = (data: Partial<Task>) => api.post<Task>('/tasks', data)
export const updateTask = (id: number, data: Partial<Task>) => api.put<Task>(`/tasks/${id}`, data)
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`)

// Absence Requests（欠席連絡）
export const getPendingAbsences = () => api.get<AbsenceRequest[]>('/absence-requests/pending')
export const getStudentAbsences = (studentId: number) =>
  api.get<AbsenceRequest[]>(`/absence-requests/student/${studentId}`)
export const createAbsenceRequest = (data: Partial<AbsenceRequest>) =>
  api.post<AbsenceRequest>('/absence-requests', data)
export const updateAbsenceStatus = (id: number, status: string, makeupLessonId?: number) =>
  api.patch<AbsenceRequest>(`/absence-requests/${id}`, { status, makeupLessonId })
