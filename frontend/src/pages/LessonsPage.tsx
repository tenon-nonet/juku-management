import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLessons } from '../api'
import type { Lesson } from '../types'
import { LESSON_STATUS_LABEL, LESSON_STATUS_COLOR } from '../constants'

function getWeekRange(offset = 0) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { from: monday, to: sunday }
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const { from, to } = getWeekRange(weekOffset)
    getLessons(from.toISOString(), to.toISOString()).then((r) => setLessons(r.data))
  }, [weekOffset])

  const { from, to } = getWeekRange(weekOffset)
  const weekLabel = `${from.getFullYear()}/${from.getMonth() + 1}/${from.getDate()} 〜 ${to.getMonth() + 1}/${to.getDate()}`

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">授業スケジュール</h1>
        <Link to="/lessons/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + 授業追加
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">←</button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-48 text-center">{weekLabel}</span>
        <button onClick={() => setWeekOffset(w => w + 1)} className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">→</button>
        <button onClick={() => setWeekOffset(0)} className="text-sm text-indigo-600 hover:underline">今週</button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">日時</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">コース</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">担当</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">教室</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">時間</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">ステータス</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {lessons.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">この週の授業はありません</td></tr>
            )}
            {lessons.map((l) => {
              const dt = new Date(l.scheduledAt)
              return (
                <tr key={l.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/lessons/${l.id}`)}>
                  <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                    {dt.getMonth() + 1}/{dt.getDate()}（{['日','月','火','水','木','金','土'][dt.getDay()]}）
                    <span className="ml-2 text-gray-500 dark:text-gray-400">{dt.getHours()}:{String(dt.getMinutes()).padStart(2, '0')}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{l.courseName}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{l.teacherName ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{l.classroom ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{l.durationMin}分</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LESSON_STATUS_COLOR[l.status]}`}>
                      {LESSON_STATUS_LABEL[l.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/lessons/${l.id}/edit`} className="text-indigo-600 hover:underline text-xs">編集</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
