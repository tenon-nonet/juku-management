import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getGuardians, deleteGuardian } from '../api'
import type { Guardian } from '../types'

export default function GuardiansPage() {
  const [guardians, setGuardians] = useState<Guardian[]>([])
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const load = () => getGuardians(search || undefined).then((r) => setGuardians(r.data))
  useEffect(() => { load() }, [search])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await deleteGuardian(id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">保護者管理</h1>
        <Link to="/guardians/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + 新規登録
        </Link>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <input
          type="text"
          placeholder="氏名で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm w-48 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">氏名</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">電話番号</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">メール</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400">住所</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {guardians.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">保護者が見つかりません</td></tr>
            )}
            {guardians.map((g) => (
              <tr key={g.id} className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/guardians/${g.id}`)}>
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                  {g.fullName}
                  {g.fullNameKana && <span className="block text-xs text-gray-500 dark:text-gray-400">{g.fullNameKana}</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{g.phone}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{g.email ?? '-'}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-xs truncate">{g.address ?? '-'}</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <Link to={`/guardians/${g.id}/edit`} className="text-indigo-600 hover:underline mr-3 text-xs">編集</Link>
                  <button onClick={() => handleDelete(g.id, g.fullName)} className="text-red-400 hover:underline text-xs">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
