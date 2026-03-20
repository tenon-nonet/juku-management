import { useEffect, useState } from 'react'
import { getExamResults, getStudents, getSubjects, createExamResult, deleteExamResult, getExamTypes } from '../api'
import type { ExamResult, Student, Subject, ExamType } from '../types'

export default function ExamResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [filter, setFilter] = useState({ studentId: '', subjectId: '' })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ studentId: '', subjectId: '', examTypeId: '', examName: '', examDate: '', score: '', maxScore: '100', rank: '', memo: '' })

  const load = () => {
    getExamResults({
      studentId: filter.studentId ? Number(filter.studentId) : undefined,
      subjectId: filter.subjectId ? Number(filter.subjectId) : undefined,
    }).then((r) => setResults(r.data))
  }

  useEffect(() => {
    getStudents({}).then((r) => setStudents(r.data))
    getSubjects().then((r) => setSubjects(r.data))
    getExamTypes().then((r) => setExamTypes(r.data))
  }, [])

  useEffect(() => { load() }, [filter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createExamResult({
      studentId: Number(form.studentId), subjectId: Number(form.subjectId),
      examTypeId: form.examTypeId ? Number(form.examTypeId) : undefined,
      examName: form.examName, examDate: form.examDate,
      score: Number(form.score), maxScore: Number(form.maxScore),
      rank: form.rank ? Number(form.rank) : undefined, memo: form.memo || undefined,
    })
    setShowForm(false)
    setForm({ studentId: '', subjectId: '', examTypeId: '', examName: '', examDate: '', score: '', maxScore: '100', rank: '', memo: '' })
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return
    await deleteExamResult(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-100">成績記録</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          {showForm ? '閉じる' : '+ 成績登録'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 mb-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-200">新規登録</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">生徒 *</label>
              <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required
                className="w-full border border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">選択</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">科目 *</label>
              <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required
                className="w-full border border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">選択</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">テスト種別</label>
              <select value={form.examTypeId} onChange={(e) => setForm({ ...form, examTypeId: e.target.value })}
                className="w-full border border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">選択</option>
                {examTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">テスト名 *</label>
              <input value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} required
                className="w-full border border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">実施日 *</label>
              <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} required
                className="w-full border border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="flex gap-2">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">得点 *</label>
                <input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required min="0"
                  className="w-full border border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">満点</label>
                <input type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} min="1"
                  className="w-full border border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">登録</button>
        </form>
      )}

      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-4 mb-4 flex gap-3">
        <select value={filter.studentId} onChange={(e) => setFilter({ ...filter, studentId: e.target.value })}
          className="border border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-gray-700 text-gray-100 focus:outline-none">
          <option value="">全生徒</option>
          {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
        </select>
        <select value={filter.subjectId} onChange={(e) => setFilter({ ...filter, subjectId: e.target.value })}
          className="border border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-gray-700 text-gray-100 focus:outline-none">
          <option value="">全科目</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-400">生徒</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">テスト名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">科目</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">日付</th>
              <th className="text-right px-4 py-3 font-medium text-gray-400">得点</th>
              <th className="text-right px-4 py-3 font-medium text-gray-400">割合</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {results.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">記録がありません</td></tr>}
            {results.map((r) => (
              <tr key={r.id} className="hover:bg-gray-700">
                <td className="px-4 py-3 font-medium text-gray-100">{r.studentName}</td>
                <td className="px-4 py-3 text-gray-400">{r.examName}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: r.subjectColor + '30', color: r.subjectColor }}>{r.subjectName}</span>
                </td>
                <td className="px-4 py-3 text-gray-400">{r.examDate}</td>
                <td className="px-4 py-3 text-right font-medium">{Number(r.score)}/{Number(r.maxScore)}</td>
                <td className="px-4 py-3 text-right text-gray-400">{(Number(r.score) / Number(r.maxScore) * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:underline text-xs">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
