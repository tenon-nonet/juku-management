import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLessons, getStaff, getStudents } from '../api'
import type { Lesson, Staff, Student } from '../types'
import { LESSON_STATUS_LABEL, LESSON_STATUS_COLOR } from '../constants'

type ViewMode = 'week' | 'list'

const DAYS = ['月', '火', '水', '木', '金', '土', '日']
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8) // 8:00〜21:00

function getWeekDates(offset = 0): Date[] {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

function getWeekRange(offset = 0) {
  const dates = getWeekDates(offset)
  const from = new Date(dates[0]); from.setHours(0, 0, 0, 0)
  const to = new Date(dates[6]); to.setHours(23, 59, 59, 999)
  return { from, to }
}

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-indigo-100 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200',
  DONE: 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200',
  CANCELLED: 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 line-through',
}

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [filterTeacherId, setFilterTeacherId] = useState('')
  const [filterStudentId, setFilterStudentId] = useState('')
  const [teachers, setTeachers] = useState<Staff[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const navigate = useNavigate()

  const weekDates = getWeekDates(weekOffset)
  const { from, to } = getWeekRange(weekOffset)

  useEffect(() => {
    getStaff().then(r => setTeachers(r.data))
    getStudents({}).then(r => setStudents(r.data))
  }, [])

  useEffect(() => {
    getLessons(from.toISOString(), to.toISOString(), {
      teacherId: filterTeacherId ? Number(filterTeacherId) : undefined,
      studentId: filterStudentId ? Number(filterStudentId) : undefined,
    }).then((r) => setLessons(r.data))
  }, [weekOffset, filterTeacherId, filterStudentId])

  const weekLabel = `${weekDates[0].getMonth() + 1}/${weekDates[0].getDate()} 〜 ${weekDates[6].getMonth() + 1}/${weekDates[6].getDate()}`

  // Get lessons for a specific day and hour slot
  const getLessonsAt = (date: Date, hour: number) => {
    return lessons.filter(l => {
      const dt = new Date(l.scheduledAt)
      return dt.getDate() === date.getDate() &&
             dt.getMonth() === date.getMonth() &&
             dt.getFullYear() === date.getFullYear() &&
             dt.getHours() === hour
    })
  }

  const isToday = (date: Date) => {
    const now = new Date()
    return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">授業スケジュール</h1>
        <Link to="/lessons/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 min-h-[44px] flex items-center">
          + 授業追加
        </Link>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-4 flex flex-wrap gap-3 items-center">
        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekOffset(w => w - 1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold">‹</button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-40 text-center">{weekLabel}</span>
          <button onClick={() => setWeekOffset(w => w + 1)} className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold">›</button>
          <button onClick={() => setWeekOffset(0)} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline px-2">今週</button>
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-sm ${viewMode === 'week' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            カレンダー
          </button>
          <button onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-sm ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            リスト
          </button>
        </div>

        {/* Filters */}
        <select value={filterTeacherId} onChange={e => setFilterTeacherId(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
          <option value="">全講師</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.fullName}</option>)}
        </select>
        <select value={filterStudentId} onChange={e => setFilterStudentId(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
          <option value="">全生徒</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </select>

        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{lessons.length}件</span>
      </div>

      {/* Week calendar view */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Day headers */}
            <div className="grid border-b border-gray-200 dark:border-gray-700" style={{ gridTemplateColumns: '48px repeat(7, 1fr)' }}>
              <div className="px-1 py-2" />
              {weekDates.map((date, i) => (
                <div key={i} className={`px-1 py-2 text-center border-l border-gray-200 dark:border-gray-700 ${isToday(date) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{DAYS[i]}</p>
                  <p className={`text-sm font-semibold ${isToday(date) ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {date.getDate()}
                  </p>
                </div>
              ))}
            </div>

            {/* Time grid */}
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {HOURS.map(hour => (
                <div key={hour} className="grid" style={{ gridTemplateColumns: '48px repeat(7, 1fr)', minHeight: '48px' }}>
                  <div className="flex items-start justify-end pr-2 pt-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500">{hour}:00</span>
                  </div>
                  {weekDates.map((date, i) => {
                    const dayLessons = getLessonsAt(date, hour)
                    return (
                      <div key={i} className={`border-l border-gray-100 dark:border-gray-700/50 p-0.5 ${isToday(date) ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                        {dayLessons.map(l => (
                          <div
                            key={l.id}
                            onClick={() => navigate(`/lessons/${l.id}`)}
                            className={`mb-0.5 rounded border px-1 py-0.5 text-xs cursor-pointer hover:opacity-80 transition-opacity ${statusColors[l.status]}`}
                          >
                            <p className="font-medium truncate leading-tight">{l.courseName}</p>
                            {l.studentName && <p className="truncate opacity-80 leading-tight">{l.studentName}</p>}
                            {l.teacherName && <p className="truncate opacity-70 leading-tight">{l.teacherName}</p>}
                            <p className="opacity-60 leading-tight">
                              {new Date(l.scheduledAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}〜{l.durationMin}分
                            </p>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">日時</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">コース</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">生徒</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">担当</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">時間</th>
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
                  <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/lessons/${l.id}`)}>
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                      {dt.getMonth() + 1}/{dt.getDate()}（{DAYS[dt.getDay() === 0 ? 6 : dt.getDay() - 1]}）
                      <span className="ml-2 text-gray-500 dark:text-gray-400">{dt.getHours()}:{String(dt.getMinutes()).padStart(2, '0')}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{l.courseName}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{l.studentName ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{l.teacherName ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{l.durationMin}分</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LESSON_STATUS_COLOR[l.status]}`}>
                        {LESSON_STATUS_LABEL[l.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Link to={`/lessons/${l.id}/edit`} className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs">編集</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
