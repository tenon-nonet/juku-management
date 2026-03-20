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
    <header className="h-14 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6">
      <h2 className="text-base font-semibold text-gray-100">{title}</h2>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">
          {fullName}
          {role === 'ADMIN' && (
            <span className="ml-1 text-xs bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded">管理者</span>
          )}
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}
