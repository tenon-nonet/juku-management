import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMessages, sendMessage } from '../api'
import type { Message } from '../types'
import { useAuth } from '../contexts/AuthContext'

const senderLabel = (senderType: string) => {
  const map: Record<string, string> = { STAFF: '教室', TEACHER: '講師', STUDENT: '生徒', GUARDIAN: '保護者' }
  return map[senderType] ?? senderType
}

export default function MessageThreadPage() {
  const { id } = useParams<{ id: string }>()
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const load = async () => {
    if (!id) return
    const res = await getMessages(Number(id))
    setMessages(res.data)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  useEffect(() => { load() }, [id])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !id) return
    setSending(true)
    try {
      const res = await sendMessage(Number(id), content)
      setMessages(prev => [...prev, res.data])
      setContent('')
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    } finally {
      setSending(false)
    }
  }

  const isMyMessage = (msg: Message) => {
    if (user?.userType === 'STAFF') return msg.senderType === 'STAFF' || msg.senderType === 'TEACHER'
    return msg.senderType === user?.userType
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/messages')} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          ← 戻る
        </button>
        <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100">メッセージ詳細</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 py-8">まだメッセージがありません</p>
        )}
        {messages.map(msg => {
          const mine = isMyMessage(msg)
          return (
            <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                mine
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow'
              }`}>
                {!mine && (
                  <p className="text-xs font-medium mb-1 opacity-70">{senderLabel(msg.senderType)}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${mine ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>
                  {new Date(msg.createdAt).toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="メッセージを入力..."
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          送信
        </button>
      </form>
    </div>
  )
}
