import { useEffect, useState } from 'react'
import { getSalesAnalytics, bulkGenerateInvoices } from '../api'
import type { SalesAnalytics } from '../types'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316']

const fmt = (n: number) => n.toLocaleString('ja-JP') + '円'

export default function SalesPage() {
  const [data, setData] = useState<SalesAnalytics | null>(null)
  const [months, setMonths] = useState(12)
  const [bulkMonth, setBulkMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [generating, setGenerating] = useState(false)
  const [genResult, setGenResult] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'revenue' | 'enrollment' | 'course' | 'staff'>('revenue')

  useEffect(() => {
    getSalesAnalytics(months).then(r => setData(r.data))
  }, [months])

  const handleBulkGenerate = async () => {
    setGenerating(true)
    setGenResult(null)
    try {
      const r = await bulkGenerateInvoices(bulkMonth)
      setGenResult(`${r.data.length}件の請求書を生成しました`)
    } catch {
      setGenResult('エラーが発生しました')
    } finally {
      setGenerating(false)
    }
  }

  if (!data) return <div className="text-center py-12 text-gray-400">読み込み中...</div>

  const { summary, monthlyRevenue, enrollmentTrend, courseBreakdown, staffLessonCounts } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">売上・経営分析</h1>
        <select value={months} onChange={e => setMonths(Number(e.target.value))}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
          <option value={3}>直近3ヶ月</option>
          <option value={6}>直近6ヶ月</option>
          <option value={12}>直近12ヶ月</option>
        </select>
      </div>

      {/* KPIカード */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: '在籍生徒数', value: `${summary.activeStudents}名`, color: 'text-indigo-600 dark:text-indigo-400' },
          { label: '今月入金額', value: fmt(summary.currentMonthRevenue), color: 'text-green-600 dark:text-green-400' },
          { label: '未収金', value: fmt(summary.unpaidAmount), color: 'text-yellow-600 dark:text-yellow-400' },
          { label: '延滞金', value: fmt(summary.overdueAmount), color: 'text-red-600 dark:text-red-400' },
          { label: '総生徒数', value: `${summary.totalStudents}名`, color: 'text-gray-600 dark:text-gray-400' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</p>
            <p className={`text-lg font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* 月次一括請求生成 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">月次請求書 一括生成</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <input type="month" value={bulkMonth} onChange={e => setBulkMonth(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
          <button onClick={handleBulkGenerate} disabled={generating}
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {generating ? '生成中...' : '在籍全生徒分を生成'}
          </button>
          {genResult && <span className="text-sm text-green-600 dark:text-green-400">{genResult}</span>}
        </div>
        <p className="text-xs text-gray-400 mt-2">※ 既に作成済みの月は上書きせずスキップします</p>
      </div>

      {/* タブ */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {([
            ['revenue', '売上推移'],
            ['enrollment', '在籍推移'],
            ['course', 'コース別'],
            ['staff', '講師別'],
          ] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* 売上推移 */}
          {activeTab === 'revenue' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">月次売上推移</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={v => `${(v/10000).toFixed(0)}万`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="billedAmount"    name="請求額"  fill="#6366f1" />
                  <Bar dataKey="collectedAmount" name="入金額"  fill="#22c55e" />
                  <Bar dataKey="uncollectedAmount" name="未収額" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
              {/* 月次テーブル */}
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      {['月', '請求件数', '請求額', '入金額', '未収額', '回収率'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-gray-500 dark:text-gray-400 font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {[...monthlyRevenue].reverse().map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{r.month}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{r.invoiceCount}件</td>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{fmt(r.billedAmount)}</td>
                        <td className="px-3 py-2 text-green-600 dark:text-green-400">{fmt(r.collectedAmount)}</td>
                        <td className="px-3 py-2 text-yellow-600 dark:text-yellow-400">{fmt(r.uncollectedAmount)}</td>
                        <td className="px-3 py-2 text-gray-600 dark:text-gray-300">
                          {r.billedAmount > 0 ? Math.round(r.collectedAmount / r.billedAmount * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 在籍推移 */}
          {activeTab === 'enrollment' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">在籍生徒数推移</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={enrollmentTrend} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="activeCount" name="在籍数" stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="newCount"    name="新規入塾" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="leftCount"   name="退塾" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* コース別 */}
          {activeTab === 'course' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">コース別受講者数</h3>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={courseBreakdown} dataKey="studentCount" nameKey="courseName"
                      cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name} ${value}名`}>
                      {courseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}名`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">コース別月次売上</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400 font-medium">コース</th>
                      <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400 font-medium">受講者数</th>
                      <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400 font-medium">月次売上</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {courseBreakdown.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue).map((c, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{c.courseName}</td>
                        <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">{c.studentCount}名</td>
                        <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">{fmt(c.monthlyRevenue)}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold bg-gray-50 dark:bg-gray-900">
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">合計</td>
                      <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">
                        {courseBreakdown.reduce((s, c) => s + c.studentCount, 0)}名
                      </td>
                      <td className="px-3 py-2 text-right text-gray-800 dark:text-gray-100">
                        {fmt(courseBreakdown.reduce((s, c) => s + c.monthlyRevenue, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 講師別 */}
          {activeTab === 'staff' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">講師別担当コマ数（期間累計）</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={staffLessonCounts} layout="vertical" margin={{ left: 60, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="staffName" tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="doneCount"   name="実施済み" fill="#22c55e" stackId="a" />
                  <Bar dataKey="lessonCount" name="総コマ数" fill="#6366f133" stackId="b" />
                </BarChart>
              </ResponsiveContainer>
              <table className="w-full text-sm mt-4">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-3 py-2 text-left text-gray-500 dark:text-gray-400 font-medium">講師</th>
                    <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400 font-medium">総コマ数</th>
                    <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400 font-medium">実施済み</th>
                    <th className="px-3 py-2 text-right text-gray-500 dark:text-gray-400 font-medium">実施率</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {staffLessonCounts.map((s, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{s.staffName}</td>
                      <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">{s.lessonCount}</td>
                      <td className="px-3 py-2 text-right text-green-600 dark:text-green-400">{s.doneCount}</td>
                      <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-300">
                        {s.lessonCount > 0 ? Math.round(s.doneCount / s.lessonCount * 100) : 0}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
