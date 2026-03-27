import { useEffect, useState } from 'react'
import { getTasks, createTask, updateTask, deleteTask, getStaff } from '../api'
import type { Task, Staff } from '../types'

const PRIORITY_LABEL: Record<string, string> = { LOW: '低', MEDIUM: '中', HIGH: '高', URGENT: '緊急' }
const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  MEDIUM: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  HIGH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}
const STATUS_LABEL: Record<string, string> = { TODO: '未着手', IN_PROGRESS: '進行中', DONE: '完了', CANCELLED: 'キャンセル' }

const emptyForm = (): Partial<Task> => ({
  title: '', priority: 'MEDIUM', status: 'TODO',
  dueDate: '', assigneeId: undefined, description: '',
})

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('ACTIVE')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [form, setForm] = useState<Partial<Task>>(emptyForm())

  const load = () => getTasks(filterStatus === 'ACTIVE' ? undefined : filterStatus).then(r => setTasks(r.data))

  useEffect(() => {
    load()
    getStaff().then(r => setStaff(r.data))
  }, [])

  useEffect(() => { load() }, [filterStatus])

  const openNew = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = (t: Task) => { setEditing(t); setForm({ ...t }); setShowModal(true) }

  const handleSave = async () => {
    if (editing) await updateTask(editing.id, form)
    else await createTask(form)
    setShowModal(false)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return
    await deleteTask(id)
    load()
  }

  const handleStatusChange = async (id: number, status: string) => {
    await updateTask(id, { status })
    load()
  }

  const grouped = {
    TODO: tasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: tasks.filter(t => t.status === 'DONE'),
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">タスク管理</h1>
        <button onClick={openNew}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 min-h-[44px] flex items-center">
          + タスク追加
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-4 flex gap-2 flex-wrap">
        {[
          { key: 'ACTIVE', label: '進行中・未着手' },
          { key: 'TODO', label: '未着手のみ' },
          { key: 'IN_PROGRESS', label: '進行中のみ' },
          { key: 'DONE', label: '完了済み' },
        ].map(opt => (
          <button key={opt.key} onClick={() => setFilterStatus(opt.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === opt.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            {opt.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 self-center">{tasks.length}件</span>
      </div>

      {filterStatus === 'ACTIVE' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(['TODO', 'IN_PROGRESS'] as const).map(status => (
            <div key={status}>
              <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {STATUS_LABEL[status]} ({grouped[status].length})
              </h2>
              <div className="space-y-2">
                {grouped[status].length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">タスクなし</p>
                )}
                {grouped[status].map(t => (
                  <TaskCard key={t.id} task={t} today={today}
                    onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.length === 0 && (
            <p className="text-center py-8 text-gray-400">タスクがありません</p>
          )}
          {tasks.map(t => (
            <TaskCard key={t.id} task={t} today={today}
              onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              {editing ? 'タスクを編集' : '新規タスク'}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">タイトル *</label>
                <input value={form.title ?? ''} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">優先度</label>
                  <select value={form.priority ?? 'MEDIUM'} onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                    {Object.entries(PRIORITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">ステータス</label>
                  <select value={form.status ?? 'TODO'} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                    {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">期限</label>
                <input type="date" value={form.dueDate ?? ''} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">担当者</label>
                <select value={form.assigneeId ?? ''} onChange={e => setForm(f => ({ ...f, assigneeId: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100">
                  <option value="">未割当</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">詳細</label>
                <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              </div>
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

function TaskCard({ task, today, onEdit, onDelete, onStatusChange }: {
  task: Task
  today: string
  onEdit: (t: Task) => void
  onDelete: (id: number) => void
  onStatusChange: (id: number, status: string) => void
}) {
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'DONE' && task.status !== 'CANCELLED'
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border p-4 ${isOverdue ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLOR[task.priority]}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
            {task.status === 'DONE' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 font-medium">完了</span>
            )}
            {isOverdue && (
              <span className="text-xs text-red-500 font-medium">期限超過</span>
            )}
          </div>
          <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
            {task.title}
          </p>
          {task.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{task.description}</p>}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
            {task.dueDate && <span>{isOverdue ? '⚠️ ' : ''}{task.dueDate}</span>}
            {task.assigneeName && <span>👤 {task.assigneeName}</span>}
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          {task.status === 'TODO' && (
            <button onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline">開始</button>
          )}
          {task.status === 'IN_PROGRESS' && (
            <button onClick={() => onStatusChange(task.id, 'DONE')}
              className="text-xs text-green-600 dark:text-green-400 hover:underline">完了</button>
          )}
          {task.status === 'DONE' && (
            <button onClick={() => onStatusChange(task.id, 'TODO')}
              className="text-xs text-gray-500 hover:underline">戻す</button>
          )}
          <button onClick={() => onEdit(task)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">編集</button>
          <button onClick={() => onDelete(task.id)} className="text-xs text-red-500 hover:underline">削除</button>
        </div>
      </div>
    </div>
  )
}
