import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getLesson, createLesson, updateLesson, getCourses, getStaff } from '../api'
import type { Course, Staff } from '../types'

export default function LessonFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [courses, setCourses] = useState<Course[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [form, setForm] = useState({
    courseId: '', teacherId: '', classroom: '', scheduledAt: '', durationMin: '60', status: 'SCHEDULED', note: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    getCourses(true).then((r) => setCourses(r.data))
    getStaff().then((r) => setStaffList(r.data))
    if (isEdit) {
      getLesson(Number(id)).then((r) => {
        const l = r.data
        const dt = new Date(l.scheduledAt)
        const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        setForm({
          courseId: String(l.courseId), teacherId: l.teacherId ? String(l.teacherId) : '',
          classroom: l.classroom ?? '', scheduledAt: local,
          durationMin: String(l.durationMin), status: l.status, note: l.note ?? ''
        })
      })
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = {
        courseId: Number(form.courseId),
        teacherId: form.teacherId ? Number(form.teacherId) : null,
        classroom: form.classroom || null,
        scheduledAt: form.scheduledAt,
        durationMin: Number(form.durationMin),
        status: form.status,
        note: form.note || null,
      }
      if (isEdit) { await updateLesson(Number(id), data) } else { await createLesson(data) }
      navigate('/lessons')
    } catch { setError('保存に失敗しました') }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">{isEdit ? '授業編集' : '授業追加'}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">コース <span className="text-red-500">*</span></label>
          <select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="">選択してください</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日時 <span className="text-red-500">*</span></label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">時間（分）</label>
            <input type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} min="10"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当講師</label>
            <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">未設定</option>
              {staffList.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">教室</label>
            <input value={form.classroom} onChange={(e) => setForm({ ...form, classroom: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
            <option value="SCHEDULED">予定</option>
            <option value="DONE">完了</option>
            <option value="CANCELLED">キャンセル</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
          <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">保存</button>
          <button type="button" onClick={() => navigate('/lessons')} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">キャンセル</button>
        </div>
      </form>
    </div>
  )
}
