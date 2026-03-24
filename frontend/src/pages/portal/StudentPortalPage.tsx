import { useEffect, useState } from 'react'
import { getStudentExamResults, getLessons } from '../../api'
import type { ExamResult, Lesson } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

export default function StudentPortalPage() {
  const { user } = useAuth()
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.userId) return
    const load = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const [exams, lessons] = await Promise.all([
          getStudentExamResults(user.userId!),
          getLessons(today, nextMonth, { studentId: user.userId! }),
        ])
        setExamResults(exams.data.slice(0, 5))
        setUpcomingLessons(lessons.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) return <p className="text-center text-gray-400 py-12">読み込み中...</p>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-1">こんにちは、{user?.fullName}さん</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">今日も頑張りましょう！</p>
      </div>

      {/* Upcoming lessons */}
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
                <div className="text-right">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(lesson.scheduledAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(lesson.scheduledAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent exam results */}
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
    </div>
  )
}
