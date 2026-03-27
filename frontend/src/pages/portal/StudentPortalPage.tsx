import { useEffect, useState } from 'react'
import { getStudentExamResults, getLessons, getStudentAbsences, createAbsenceRequest, getAnnouncements } from '../../api'
import type { ExamResult, Lesson, AbsenceRequest, Announcement } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

const ABSENCE_STATUS_LABEL: Record<string, string> = {
  PENDING: '未処理', CONFIRMED: '確認済み', MAKEUP_SCHEDULED: '補講予定', COMPLETED: '完了',
}

export default function StudentPortalPage() {
  const { user } = useAuth()
  const [examResults, setExamResults] = useState<ExamResult[]>([])
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([])
  const [absences, setAbsences] = useState<AbsenceRequest[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'home' | 'lessons' | 'grades' | 'absences'>('home')
  const [showAbsenceForm, setShowAbsenceForm] = useState(false)
  const [absenceForm, setAbsenceForm] = useState({
    absenceDate: new Date().toISOString().split('T')[0],
    reason: '',
    wantsMakeup: false,
  })

  useEffect(() => {
    if (!user?.userId) return
    const load = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const [exams, lessons, abs, ann] = await Promise.all([
          getStudentExamResults(user.userId!),
          getLessons(today, nextMonth, { studentId: user.userId! }),
          getStudentAbsences(user.userId!),
          getAnnouncements(),
        ])
        setExamResults(exams.data)
        setUpcomingLessons(lessons.data)
        setAbsences(abs.data)
        setAnnouncements(ann.data.slice(0, 3))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const handleAbsenceSubmit = async () => {
    if (!user?.userId) return
    await createAbsenceRequest({ ...absenceForm, studentId: user.userId })
    setShowAbsenceForm(false)
    setAbsenceForm({ absenceDate: new Date().toISOString().split('T')[0], reason: '', wantsMakeup: false })
    getStudentAbsences(user.userId).then(r => setAbsences(r.data))
  }

  if (loading) return <p className="text-center text-gray-400 py-12">読み込み中...</p>

  const tabs = [
    { key: 'home' as const, label: 'ホーム', icon: '🏠' },
    { key: 'lessons' as const, label: '授業', icon: '📅' },
    { key: 'grades' as const, label: '成績', icon: '📊' },
    { key: 'absences' as const, label: '欠席', icon: '📋' },
  ]

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* ヘッダー */}
      <div className="bg-indigo-600 rounded-xl p-5 mb-4 text-white">
        <p className="text-sm opacity-80">こんにちは</p>
        <h1 className="text-xl font-bold">{user?.fullName} さん</h1>
        {upcomingLessons.length > 0 && (
          <p className="text-sm opacity-90 mt-1">
            次回授業: {new Date(upcomingLessons[0].scheduledAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
            &nbsp;{new Date(upcomingLessons[0].scheduledAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

      {activeTab === 'home' && (
        <div className="space-y-4">
          {/* お知らせ */}
          {announcements.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">📢 お知らせ</h3>
              <div className="space-y-2">
                {announcements.map(a => (
                  <div key={a.id} className="text-sm">
                    <p className="font-medium text-gray-800 dark:text-gray-100">{a.title}</p>
                    <p className="text-xs text-gray-400">{a.publishedAt ?? a.createdAt}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 直近の授業 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">📅 今後の授業</h3>
            {upcomingLessons.length === 0 ? (
              <p className="text-sm text-gray-400">予定なし</p>
            ) : (
              <ul className="space-y-2">
                {upcomingLessons.slice(0, 3).map(lesson => (
                  <li key={lesson.id} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{lesson.courseName}</p>
                      <p className="text-xs text-gray-500">{lesson.teacherName}</p>
                    </div>
                    <div className="text-right text-xs text-gray-600 dark:text-gray-300">
                      <p>{new Date(lesson.scheduledAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}</p>
                      <p>{new Date(lesson.scheduledAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 欠席連絡ショートカット */}
          <button onClick={() => setShowAbsenceForm(true)}
            className="w-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">📋 欠席・遅刻連絡</p>
            <p className="text-xs text-orange-500 dark:text-orange-400 mt-0.5">タップして欠席連絡を送る</p>
          </button>
        </div>
      )}

      {activeTab === 'lessons' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">今後の授業 ({upcomingLessons.length}件)</h3>
          {upcomingLessons.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">予定なし</p>
          ) : (
            <ul className="space-y-3">
              {upcomingLessons.map(lesson => (
                <li key={lesson.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{lesson.courseName}</p>
                    <p className="text-xs text-gray-500">{lesson.teacherName}</p>
                  </div>
                  <div className="text-right text-sm text-gray-600 dark:text-gray-300">
                    <p>{new Date(lesson.scheduledAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}</p>
                    <p className="text-xs">{new Date(lesson.scheduledAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">テスト結果 ({examResults.length}件)</h3>
          {examResults.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">記録なし</p>
          ) : (
            <ul className="space-y-2">
              {examResults.map(r => (
                <li key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{r.examName}</p>
                    <p className="text-xs text-gray-500">{r.subjectName} · {r.examDate}</p>
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
      )}

      {activeTab === 'absences' && (
        <div className="space-y-3">
          <button onClick={() => setShowAbsenceForm(true)}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-indigo-700">
            + 欠席・遅刻連絡を送る
          </button>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">欠席連絡履歴</h3>
            {absences.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">連絡履歴なし</p>
            ) : (
              <ul className="space-y-2">
                {absences.map(a => (
                  <li key={a.id} className="py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{a.absenceDate}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {ABSENCE_STATUS_LABEL[a.status]}
                      </span>
                    </div>
                    {a.reason && <p className="text-xs text-gray-500 mt-0.5">{a.reason}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ボトムナビ */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex safe-area-pb">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-colors ${activeTab === t.key ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="text-xs">{t.label}</span>
          </button>
        ))}
      </div>

      {/* 欠席連絡モーダル */}
      {showAbsenceForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">欠席・遅刻連絡</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">欠席日</label>
                <input type="date" value={absenceForm.absenceDate}
                  onChange={e => setAbsenceForm(f => ({ ...f, absenceDate: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">理由</label>
                <textarea value={absenceForm.reason}
                  onChange={e => setAbsenceForm(f => ({ ...f, reason: e.target.value }))} rows={3}
                  placeholder="例: 発熱のため"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={absenceForm.wantsMakeup}
                  onChange={e => setAbsenceForm(f => ({ ...f, wantsMakeup: e.target.checked }))} />
                補講を希望する
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleAbsenceSubmit}
                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700">送信</button>
              <button onClick={() => setShowAbsenceForm(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-xl text-sm font-medium">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
