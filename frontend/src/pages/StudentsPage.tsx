import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getStudents, deleteStudent } from '../api'
import type { Student } from '../types'

const STATUS_LABEL: Record<string, string> = { ACTIVE: '在籍', INACTIVE: '退塾', SUSPENDED: '休塾' }
const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
  SUSPENDED: 'bg-yellow-100 text-yellow-700',
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('ACTIVE')
  const navigate = useNavigate()

  const load = async () => {
    const res = await getStudents({ name: search || undefined, grade: gradeFilter || undefined, status: statusFilter || undefined })
    setStudents(res.data)
  }

  useEffect(() => { load() }, [search, gradeFilter, statusFilter])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await deleteStudent(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">生徒管理</h1>
        <Link to="/students/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + 新規登録
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="氏名で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          placeholder="学年（例: 中1）"
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">全ステータス</option>
          <option value="ACTIVE">在籍</option>
          <option value="INACTIVE">退塾</option>
          <option value="SUSPENDED">休塾</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">氏名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">学年</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">学校</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">保護者</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">入塾日</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {students.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">生徒が見つかりません</td></tr>
            )}
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/students/${s.id}`)}>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {s.fullName}
                  {s.fullNameKana && <span className="block text-xs text-gray-400">{s.fullNameKana}</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.grade}</td>
                <td className="px-4 py-3 text-gray-600">{s.schoolName ?? '-'}</td>
                <td className="px-4 py-3 text-gray-600">{s.guardianName ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[s.status]}`}>
                    {STATUS_LABEL[s.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{s.enrolledAt}</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/students/${s.id}/edit`} className="text-indigo-600 hover:underline mr-3 text-xs">編集</Link>
                  <button onClick={() => handleDelete(s.id, s.fullName)} className="text-red-500 hover:underline text-xs">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
