import { clearAuth, getFullName, getRole } from '../../auth'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate()
  const fullName = getFullName()
  const role = getRole()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          {fullName}
          {role === 'ADMIN' && (
            <span className="ml-1 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">管理者</span>
          )}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}
