import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getGuardian, createGuardian, updateGuardian } from '../api'

export default function GuardianFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', fullNameKana: '', phone: '', phoneSub: '', email: '', address: '', memo: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      getGuardian(Number(id)).then((r) => {
        const g = r.data
        setForm({ fullName: g.fullName, fullNameKana: g.fullNameKana ?? '', phone: g.phone, phoneSub: g.phoneSub ?? '', email: g.email ?? '', address: g.address ?? '', memo: g.memo ?? '' })
      })
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isEdit) { await updateGuardian(Number(id), form) } else { await createGuardian(form) }
      navigate('/guardians')
    } catch { setError('保存に失敗しました') }
  }

  const field = (label: string, key: keyof typeof form, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
    </div>
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">{isEdit ? '保護者編集' : '保護者新規登録'}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {field('氏名', 'fullName', 'text', true)}
          {field('氏名（フリガナ）', 'fullNameKana')}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {field('電話番号', 'phone', 'tel', true)}
          {field('電話番号（副）', 'phoneSub', 'tel')}
        </div>
        {field('メールアドレス', 'email', 'email')}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">住所</label>
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
          <textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">保存</button>
          <button type="button" onClick={() => navigate('/guardians')} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">キャンセル</button>
        </div>
      </form>
    </div>
  )
}
