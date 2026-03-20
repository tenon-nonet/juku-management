import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getLesson, getLessonAttendances, updateAttendances, getStudents } from '../api'
import type { Lesson, Attendance, Student } from '../types'

const STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const
const STATUS_LABEL: Record<string, string> = { PRESENT: '出席', ABSENT: '欠席', LATE: '遅刻', EXCUSED: '公欠' }
const STATUS_COLOR: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-700 ring-green-400',
  ABSENT: 'bg-red-100 text-red-700 ring-red-400',
  LATE: 'bg-yellow-100 text-yellow-700 ring-yellow-400',
  EXCUSED: 'bg-blue-100 text-blue-700 ring-blue-400',
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

  if (!lesson) return <div className="text-gray-400">読み込み中...</div>
  const dt = new Date(lesson.scheduledAt)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{lesson.courseName}</h1>
          <p className="text-sm text-gray-500">
            {dt.getFullYear()}/{dt.getMonth() + 1}/{dt.getDate()} {dt.getHours()}:{String(dt.getMinutes()).padStart(2, '0')} ({lesson.durationMin}分)
            {lesson.classroom && ` / ${lesson.classroom}`}
            {lesson.teacherName && ` / ${lesson.teacherName}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/lessons/${lessonId}/edit`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">編集</Link>
          <Link to="/lessons" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">一覧へ</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">出席記録</h2>
          <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            {saved ? '✓ 保存済み' : '保存'}
          </button>
        </div>
        {students.length === 0 ? (
          <p className="text-gray-400 text-sm">在籍生徒がいません</p>
        ) : (
          <div className="space-y-2">
            {students.map((s) => {
              const current = attendances[s.id]?.status ?? 'PRESENT'
              return (
                <div key={s.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-800 w-32">{s.fullName}</span>
                  <div className="flex gap-1">
                    {STATUSES.map((st) => (
                      <button key={st} onClick={() => setStudentStatus(s.id, st)}
                        className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${current === st ? `${STATUS_COLOR[st]} ring-2 ring-offset-1` : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-100'}`}>
                        {STATUS_LABEL[st]}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="メモ"
                    value={attendances[s.id]?.note ?? ''}
                    onChange={(e) => setAttendances((prev) => ({ ...prev, [s.id]: { ...prev[s.id] ?? { status: 'PRESENT' }, note: e.target.value } }))}
                    className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
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
