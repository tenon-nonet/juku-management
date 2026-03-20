import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createInvoice, getStudents } from '../api'
import type { Student } from '../types'

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function defaultDueDate() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  d.setDate(0)
  return d.toISOString().split('T')[0]
}

interface ItemForm {
  description: string
  amount: string
}

export default function InvoiceFormPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState({ studentId: '', billingMonth: currentMonth(), dueDate: defaultDueDate(), note: '' })
  const [items, setItems] = useState<ItemForm[]>([{ description: '', amount: '' }])
  const [error, setError] = useState('')

  useEffect(() => {
    getStudents({ status: 'ACTIVE' }).then((r) => setStudents(r.data))
  }, [])

  const addItem = () => setItems([...items, { description: '', amount: '' }])
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: keyof ItemForm, value: string) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))
  }

  const totalAmount = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const validItems = items.filter((item) => item.description && item.amount)
    if (validItems.length === 0) { setError('明細を1件以上入力してください'); return }
    try {
      await createInvoice({
        studentId: Number(form.studentId),
        billingMonth: form.billingMonth,
        dueDate: form.dueDate,
        note: form.note || undefined,
        items: validItems.map((item, i) => ({ description: item.description, amount: Number(item.amount), sortOrder: i + 1 })),
      })
      navigate('/invoices')
    } catch { setError('保存に失敗しました') }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">請求書作成</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本情報</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">生徒 <span className="text-red-400">*</span></label>
              <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">選択してください</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">請求月 <span className="text-red-400">*</span></label>
              <input type="month" value={form.billingMonth} onChange={(e) => setForm({ ...form, billingMonth: e.target.value })} required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">支払期限 <span className="text-red-400">*</span></label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">備考</label>
              <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">請求明細</h2>
            <button type="button" onClick={addItem}
              className="text-xs text-indigo-600 hover:underline">+ 行を追加</button>
          </div>
          {items.map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
              <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)}
                placeholder="内容（例：月謝 4月分）"
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <input type="number" value={item.amount} onChange={(e) => updateItem(i, 'amount', e.target.value)}
                placeholder="金額" min="0"
                className="w-32 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              {items.length > 1 && (
                <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-100">合計: ¥{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">保存</button>
          <button type="button" onClick={() => navigate('/invoices')} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">キャンセル</button>
        </div>
      </form>
    </div>
  )
}
