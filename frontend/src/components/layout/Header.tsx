import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../theme'
import { useAuth } from '../../contexts/AuthContext'

interface HeaderProps {
  title: string
  onMenuToggle?: () => void
}

const roleLabels: Record<string, string> = {
  PRINCIPAL: '教室長',
  ADMIN: '管理者',
  TEACHER: '講師',
  OFFICE_STAFF: '事務',
  STAFF: 'スタッフ',
  STUDENT: '生徒',
  GUARDIAN: '保護者',
}

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleLabel = user ? roleLabels[user.role] : ''

  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-1"
            aria-label="メニューを開く"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      </div>
      <div className="flex items-center gap-2 lg:gap-3">
        <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
          {user?.fullName}
          {roleLabel && (
            <span className="ml-1 text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-1.5 py-0.5 rounded">{roleLabel}</span>
          )}
        </span>
        <button
          onClick={toggle}
          className="text-lg leading-none min-w-[44px] min-h-[44px] flex items-center justify-center"
          title={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors min-h-[44px] px-2"
        >
          ログアウト
        </button>
      </div>
    </header>
  )
}
