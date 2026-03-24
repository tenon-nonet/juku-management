import { useEffect, useState } from 'react'
import { getSalaryByMonth, calculateSalary, updateSalaryRecord, saveSalaryRule, getSalaryRules, getStaff } from '../api'
import type { SalaryRecord, Staff } from '../types'

const STATUS_LABEL: Record<string, string> = { DRAFT: '下書き', CONFIRMED: '確定', PAID: '支払済' }
const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  CONFIRMED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  PAID: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

export default function SalaryPage() {
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [records, setRecords] = useState<SalaryRecord[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [calculating, setCalculating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [adjustment, setAdjustment] = useState<number>(0)
  const [note, setNote] = useState('')
  const [showRuleModal, setShowRuleModal] = useState(false)
  const [ruleStaffId, setRuleStaffId] = useState<number>(0)
  const [ruleAmount, setRuleAmount] = useState<number>(0)
  const [ruleFrom, setRuleFrom] = useState('')

  const load = () => getSalaryByMonth(month).then(r => setRecords(r.data))
  useEffect(() => { load(); getStaff().then(r => setStaff(r.data)) }, [])
  useEffect(() => { load() }, [month])

  const handleCalculate = async () => {
    setCalculating(true)
    await calculateSalary(month)
    await load()
    setCalculating(false)
  }

  const handleStatusChange = async (id: number, status: string) => {
    await updateSalaryRecord(id, { status })
    load()
  }

  const handleAdjustment = async (id: number) => {
    await updateSalaryRecord(id, { adjustment, note })
    setEditingId(null)
    load()
  }

  const handleSaveRule = async () => {
    await saveSalaryRule({ staffId: ruleStaffId, lessonType: 'REGULAR', amountPerLesson: ruleAmount, effectiveFrom: ruleFrom })
    setShowRuleModal(false)
  }

  const totalBase = records.reduce((s, r) => s + r.baseAmount, 0)
  const totalTotal = records.reduce((s, r) => s + r.totalAmount, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">講師給与管理</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowRuleModal(true)}
            className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">
            給与ルール設定
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-4 flex gap-3 items-center flex-wrap">
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
        <button onClick={handleCalculate} disabled={calculating}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
          {calculating ? '計算中...' : '月次給与を計算'}
        </button>
        <p className="text-xs text-gray-400">※ 担当完了コマ数 × コマ単価で自動計算されます</p>
      </div>

      {records.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">基本給合計</p>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{totalBase.toLocaleString()}円</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">支払合計（調整後）</p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalTotal.toLocaleString()}円</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {['講師名','コマ数','基本給','調整額','支給額','ステータス','操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {records.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                「月次給与を計算」ボタンを押してください
              </td></tr>
            )}
            {records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">{r.staffName}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{r.lessonCount}コマ</td>
                <td className="px-4 py-3 text-gray-800 dark:text-gray-100">{r.baseAmount.toLocaleString()}円</td>
                <td className="px-4 py-3">
                  {editingId === r.id ? (
                    <div className="flex items-center gap-1">
                      <input type="number" value={adjustment} onChange={e => setAdjustment(Number(e.target.value))}
                        className="w-24 border rounded px-2 py-1 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                      <button onClick={() => handleAdjustment(r.id)} className="text-xs text-indigo-600 dark:text-indigo-400">保存</button>
                    </div>
                  ) : (
                    <span className={r.adjustment !== 0 ? (r.adjustment > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500') : 'text-gray-400'}>
                      {r.adjustment > 0 ? '+' : ''}{r.adjustment.toLocaleString()}円
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">{r.totalAmount.toLocaleString()}円</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2 items-center">
                  {r.status === 'DRAFT' && (
                    <button onClick={() => handleStatusChange(r.id, 'CONFIRMED')}
                      className="text-xs text-yellow-600 dark:text-yellow-400 hover:underline">確定</button>
                  )}
                  {r.status === 'CONFIRMED' && (
                    <button onClick={() => handleStatusChange(r.id, 'PAID')}
                      className="text-xs text-green-600 dark:text-green-400 hover:underline">支払済にする</button>
                  )}
                  <button onClick={() => { setEditingId(editingId === r.id ? null : r.id); setAdjustment(r.adjustment); setNote(r.note ?? '') }}
                    className="text-xs text-gray-500 hover:underline">調整</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 給与ルールモーダル */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">コマ単価設定</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">講師</label>
                <select value={ruleStaffId} onChange={e => setRuleStaffId(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value={0}>選択してください</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">コマ単価（円）</label>
                <input type="number" value={ruleAmount} onChange={e => setRuleAmount(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">適用開始日</label>
                <input type="date" value={ruleFrom} onChange={e => setRuleFrom(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSaveRule} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">保存</button>
              <button onClick={() => setShowRuleModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
