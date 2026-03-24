import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getStaffById, getTeacherStudents, getTeacherLessons } from '../api'
import type { Staff, Student, Lesson } from '../types'
import { LESSON_STATUS_LABEL, LESSON_STATUS_COLOR } from '../constants'

type Tab = 'info' | 'students' | 'lessons'

export default function StaffDetailPage() {
  const { id } = useParams()
  const staffId = Number(id)
  const [staff, setStaff] = useState<Staff | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [tab, setTab] = useState<Tab>('info')

  useEffect(() => {
    getStaffById(staffId).then((r) => setStaff(r.data))
    getTeacherStudents(staffId).then((r) => setStudents(r.data))
    getTeacherLessons(staffId).then((r) => setLessons(r.data))
  }, [staffId])

  if (!staff) return <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: '基本情報' },
    { key: 'students', label: `担当生徒 (${students.length})` },
    { key: 'lessons', label: `今後の授業 (${lessons.length})` },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{staff.fullName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{staff.role === 'ADMIN' ? '管理者' : 'スタッフ'}</p>
        </div>
        <Link to="/settings" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
          設定へ
        </Link>
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
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-500 dark:text-gray-400">ユーザー名</p>
                <p className="text-gray-800 dark:text-gray-100 font-medium">{staff.username}</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">ステータス</p>
                <p className="text-gray-800 dark:text-gray-100 font-medium">{staff.isActive ? '有効' : '無効'}</p>
              </div>
            </div>
            {staff.subjectNames.length > 0 && (
              <div>
                <p className="text-gray-500 dark:text-gray-400 mb-1">担当科目</p>
                <div className="flex gap-2 flex-wrap">
                  {staff.subjectNames.map((name, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-full">{name}</span>
                  ))}
                </div>
              </div>
            )}
            {staff.memo && (
              <div>
                <p className="text-gray-500 dark:text-gray-400">備考</p>
                <p className="text-gray-800 dark:text-gray-100">{staff.memo}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'students' && (
          students.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">担当生徒なし</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left pb-2">氏名</th>
                  <th className="text-left pb-2">学年</th>
                  <th className="text-left pb-2">学校</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2 font-medium text-gray-800 dark:text-gray-100">{s.fullName}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400">{s.grade}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400">{s.schoolName ?? '-'}</td>
                    <td className="py-2 text-right">
                      <Link to={`/students/${s.id}`} className="text-indigo-600 hover:underline text-xs">詳細</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {tab === 'lessons' && (
          lessons.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">今後1ヶ月の授業なし</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left pb-2">日時</th>
                  <th className="text-left pb-2">コース</th>
                  <th className="text-left pb-2">生徒</th>
                  <th className="text-left pb-2">ステータス</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {lessons.map((l) => {
                  const dt = new Date(l.scheduledAt)
                  return (
                    <tr key={l.id}>
                      <td className="py-2 text-gray-800 dark:text-gray-100">
                        {dt.getMonth() + 1}/{dt.getDate()} {dt.getHours()}:{String(dt.getMinutes()).padStart(2, '0')}
                      </td>
                      <td className="py-2 text-gray-800 dark:text-gray-100">{l.courseName}</td>
                      <td className="py-2 text-gray-500 dark:text-gray-400">{l.studentName ?? '-'}</td>
                      <td className="py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LESSON_STATUS_COLOR[l.status]}`}>
                          {LESSON_STATUS_LABEL[l.status]}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <Link to={`/lessons/${l.id}`} className="text-indigo-600 hover:underline text-xs">詳細</Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  )
}
