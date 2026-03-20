import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getStudent, createStudent, updateStudent, getGuardians } from '../api'
import type { Guardian } from '../types'

const GRADES = ['小1','小2','小3','小4','小5','小6','中1','中2','中3','高1','高2','高3','浪人','その他']

export default function StudentFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [guardians, setGuardians] = useState<Guardian[]>([])
  const [form, setForm] = useState({
    fullName: '', fullNameKana: '', birthDate: '', grade: '中1',
    schoolName: '', guardianId: '', status: 'ACTIVE', enrolledAt: '', memo: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    getGuardians().then((r) => setGuardians(r.data))
    if (isEdit) {
      getStudent(Number(id)).then((r) => {
        const s = r.data
        setForm({
          fullName: s.fullName,
          fullNameKana: s.fullNameKana ?? '',
          birthDate: s.birthDate ?? '',
          grade: s.grade,
          schoolName: s.schoolName ?? '',
          guardianId: s.guardianId ? String(s.guardianId) : '',
          status: s.status,
          enrolledAt: s.enrolledAt,
          memo: s.memo ?? '',
        })
      })
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = {
        ...form,
        guardianId: form.guardianId ? Number(form.guardianId) : null,
        birthDate: form.birthDate || null,
      }
      if (isEdit) {
        await updateStudent(Number(id), data)
      } else {
        await createStudent(data)
      }
      navigate('/students')
    } catch {
      setError('保存に失敗しました')
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">{isEdit ? '生徒編集' : '生徒新規登録'}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">氏名 <span className="text-red-500">*</span></label>
            <input value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">氏名（フリガナ）</label>
            <input value={form.fullNameKana} onChange={(e) => setForm({...form, fullNameKana: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学年 <span className="text-red-500">*</span></label>
            <select value={form.grade} onChange={(e) => setForm({...form, grade: e.target.value})} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              {GRADES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">生年月日</label>
            <input type="date" value={form.birthDate} onChange={(e) => setForm({...form, birthDate: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">学校名</label>
            <input value={form.schoolName} onChange={(e) => setForm({...form, schoolName: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">保護者</label>
            <select value={form.guardianId} onChange={(e) => setForm({...form, guardianId: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">未設定</option>
              {guardians.map((g) => <option key={g.id} value={g.id}>{g.fullName}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="ACTIVE">在籍</option>
              <option value="INACTIVE">退塾</option>
              <option value="SUSPENDED">休塾</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">入塾日</label>
            <input type="date" value={form.enrolledAt} onChange={(e) => setForm({...form, enrolledAt: e.target.value})}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
          <textarea value={form.memo} onChange={(e) => setForm({...form, memo: e.target.value})} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            保存
          </button>
          <button type="button" onClick={() => navigate('/students')} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}
