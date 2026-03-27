import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStudent, getStudentCourses, getStudentAttendances, getStudentExamResults, getStudentInvoices, getCourses, enrollStudentCourse, unenrollStudentCourse, getConsultations, createConsultation, updateConsultation, deleteConsultation, getStudentAbsences, updateAbsenceStatus, getStaff } from '../api'
import type { Student, StudentCourse, Attendance, ExamResult, Invoice, Course, ConsultationRecord, AbsenceRequest, Staff } from '../types'
import { STUDENT_STATUS_LABEL, ATTEND_LABEL, INVOICE_STATUS_LABEL } from '../constants'

const ATTEND_COLOR: Record<string, string> = {
  PRESENT: 'text-green-600 dark:text-green-400', ABSENT: 'text-red-500 dark:text-red-400', LATE: 'text-yellow-600 dark:text-yellow-400', EXCUSED: 'text-blue-500 dark:text-blue-400',
}
const INV_COLOR: Record<string, string> = {
  UNPAID: 'text-red-500 dark:text-red-400', PAID: 'text-green-600 dark:text-green-400', OVERDUE: 'text-orange-500 dark:text-orange-400', CANCELLED: 'text-gray-400 dark:text-gray-500',
}

const ABSENCE_STATUS_LABEL: Record<string, string> = {
  PENDING: '未処理', CONFIRMED: '確認済み', MAKEUP_SCHEDULED: '補講予定', COMPLETED: '完了',
}
const ABSENCE_STATUS_COLOR: Record<string, string> = {
  PENDING: 'text-yellow-600 dark:text-yellow-400',
  CONFIRMED: 'text-blue-600 dark:text-blue-400',
  MAKEUP_SCHEDULED: 'text-orange-600 dark:text-orange-400',
  COMPLETED: 'text-green-600 dark:text-green-400',
}

const emptyConsultation = (studentId: number): Partial<ConsultationRecord> => ({
  studentId,
  consultationDate: new Date().toISOString().split('T')[0],
  content: '', actionItems: '', attendees: '',
})

type Tab = 'info' | 'courses' | 'attendance' | 'exams' | 'invoices' | 'consultations' | 'absences'

export default function StudentDetailPage() {
  const { id } = useParams()
  const studentId = Number(id)
  const [student, setStudent] = useState<Student | null>(null)
  const [courses, setCourses] = useState<StudentCourse[]>([])
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [exams, setExams] = useState<ExamResult[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([])
  const [absences, setAbsences] = useState<AbsenceRequest[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [tab, setTab] = useState<Tab>('info')
  const [showConsultModal, setShowConsultModal] = useState(false)
  const [editingConsult, setEditingConsult] = useState<ConsultationRecord | null>(null)
  const [consultForm, setConsultForm] = useState<Partial<ConsultationRecord>>(emptyConsultation(studentId))

  useEffect(() => {
    getStudent(studentId).then((r) => setStudent(r.data))
    getStudentCourses(studentId).then((r) => setCourses(r.data))
    getStudentAttendances(studentId).then((r) => setAttendances(r.data))
    getStudentExamResults(studentId).then((r) => setExams(r.data))
    getStudentInvoices(studentId).then((r) => setInvoices(r.data))
    getCourses(true).then((r) => setAllCourses(r.data))
    getConsultations(studentId).then((r) => setConsultations(r.data))
    getStudentAbsences(studentId).then((r) => setAbsences(r.data))
    getStaff().then((r) => setStaffList(r.data))
  }, [studentId])

  const openNewConsult = () => {
    setEditingConsult(null)
    setConsultForm(emptyConsultation(studentId))
    setShowConsultModal(true)
  }
  const openEditConsult = (c: ConsultationRecord) => {
    setEditingConsult(c)
    setConsultForm({ ...c })
    setShowConsultModal(true)
  }
  const handleSaveConsult = async () => {
    if (editingConsult) {
      await updateConsultation(editingConsult.id, consultForm)
    } else {
      await createConsultation({ ...consultForm, studentId })
    }
    setShowConsultModal(false)
    getConsultations(studentId).then(r => setConsultations(r.data))
  }
  const handleDeleteConsult = async (cid: number) => {
    if (!confirm('削除しますか？')) return
    await deleteConsultation(cid)
    getConsultations(studentId).then(r => setConsultations(r.data))
  }
  const handleAbsenceStatus = async (aid: number, status: string) => {
    await updateAbsenceStatus(aid, status)
    getStudentAbsences(studentId).then(r => setAbsences(r.data))
  }

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
    { key: 'consultations', label: `面談記録 (${consultations.length})` },
    { key: 'absences', label: `欠席連絡 (${absences.length})` },
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
              <th className="text-left pb-2">コース</th>
              <th className="text-left pb-2">ステータス</th>
              <th className="text-left pb-2">メモ</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {attendances.length === 0 && <tr><td colSpan={4} className="py-4 text-center text-gray-500 dark:text-gray-400">記録なし</td></tr>}
              {attendances.map((a) => (
                <tr key={a.id}>
                  <td className="py-2 text-gray-600 dark:text-gray-300">
                    {a.lessonScheduledAt
                      ? new Date(a.lessonScheduledAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })
                        + ' ' + new Date(a.lessonScheduledAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </td>
                  <td className="py-2 text-gray-700 dark:text-gray-200">{a.lessonCourseName ?? '-'}</td>
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
        {tab === 'consultations' && (
          <div>
            <div className="flex justify-end mb-3">
              <button onClick={openNewConsult}
                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700">
                + 面談記録を追加
              </button>
            </div>
            {consultations.length === 0
              ? <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">面談記録なし</p>
              : (
                <div className="space-y-3">
                  {consultations.map(c => (
                    <div key={c.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.consultationDate}</span>
                        <div className="flex gap-2">
                          <button onClick={() => openEditConsult(c)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">編集</button>
                          <button onClick={() => handleDeleteConsult(c.id)} className="text-xs text-red-500 hover:underline">削除</button>
                        </div>
                      </div>
                      {c.attendees && <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">参加者: {c.attendees}</p>}
                      {c.content && <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{c.content}</p>}
                      {c.actionItems && (
                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-gray-700 dark:text-gray-300">
                          <span className="font-medium">アクション: </span>{c.actionItems}
                        </div>
                      )}
                      {c.nextDate && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">次回: {c.nextDate}</p>}
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}

        {tab === 'absences' && (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700"><tr>
              <th className="text-left pb-2">欠席日</th>
              <th className="text-left pb-2">理由</th>
              <th className="text-left pb-2">補講</th>
              <th className="text-left pb-2">ステータス</th>
              <th></th>
            </tr></thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {absences.length === 0 && <tr><td colSpan={5} className="py-4 text-center text-gray-500 dark:text-gray-400">欠席連絡なし</td></tr>}
              {absences.map(a => (
                <tr key={a.id}>
                  <td className="py-2">{a.absenceDate}</td>
                  <td className="py-2 text-gray-500 dark:text-gray-400">{a.reason ?? '-'}</td>
                  <td className="py-2">{a.wantsMakeup ? '希望' : '-'}</td>
                  <td className={`py-2 font-medium ${ABSENCE_STATUS_COLOR[a.status]}`}>{ABSENCE_STATUS_LABEL[a.status]}</td>
                  <td className="py-2 text-right flex gap-1 justify-end">
                    {a.status === 'PENDING' && (
                      <button onClick={() => handleAbsenceStatus(a.id, 'CONFIRMED')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">確認</button>
                    )}
                    {(a.status === 'CONFIRMED' || a.status === 'MAKEUP_SCHEDULED') && (
                      <button onClick={() => handleAbsenceStatus(a.id, 'COMPLETED')} className="text-xs text-green-600 dark:text-green-400 hover:underline">完了</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showConsultModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              {editingConsult ? '面談記録を編集' : '面談記録を追加'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">面談日</label>
                <input type="date" value={consultForm.consultationDate ?? ''} onChange={e => setConsultForm(f => ({ ...f, consultationDate: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">参加者</label>
                <input value={consultForm.attendees ?? ''} onChange={e => setConsultForm(f => ({ ...f, attendees: e.target.value }))}
                  placeholder="例: 保護者・担当講師"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">内容</label>
                <textarea value={consultForm.content ?? ''} onChange={e => setConsultForm(f => ({ ...f, content: e.target.value }))} rows={4}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">アクション・次のステップ</label>
                <textarea value={consultForm.actionItems ?? ''} onChange={e => setConsultForm(f => ({ ...f, actionItems: e.target.value }))} rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">次回面談日</label>
                <input type="date" value={consultForm.nextDate ?? ''} onChange={e => setConsultForm(f => ({ ...f, nextDate: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">担当スタッフ</label>
                <select value={consultForm.staffId ?? ''} onChange={e => setConsultForm(f => ({ ...f, staffId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value="">未設定</option>
                  {staffList.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSaveConsult} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">保存</button>
              <button onClick={() => setShowConsultModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
