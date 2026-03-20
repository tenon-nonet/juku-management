import { clearAuth, getFullName, getRole } from '../../auth'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../theme'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate()
  const fullName = getFullName()
  const role = getRole()
  const { theme, toggle } = useTheme()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {fullName}
          {role === 'ADMIN' && (
            <span className="ml-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-1.5 py-0.5 rounded">管理者</span>
          )}
        </span>
        <button
          onClick={toggle}
          className="text-lg leading-none"
          title={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}
