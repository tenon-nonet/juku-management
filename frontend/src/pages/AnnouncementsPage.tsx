import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAnnouncements, deleteAnnouncement } from '../api'
import type { Announcement } from '../types'

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  const load = () => getAnnouncements().then((r) => setAnnouncements(r.data))
  useEffect(() => { load() }, [])

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`「${title}」を削除しますか？`)) return
    await deleteAnnouncement(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-100">お知らせ管理</h1>
        <Link to="/announcements/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + 新規作成
        </Link>
      </div>
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-400">タイトル</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">対象</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">公開状態</th>
              <th className="text-left px-4 py-3 font-medium text-gray-400">作成日</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {announcements.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">お知らせがありません</td></tr>}
            {announcements.map((a) => (
              <tr key={a.id} className="hover:bg-gray-700">
                <td className="px-4 py-3 font-medium text-gray-100">{a.title}</td>
                <td className="px-4 py-3 text-gray-400">{a.target === 'ALL' ? '全員' : a.target}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.isPublished ? 'bg-green-900/50 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    {a.isPublished ? '公開中' : '下書き'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(a.createdAt).toLocaleDateString('ja-JP')}</td>
                <td className="px-4 py-3 text-right">
                  <Link to={`/announcements/${a.id}/edit`} className="text-indigo-600 hover:underline mr-3 text-xs">編集</Link>
                  <button onClick={() => handleDelete(a.id, a.title)} className="text-red-400 hover:underline text-xs">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
