import { useEffect, useState } from 'react'
import { getPendingAbsences, updateAbsenceStatus, getStudents, createAbsenceRequest } from '../api'
import type { AbsenceRequest, Student } from '../types'

const STATUS_LABEL: Record<string, string> = {
  PENDING: '未処理',
  CONFIRMED: '確認済み',
  MAKEUP_SCHEDULED: '補講予定',
  COMPLETED: '完了',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  MAKEUP_SCHEDULED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  COMPLETED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

const emptyForm = () => ({
  studentId: 0,
  absenceDate: new Date().toISOString().split('T')[0],
  reason: '',
  wantsMakeup: false,
})

export default function AbsenceRequestsPage() {
  const [pending, setPending] = useState<AbsenceRequest[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [showAll, setShowAll] = useState(false)
  const [allRequests, setAllRequests] = useState<AbsenceRequest[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm())

  const load = async () => {
    const r = await getPendingAbsences()
    setPending(r.data)
  }

  useEffect(() => {
    load()
    getStudents().then(r => setStudents(r.data))
  }, [])

  const handleStatus = async (id: number, status: string) => {
    await updateAbsenceStatus(id, status)
    load()
  }

  const handleCreate = async () => {
    if (!form.studentId) return
    await createAbsenceRequest(form)
    setShowModal(false)
    setForm(emptyForm())
    load()
  }

  const displayed = showAll ? allRequests : pending

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">欠席連絡管理</h1>
        <button onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 min-h-[44px] flex items-center">
          + 欠席登録
        </button>
      </div>

      {/* サマリカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {Object.entries(STATUS_LABEL).map(([key, label]) => {
          const count = pending.filter(r => r.status === key).length
          return (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
            </div>
          )
        })}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-4 flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
          <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} className="rounded" />
          全件表示（処理済み含む）
        </label>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{pending.length}件の未処理</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {['生徒名', '欠席日', '理由', '補講希望', 'ステータス', '操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pending.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                未処理の欠席連絡はありません
              </td></tr>
            )}
            {pending.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{r.studentName}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.absenceDate}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{r.reason ?? '-'}</td>
                <td className="px-4 py-3">
                  {r.wantsMakeup
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 font-medium">希望</span>
                    : <span className="text-xs text-gray-400">なし</span>
                  }
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2 items-center">
                  {r.status === 'PENDING' && (
                    <button onClick={() => handleStatus(r.id, 'CONFIRMED')}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline">確認</button>
                  )}
                  {r.status === 'CONFIRMED' && r.wantsMakeup && (
                    <button onClick={() => handleStatus(r.id, 'MAKEUP_SCHEDULED')}
                      className="text-xs text-orange-600 dark:text-orange-400 hover:underline">補講設定</button>
                  )}
                  {(r.status === 'CONFIRMED' || r.status === 'MAKEUP_SCHEDULED') && (
                    <button onClick={() => handleStatus(r.id, 'COMPLETED')}
                      className="text-xs text-green-600 dark:text-green-400 hover:underline">完了</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">欠席連絡を登録</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">生徒</label>
                <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: Number(e.target.value) }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value={0}>選択してください</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">欠席日</label>
                <input type="date" value={form.absenceDate} onChange={e => setForm(f => ({ ...f, absenceDate: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">理由</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.wantsMakeup} onChange={e => setForm(f => ({ ...f, wantsMakeup: e.target.checked }))} />
                補講を希望する
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleCreate} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">保存</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
