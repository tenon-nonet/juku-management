import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMessageThreads, createMessageThread } from '../api'
import type { MessageThread } from '../types'

const categoryLabels: Record<string, string> = {
  GENERAL: '一般',
  INQUIRY: 'お問い合わせ',
  ABSENCE: '欠席連絡',
  BILLING: '請求について',
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('GENERAL')
  const navigate = useNavigate()

  const load = async () => {
    try {
      const res = await getMessageThreads()
      setThreads(res.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim()) return
    const res = await createMessageThread({ subject, category })
    setShowNew(false)
    setSubject('')
    navigate(`/messages/${res.data.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">メッセージ</h1>
        <button
          onClick={() => setShowNew(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
        >
          ＋ 新規メッセージ
        </button>
      </div>

      {showNew && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">新規メッセージ</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">件名</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">カテゴリ</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">送信</button>
              <button type="button" onClick={() => setShowNew(false)} className="text-gray-500 dark:text-gray-400 px-4 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700">キャンセル</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-400 py-8">読み込み中...</p>
      ) : threads.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p>メッセージはまだありません</p>
        </div>
      ) : (
        <div className="space-y-2">
          {threads.map(thread => (
            <div
              key={thread.id}
              onClick={() => navigate(`/messages/${thread.id}`)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{thread.subject}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                      {categoryLabels[thread.category] ?? thread.category}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${thread.status === 'OPEN' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {thread.status === 'OPEN' ? 'オープン' : 'クローズ'}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(thread.updatedAt).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
