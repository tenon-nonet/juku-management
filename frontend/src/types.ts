export interface Staff {
  id: number
  username: string
  fullName: string
  role: 'ADMIN' | 'STAFF'
  isActive: boolean
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
