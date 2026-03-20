import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLesson, getLessonAttendances, updateAttendances, getStudents } from '../api'
import type { Lesson, Attendance, Student } from '../types'
import { ATTEND_STATUSES, ATTEND_LABEL } from '../constants'

const ATTEND_BADGE_COLOR: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700 ring-green-400 dark:bg-green-900/50 dark:text-green-400 dark:ring-green-600',
  ABSENT: 'bg-red-100 text-red-700 ring-red-400 dark:bg-red-900/50 dark:text-red-400 dark:ring-red-600',
  LATE: 'bg-yellow-100 text-yellow-700 ring-yellow-400 dark:bg-yellow-900/50 dark:text-yellow-400 dark:ring-yellow-600',
  EXCUSED: 'bg-blue-100 text-blue-700 ring-blue-400 dark:bg-blue-900/50 dark:text-blue-400 dark:ring-blue-600',
}

export default function LessonDetailPage() {
  const { id } = useParams()
  const lessonId = Number(id)
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [attendances, setAttendances] = useState<Record<number, { status: string; note: string }>>({})
  const [students, setStudents] = useState<Student[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getLesson(lessonId).then((r) => {
      setLesson(r.data)
      // コースに紐づく生徒を取得（全生徒から）
      getStudents({ status: 'ACTIVE' }).then((sr) => setStudents(sr.data))
    })
    getLessonAttendances(lessonId).then((r) => {
      const map: Record<number, { status: string; note: string }> = {}
      r.data.forEach((a: Attendance) => { map[a.studentId] = { status: a.status, note: a.note ?? '' } })
      setAttendances(map)
    })
  }, [lessonId])

  const setStudentStatus = (studentId: number, status: string) => {
    setAttendances((prev) => ({ ...prev, [studentId]: { ...prev[studentId] ?? { note: '' }, status } }))
  }

  const handleSave = async () => {
    const entries = students.map((s) => ({
      studentId: s.id,
      status: attendances[s.id]?.status ?? 'PRESENT',
      note: attendances[s.id]?.note ?? '',
    }))
    await updateAttendances(lessonId, entries)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!lesson) return <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
  const dt = new Date(lesson.scheduledAt)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{lesson.courseName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {dt.getFullYear()}/{dt.getMonth() + 1}/{dt.getDate()} {dt.getHours()}:{String(dt.getMinutes()).padStart(2, '0')} ({lesson.durationMin}分)
            {lesson.classroom && ` / ${lesson.classroom}`}
            {lesson.teacherName && ` / ${lesson.teacherName}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/lessons/${lessonId}/edit`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">編集</Link>
          <Link to="/lessons" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">一覧へ</Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">出席記録</h2>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            {saved ? '✓ 保存済み' : '保存'}
          </button>
        </div>
        {students.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">在籍生徒がいません</p>
        ) : (
          <div className="space-y-2">
            {students.map((s) => {
              const current = attendances[s.id]?.status ?? 'PRESENT'
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100 w-32">{s.fullName}</span>
                  <div className="flex gap-1">
                    {ATTEND_STATUSES.map((st) => (
                      <button key={st} onClick={() => setStudentStatus(s.id, st)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${current === st ? `${ATTEND_BADGE_COLOR[st]} ring-2 ring-offset-1 ring-offset-gray-100 dark:ring-offset-gray-700` : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                        {ATTEND_LABEL[st]}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="メモ"
                    value={attendances[s.id]?.note ?? ''}
                    onChange={(e) => setAttendances((prev) => ({ ...prev, [s.id]: { ...prev[s.id] ?? { status: 'PRESENT' }, note: e.target.value } }))}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
