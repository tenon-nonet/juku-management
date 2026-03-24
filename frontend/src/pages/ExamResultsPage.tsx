import { useEffect, useRef, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer, ReferenceLine
} from 'recharts'
import {
  getExamResults, getStudents, getSubjects, createExamResult, deleteExamResult, getExamTypes,
  importExamResultsCsv, getStudentGradeTrend, getSchoolDistribution, getExamNames
} from '../api'
import type { ExamResult, Student, Subject, ExamType } from '../types'

type Tab = 'list' | 'trend' | 'distribution'

const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400'

export default function ExamResultsPage() {
  const [tab, setTab] = useState<Tab>('list')
  const [results, setResults] = useState<ExamResult[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [examTypes, setExamTypes] = useState<ExamType[]>([])
  const [filter, setFilter] = useState({ studentId: '', subjectId: '' })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    studentId: '', subjectId: '', examTypeId: '', examName: '', examDate: '',
    score: '', maxScore: '100', rank: '', totalStudents: '', memo: '',
    academicYear: '', semester: '', gradeAtExam: ''
  })

  // CSV import
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ successCount: number; errorCount: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Trend analysis
  const [trendStudentId, setTrendStudentId] = useState('')
  const [trendSubjectId, setTrendSubjectId] = useState('')
  const [trendData, setTrendData] = useState<any[]>([])
  const [trendLoading, setTrendLoading] = useState(false)

  // Distribution
  const [distSchool, setDistSchool] = useState('')
  const [distExamName, setDistExamName] = useState('')
  const [examNameList, setExamNameList] = useState<string[]>([])
  const [distData, setDistData] = useState<any>(null)
  const [distLoading, setDistLoading] = useState(false)

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
    getExamNames().then((r) => setExamNameList(r.data))
  }, [])

  useEffect(() => { load() }, [filter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createExamResult({
      studentId: Number(form.studentId), subjectId: Number(form.subjectId),
      examTypeId: form.examTypeId ? Number(form.examTypeId) : undefined,
      examName: form.examName, examDate: form.examDate,
      score: Number(form.score), maxScore: Number(form.maxScore),
      rank: form.rank ? Number(form.rank) : undefined,
      totalStudents: form.totalStudents ? Number(form.totalStudents) : undefined,
      memo: form.memo || undefined,
      academicYear: form.academicYear ? Number(form.academicYear) : undefined,
      semester: form.semester ? Number(form.semester) : undefined,
      gradeAtExam: form.gradeAtExam || undefined,
    })
    setShowForm(false)
    setForm({ studentId: '', subjectId: '', examTypeId: '', examName: '', examDate: '', score: '', maxScore: '100', rank: '', totalStudents: '', memo: '', academicYear: '', semester: '', gradeAtExam: '' })
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return
    await deleteExamResult(id)
    load()
  }

  const handleExport = () => {
    const params = new URLSearchParams()
    if (filter.studentId) params.set('studentId', filter.studentId)
    if (filter.subjectId) params.set('subjectId', filter.subjectId)
    window.location.href = `/api/exam-results/export?${params}`
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const res = await importExamResultsCsv(file)
      setImportResult(res.data)
      if (res.data.successCount > 0) load()
    } catch {
      setImportResult({ successCount: 0, errorCount: 1, errors: ['インポートに失敗しました'] })
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const loadTrend = async () => {
    if (!trendStudentId) return
    setTrendLoading(true)
    try {
      const res = await getStudentGradeTrend(Number(trendStudentId), trendSubjectId ? Number(trendSubjectId) : undefined)
      setTrendData(res.data)
    } finally {
      setTrendLoading(false)
    }
  }

  const loadDistribution = async () => {
    if (!distSchool || !distExamName) return
    setDistLoading(true)
    try {
      const res = await getSchoolDistribution(distSchool, distExamName)
      setDistData(res.data)
    } finally {
      setDistLoading(false)
    }
  }

  const subjectColors = subjects.reduce((acc, s) => ({ ...acc, [s.name]: s.color }), {} as Record<string, string>)
  const uniqueSubjects = [...new Set(trendData.map((d: any) => d.subjectName))]

  const distChartData = distData?.buckets
    ? Object.entries(distData.buckets).map(([range, count]) => ({ range, count }))
    : []

  const tabCls = (t: Tab) =>
    `px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
      tab === t
        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
    }`

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">成績管理</h1>
        <div className="flex gap-2 flex-wrap">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} className="hidden" id="csv-import" />
          <label htmlFor="csv-import"
            className="cursor-pointer bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            {importing ? '取り込み中...' : '📥 CSV取込'}
          </label>
          <button onClick={handleExport}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
            📤 CSV出力
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
            {showForm ? '閉じる' : '+ 成績登録'}
          </button>
        </div>
      </div>

      {/* Import result */}
      {importResult && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${importResult.errorCount === 0 ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'}`}>
          <p className="font-medium">取込結果: 成功 {importResult.successCount}件 / エラー {importResult.errorCount}件</p>
          {importResult.errors.length > 0 && (
            <ul className="mt-1 space-y-0.5 list-disc list-inside text-xs">
              {importResult.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
              {importResult.errors.length > 5 && <li>他 {importResult.errors.length - 5} 件...</li>}
            </ul>
          )}
        </div>
      )}

      {/* Registration form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 mb-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">成績登録</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">生徒 *</label>
              <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required className={inputCls}>
                <option value="">選択</option>
                {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">科目 *</label>
              <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required className={inputCls}>
                <option value="">選択</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">テスト種別</label>
              <select value={form.examTypeId} onChange={(e) => setForm({ ...form, examTypeId: e.target.value })} className={inputCls}>
                <option value="">選択</option>
                {examTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">テスト名 *</label>
              <input value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} required className={inputCls} />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">実施日 *</label>
              <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} required className={inputCls} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">得点 *</label>
                <input type="number" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} required min="0" className={inputCls} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">満点</label>
                <input type="number" value={form.maxScore} onChange={(e) => setForm({ ...form, maxScore: e.target.value })} min="1" className={inputCls} />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">順位</label>
                <input type="number" value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} min="1" className={inputCls} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">受験者数</label>
                <input type="number" value={form.totalStudents} onChange={(e) => setForm({ ...form, totalStudents: e.target.value })} min="1" className={inputCls} />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">年度</label>
                <input type="number" value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} placeholder="2025" className={inputCls} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">学期</label>
                <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} className={inputCls}>
                  <option value="">-</option>
                  <option value="1">1学期</option>
                  <option value="2">2学期</option>
                  <option value="3">3学期</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">受験時の学年</label>
              <input value={form.gradeAtExam} onChange={(e) => setForm({ ...form, gradeAtExam: e.target.value })} placeholder="中1" className={inputCls} />
            </div>
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">登録</button>
        </form>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4 flex gap-1">
        <button className={tabCls('list')} onClick={() => setTab('list')}>成績一覧</button>
        <button className={tabCls('trend')} onClick={() => setTab('trend')}>推移グラフ</button>
        <button className={tabCls('distribution')} onClick={() => setTab('distribution')}>学校別分布</button>
      </div>

      {/* List tab */}
      {tab === 'list' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 flex gap-3 flex-wrap">
            <select value={filter.studentId} onChange={(e) => setFilter({ ...filter, studentId: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none">
              <option value="">全生徒</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
            <select value={filter.subjectId} onChange={(e) => setFilter({ ...filter, subjectId: e.target.value })}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none">
              <option value="">全科目</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">生徒</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">テスト名</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">科目</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">日付</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">学期</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">得点</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400">割合</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">順位</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {results.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">記録がありません</td></tr>
                )}
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{r.studentName}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.examName}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: r.subjectColor + '30', color: r.subjectColor }}>{r.subjectName}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.examDate}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {r.academicYear && <span>{r.academicYear}年度</span>}
                      {r.semester && <span className="ml-1">{r.semester}学期</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800 dark:text-gray-100">{Number(r.score)}/{Number(r.maxScore)}</td>
                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{(Number(r.score) / Number(r.maxScore) * 100).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {r.rank && r.totalStudents ? `${r.rank}/${r.totalStudents}` : r.rank ? `${r.rank}位` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(r.id)} className="text-red-400 hover:underline text-xs">削除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Trend tab */}
      {tab === 'trend' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-3 flex-wrap items-end">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">生徒 *</label>
                <select value={trendStudentId} onChange={(e) => setTrendStudentId(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value="">選択してください</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">科目（絞り込み）</label>
                <select value={trendSubjectId} onChange={(e) => setTrendSubjectId(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value="">全科目</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <button onClick={loadTrend} disabled={!trendStudentId || trendLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 min-h-[38px]">
                {trendLoading ? '読込中...' : '表示'}
              </button>
            </div>
          </div>

          {trendData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
                成績推移（{students.find(s => s.id === Number(trendStudentId))?.fullName}）
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="examName" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: any) => [`${value}%`, '得点率']} />
                  <Legend />
                  <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '70%', fontSize: 10 }} />
                  {uniqueSubjects.map((subj) => (
                    <Line
                      key={subj}
                      type="monotone"
                      dataKey="percentage"
                      data={trendData.filter((d: any) => d.subjectName === subj)}
                      name={subj}
                      stroke={subjectColors[subj] || '#6366f1'}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">テスト名</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">科目</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">日付</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-500">得点率</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-500">順位</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {trendData.map((d: any, i: number) => (
                      <tr key={i}>
                        <td className="px-3 py-2 text-gray-800 dark:text-gray-100">{d.examName}</td>
                        <td className="px-3 py-2">
                          <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: (subjectColors[d.subjectName] || '#6366f1') + '30', color: subjectColors[d.subjectName] || '#6366f1' }}>{d.subjectName}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-500">{d.examDate}</td>
                        <td className="px-3 py-2 text-right font-medium">{Number(d.percentage)}%</td>
                        <td className="px-3 py-2 text-right text-gray-500">{d.rank ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {trendData.length === 0 && trendStudentId && !trendLoading && (
            <p className="text-center text-gray-400 py-8">データがありません</p>
          )}
        </div>
      )}

      {/* Distribution tab */}
      {tab === 'distribution' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-3 flex-wrap items-end">
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">学校名 *</label>
                <input
                  value={distSchool}
                  onChange={(e) => setDistSchool(e.target.value)}
                  placeholder="○○中学校"
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 w-48"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">テスト名 *</label>
                <select value={distExamName} onChange={(e) => setDistExamName(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value="">選択</option>
                  {examNameList.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <button onClick={loadDistribution} disabled={!distSchool || !distExamName || distLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                {distLoading ? '読込中...' : '表示'}
              </button>
            </div>
          </div>

          {distData && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {distSchool} - {distExamName} の得点分布
              </h3>
              <div className="flex gap-6 mb-4 text-sm">
                <div><span className="text-gray-500 dark:text-gray-400">対象人数: </span><span className="font-medium text-gray-800 dark:text-gray-100">{distData.count}人</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">平均: </span><span className="font-medium text-gray-800 dark:text-gray-100">{distData.average}点</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">最高: </span><span className="font-medium text-gray-800 dark:text-gray-100">{distData.max}点</span></div>
                <div><span className="text-gray-500 dark:text-gray-400">最低: </span><span className="font-medium text-gray-800 dark:text-gray-100">{distData.min}点</span></div>
              </div>
              {distChartData.length > 0 && (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={distChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="人数" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
