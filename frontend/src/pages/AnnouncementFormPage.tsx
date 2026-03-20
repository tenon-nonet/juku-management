import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getAnnouncement, createAnnouncement, updateAnnouncement } from '../api'

export default function AnnouncementFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '', target: 'ALL', isPublished: false, expiresAt: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) {
      getAnnouncement(Number(id)).then((r) => {
        const a = r.data
        setForm({ title: a.title, content: a.content, target: a.target, isPublished: a.isPublished, expiresAt: a.expiresAt ? a.expiresAt.slice(0, 16) : '' })
      })
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const data = { ...form, expiresAt: form.expiresAt ? form.expiresAt : undefined }
      if (isEdit) { await updateAnnouncement(Number(id), data) } else { await createAnnouncement(data) }
      navigate('/announcements')
    } catch { setError('保存に失敗しました') }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{isEdit ? 'お知らせ編集' : 'お知らせ作成'}</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">タイトル <span className="text-red-400">*</span></label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">内容 <span className="text-red-400">*</span></label>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required rows={6}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">対象</label>
            <select value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="ALL">全員</option>
              <option value="GRADE">学年別</option>
              <option value="COURSE">コース別</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">掲示期限</label>
            <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded" />
          <label htmlFor="published" className="text-sm text-gray-700 dark:text-gray-200">公開する</label>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">保存</button>
          <button type="button" onClick={() => navigate('/announcements')} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">キャンセル</button>
        </div>
      </form>
    </div>
  )
}
