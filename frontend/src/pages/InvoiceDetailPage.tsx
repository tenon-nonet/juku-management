import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getInvoice, getInvoicePayments, addPayment, updateInvoiceStatus } from '../api'
import type { Invoice, Payment } from '../types'

const STATUS_LABEL: Record<string, string> = { UNPAID: '未入金', PAID: '入金済', OVERDUE: '期限超過', CANCELLED: 'キャンセル' }
const STATUS_COLOR: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-700', PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-orange-100 text-orange-700', CANCELLED: 'bg-gray-100 text-gray-500'
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const invoiceId = Number(id)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [form, setForm] = useState({ paidAmount: '', paidAt: new Date().toISOString().split('T')[0], method: 'BANK_TRANSFER', note: '' })
  const [error, setError] = useState('')

  const loadAll = () => {
    getInvoice(invoiceId).then((r) => setInvoice(r.data))
    getInvoicePayments(invoiceId).then((r) => setPayments(r.data))
  }

  useEffect(() => { loadAll() }, [invoiceId])

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await addPayment(invoiceId, { paidAmount: Number(form.paidAmount), paidAt: form.paidAt, method: form.method, note: form.note || undefined })
      setForm({ paidAmount: '', paidAt: new Date().toISOString().split('T')[0], method: 'BANK_TRANSFER', note: '' })
      loadAll()
    } catch { setError('登録に失敗しました') }
  }

  const handleStatusChange = async (status: string) => {
    await updateInvoiceStatus(invoiceId, status)
    loadAll()
  }

  if (!invoice) return <div className="text-gray-400">読み込み中...</div>

  const totalPaid = payments.reduce((sum, p) => sum + p.paidAmount, 0)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{invoice.studentName} / {invoice.billingMonth}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[invoice.status]}`}>
            {STATUS_LABEL[invoice.status]}
          </span>
        </div>
        <Link to="/invoices" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">一覧へ</Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">請求明細</h2>
        <table className="w-full text-sm mb-3">
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="py-2 text-gray-700">{item.description}</td>
                <td className="py-2 text-right font-medium">¥{item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-200">
              <td className="py-2 font-bold text-gray-800">合計</td>
              <td className="py-2 text-right font-bold text-gray-800">¥{invoice.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">支払期限: {invoice.dueDate}</span>
          <div className="flex gap-2">
            {invoice.status !== 'PAID' && (
              <button onClick={() => handleStatusChange('PAID')} className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200">入金済にする</button>
            )}
            {invoice.status !== 'CANCELLED' && (
              <button onClick={() => handleStatusChange('CANCELLED')} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200">キャンセル</button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">入金履歴</h2>
        <div className="mb-3 text-sm">
          <span className="text-gray-500">入金済: </span>
          <span className="font-bold text-green-600">¥{totalPaid.toLocaleString()}</span>
          <span className="text-gray-400"> / 残: ¥{(invoice.totalAmount - totalPaid).toLocaleString()}</span>
        </div>
        {payments.length === 0 ? (
          <p className="text-gray-400 text-sm">入金記録なし</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b"><tr>
              <th className="text-left pb-2">日付</th><th className="text-right pb-2">金額</th><th className="text-left pb-2">方法</th><th className="text-left pb-2">記録者</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2">{p.paidAt}</td>
                  <td className="py-2 text-right font-medium">¥{p.paidAmount.toLocaleString()}</td>
                  <td className="py-2 text-gray-600">{p.method}</td>
                  <td className="py-2 text-gray-600">{p.recordedBy ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">入金登録</h2>
        <form onSubmit={handleAddPayment} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 mb-1 block">入金額 *</label>
              <input type="number" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} required min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="text-xs text-gray-600 mb-1 block">入金日 *</label>
              <input type="date" value={form.paidAt} onChange={(e) => setForm({ ...form, paidAt: e.target.value })} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">支払方法</label>
            <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="BANK_TRANSFER">銀行振込</option>
              <option value="CASH">現金</option>
              <option value="CREDIT_CARD">クレジットカード</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">登録</button>
        </form>
      </div>
    </div>
  )
}
