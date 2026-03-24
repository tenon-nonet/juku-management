import { useEffect, useState } from 'react'
import { getGuardianStudents, getStudentExamResults, getLessons } from '../../api'
import type { Student, ExamResult, Lesson } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

export default function GuardianPortalPage() {
  const { user } = useAuth()
  const [children, setChildren] = useState<Student[]>([])
  const [selectedChild, setSelectedChild] = useState<Student | null>(null)
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.userId) return
    const load = async () => {
      try {
        const res = await getGuardianStudents(user.userId!)
        setChildren(res.data)
        if (res.data.length > 0) setSelectedChild(res.data[0])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  useEffect(() => {
    if (!selectedChild) return
    const load = async () => {
      const today = new Date().toISOString().split('T')[0]
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const [exams, lessons] = await Promise.all([
        getStudentExamResults(selectedChild.id),
        getLessons(today, nextMonth, { studentId: selectedChild.id }),
      ])
      setExamResults(exams.data.slice(0, 5))
      setUpcomingLessons(lessons.data)
    }
    load()
  }, [selectedChild])

  if (loading) return <p className="text-center text-gray-400 py-12">読み込み中...</p>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">{user?.fullName}さん</h2>
        {children.length > 1 && (
          <div className="mt-3">
            <label className="text-sm text-gray-600 dark:text-gray-400 mr-2">お子様を選択：</label>
            <select
              value={selectedChild?.id}
              onChange={e => setSelectedChild(children.find(c => c.id === Number(e.target.value)) ?? null)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              {children.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
            </select>
          </div>
        )}
      </div>

      {selectedChild && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">👤 {selectedChild.fullName}さんの情報</h3>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div><dt className="text-gray-500 dark:text-gray-400">学年</dt><dd className="font-medium text-gray-800 dark:text-gray-100">{selectedChild.grade}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">学校</dt><dd className="font-medium text-gray-800 dark:text-gray-100">{selectedChild.schoolName ?? '未設定'}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">担当講師</dt><dd className="font-medium text-gray-800 dark:text-gray-100">{selectedChild.primaryTeacherName ?? '未設定'}</dd></div>
              <div><dt className="text-gray-500 dark:text-gray-400">在籍状況</dt><dd className="font-medium text-gray-800 dark:text-gray-100">{selectedChild.status === 'ACTIVE' ? '在籍中' : selectedChild.status}</dd></div>
            </dl>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📅 今後の授業</h3>
            {upcomingLessons.length === 0 ? (
              <p className="text-sm text-gray-400">予定されている授業はありません</p>
            ) : (
              <ul className="space-y-2">
                {upcomingLessons.slice(0, 5).map(lesson => (
                  <li key={lesson.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{lesson.courseName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.teacherName}</p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {new Date(lesson.scheduledAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📊 最近のテスト結果</h3>
            {examResults.length === 0 ? (
              <p className="text-sm text-gray-400">テスト記録はまだありません</p>
            ) : (
              <ul className="space-y-2">
                {examResults.map(r => (
                  <li key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{r.examName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{r.subjectName} · {r.examDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{r.score}</p>
                      <p className="text-xs text-gray-400">/ {r.maxScore}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
