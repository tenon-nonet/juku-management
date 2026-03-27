export interface Staff {
  id: number
  username: string
  fullName: string
  role: 'PRINCIPAL' | 'ADMIN' | 'TEACHER' | 'OFFICE_STAFF' | 'STAFF'
  isActive: boolean
  memo?: string
  subjectIds: number[]
  subjectNames: string[]
  createdAt: string
}

export interface Guardian {
  id: number
  fullName: string
  fullNameKana?: string
  phone: string
  phoneSub?: string
  email?: string
  address?: string
  memo?: string
  createdAt: string
}

export interface Student {
  id: number
  fullName: string
  fullNameKana?: string
  birthDate?: string
  grade: string
  schoolName?: string
  guardianId?: number
  guardianName?: string
  guardianPhone?: string
  primaryTeacherId?: number
  primaryTeacherName?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  enrolledAt: string
  leftAt?: string
  memo?: string
  createdAt: string
}

export interface Subject {
  id: number
  name: string
  color: string
  sortOrder: number
}

export interface Course {
  id: number
  name: string
  subjectId?: number
  subjectName?: string
  subjectColor?: string
  gradeTarget?: string
  monthlyFee: number
  description?: string
  isActive: boolean
}

export interface StudentCourse {
  id: number
  studentId: number
  courseId: number
  courseName: string
  subjectName?: string
  monthlyFee: number
  startedAt: string
  endedAt?: string
}

export interface Lesson {
  id: number
  courseId: number
  courseName: string
  teacherId?: number
  teacherName?: string
  studentId?: number
  studentName?: string
  classroom?: string
  scheduledAt: string
  durationMin: number
  status: 'SCHEDULED' | 'DONE' | 'CANCELLED'
  note?: string
}

export interface Attendance {
  id: number
  lessonId: number
  studentId: number
  studentName: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  note?: string
  lessonScheduledAt?: string
  lessonCourseName?: string
}

export interface ExamType {
  id: number
  name: string
  sortOrder: number
}

export interface ExamResult {
  id: number
  studentId: number
  studentName: string
  subjectId: number
  subjectName: string
  subjectColor: string
  examTypeId?: number
  examTypeName?: string
  examName: string
  examDate: string
  score: number
  maxScore: number
  rank?: number
  totalStudents?: number
  memo?: string
  academicYear?: number
  semester?: number
  gradeAtExam?: string
}

export interface InvoiceItem {
  id: number
  description: string
  amount: number
  sortOrder: number
}

export interface Invoice {
  id: number
  studentId: number
  studentName: string
  billingMonth: string
  totalAmount: number
  dueDate: string
  status: 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  note?: string
  issuedAt: string
  items: InvoiceItem[]
}

export interface Payment {
  id: number
  invoiceId: number
  paidAmount: number
  paidAt: string
  method: string
  note?: string
  recordedBy?: string
  createdAt: string
}

export interface Announcement {
  id: number
  title: string
  content: string
  target: string
  targetValue?: string
  isPublished: boolean
  publishedAt?: string
  expiresAt?: string
  createdBy?: string
  createdAt: string
}

export interface DashboardSummary {
  activeStudents: number
  todayLessons: number
  unpaidInvoices: number
}

export interface FeatureFlag {
  id: number
  featureKey: string
  isEnabled: boolean
  planLevel: string
  description: string
  updatedAt?: string
}

export interface MessageThread {
  id: number
  subject: string
  category: string
  status: string
  studentId?: number
  studentName?: string
  createdByName?: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: number
  threadId: number
  content: string
  senderType: string
  senderName?: string
  isRead: boolean
  createdAt: string
}

export interface TargetSchool {
  id: number
  schoolName: string
  schoolType: string
  region?: string
  difficulty?: number
  memo?: string
}

export interface GradeImportResult {
  successCount: number
  errorCount: number
  errors: string[]
}

export interface Prospect {
  id: number
  fullName: string
  fullNameKana?: string
  phone?: string
  email?: string
  grade?: string
  schoolName?: string
  inquiryDate: string
  trialDate?: string
  status: 'INQUIRY' | 'TRIAL_SCHEDULED' | 'TRIAL_DONE' | 'ENROLLED' | 'DROPPED'
  interestCourses?: string
  referralSource?: string
  memo?: string
  assignedStaffId?: number
  assignedStaffName?: string
  enrolledStudentId?: number
  createdAt: string
}

export interface LessonPack {
  id: number
  name: string
  packType: 'REGULAR' | 'SUMMER' | 'WINTER' | 'SPRING' | 'CUSTOM'
  totalSessions: number
  price: number
  subjectId?: number
  subjectName?: string
  validFrom?: string
  validTo?: string
  description?: string
  isActive: boolean
}

export interface StudentLessonPack {
  id: number
  studentId: number
  studentName: string
  packId: number
  packName: string
  packType: string
  purchasedAt: string
  totalSessions: number
  usedSessions: number
  remainingSessions: number
}

export interface SalaryRecord {
  id: number
  staffId: number
  staffName: string
  salaryMonth: string
  lessonCount: number
  baseAmount: number
  adjustment: number
  totalAmount: number
  note?: string
  status: 'DRAFT' | 'CONFIRMED' | 'PAID'
  updatedAt: string
}

export interface SalaryRule {
  id: number
  staffId: number
  lessonType: string
  amountPerLesson: number
  effectiveFrom: string
  effectiveTo?: string
}

export interface ConsultationRecord {
  id: number
  studentId: number
  studentName: string
  consultationDate: string
  attendees?: string
  content?: string
  actionItems?: string
  nextDate?: string
  staffId?: number
  staffName?: string
}

export interface AbsenceRequest {
  id: number
  studentId: number
  studentName: string
  lessonId?: number
  lessonInfo?: string
  absenceDate: string
  reason?: string
  wantsMakeup: boolean
  status: 'PENDING' | 'CONFIRMED' | 'MAKEUP_SCHEDULED' | 'COMPLETED'
  makeupLessonId?: number
}

export interface SalesAnalytics {
  monthlyRevenue: Array<{
    month: string
    billedAmount: number
    collectedAmount: number
    uncollectedAmount: number
    invoiceCount: number
  }>
  courseBreakdown: Array<{
    courseName: string
    studentCount: number
    monthlyRevenue: number
  }>
  enrollmentTrend: Array<{
    month: string
    activeCount: number
    newCount: number
    leftCount: number
  }>
  staffLessonCounts: Array<{
    staffId: number
    staffName: string
    lessonCount: number
    doneCount: number
  }>
  summary: {
    totalStudents: number
    activeStudents: number
    currentMonthRevenue: number
    unpaidAmount: number
    overdueAmount: number
  }
}

export interface Task {
  id: number
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  dueDate?: string
  assigneeId?: number
  assigneeName?: string
  createdAt: string
}
