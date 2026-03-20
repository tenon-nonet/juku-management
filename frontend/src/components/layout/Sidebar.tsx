import { NavLink } from 'react-router-dom'
import { isAdmin } from '../../auth'

const navItems = [
  { to: '/', label: 'ダッシュボード', icon: '🏠', exact: true },
  { to: '/students', label: '生徒管理', icon: '👨‍🎓' },
  { to: '/guardians', label: '保護者管理', icon: '👪' },
  { to: '/lessons', label: '授業スケジュール', icon: '📅' },
  { to: '/exam-results', label: '成績記録', icon: '📊' },
  { to: '/invoices', label: '請求・支払い', icon: '💴' },
  { to: '/announcements', label: 'お知らせ', icon: '📢' },
]

const adminItems = [
  { to: '/settings', label: '設定', icon: '⚙️' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="px-4 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold text-white">塾管理システム</h1>
      </div>
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        {isAdmin() && (
          <>
            <div className="px-4 pt-4 pb-1">
              <p className="text-xs text-gray-500 uppercase tracking-wider">管理者</p>
            </div>
            <ul className="space-y-1 px-2">
              {adminItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`
                    }
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </>
        )}
      </nav>
    </aside>
  )
}
