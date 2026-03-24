import { useEffect, useState } from 'react'
import { getLessonPacks, createLessonPack, updateLessonPack, deleteLessonPack, getSubjects } from '../api'
import type { LessonPack, Subject } from '../types'

const PACK_TYPE_LABEL: Record<string, string> = {
  REGULAR: '通常', SUMMER: '夏期講習', WINTER: '冬期講習', SPRING: '春期講習', CUSTOM: 'カスタム'
}
const PACK_TYPE_COLOR: Record<string, string> = {
  REGULAR: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  SUMMER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  WINTER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  SPRING: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  CUSTOM: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

const emptyForm = (): Partial<LessonPack> => ({
  name: '', packType: 'CUSTOM', totalSessions: 10, price: 0, isActive: true
})

export default function LessonPacksPage() {
  const [packs, setPacks] = useState<LessonPack[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<LessonPack | null>(null)
  const [form, setForm] = useState<Partial<LessonPack>>(emptyForm())
  const [activeOnly, setActiveOnly] = useState(false)

  const load = () => getLessonPacks(activeOnly).then(r => setPacks(r.data))
  useEffect(() => { load(); getSubjects().then(r => setSubjects(r.data)) }, [])
  useEffect(() => { load() }, [activeOnly])

  const openNew = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = (p: LessonPack) => { setEditing(p); setForm({ ...p }); setShowModal(true) }

  const handleSave = async () => {
    if (editing) await updateLessonPack(editing.id, form)
    else await createLessonPack(form)
    setShowModal(false); load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return
    await deleteLessonPack(id); load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">特別授業パック管理</h1>
        <button onClick={openNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 min-h-[44px] flex items-center">
          + パック追加
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">夏期・冬期・春期講習などのコマ制授業パックを管理します。</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-4 flex gap-3 items-center">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
          <input type="checkbox" checked={activeOnly} onChange={e => setActiveOnly(e.target.checked)}
            className="rounded" />
          有効パックのみ表示
        </label>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">{packs.length}件</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packs.map(p => (
          <div key={p.id} className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-4 ${
            p.isActive ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800 opacity-60'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PACK_TYPE_COLOR[p.packType]}`}>
                  {PACK_TYPE_LABEL[p.packType]}
                </span>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mt-1">{p.name}</h3>
              </div>
              {!p.isActive && <span className="text-xs text-gray-400">無効</span>}
            </div>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>コマ数</span><span className="font-medium">{p.totalSessions}コマ</span>
              </div>
              <div className="flex justify-between">
                <span>価格</span><span className="font-medium">{p.price.toLocaleString()}円</span>
              </div>
              <div className="flex justify-between">
                <span>1コマ単価</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {Math.round(p.price / p.totalSessions).toLocaleString()}円
                </span>
              </div>
              {p.subjectName && <div className="flex justify-between"><span>科目</span><span>{p.subjectName}</span></div>}
              {(p.validFrom || p.validTo) && (
                <div className="flex justify-between">
                  <span>有効期間</span>
                  <span className="text-xs">{p.validFrom ?? '〜'} 〜 {p.validTo ?? ''}</span>
                </div>
              )}
            </div>
            {p.description && <p className="text-xs text-gray-400 mt-2 line-clamp-2">{p.description}</p>}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <button onClick={() => openEdit(p)} className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs">編集</button>
              <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline text-xs">削除</button>
            </div>
          </div>
        ))}
        {packs.length === 0 && (
          <div className="col-span-3 py-12 text-center text-gray-400">
            パックがありません。「+ パック追加」から登録してください。
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              {editing ? 'パック編集' : '新規パック作成'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">パック名 *</label>
                <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">種別</label>
                <select value={form.packType ?? 'CUSTOM'} onChange={e => setForm(f => ({ ...f, packType: e.target.value as any }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  {Object.entries(PACK_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">コマ数</label>
                  <input type="number" min={1} value={form.totalSessions ?? 10}
                    onChange={e => setForm(f => ({ ...f, totalSessions: Number(e.target.value) }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">価格（円）</label>
                  <input type="number" min={0} value={form.price ?? 0}
                    onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">対象科目</label>
                <select value={form.subjectId ?? ''} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value="">科目なし</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">有効開始日</label>
                  <input type="date" value={form.validFrom ?? ''} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">有効終了日</label>
                  <input type="date" value={form.validTo ?? ''} onChange={e => setForm(f => ({ ...f, validTo: e.target.value }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">説明</label>
                <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input type="checkbox" checked={form.isActive ?? true} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                有効にする
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">保存</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg text-sm font-medium">キャンセル</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
