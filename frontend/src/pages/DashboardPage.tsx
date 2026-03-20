import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardSummary, getTodayLessons, getUnpaidInvoices } from '../api'
import type { DashboardSummary, Lesson, Invoice } from '../types'
import { INVOICE_STATUS_COLOR, INVOICE_STATUS_LABEL } from '../constants'

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [todayLessons, setTodayLessons] = useState<Lesson[]>([])
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    getDashboardSummary().then((r) => setSummary(r.data))
    getTodayLessons().then((r) => setTodayLessons(r.data))
    getUnpaidInvoices().then((r) => setUnpaidInvoices(r.data))
  }, [])

  const cards = summary ? [
    { label: '在籍生徒数', value: summary.activeStudents, unit: '名', color: 'text-indigo-600', link: '/students' },
    { label: '本日の授業', value: summary.todayLessons, unit: '件', color: 'text-blue-600', link: '/lessons' },
    { label: '未入金請求', value: summary.unpaidInvoices, unit: '件', color: 'text-red-600', link: '/invoices' },
  ] : []

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-100 mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {cards.map((c) => (
          <Link key={c.label} to={c.link} className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-5 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-400 mb-1">{c.label}</p>
            <p className={`text-3xl font-bold ${c.color}`}>{c.value}<span className="text-sm font-normal text-gray-400 ml-1">{c.unit}</span></p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-200">本日の授業</h2>
            <Link to="/lessons" className="text-xs text-indigo-600 hover:underline">一覧へ</Link>
          </div>
          {todayLessons.length === 0 ? (
            <p className="text-sm text-gray-400">本日の授業はありません</p>
          ) : (
            <div className="space-y-2">
              {todayLessons.map((lesson) => {
                const time = new Date(lesson.scheduledAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
                return (
                  <Link key={lesson.id} to={`/lessons/${lesson.id}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 text-sm">
                    <div>
                      <span className="font-medium text-gray-100">{lesson.courseName}</span>
                      {lesson.teacherName && <span className="text-gray-400 ml-2">/ {lesson.teacherName}</span>}
                    </div>
                    <span className="text-gray-400">{time}</span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-200">未入金請求</h2>
            <Link to="/invoices" className="text-xs text-indigo-600 hover:underline">一覧へ</Link>
          </div>
          {unpaidInvoices.length === 0 ? (
            <p className="text-sm text-gray-400">未入金の請求はありません</p>
          ) : (
            <div className="space-y-2">
              {unpaidInvoices.slice(0, 8).map((inv) => (
                <Link key={inv.id} to={`/invoices/${inv.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 text-sm">
                  <div>
                    <span className="font-medium text-gray-100">{inv.studentName}</span>
                    <span className="text-gray-400 ml-2">{inv.billingMonth}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${INVOICE_STATUS_COLOR[inv.status]}`}>
                      {INVOICE_STATUS_LABEL[inv.status]}
                    </span>
                    <span className="font-medium text-gray-100">¥{inv.totalAmount.toLocaleString()}</span>
                  </div>
                </Link>
              ))}
              {unpaidInvoices.length > 8 && (
                <p className="text-xs text-gray-400 text-center pt-1">他 {unpaidInvoices.length - 8} 件</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
