import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStudent, getStudentCourses, getStudentAttendances, getStudentExamResults, getStudentInvoices, getCourses, enrollStudentCourse, unenrollStudentCourse } from '../api'
import type { Student, StudentCourse, Attendance, ExamResult, Invoice, Course } from '../types'
import { STUDENT_STATUS_LABEL, ATTEND_LABEL, INVOICE_STATUS_LABEL } from '../constants'

const ATTEND_COLOR: Record<string, string> = {
  PRESENT: 'text-green-600 dark:text-green-400', ABSENT: 'text-red-500 dark:text-red-400', LATE: 'text-yellow-600 dark:text-yellow-400', EXCUSED: 'text-blue-500 dark:text-blue-400',
}
const INV_COLOR: Record<string, string> = {
  UNPAID: 'text-red-500 dark:text-red-400', PAID: 'text-green-600 dark:text-green-400', OVERDUE: 'text-orange-500 dark:text-orange-400', CANCELLED: 'text-gray-400 dark:text-gray-500',
}

type Tab = 'info' | 'courses' | 'attendance' | 'exams' | 'invoices'

export default function StudentDetailPage() {
  const { id } = useParams()
  const studentId = Number(id)
  const [student, setStudent] = useState<Student | null>(null)
  const [courses, setCourses] = useState<StudentCourse[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [exams, setExams] = useState<ExamResult[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [tab, setTab] = useState<Tab>('info')

  useEffect(() => {
    getStudent(studentId).then((r) => setStudent(r.data))
    getStudentCourses(studentId).then((r) => setCourses(r.data))
    getStudentAttendances(studentId).then((r) => setAttendances(r.data))
    getStudentExamResults(studentId).then((r) => setExams(r.data))
    getStudentInvoices(studentId).then((r) => setInvoices(r.data))
    getCourses(true).then((r) => setAllCourses(r.data))
  }, [studentId])

  const handleEnroll = async (courseId: number) => {
    await enrollStudentCourse(studentId, courseId)
    getStudentCourses(studentId).then((r) => setCourses(r.data))
  }

  const handleUnenroll = async (scId: number) => {
    if (!confirm('受講を解除しますか？')) return
    await unenrollStudentCourse(studentId, scId)
    getStudentCourses(studentId).then((r) => setCourses(r.data))
  }

  if (!student) return <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>


  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: '基本情報' },
    { key: 'courses', label: `受講コース (${courses.length})` },
    { key: 'attendance', label: `出席履歴 (${attendances.length})` },
    { key: 'exams', label: `成績 (${exams.length})` },
    { key: 'invoices', label: `請求 (${invoices.length})` },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{student.fullName}</h1>
          {student.fullNameKana && <p className="text-sm text-gray-500 dark:text-gray-400">{student.fullNameKana}</p>}
        </div>
        <div className="flex gap-2">
          <Link to={`/students/${studentId}/edit`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">編集</Link>
          <Link to="/students" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">一覧へ</Link>
        </div>
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {tab === 'info' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              ['学年', student.grade],
              ['ステータス', STUDENT_STATUS_LABEL[student.status]],
              ['学校', student.schoolName ?? '-'],
              ['生年月日', student.birthDate ?? '-'],
              ['入塾日', student.enrolledAt],
              ['退塾日', student.leftAt ?? '-'],
              ['保護者', student.guardianName ?? '-'],
              ['保護者電話', student.guardianPhone ?? '-'],
              ['担当講師', student.primaryTeacherName ?? '-'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-gray-800 dark:text-gray-100 font-medium">{value}</p>
              </div>
            ))}
            {student.memo && (
              <div className="col-span-2">
                <p className="text-gray-500 dark:text-gray-400">備考</p>
                <p className="text-gray-800 dark:text-gray-100">{student.memo}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'courses' && (
          <div>
            <div className="mb-4">
              <select onChange={(e) => { if (e.target.value) handleEnroll(Number(e.target.value)); e.target.value = '' }}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none">
                <option value="">コースを追加...</option>
                {allCourses.filter((c) => !courses.some((sc) => sc.courseId === c.id)).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {courses.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-sm">受講中のコースなし</p> : (
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr><th className="text-left pb-2">コース</th><th className="text-left pb-2">月額</th><th className="text-left pb-2">開始日</th><th></th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {courses.map((sc) => (
                    <tr key={sc.id}>
                      <td className="py-2">{sc.courseName}</td>
                      <td className="py-2">¥{sc.monthlyFee.toLocaleString()}</td>
                      <td className="py-2">{sc.startedAt}</td>
                      <td className="py-2 text-right">
                        <button onClick={() => handleUnenroll(sc.id)} className="text-red-400 hover:underline text-xs">解除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'attendance' && (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700"><tr>
              <th className="text-left pb-2">日時</th>
              <th className="text-left pb-2">ステータス</th>
              <th className="text-left pb-2">メモ</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {attendances.length === 0 && <tr><td colSpan={3} className="py-4 text-center text-gray-500 dark:text-gray-400">記録なし</td></tr>}
              {attendances.map((a) => (
                <tr key={a.id}>
                  <td className="py-2">{a.lessonId}</td>
                  <td className={`py-2 font-medium ${ATTEND_COLOR[a.status]}`}>{ATTEND_LABEL[a.status]}</td>
                  <td className="py-2 text-gray-500 dark:text-gray-400">{a.note ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'exams' && (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700"><tr>
              <th className="text-left pb-2">テスト名</th>
              <th className="text-left pb-2">科目</th>
              <th className="text-left pb-2">日付</th>
              <th className="text-right pb-2">得点</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {exams.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-500 dark:text-gray-400">記録なし</td></tr>}
              {exams.map((r) => (
                <tr key={r.id}>
                  <td className="py-2">{r.examName}</td>
                  <td className="py-2">{r.subjectName}</td>
                  <td className="py-2">{r.examDate}</td>
                  <td className="py-2 text-right font-medium">{Number(r.score)}/{Number(r.maxScore)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'invoices' && (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700"><tr>
              <th className="text-left pb-2">請求月</th>
              <th className="text-right pb-2">金額</th>
              <th className="text-left pb-2">ステータス</th>
              <th className="text-left pb-2">期限</th>
              <th></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {invoices.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">請求なし</td></tr>}
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="py-2">{inv.billingMonth}</td>
                  <td className="py-2 text-right">¥{inv.totalAmount.toLocaleString()}</td>
                  <td className={`py-2 font-medium ${INV_COLOR[inv.status]}`}>{INVOICE_STATUS_LABEL[inv.status]}</td>
                  <td className="py-2">{inv.dueDate}</td>
                  <td className="py-2 text-right">
                    <Link to={`/invoices/${inv.id}`} className="text-indigo-600 hover:underline text-xs">詳細</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
