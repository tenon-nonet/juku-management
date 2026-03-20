import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getGuardian, getGuardianStudents, deleteGuardian } from '../api'
import type { Guardian, Student } from '../types'

export default function GuardianDetailPage() {
  const { id } = useParams()
  const guardianId = Number(id)
  const navigate = useNavigate()
  const [guardian, setGuardian] = useState<Guardian | null>(null)
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    getGuardian(guardianId).then((r) => setGuardian(r.data))
    getGuardianStudents(guardianId).then((r) => setStudents(r.data))
  }, [guardianId])

  const handleDelete = async () => {
    if (!guardian || !confirm(`「${guardian.fullName}」を削除しますか？`)) return
    await deleteGuardian(guardianId)
    navigate('/guardians')
  }

  if (!guardian) return <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{guardian.fullName}</h1>
          {guardian.fullNameKana && <p className="text-sm text-gray-500 dark:text-gray-400">{guardian.fullNameKana}</p>}
        </div>
        <div className="flex gap-2">
          <Link to={`/guardians/${guardianId}/edit`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">編集</Link>
          <button onClick={handleDelete} className="bg-red-900/50 text-red-400 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-900">削除</button>
          <Link to="/guardians" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">一覧へ</Link>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">連絡先情報</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['電話番号（主）', guardian.phone],
            ['電話番号（副）', guardian.phoneSub ?? '-'],
            ['メールアドレス', guardian.email ?? '-'],
          ].map(([label, value]) => (
            <div key={label}><p className="text-gray-500 dark:text-gray-400">{label}</p><p className="text-gray-800 dark:text-gray-100 font-medium">{value}</p></div>
          ))}
          <div className="col-span-2"><p className="text-gray-500 dark:text-gray-400">住所</p><p className="text-gray-800 dark:text-gray-100">{guardian.address ?? '-'}</p></div>
          {guardian.memo && <div className="col-span-2"><p className="text-gray-500 dark:text-gray-400">備考</p><p className="text-gray-800 dark:text-gray-100">{guardian.memo}</p></div>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">担当生徒 ({students.length}人)</h2>
        {students.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">担当生徒なし</p>
        ) : (
          <div className="space-y-2">
            {students.map((s) => (
              <Link key={s.id} to={`/students/${s.id}`} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{s.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{s.grade} / {s.schoolName ?? '-'}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                  {s.status === 'ACTIVE' ? '在籍' : s.status === 'INACTIVE' ? '退塾' : '休塾'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
