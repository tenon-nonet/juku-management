import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getInvoices } from '../api'
import type { Invoice } from '../types'

const STATUS_LABEL: Record<string, string> = { UNPAID: '未入金', PAID: '入金済', OVERDUE: '期限超過', CANCELLED: 'キャンセル' }
const STATUS_COLOR: Record<string, string> = {
  UNPAID: 'bg-red-100 text-red-700', PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-orange-100 text-orange-700', CANCELLED: 'bg-gray-100 text-gray-500'
}

function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [month, setMonth] = useState(currentMonth())
  const [status, setStatus] = useState('')

  useEffect(() => {
    getInvoices({ month: month || undefined, status: status || undefined }).then((r) => setInvoices(r.data))
  }, [month, status])

  const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0)
  const paidAmount = invoices.filter((i) => i.status === 'PAID').reduce((sum, i) => sum + i.totalAmount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800">請求・支払い</h1>
        <Link to="/invoices/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + 請求書作成
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {[
          { label: '請求合計', value: `¥${totalAmount.toLocaleString()}`, color: 'text-gray-800' },
          { label: '入金済', value: `¥${paidAmount.toLocaleString()}`, color: 'text-green-600' },
          { label: '未入金', value: `¥${(totalAmount - paidAmount).toLocaleString()}`, color: 'text-red-600' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className={`text-xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex gap-3">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none">
          <option value="">全ステータス</option>
          <option value="UNPAID">未入金</option>
          <option value="PAID">入金済</option>
          <option value="OVERDUE">期限超過</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">生徒</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">請求月</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">金額</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">ステータス</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">支払期限</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">請求書がありません</td></tr>}
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{inv.studentName}</td>
                <td className="px-4 py-3 text-gray-600">{inv.billingMonth}</td>
                <td className="px-4 py-3 text-right font-medium">¥{inv.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[inv.status]}`}>
                    {STATUS_LABEL[inv.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{inv.dueDate}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/invoices/${inv.id}`} className="text-indigo-600 hover:underline text-xs">詳細</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
