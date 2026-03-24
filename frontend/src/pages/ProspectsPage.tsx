import { useEffect, useState } from 'react'
import { getProspects, getProspectStats, createProspect, updateProspect, deleteProspect, getStaff } from '../api'
import type { Prospect, Staff } from '../types'

const STATUS_LABEL: Record<string, string> = {
  INQUIRY: '問い合わせ',
  TRIAL_SCHEDULED: '体験予約',
  TRIAL_DONE: '体験済み',
  ENROLLED: '入塾',
  DROPPED: '見送り',
}
const STATUS_COLOR: Record<string, string> = {
  INQUIRY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  TRIAL_SCHEDULED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  TRIAL_DONE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  ENROLLED: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  DROPPED: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
}
const REFERRAL_LABEL: Record<string, string> = {
  WEB: 'Web', SNS: 'SNS', FLYER: 'チラシ', REFERRAL: '紹介', WALK_IN: '飛び込み', OTHER: 'その他'
}

const emptyForm = (): Partial<Prospect> => ({
  fullName: '', grade: '', status: 'INQUIRY', referralSource: 'WEB',
  inquiryDate: new Date().toISOString().split('T')[0],
})

export default function ProspectsPage() {
  const [prospects, setProspects] = useState<Prospect[]>([])
  const [stats, setStats] = useState<Record<string, number>>({})
  const [staff, setStaff] = useState<Staff[]>([])
  const [filterStatus, setFilterStatus] = useState('')
  const [filterName, setFilterName] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Prospect | null>(null)
  const [form, setForm] = useState<Partial<Prospect>>(emptyForm())

  const load = () => {
    getProspects({ status: filterStatus || undefined, name: filterName || undefined })
      .then(r => setProspects(r.data))
    getProspectStats().then(r => setStats(r.data))
  }

  useEffect(() => { load(); getStaff().then(r => setStaff(r.data)) }, [])
  useEffect(() => { load() }, [filterStatus, filterName])

  const openNew = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = (p: Prospect) => { setEditing(p); setForm({ ...p }); setShowModal(true) }

  const handleSave = async () => {
    if (editing) {
      await updateProspect(editing.id, form)
    } else {
      await createProspect(form)
    }
    setShowModal(false)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return
    await deleteProspect(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">体験生・見込み客管理</h1>
        <button onClick={openNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 min-h-[44px] flex items-center">
          + 新規登録
        </button>
      </div>

      {/* ファネル統計 */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
        {Object.entries(STATUS_LABEL).map(([key, label]) => (
          <button key={key} onClick={() => setFilterStatus(filterStatus === key ? '' : key)}
            className={`p-3 rounded-xl border text-center transition-all ${
              filterStatus === key
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{stats[key] ?? 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
          </button>
        ))}
      </div>

      {/* フィルター */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-4 flex gap-3 flex-wrap">
        <input placeholder="名前で検索" value={filterName} onChange={e => setFilterName(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 flex-1 min-w-[160px]" />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
          <option value="">全ステータス</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 self-center">{prospects.length}件</span>
      </div>

      {/* リスト */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {['名前','学年','問い合わせ日','体験日','ステータス','流入経路','担当','操作'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {prospects.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">データがありません</td></tr>
            )}
            {prospects.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800 dark:text-gray-100">{p.fullName}</p>
                  {p.fullNameKana && <p className="text-xs text-gray-400">{p.fullNameKana}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{p.grade ?? '-'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.inquiryDate}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.trialDate ?? '-'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[p.status]}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {REFERRAL_LABEL[p.referralSource ?? ''] ?? p.referralSource ?? '-'}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.assignedStaffName ?? '-'}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs">編集</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              {editing ? '体験生情報を編集' : '新規体験生登録'}
            </h2>
            <div className="space-y-3">
              {[
                { label: '氏名 *', key: 'fullName', type: 'text' },
                { label: 'ふりがな', key: 'fullNameKana', type: 'text' },
                { label: '電話番号', key: 'phone', type: 'tel' },
                { label: 'メール', key: 'email', type: 'email' },
                { label: '学年', key: 'grade', type: 'text' },
                { label: '学校名', key: 'schoolName', type: 'text' },
                { label: '問い合わせ日', key: 'inquiryDate', type: 'date' },
                { label: '体験日', key: 'trialDate', type: 'date' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                  <input type={type} value={(form as any)[key] ?? ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ステータス</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">流入経路</label>
                <select value={form.referralSource ?? 'WEB'} onChange={e => setForm(f => ({ ...f, referralSource: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  {Object.entries(REFERRAL_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">担当スタッフ</label>
                <select value={form.assignedStaffId ?? ''} onChange={e => setForm(f => ({ ...f, assignedStaffId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value="">未割当</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">興味コース</label>
                <input value={form.interestCourses ?? ''} onChange={e => setForm(f => ({ ...f, interestCourses: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">メモ</label>
                <textarea value={form.memo ?? ''} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">保存</button>
              <button onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
