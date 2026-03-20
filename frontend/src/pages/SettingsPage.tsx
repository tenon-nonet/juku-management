import { useEffect, useState } from 'react'
import {
  getSubjects, createSubject, updateSubject, deleteSubject,
  getCourses, createCourse, updateCourse, deleteCourse,
  getExamTypes, getStaff, createStaff, updateStaff, deleteStaff,
} from '../api'
import type { Subject, Course, ExamType, Staff } from '../types'

type Tab = 'subjects' | 'courses' | 'examTypes' | 'staff'

const TABS: { key: Tab; label: string }[] = [
  { key: 'subjects', label: '科目' },
  { key: 'courses', label: 'コース' },
  { key: 'examTypes', label: 'テスト種別' },
  { key: 'staff', label: 'スタッフ' },
]

// ---- Subjects ----
function SubjectsTab() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [form, setForm] = useState({ name: '', color: '#6366f1' })
  const [editId, setEditId] = useState<number | null>(null)

  const load = () => getSubjects().then((r) => setSubjects(r.data))
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    if (!form.name) return
    if (editId) { await updateSubject(editId, form) } else { await createSubject(form) }
    setForm({ name: '', color: '#6366f1' }); setEditId(null); load()
  }

  const handleEdit = (s: Subject) => { setEditId(s.id); setForm({ name: s.name, color: s.color }) }
  const handleDelete = async (id: number) => { if (!confirm('削除しますか？')) return; await deleteSubject(id); load() }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 flex gap-3 items-end">
        <div>
          <label className="text-xs text-gray-400 block mb-1">科目名</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48" />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">カラー</label>
          <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="h-9 w-16 border border-gray-600 rounded-lg cursor-pointer" />
        </div>
        <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          {editId ? '更新' : '追加'}
        </button>
        {editId && <button onClick={() => { setEditId(null); setForm({ name: '', color: '#6366f1' }) }}
          className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-600">キャンセル</button>}
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-400">科目名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">カラー</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {subjects.map((s) => (
              <tr key={s.id} className="hover:bg-gray-700">
                <td className="px-4 py-3 font-medium text-gray-100">{s.name}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                    {s.color}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(s)} className="text-indigo-600 hover:underline text-xs mr-3">編集</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:underline text-xs">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Courses ----
function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [form, setForm] = useState({ name: '', subjectId: '', gradeTarget: '', monthlyFee: '', description: '', isActive: true })
  const [editId, setEditId] = useState<number | null>(null)

  const load = () => getCourses().then((r) => setCourses(r.data))
  useEffect(() => { load(); getSubjects().then((r) => setSubjects(r.data)) }, [])

  const handleSave = async () => {
    if (!form.name || !form.monthlyFee) return
    const data = { name: form.name, subjectId: form.subjectId ? Number(form.subjectId) : undefined, gradeTarget: form.gradeTarget || undefined, monthlyFee: Number(form.monthlyFee), description: form.description || undefined, isActive: form.isActive }
    if (editId) { await updateCourse(editId, data) } else { await createCourse(data) }
    setForm({ name: '', subjectId: '', gradeTarget: '', monthlyFee: '', description: '', isActive: true }); setEditId(null); load()
  }

  const handleEdit = (c: Course) => {
    setEditId(c.id)
    setForm({ name: c.name, subjectId: c.subjectId?.toString() ?? '', gradeTarget: c.gradeTarget ?? '', monthlyFee: c.monthlyFee.toString(), description: c.description ?? '', isActive: c.isActive })
  }
  const handleDelete = async (id: number) => { if (!confirm('削除しますか？')) return; await deleteCourse(id); load() }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">コース名 *</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">科目</label>
            <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">なし</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">月謝 (円) *</label>
            <input type="number" value={form.monthlyFee} onChange={(e) => setForm({ ...form, monthlyFee: e.target.value })} min="0"
              className="w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">対象学年</label>
            <input value={form.gradeTarget} onChange={(e) => setForm({ ...form, gradeTarget: e.target.value })}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">説明</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded" />
              有効
            </label>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            {editId ? '更新' : '追加'}
          </button>
          {editId && <button onClick={() => { setEditId(null); setForm({ name: '', subjectId: '', gradeTarget: '', monthlyFee: '', description: '', isActive: true }) }}
            className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-600">キャンセル</button>}
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-400">コース名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">科目</th>
              <th className="text-right px-4 py-3 font-medium text-gray-400">月謝</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">状態</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {courses.map((c) => (
              <tr key={c.id} className="hover:bg-gray-700">
                <td className="px-4 py-3 font-medium text-gray-100">{c.name}</td>
                <td className="px-4 py-3 text-gray-400">{c.subjectName ?? '-'}</td>
                <td className="px-4 py-3 text-right">¥{c.monthlyFee.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isActive ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    {c.isActive ? '有効' : '無効'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(c)} className="text-indigo-600 hover:underline text-xs mr-3">編集</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:underline text-xs">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Exam Types ----
function ExamTypesTab() {
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [name, setName] = useState('')

  const load = () => getExamTypes().then((r) => setExamTypes(r.data))
  useEffect(() => { load() }, [])

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 flex gap-3 items-end">
        <div>
          <label className="text-xs text-gray-400 block mb-1">種別名</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 w-48" />
        </div>
        <p className="text-xs text-gray-400 pb-2">※ テスト種別の編集・削除は現在未対応です</p>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-400">種別名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">表示順</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {examTypes.map((t) => (
              <tr key={t.id} className="hover:bg-gray-700">
                <td className="px-4 py-3 font-medium text-gray-100">{t.name}</td>
                <td className="px-4 py-3 text-gray-400">{t.sortOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ---- Staff ----
function StaffTab() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [form, setForm] = useState({ username: '', fullName: '', role: 'STAFF', password: '' })
  const [editId, setEditId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const load = () => getStaff().then((r) => setStaffList(r.data))
  useEffect(() => { load() }, [])

  const handleSave = async () => {
    setError('')
    if (!form.fullName || (!editId && !form.password)) { setError('必須項目を入力してください'); return }
    try {
      if (editId) {
        await updateStaff(editId, { fullName: form.fullName, role: form.role as 'ADMIN' | 'STAFF', password: form.password || undefined })
      } else {
        await createStaff({ username: form.username, fullName: form.fullName, role: form.role as 'ADMIN' | 'STAFF', password: form.password })
      }
      setForm({ username: '', fullName: '', role: 'STAFF', password: '' }); setEditId(null); load()
    } catch { setError('保存に失敗しました') }
  }

  const handleEdit = (s: Staff) => { setEditId(s.id); setForm({ username: s.username, fullName: s.fullName, role: s.role, password: '' }) }
  const handleDelete = async (id: number) => { if (!confirm('削除しますか？')) return; await deleteStaff(id); load() }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {!editId && (
            <div>
              <label className="text-xs text-gray-400 block mb-1">ユーザー名 *</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          )}
          <div>
            <label className="text-xs text-gray-400 block mb-1">氏名 *</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">権限</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="STAFF">スタッフ</option>
              <option value="ADMIN">管理者</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">パスワード {!editId && <span className="text-red-400">*</span>}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editId ? '変更する場合のみ入力' : ''}
              className="w-full border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            {editId ? '更新' : '追加'}
          </button>
          {editId && <button onClick={() => { setEditId(null); setForm({ username: '', fullName: '', role: 'STAFF', password: '' }) }}
            className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-600">キャンセル</button>}
        </div>
      </div>
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-400">ユーザー名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">氏名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">権限</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {staffList.map((s) => (
              <tr key={s.id} className="hover:bg-gray-700">
                <td className="px-4 py-3 text-gray-100">{s.username}</td>
                <td className="px-4 py-3 font-medium text-gray-100">{s.fullName}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.role === 'ADMIN' ? 'bg-indigo-900/50 text-indigo-300' : 'bg-blue-900/50 text-blue-400'}`}>
                    {s.role === 'ADMIN' ? '管理者' : 'スタッフ'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleEdit(s)} className="text-indigo-600 hover:underline text-xs mr-3">編集</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:underline text-xs">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('subjects')

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-100 mb-6">設定</h1>
      <div className="flex gap-1 mb-6 border-b border-gray-700">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-200'}`}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'subjects' && <SubjectsTab />}
      {tab === 'courses' && <CoursesTab />}
      {tab === 'examTypes' && <ExamTypesTab />}
      {tab === 'staff' && <StaffTab />}
    </div>
  )
}
